import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireApiKey } from '@/lib/auth';
import type { AgentId } from '@/types/agents';

const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL;
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN;

function resolveAgentId(sessionKey: string): AgentId | null {
  if (sessionKey.startsWith('agent:main:')) return 'begubot';
  if (sessionKey === 'agent:main:main') return 'begubot';
  if (!sessionKey.startsWith('agent:')) return null;
  const parts = sessionKey.split(':');
  if (parts.length < 2) return null;
  return parts[1] as AgentId;
}

function parseSessions(payload: any): Array<{ key: string; model?: string; totalTokens?: number; updatedAt?: number; sessionId?: string }>
{
  // Check various response formats from gateway
  if (Array.isArray(payload?.sessions)) return payload.sessions;
  if (Array.isArray(payload?.result?.sessions)) return payload.result.sessions;
  if (Array.isArray(payload?.result?.details?.sessions)) return payload.result.details.sessions;
  if (Array.isArray(payload?.data?.sessions)) return payload.data.sessions;
  
  // Handle case where content[0].text contains JSON string
  if (payload?.result?.content?.[0]?.text) {
    try {
      const parsed = JSON.parse(payload.result.content[0].text);
      if (Array.isArray(parsed?.sessions)) return parsed.sessions;
    } catch {}
  }
  
  return [];
}

export async function POST(request: Request) {
  try {
    const auth = requireApiKey(request);
    if (auth) return auth;

    if (!GATEWAY_URL || !GATEWAY_TOKEN) {
      return NextResponse.json({ error: 'Gateway credentials missing' }, { status: 500 });
    }

    const response = await fetch(`${GATEWAY_URL}/tools/invoke`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GATEWAY_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tool: 'sessions_list',
        args: { kinds: ['agent'] },
      }),
    });

    console.log('[AgentSessionsSync] Gateway response status:', response.status);

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('[AgentSessionsSync] Gateway error:', response.status, text);
      return NextResponse.json({ error: `Gateway error: ${response.status} ${text.slice(0, 100)}` }, { status: 500 });
    }

    const data = await response.json().catch(() => ({}));
    console.log('[AgentSessionsSync] Gateway response keys:', Object.keys(data));
    const sessions = parseSessions(data);
    console.log('[AgentSessionsSync] Parsed sessions:', sessions.length);

    const sessionKeys = sessions.map((s) => s.key).filter(Boolean);
    const { data: existingSessions } = await supabase
      .from('agent_sessions')
      .select('session_key, started_at')
      .in('session_key', sessionKeys);

    const startedAtByKey = new Map<string, string>();
    for (const row of existingSessions || []) {
      startedAtByKey.set(row.session_key, row.started_at);
    }

    const activeAgentIds = new Set<AgentId>();
    const upserts = sessions
      .map((session) => {
        const agentId = resolveAgentId(session.key);
        if (!agentId) return null;
        activeAgentIds.add(agentId);
        const updatedAt = session.updatedAt ? new Date(session.updatedAt).toISOString() : new Date().toISOString();
        const startedAt = startedAtByKey.get(session.key) || updatedAt;
        return {
          agent_id: agentId,
          session_key: session.key,
          status: 'active',
          current_action: undefined,
          started_at: startedAt,
          last_active: updatedAt,
          ended_at: null,
          metadata: {
            tokens_used: session.totalTokens || 0,
            model: session.model,
            session_id: session.sessionId,
          },
        };
      })
      .filter(Boolean);

    if (upserts.length > 0) {
      await supabase.from('agent_sessions').upsert(upserts, { onConflict: 'session_key' });
    }

    const { data: agents } = await supabase.from('agents').select('id');
    const allAgentIds = (agents || []).map((agent) => agent.id as AgentId);
    const offlineAgents = allAgentIds.filter((id) => !activeAgentIds.has(id));

    if (offlineAgents.length > 0) {
      await supabase
        .from('agent_sessions')
        .update({
          status: 'offline',
          ended_at: new Date().toISOString(),
          current_action: null,
        })
        .in('agent_id', offlineAgents);
    }

    return NextResponse.json({
      success: true,
      total: sessions.length,
      activeAgents: Array.from(activeAgentIds),
      offlineAgents,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[AgentSessionsSync] Error:', errorMsg);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? errorMsg : undefined
    }, { status: 500 });
  }
}
