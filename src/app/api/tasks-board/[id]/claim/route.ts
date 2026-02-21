import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireApiKey } from '@/lib/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase env variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireApiKey(request);
    if (auth) return auth;

    const body = await request.json();
    const { agent_id, reason } = body;

    if (!agent_id || typeof agent_id !== 'string') {
      return NextResponse.json({ error: 'Missing agent_id' }, { status: 400 });
    }

    // Get current task
    const { data: existing, error: fetchError } = await supabase
      .from('tasks_board')
      .select('id, title, status, owner')
      .eq('id', params.id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (existing.status !== 'TODO') {
      return NextResponse.json({ error: 'Task already claimed or completed', status: existing.status }, { status: 409 });
    }

    // Update task to IN_PROGRESS and change owner to claiming agent
    const { data: task, error } = await supabase
      .from('tasks_board')
      .update({
        status: 'IN_PROGRESS',
        owner: agent_id, // Use owner field to track who claimed it
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('[TasksBoard] Claim error:', error);
      return NextResponse.json({ error: 'Failed to claim task', details: error.message }, { status: 500 });
    }

    // Log activity
    await supabase.from('agent_activities').insert({
      agent_id,
      action: 'task-claim',
      description: `Claimed task: ${task.title}${reason ? ` (${reason})` : ''}`,
      status: 'completed',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error('[TasksBoard] Claim error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
