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

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireApiKey(request);
    if (auth) return auth;

    const body = await request.json();
    const { status, owner, priority, title, description, assigned_to, claimed_at, labels } = body;

    const updates: Record<string, any> = {
      ...(status ? { status } : {}),
      ...(owner ? { owner } : {}),
      ...(priority ? { priority } : {}),
      ...(title ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(assigned_to !== undefined ? { assigned_to } : {}),
      ...(claimed_at !== undefined ? { claimed_at } : {}),
      ...(labels !== undefined ? { labels } : {}),
    };

    if (status === 'DONE') {
      updates.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('tasks_board')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }

    if (status) {
      await logAgentActivity(data.owner, 'task-status', `Task status set to ${status}: ${data.title}`);
    }
    if (owner) {
      await logAgentActivity(owner, 'task-assign', `Assigned task: ${data.title}`);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[TasksBoard] PATCH error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireApiKey(request);
    if (auth) return auth;

    const { data, error } = await supabase
      .from('tasks_board')
      .delete()
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }

    await logAgentActivity(data.owner, 'task-delete', `Deleted task: ${data.title}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[TasksBoard] DELETE error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
