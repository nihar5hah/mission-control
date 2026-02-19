import { NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/auth';
import { sendSessionMessage } from '@/lib/openclaw';

const SESSION_KEY = process.env.OPENCLAW_SESSION_KEY || 'agent:main:main';

export async function POST(request: Request) {
  try {
    const auth = requireApiKey(request);
    if (auth) return auth;

    const result = await sendSessionMessage({
      sessionKey: SESSION_KEY,
      message: 'Run the morning brief now and post a summary.',
      timeoutSeconds: 0,
    });

    return NextResponse.json({
      success: true,
      message: '🌅 Morning Brief triggered',
      result,
    });
  } catch (error) {
    console.error('[QuickActions] Morning brief error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
