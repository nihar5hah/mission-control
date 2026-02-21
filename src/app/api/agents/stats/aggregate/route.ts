import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireApiKey } from '@/lib/auth';
import type { AgentId } from '@/types/agents';

function secondsBetween(start?: string | null, end?: string | null) {
  if (!start || !end) return 0;
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) return 0;
  return Math.max(0, Math.floor((endMs - startMs) / 1000));
}

export async function POST(request: Request) {
  try {
    const auth = requireApiKey(request);
    if (auth) return auth;

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const today = start.toISOString().split('T')[0];

    // Best-effort session sync to keep stats fresh
    try {
      const url = new URL(request.url);
      const base = `${url.protocol}//${url.host}`;
      await fetch(`${base}/api/agents/sessions/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
    } catch (err) {
      console.warn('[StatsAggregate] Session sync failed:', err);
    }

    const { data: activities, error } = await supabase
      .from('agent_activities')
      .select('agent_id,status')
      .gte('timestamp', start.toISOString());

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
    }

    const { data: agents } = await supabase.from('agents').select('id');
    const agentIds = (agents || []).map((agent) => agent.id as AgentId);

    const { data: sessions } = await supabase
      .from('agent_sessions')
      .select('*');

    const completedCounts: Record<string, number> = {};
    for (const activity of activities || []) {
      if (activity.status === 'completed') {
        completedCounts[activity.agent_id] = (completedCounts[activity.agent_id] || 0) + 1;
      }
    }

    const updates = await Promise.all(
      agentIds.map(async (agentId) => {
        const session = sessions?.find((s) => s.agent_id === agentId);
        const tokensUsed = Number(session?.metadata?.tokens_used || 0);
        const activeSeconds = secondsBetween(session?.started_at, session?.last_active);

        const { data: current } = await supabase
          .from('agent_stats')
          .select('*')
          .eq('agent_id', agentId)
          .single();

        const payload = {
          agent_id: agentId,
          total_tokens_used: tokensUsed,
          total_tasks_completed: current?.total_tasks_completed || 0,
          total_tasks_failed: current?.total_tasks_failed || 0,
          total_uptime_seconds: activeSeconds,
          last_reset: current?.last_reset || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          daily_tokens_used: tokensUsed,
          daily_tasks_completed: completedCounts[agentId] || 0,
          daily_active_seconds: activeSeconds,
          daily_date: today,
        };

        const { error: upsertError } = await supabase
          .from('agent_stats')
          .upsert(payload, { onConflict: 'agent_id' });

        return { agentId, ok: !upsertError };
      })
    );

    return NextResponse.json({ success: true, updated: updates.length, updates });
  } catch (error) {
    console.error('[StatsAggregate] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
