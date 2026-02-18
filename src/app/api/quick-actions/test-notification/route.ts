import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const base = `${url.protocol}//${url.host}`;
    const response = await fetch(`${base}/api/notifications/telegram`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: '✅ Mission Control test notification',
        type: 'test',
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to send test notification' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[QuickActions] Test notification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
