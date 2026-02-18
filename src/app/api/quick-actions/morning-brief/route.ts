import { NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const auth = requireApiKey(request);
    if (auth) return auth;
    return NextResponse.json({
      success: true,
      message: '🌅 Morning Brief runs automatically at 9 AM IST',
      note: 'The morning brief is scheduled and will run automatically. You can also run it manually via the OpenClaw gateway.',
    });
  } catch (error) {
    console.error('[QuickActions] Morning brief error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
