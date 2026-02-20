import { NextRequest, NextResponse } from 'next/server';
import { logActivity } from '@/lib/activity-logger';
import { requireApiKey } from '@/lib/auth';

// POST /api/activity/log
// Public endpoint for agents to log their activities
export async function POST(request: NextRequest) {
  try {
    const auth = requireApiKey(request);
    if (auth) return auth;

    const body = await request.json();
    const { agent_id, action, description, status, tokens_used, metadata } = body;

    if (!agent_id || !action || !description) {
      return NextResponse.json({ 
        error: 'Missing required fields: agent_id, action, description' 
      }, { status: 400 });
    }

    await logActivity({
      agent_id,
      action,
      description,
      status,
      tokens_used,
      metadata,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ActivityAPI] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
