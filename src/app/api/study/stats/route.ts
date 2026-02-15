import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/study/stats
 * Fetch study statistics (today's minutes, current streak, week total)
 */
export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();

    // Get today's study time
    const { data: todaySessions } = await supabase
      .from('study_sessions')
      .select('duration_minutes')
      .gte('created_at', todayStr)
      .lte('created_at', new Date().toISOString());

    const todayMinutes = todaySessions?.reduce((sum, s) => sum + s.duration_minutes, 0) || 0;

    // Get this week's total
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { data: weekSessions } = await supabase
      .from('study_sessions')
      .select('duration_minutes, created_at')
      .gte('created_at', weekAgo.toISOString());

    const weekTotal = weekSessions?.reduce((sum, s) => sum + s.duration_minutes, 0) || 0;

    // Calculate streak (consecutive days studied)
    const { data: allSessions } = await supabase
      .from('study_sessions')
      .select('created_at')
      .order('created_at', { ascending: false });

    let streak = 0;
    if (allSessions && allSessions.length > 0) {
      const dates = new Set(
        allSessions.map(s => {
          const d = new Date(s.created_at);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        })
      );

      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      while (dates.has(currentDate.getTime())) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      }
    }

    return NextResponse.json({
      today_minutes: todayMinutes,
      week_total: weekTotal,
      current_streak: streak,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats', today_minutes: 0, week_total: 0, current_streak: 0 },
      { status: 500 }
    );
  }
}
