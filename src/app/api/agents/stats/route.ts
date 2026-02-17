import { NextRequest, NextResponse } from 'next/server';
import { agentStatsApi } from '@/lib/agents-api';
import type { AgentId } from '@/types/agents';

// POST /api/agents/stats
// Seed/update agent stats with realistic data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agent_id, stats } = body as { agent_id: AgentId; stats: Record<string, number> };

    if (!agent_id || typeof agent_id !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid "agent_id"' }, { status: 400 });
    }

    const updated = await agentStatsApi.upsert(agent_id, {
      ...stats,
      daily_date: new Date().toISOString().split('T')[0],
    } as any);

    return NextResponse.json({ success: true, stats: updated }, { status: 200 });
  } catch (error) {
    console.error('[AgentStats] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
