/**
 * Patterns API Routes
 * Handles pattern detection and retrieval
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/proactive/patterns - Get all patterns
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const active = searchParams.get('active');

    let query = supabase
      .from('patterns')
      .select('*')
      .order('impact_score', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }
    if (active !== null) {
      query = query.eq('is_active', active === 'true');
    }

    const { data, error } = await query;

    if (error) throw error;

    // Parse pattern_data JSON
    const patterns = (data || []).map(p => ({
      ...p,
      pattern_data: typeof p.pattern_data === 'string' 
        ? JSON.parse(p.pattern_data) 
        : p.pattern_data,
    }));

    return NextResponse.json(patterns);
  } catch (error) {
    console.error('Failed to fetch patterns:', error);
    return NextResponse.json({ error: 'Failed to fetch patterns' }, { status: 500 });
  }
}

// POST /api/proactive/patterns - Create/refresh patterns
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'analyze') {
      // Import and run pattern analysis
      const { patternEngine } = await import('@/lib/proactive/patterns');
      const patternIds = await patternEngine.detectAndStore();
      
      return NextResponse.json({ 
        success: true, 
        message: `Analyzed and stored ${patternIds.length} patterns`,
        patternIds 
      });
    }

    // Create new pattern
    const { data, error } = await supabase
      .from('patterns')
      .insert({
        category: body.category,
        name: body.name,
        pattern_data: body.pattern_data,
        frequency: body.frequency || 'unknown',
        impact_score: body.impact_score || 0.5,
        confidence: body.confidence || 0.5,
        metadata: body.metadata || {},
        is_active: body.is_active ?? true,
        suggested_action: body.suggested_action,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to create pattern:', error);
    return NextResponse.json({ error: 'Failed to create pattern' }, { status: 500 });
  }
}

// PATCH /api/proactive/patterns - Update pattern
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Pattern ID required' }, { status: 400 });
    }

    const body = await request.json();

    const { data, error } = await supabase
      .from('patterns')
      .update({
        ...body,
        last_seen: new Date().toISOString(),
      })
      .eq('id', parseInt(id))
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to update pattern:', error);
    return NextResponse.json({ error: 'Failed to update pattern' }, { status: 500 });
  }
}
