import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const base = `${url.protocol}//${url.host}`;
    const response = await fetch(`${base}/api/agents/documents/sync-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to sync documents' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[QuickActions] Sync docs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
