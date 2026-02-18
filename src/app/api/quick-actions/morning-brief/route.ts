import { NextResponse } from 'next/server';

export async function POST() {
  try {
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
