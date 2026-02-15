import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { ActivityInsert } from '@/types/database';

// Valid activity types for logging
const VALID_ACTIVITY_TYPES = [
  'build',      // Building features/projects
  'research',   // Research tasks
  'sync',       // Data synchronization
  'fix',        // Bug fixes
  'deploy',     // Deployments
  'test',       // Testing
  // Legacy types for backward compatibility
  'agent-start',
  'agent-complete',
  'agent-error',
  'file-create',
  'file-update',
  'file-delete',
  'api-call',
  'db-query',
  'memory-save',
  'memory-recall',
  'git-commit',
  'git-push',
  'system-log',
] as const;

// POST /api/activities/log
// Log a new activity to the activities table
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { agent, action, description, status, metadata } = body;

    if (!agent || typeof agent !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "agent" field' },
        { status: 400 }
      );
    }

    if (!action || typeof action !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "action" field' },
        { status: 400 }
      );
    }

    // Validate action type
    const isValidAction = VALID_ACTIVITY_TYPES.includes(action as typeof VALID_ACTIVITY_TYPES[number]);
    if (!isValidAction) {
      // Allow any action but log a warning (flexible for future types)
      console.warn(`[ActivityLog] Non-standard action type: ${action}`);
    }

    // Create activity record - only use columns that exist in the schema
    // Schema: id, agent, action, description, status, timestamp, created_at
    const activity = {
      agent,
      action,
      description: description || '',
      status: status || 'completed',
      timestamp: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('activities')
      .insert(activity)
      .select()
      .single();

    if (error) {
      console.error('[ActivityLog] Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to log activity', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      activity: data,
    }, { status: 201 });

  } catch (error) {
    console.error('[ActivityLog] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET /api/activities/log
// Get recent activities (optional query params: limit, agent, action)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const agent = searchParams.get('agent');
    const action = searchParams.get('action');

    let query = supabase
      .from('activities')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (agent) {
      query = query.eq('agent', agent);
    }

    if (action) {
      query = query.eq('action', action);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[ActivityLog] Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch activities', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      activities: data,
      count: data?.length || 0,
    }, { status: 200 });

  } catch (error) {
    console.error('[ActivityLog] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}