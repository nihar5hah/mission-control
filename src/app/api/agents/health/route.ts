import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { AgentId } from '@/types/agents';

const DAY_MS = 24 * 60 * 60 * 1000;

function getActivityScore(count: number) {
  if (count === 0) return 0;
  if (count <= 5) return 40;
  if (count <= 15) return 70;
  return 100;
}

function getUtilizationScore(tokens: number) {
  if (tokens === 0) return 0;
  if (tokens <= 25000) return 50;
  if (tokens <= 75000) return 80;
  return 100;
}

function getStatus(activityCount: number, utilizationScore: number, healthScore: number) {
  if (activityCount === 0) return 'inactive';
  if (utilizationScore >= 90 && healthScore >= 75) return 'overworked';
  if (healthScore < 60 || utilizationScore <= 50) return 'underutilized';
  return 'healthy';
}

export async function GET() {
  try {
    const since = new Date(Date.now() - DAY_MS).toISOString();

    const [{ data: agents }, { data: activities }, { data: stats }, { data: sessions }] = await Promise.all([
      supabase.from('agents').select('id, name'),
      supabase
        .from('agent_activities')
        .select('agent_id,status,metadata,timestamp')
        .gte('timestamp', since),
      supabase.from('agent_stats').select('agent_id,daily_tokens_used'),
      supabase.from('agent_sessions').select('agent_id,last_active'),
    ]);

    const agentIds = (agents || []).map((agent) => agent.id as AgentId);

    const totals = new Map<string, {
      activityCount: number;
      completed: number;
      failed: number;
      tokens: number;
      lastActivity: string | null;
    }>();

    for (const agentId of agentIds) {
      totals.set(agentId, { activityCount: 0, completed: 0, failed: 0, tokens: 0, lastActivity: null });
    }

    for (const activity of activities || []) {
      const agentId = activity.agent_id as string;
      if (!totals.has(agentId)) {
        totals.set(agentId, { activityCount: 0, completed: 0, failed: 0, tokens: 0, lastActivity: null });
      }
      const record = totals.get(agentId)!;
      record.activityCount += 1;
      if (activity.status === 'completed') record.completed += 1;
      if (activity.status === 'failed') record.failed += 1;
      const tokens = Number(activity?.metadata?.tokens_used || 0);
      record.tokens += isNaN(tokens) ? 0 : tokens;
      if (!record.lastActivity || activity.timestamp > record.lastActivity) {
        record.lastActivity = activity.timestamp;
      }
    }

    for (const row of stats || []) {
      const record = totals.get(row.agent_id as string);
      if (record && record.tokens === 0 && typeof row.daily_tokens_used === 'number') {
        record.tokens = row.daily_tokens_used;
      }
    }

    for (const session of sessions || []) {
      const record = totals.get(session.agent_id as string);
      if (record && !record.lastActivity && session.last_active) {
        record.lastActivity = session.last_active;
      }
    }

    const agentsPayload = agentIds.map((agentId) => {
      const record = totals.get(agentId) || { activityCount: 0, completed: 0, failed: 0, tokens: 0, lastActivity: null };
      const activityScore = getActivityScore(record.activityCount);
      const successRate = record.activityCount === 0 ? 50 : Math.round((record.completed / record.activityCount) * 100);
      const utilizationScore = getUtilizationScore(record.tokens);
      const healthScore = Math.round(activityScore * 0.4 + successRate * 0.3 + utilizationScore * 0.3);
      const status = getStatus(record.activityCount, utilizationScore, healthScore);

      let recommendation: string | null = null;
      if (status === 'underutilized') recommendation = `Consider assigning more tasks to ${agentId}`;
      if (status === 'overworked') recommendation = `Reduce workload for ${agentId} or redistribute tasks`;
      if (status === 'inactive') recommendation = `Check session connectivity for ${agentId}`;

      return {
        agent_id: agentId,
        health_score: healthScore,
        activity_score: activityScore,
        success_rate: successRate,
        utilization_score: utilizationScore,
        status,
        activity_count_24h: record.activityCount,
        success_count_24h: record.completed,
        failed_count_24h: record.failed,
        tokens_used_24h: record.tokens,
        last_activity: record.lastActivity,
        recommendation,
      };
    });

    const summary = agentsPayload.reduce(
      (acc, agent) => {
        acc.total_agents += 1;
        acc[agent.status] += 1;
        return acc;
      },
      { total_agents: 0, healthy: 0, underutilized: 0, overworked: 0, inactive: 0 } as Record<string, number>
    );

    return NextResponse.json({ agents: agentsPayload, summary });
  } catch (error) {
    console.error('[AgentHealth] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
