/**
 * Proactive Actions API Routes
 * Handles autonomous actions management
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/proactive/actions - Get all actions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('proactive_actions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }
    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Failed to fetch proactive actions:', error);
    return NextResponse.json({ error: 'Failed to fetch actions' }, { status: 500 });
  }
}

// POST /api/proactive/actions - Create new action
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from('proactive_actions')
      .insert({
        type: body.type,
        category: body.category,
        description: body.description,
        impact: body.impact || 'medium',
        status: body.status || 'pending',
        metadata: body.metadata || {},
        source: body.source,
        confidence_score: body.confidence_score,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to create proactive action:', error);
    return NextResponse.json({ error: 'Failed to create action' }, { status: 500 });
  }
}

// PATCH /api/proactive/actions - Update action
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Action ID required' }, { status: 400 });
    }

    const body = await request.json();

    const updates: Record<string, unknown> = { ...body };
    if (body.status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('proactive_actions')
      .update(updates)
      .eq('id', parseInt(id))
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to update proactive action:', error);
    return NextResponse.json({ error: 'Failed to update action' }, { status: 500 });
  }
}

// DELETE /api/proactive/actions - Delete action
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Action ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('proactive_actions')
      .delete()
      .eq('id', parseInt(id));

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete proactive action:', error);
    return NextResponse.json({ error: 'Failed to delete action' }, { status: 500 });
  }
}
