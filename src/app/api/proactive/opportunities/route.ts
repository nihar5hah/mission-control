/**
 * Opportunities API Routes
 * Handles opportunity discovery and management
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/proactive/opportunities - Get all opportunities
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = supabase
      .from('opportunities')
      .select('*')
      .order('priority_score', { ascending: false })
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
    console.error('Failed to fetch opportunities:', error);
    return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 });
  }
}

// POST /api/proactive/opportunities - Create or scan opportunities
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'scan') {
      // Run opportunity scan
      const { opportunityFinder } = await import('@/lib/proactive/opportunities');
      const opportunities = await opportunityFinder.scan();
      
      return NextResponse.json({ 
        success: true, 
        message: `Found ${opportunities.length} opportunities`,
        opportunities 
      });
    }

    if (action === 'dismiss') {
      // Dismiss an opportunity
      const { id } = body;
      await supabase
        .from('opportunities')
        .update({ status: 'dismissed' })
        .eq('id', id);

      return NextResponse.json({ success: true });
    }

    if (action === 'implement') {
      // Mark as implemented
      const { id } = body;
      await supabase
        .from('opportunities')
        .update({ 
          status: 'implemented',
          implemented_at: new Date().toISOString(),
        })
        .eq('id', id);

      return NextResponse.json({ success: true });
    }

    // Create new opportunity manually
    const { data, error } = await supabase
      .from('opportunities')
      .insert({
        type: body.type,
        title: body.title,
        description: body.description,
        potential_value: body.potential_value || 'medium',
        effort_estimate: body.effort_estimate || 'medium',
        status: 'discovered',
        metadata: body.metadata || {},
        tags: body.tags || [],
        priority_score: body.priority_score || 0.5,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to process opportunity:', error);
    return NextResponse.json({ error: 'Failed to process opportunity' }, { status: 500 });
  }
}

// PATCH /api/proactive/opportunities - Update opportunity
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Opportunity ID required' }, { status: 400 });
    }

    const body = await request.json();

    const updates: Record<string, unknown> = { ...body };
    if (body.status === 'implemented') {
      updates.implemented_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('opportunities')
      .update(updates)
      .eq('id', parseInt(id))
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to update opportunity:', error);
    return NextResponse.json({ error: 'Failed to update opportunity' }, { status: 500 });
  }
}
