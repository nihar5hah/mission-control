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

    // Update agent_stats totals (tokens, tasks, active time)
    const today = new Date().toISOString().split('T')[0];
    const tokensDelta = typeof tokens_used === 'number' ? tokens_used : 0;
    const activeDelta = typeof enrichedMetadata.active_seconds === 'number'
      ? enrichedMetadata.active_seconds
      : typeof enrichedMetadata.duration_seconds === 'number'
        ? enrichedMetadata.duration_seconds
        : 0;
    const tasksDelta = status === 'completed' ? 1 : 0;

    const { data: currentStats } = await supabase
      .from('agent_stats')
      .select('*')
      .eq('agent_id', agent_id)
      .single();

    const statsPayload = {
      agent_id,
      total_tokens_used: (currentStats?.total_tokens_used || 0) + tokensDelta,
      total_tasks_completed: (currentStats?.total_tasks_completed || 0) + tasksDelta,
      total_tasks_failed: currentStats?.total_tasks_failed || 0,
      total_uptime_seconds: (currentStats?.total_uptime_seconds || 0) + activeDelta,
      last_reset: currentStats?.last_reset || timestamp,
      updated_at: timestamp,
      daily_tokens_used: (currentStats?.daily_tokens_used || 0) + tokensDelta,
      daily_tasks_completed: (currentStats?.daily_tasks_completed || 0) + tasksDelta,
      daily_active_seconds: (currentStats?.daily_active_seconds || 0) + activeDelta,
      daily_date: today,
    };

    await supabase
      .from('agent_stats')
      .upsert(statsPayload, { onConflict: 'agent_id' });

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
