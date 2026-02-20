import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireApiKey } from '@/lib/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// OpenClaw gateway for agent notifications
const OPENCLAW_GATEWAY = process.env.OPENCLAW_GATEWAY_URL || 'https://100.105.130.84:18789';
const OPENCLAW_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase env variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function logAgentActivity(agent_id: string, action: string, description: string, status: 'running' | 'completed' | 'failed' | 'pending' = 'completed') {
  await supabase
    .from('agent_activities')
    .insert({
      agent_id,
      action,
      description,
      status,
      timestamp: new Date().toISOString(),
    });
}

async function notifyAgent(agentId: string, taskId: string, title: string, priority: string) {
  // Map agent IDs to session keys
  const agentSessionMap: Record<string, string> = {
    'extractor': 'agent:extractor:main',
    'coder': 'agent:coder:main',
    'researcher': 'agent:researcher:main',
    'begubot': 'agent:main:main',
  };

  const sessionKey = agentSessionMap[agentId];
  if (!sessionKey || !OPENCLAW_TOKEN) {
    console.log(`[TasksBoard] Cannot notify agent: ${agentId} (no session key or token)`);
    return;
  }

  try {
    const response = await fetch(`${OPENCLAW_GATEWAY}/api/sessions/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENCLAW_TOKEN}`,
      },
      body: JSON.stringify({
        sessionKey,
        message: `📋 **NEW TASK ASSIGNED**

**Task ID:** ${taskId}
**Title:** ${title}
**Priority:** ${priority}

You have been assigned a new task. When you start working on it, mark it as IN_PROGRESS. When complete, mark it as DONE.

Use these commands:
- \`GET /api/tasks-board?owner=${agentId}\` to see your tasks
- \`PATCH /api/tasks-board/${taskId}\` to update status

Start when ready!`,
        timeoutSeconds: 0,
      }),
    });

    if (!response.ok) {
      console.error(`[TasksBoard] Failed to notify agent ${agentId}:`, await response.text());
    } else {
      console.log(`[TasksBoard] Notified agent ${agentId} of task ${taskId}`);
    }
  } catch (error) {
    console.error(`[TasksBoard] Error notifying agent ${agentId}:`, error);
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get('owner');
  const status = searchParams.get('status');

  let query = supabase
    .from('tasks_board')
    .select('*')
    .order('created_at', { ascending: false });

  if (owner) {
    query = query.eq('owner', owner);
  }
  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireApiKey(request);
    if (auth) return auth;

    const body = await request.json();
    const { title, description, owner = 'extractor', priority = 'MEDIUM' } = body;

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'Missing title' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('tasks_board')
      .insert({
        title,
        description: description || null,
        owner,
        priority,
        status: 'TODO',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }

    await logAgentActivity(owner, 'task-create', `Created task: ${title}`);
    
    // Notify the assigned agent
    await notifyAgent(owner, data.id, title, priority);

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('[TasksBoard] POST error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
