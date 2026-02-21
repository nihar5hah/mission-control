import { NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/auth';
import { sendSessionMessage } from '@/lib/openclaw';

const SESSION_KEY = process.env.OPENCLAW_SESSION_KEY || 'agent:main:main';

export async function POST(request: Request) {
  try {
    const auth = requireApiKey(request);
    if (auth) return auth;

    const url = new URL(request.url);
    const base = `${url.protocol}//${url.host}`;

    const aggregateResponse = await fetch(`${base}/api/agents/stats/aggregate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    if (!aggregateResponse.ok) {
      return NextResponse.json({ error: 'Failed to refresh stats' }, { status: 500 });
    }

    let openclawResult: unknown = null;
    try {
      openclawResult = await sendSessionMessage({
        sessionKey: SESSION_KEY,
        message: 'Refresh agent activities and stats now.',
        timeoutSeconds: 0,
      });
    } catch (error) {
      console.warn('[QuickActions] OpenClaw refresh message failed:', error);
    }

    return NextResponse.json({ success: true, refreshed: true, openclaw: !!openclawResult });
  } catch (error) {
    console.error('[QuickActions] Refresh activities error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
