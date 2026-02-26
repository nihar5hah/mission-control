import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Agent configuration
const AGENTS: Record<string, { name: string; heartbeat_table: string }> = {
  main: { name: 'Begubot', heartbeat_table: 'activities' },
  coder: { name: 'Codex', heartbeat_table: 'activities' },
  researcher: { name: 'Researcher', heartbeat_table: 'activities' },
  extractor: { name: 'Extractor', heartbeat_table: 'activities' },
  begubot: { name: 'Begubot', heartbeat_table: 'activities' },
};

// Track server start time for uptime
const SERVER_START_TIME = Date.now();

interface HealthCheck {
  database: 'ok' | 'error';
  websocket: 'ok' | 'unknown';
  memory_mb: number;
}

interface HealthResponse {
  agent_id: string;
  agent_name: string;
  status: 'healthy' | 'degraded' | 'down';
  uptime_seconds: number;
  last_heartbeat: string | null;
  checks: HealthCheck;
  metadata: {
    server_uptime_seconds: number;
    timestamp: string;
    version: string;
  };
}

// GET /api/agents/[id]/health
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const agentId = params.id.toLowerCase();
  const agentConfig = AGENTS[agentId];

  if (!agentConfig) {
    return NextResponse.json(
      { error: `Unknown agent: ${agentId}. Valid agents: ${Object.keys(AGENTS).join(', ')}` },
      { status: 404 }
    );
  }

  const health: HealthResponse = {
    agent_id: agentId,
    agent_name: agentConfig.name,
    status: 'healthy',
    uptime_seconds: 0,
    last_heartbeat: null,
    checks: {
      database: 'ok',
      websocket: 'unknown',
      memory_mb: 0,
    },
    metadata: {
      server_uptime_seconds: Math.floor((Date.now() - SERVER_START_TIME) / 1000),
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  };

  // Check database connection
  try {
    const { error: dbError } = await supabase
      .from('activities')
      .select('id')
      .limit(1);

    if (dbError) {
      health.checks.database = 'error';
      health.status = 'degraded';
    }
  } catch (e) {
    health.checks.database = 'error';
    health.status = 'degraded';
  }

  // Get last heartbeat from activities
  try {
    const { data: lastActivity, error } = await supabase
      .from('activities')
      .select('timestamp, status')
      .eq('agent_id', agentId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (!error && lastActivity) {
      health.last_heartbeat = lastActivity.timestamp;
      
      // Calculate agent uptime from last heartbeat
      const lastHeartbeatTime = new Date(lastActivity.timestamp).getTime();
      const now = Date.now();
      const secondsSinceHeartbeat = Math.floor((now - lastHeartbeatTime) / 1000);
      
      // If no heartbeat in 5 minutes, mark as degraded
      if (secondsSinceHeartbeat > 300) {
        health.status = 'degraded';
      }
      
      // If no heartbeat in 15 minutes, mark as down
      if (secondsSinceHeartbeat > 900) {
        health.status = 'down';
      }
    } else {
      // No activities found for this agent
      health.status = 'down';
    }
  } catch (e) {
    console.error('Error fetching last heartbeat:', e);
    health.status = 'degraded';
  }

  // Memory usage (Node.js process memory)
  const memUsage = process.memoryUsage();
  health.checks.memory_mb = Math.round(memUsage.heapUsed / 1024 / 1024);

  // High memory warning (> 512MB)
  if (health.checks.memory_mb > 512) {
    health.status = health.status === 'healthy' ? 'degraded' : health.status;
  }

  // WebSocket status - check if realtime is configured
  health.checks.websocket = supabaseUrl ? 'ok' : 'unknown';

  return NextResponse.json(health, {
    status: health.status === 'down' ? 503 : 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
