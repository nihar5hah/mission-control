import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/study/subjects
 * Fetch all study subjects
 */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('study_subjects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
  }
}

/**
 * POST /api/study/subjects
 * Create a new study subject
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, total_lectures, description } = body;

    if (!name || !total_lectures) {
      return NextResponse.json(
        { error: 'name and total_lectures are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('study_subjects')
      .insert([
        {
          name,
          total_lectures: parseInt(total_lectures),
          description: description || '',
        },
      ])
      .select();

    if (error) throw error;
    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json({ error: 'Failed to create subject' }, { status: 500 });
  }
}
