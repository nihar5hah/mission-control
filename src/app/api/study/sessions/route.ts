import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/study/sessions
 * Fetch all study sessions with optional subject_id filter
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subject_id');

    let query = supabase.from('study_sessions').select('*');

    if (subjectId) {
      query = query.eq('subject_id', parseInt(subjectId));
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

/**
 * POST /api/study/sessions
 * Create a new study session
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subject_id, lecture_number, duration_minutes, notes } = body;

    if (!subject_id || lecture_number === undefined || !duration_minutes) {
      return NextResponse.json(
        { error: 'subject_id, lecture_number, and duration_minutes are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('study_sessions')
      .insert([
        {
          subject_id: parseInt(subject_id),
          lecture_number: parseInt(lecture_number),
          duration_minutes: parseInt(duration_minutes),
          notes: notes || '',
          completed_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) throw error;
    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}

/**
 * DELETE /api/study/sessions?id=...
 * Delete a study session
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('study_sessions')
      .delete()
      .eq('id', parseInt(id));

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
  }
}
