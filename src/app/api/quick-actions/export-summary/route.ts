import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('agent_activities')
      .select('*')
      .gte('timestamp', start.toISOString())
      .order('timestamp', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to export summary' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      date: start.toISOString().split('T')[0],
      total: data?.length || 0,
      activities: data || [],
    });
  } catch (error) {
    console.error('[QuickActions] Export summary error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
