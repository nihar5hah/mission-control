import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { AgentId } from '@/types/agents';

// POST /api/agents/stats
// Increment agent stats (tokens/tasks/active seconds)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      agent_id,
      tokens_used = 0,
      tasks_completed = 0,
      active_seconds = 0,
    } = body as {
      agent_id: AgentId;
      tokens_used?: number;
      tasks_completed?: number;
      active_seconds?: number;
    };

    if (!agent_id || typeof agent_id !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid "agent_id"' }, { status: 400 });
    }

    const { data: current, error: fetchError } = await supabase
      .from('agent_stats')
      .select('*')
      .eq('agent_id', agent_id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('[AgentStats] Fetch error:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch agent stats' }, { status: 500 });
    }

    const now = new Date();
    const dailyDate = now.toISOString().split('T')[0];

    const base = current || {
      agent_id,
      total_tokens_used: 0,
      total_tasks_completed: 0,
      total_tasks_failed: 0,
      total_uptime_seconds: 0,
      last_reset: now.toISOString(),
      updated_at: now.toISOString(),
      daily_tokens_used: 0,
      daily_tasks_completed: 0,
      daily_active_seconds: 0,
      daily_date: dailyDate,
    };

    const updated = {
      ...base,
      total_tokens_used: (base.total_tokens_used || 0) + (tokens_used || 0),
      total_tasks_completed: (base.total_tasks_completed || 0) + (tasks_completed || 0),
      total_uptime_seconds: (base.total_uptime_seconds || 0) + (active_seconds || 0),
      daily_tokens_used: (base.daily_tokens_used || 0) + (tokens_used || 0),
      daily_tasks_completed: (base.daily_tasks_completed || 0) + (tasks_completed || 0),
      daily_active_seconds: (base.daily_active_seconds || 0) + (active_seconds || 0),
      daily_date: dailyDate,
      updated_at: now.toISOString(),
    };

    const { data: saved, error: upsertError } = await supabase
      .from('agent_stats')
      .upsert(updated, { onConflict: 'agent_id' })
      .select()
      .single();

    if (upsertError) {
      console.error('[AgentStats] Upsert error:', upsertError);
      return NextResponse.json({ error: 'Failed to update agent stats' }, { status: 500 });
    }

    return NextResponse.json({ success: true, stats: saved }, { status: 200 });
  } catch (error) {
    console.error('[AgentStats] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
