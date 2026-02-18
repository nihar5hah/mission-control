import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireApiKey } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const auth = requireApiKey(request);
    if (auth) return auth;
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { error } = await supabase
      .from('agent_activities')
      .delete()
      .lt('timestamp', cutoff);

    if (error) {
      console.error('[QuickActions] Clear activities error:', error);
      return NextResponse.json({ error: 'Failed to clear activities' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[QuickActions] Clear activities error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
