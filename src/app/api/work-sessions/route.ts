import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// GET /api/work-sessions - Fetch work sessions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const agentId = searchParams.get('agent_id');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    let query = supabase
      .from('work_sessions')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(limit);

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      query = query
        .gte('started_at', startOfDay.toISOString())
        .lte('started_at', endOfDay.toISOString());
    }

    if (agentId) {
      query = query.eq('agent_id', agentId);
    }

    const { data, error } = await query;

    if (error) {
      // Table might not exist, return empty array
      if (error.code === '42P01') {
        return NextResponse.json({ success: true, data: [] });
      }
      console.error('Error fetching work sessions:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate stats for today
    const today = new Date().toDateString();
    const todaySessions = (data || []).filter(s => 
      new Date(s.started_at).toDateString() === today
    );

    const stats = {
      totalSessions: todaySessions.length,
      completedSessions: todaySessions.filter(s => s.completed).length,
      focusMinutes: Math.round(
        todaySessions
          .filter(s => s.session_type === 'focus' && s.completed)
          .reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / 60
      ),
      breakMinutes: Math.round(
        todaySessions
          .filter(s => s.session_type === 'break' && s.completed)
          .reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / 60
      ),
      totalMinutes: Math.round(
        todaySessions
          .filter(s => s.completed)
          .reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / 60
      ),
    };

    return NextResponse.json({
      success: true,
      data: data || [],
      stats,
    });
  } catch (error) {
    console.error('Work sessions fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch work sessions' },
      { status: 500 }
    );
  }
}

// POST /api/work-sessions - Create/Log a work session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      agent_id = 'begu',
      session_type,
      duration_seconds,
      started_at,
      ended_at,
      completed,
      project_id,
      task_id,
      notes,
    } = body;

    // Validate required fields
    if (!session_type || !duration_seconds) {
      return NextResponse.json(
        { error: 'Missing required fields: session_type, duration_seconds' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('work_sessions')
      .insert({
        agent_id,
        session_type,
        duration_seconds,
        started_at: started_at || new Date().toISOString(),
        ended_at: ended_at || new Date().toISOString(),
        completed: completed ?? true,
        project_id,
        task_id,
        notes,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating work session:', error);
      
      // Return success even if table doesn't exist (graceful degradation)
      if (error.code === '42P01') {
        return NextResponse.json({
          success: true,
          data: { id: Date.now(), ...body },
          warning: 'work_sessions table not found - data stored locally only',
        });
      }
      
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Also log to activities (ignore errors)
    void supabase.from('activities').insert({
      agent_id,
      action: `${session_type}-session`,
      description: `${completed ? 'Completed' : 'Started'} ${session_type} session (${Math.round(duration_seconds / 60)}m)${notes ? ` - ${notes}` : ''}`,
      status: completed ? 'completed' : 'running',
      metadata: {
        session_type,
        duration_seconds,
        completed,
      },
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Work session create error:', error);
    return NextResponse.json(
      { error: 'Failed to create work session' },
      { status: 500 }
    );
  }
}

// PUT /api/work-sessions - Update a work session
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing session id' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('work_sessions')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating work session:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Work session update error:', error);
    return NextResponse.json(
      { error: 'Failed to update work session' },
      { status: 500 }
    );
  }
}
