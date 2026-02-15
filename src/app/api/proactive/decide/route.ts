/**
 * Decision Engine API Routes
 * Triggers decision-making processes
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST /api/proactive/decide - Trigger decision engine
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data, context } = body;

    // Import decision engine
    const { decisionEngine } = await import('@/lib/proactive/decisions');
    
    // Process the decision request
    const result = await decisionEngine.process({
      type,
      data: data || {},
      context: context || {},
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to process decision:', error);
    return NextResponse.json({ error: 'Failed to process decision' }, { status: 500 });
  }
}

// GET /api/proactive/decide - Get recent decisions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const { data, error } = await supabase
      .from('decisions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Failed to fetch decisions:', error);
    return NextResponse.json({ error: 'Failed to fetch decisions' }, { status: 500 });
  }
}

// PATCH /api/proactive/decide - Execute/respond to decision
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { decisionId, approved, outcome } = body;

    const { decisionEngine } = await import('@/lib/proactive/decisions');
    
    await decisionEngine.execute(decisionId, approved, outcome);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to execute decision:', error);
    return NextResponse.json({ error: 'Failed to execute decision' }, { status: 500 });
  }
}
