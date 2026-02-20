import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireApiKey } from '@/lib/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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

export async function GET() {
  const { data, error } = await supabase
    .from('tasks_board')
    .select('*')
    .order('created_at', { ascending: false });

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
    const { title, description, owner = 'begu', priority = 'MEDIUM' } = body;

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

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('[TasksBoard] POST error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
