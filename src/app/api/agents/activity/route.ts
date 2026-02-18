import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireApiKey } from '@/lib/auth';
import type { AgentId, ActivityStatus } from '@/types/agents';

// POST /api/agents/activity
// Log a new agent activity and update session status
export async function POST(request: NextRequest) {
  try {
    const auth = requireApiKey(request);
    if (auth) return auth;
    const body = await request.json();
    const {
      agent_id,
      action,
      description,
      status = 'running',
      tokens_used,
      metadata = {},
      session_status = 'active',
      session_key,
    } = body;

    if (!agent_id || typeof agent_id !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid "agent_id"' }, { status: 400 });
    }

    if (!action || typeof action !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid "action"' }, { status: 400 });
    }

    const timestamp = new Date().toISOString();
    const enrichedMetadata = {
      ...metadata,
      ...(typeof tokens_used === 'number' ? { tokens_used } : {}),
    };

    const { data: activity, error: activityError } = await supabase
      .from('agent_activities')
      .insert({
        agent_id: agent_id as AgentId,
        action,
        description: description || '',
        status: status as ActivityStatus,
        metadata: enrichedMetadata,
        timestamp,
      })
      .select()
      .single();

    if (activityError) {
      console.error('[AgentActivity] Supabase error:', activityError);
      return NextResponse.json({ error: 'Failed to log agent activity' }, { status: 500 });
    }

    const sessionPayload = {
      agent_id: agent_id as AgentId,
      session_key: session_key || `${agent_id}-mission-control`,
      status: session_status,
      current_action: action,
      started_at: timestamp,
      last_active: timestamp,
      metadata: enrichedMetadata,
    };

    const { error: sessionError } = await supabase
      .from('agent_sessions')
      .upsert(sessionPayload, { onConflict: 'session_key' });

    if (sessionError) {
      console.error('[AgentActivity] Session upsert error:', sessionError);
    }

    return NextResponse.json({ success: true, activity }, { status: 201 });
  } catch (error) {
    console.error('[AgentActivity] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
