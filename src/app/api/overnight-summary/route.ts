import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// GET /api/overnight-summary - Fetch overnight activities (last 8 hours)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hours = parseInt(searchParams.get('hours') || '8', 10);
    const agentId = searchParams.get('agent_id');

    // Calculate time range
    const now = new Date();
    const startTime = new Date(now.getTime() - hours * 60 * 60 * 1000);

    // Build query
    let query = supabase
      .from('activities')
      .select('*')
      .gte('timestamp', startTime.toISOString())
      .order('timestamp', { ascending: false });

    if (agentId) {
      query = query.eq('agent_id', agentId);
    }

    const { data: activities, error } = await query;

    if (error) {
      console.error('Error fetching overnight activities:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate summary stats
    const stats = calculateStats(activities || []);

    // Group by agent
    const byAgent = groupByAgent(activities || []);

    return NextResponse.json({
      success: true,
      data: {
        activities,
        stats,
        byAgent,
        timeRange: {
          start: startTime.toISOString(),
          end: now.toISOString(),
          hours,
        },
      },
    });
  } catch (error) {
    console.error('Overnight summary error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch overnight summary' },
      { status: 500 }
    );
  }
}

function calculateStats(activities: any[]) {
  const completed = activities.filter(a => a.status === 'completed').length;
  const failed = activities.filter(a => a.status === 'failed').length;
  const agents = [...new Set(activities.map(a => a.agent_id))];
  
  // Count specific action types
  const builds = activities.filter(a => 
    a.action?.toLowerCase().includes('build') || 
    a.action?.toLowerCase().includes('deploy')
  ).length;
  
  const filesChanged = activities.filter(a => 
    a.action?.toLowerCase().includes('file')
  ).length;

  const focusSessions = activities.filter(a => 
    a.action?.toLowerCase().includes('session') || 
    a.action?.toLowerCase().includes('focus')
  );

  const focusTime = focusSessions.reduce((sum, a) => {
    const duration = a.metadata?.duration_seconds || 0;
    return sum + duration;
  }, 0);

  return {
    total: activities.length,
    completed,
    failed,
    pending: activities.filter(a => a.status === 'pending' || a.status === 'running').length,
    activeAgents: agents,
    buildsCompleted: builds,
    filesChanged,
    focusMinutes: Math.round(focusTime / 60),
  };
}

function groupByAgent(activities: any[]) {
  const groups: Record<string, any[]> = {};
  activities.forEach(a => {
    const agent = a.agent_id || 'unknown';
    if (!groups[agent]) groups[agent] = [];
    groups[agent].push(a);
  });
  return groups;
}
