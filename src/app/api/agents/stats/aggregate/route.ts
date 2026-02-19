import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireApiKey } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const auth = requireApiKey(request);
    if (auth) return auth;

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const today = start.toISOString().split('T')[0];

    const { data: activities, error } = await supabase
      .from('agent_activities')
      .select('*')
      .gte('timestamp', start.toISOString());

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
    }

    const totals: Record<string, {
      tokens: number;
      completed: number;
      activeSeconds: number;
    }> = {};

    for (const activity of activities || []) {
      const agentId = activity.agent_id as string;
      if (!totals[agentId]) {
        totals[agentId] = { tokens: 0, completed: 0, activeSeconds: 0 };
      }
      const tokens = Number(activity?.metadata?.tokens_used || 0);
      const activeSeconds = Number(activity?.metadata?.active_seconds || activity?.metadata?.duration_seconds || 0);
      totals[agentId].tokens += isNaN(tokens) ? 0 : tokens;
      totals[agentId].activeSeconds += isNaN(activeSeconds) ? 0 : activeSeconds;
      if (activity.status === 'completed') totals[agentId].completed += 1;
    }

    const updates = await Promise.all(
      Object.entries(totals).map(async ([agentId, data]) => {
        const { data: current } = await supabase
          .from('agent_stats')
          .select('*')
          .eq('agent_id', agentId)
          .single();

        const payload = {
          agent_id: agentId,
          total_tokens_used: current?.total_tokens_used || 0,
          total_tasks_completed: current?.total_tasks_completed || 0,
          total_tasks_failed: current?.total_tasks_failed || 0,
          total_uptime_seconds: current?.total_uptime_seconds || 0,
          last_reset: current?.last_reset || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          daily_tokens_used: data.tokens,
          daily_tasks_completed: data.completed,
          daily_active_seconds: data.activeSeconds,
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
