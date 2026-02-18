import { NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const auth = requireApiKey(request);
    if (auth) return auth;
    return NextResponse.json({ success: true, refreshed: true });
  } catch (error) {
    console.error('[QuickActions] Refresh activities error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
