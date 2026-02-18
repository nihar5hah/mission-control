import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const cronUrl = process.env.OPENCLAW_CRON_RUN_URL;
    const cronJobId = process.env.OPENCLAW_MORNING_BRIEF_JOB_ID;
    const gatewayToken = process.env.OPENCLAW_GATEWAY_TOKEN;

    if (!cronUrl || !cronJobId || !gatewayToken) {
      return NextResponse.json({ error: 'Morning brief trigger not configured' }, { status: 400 });
    }

    const response = await fetch(`${cronUrl}/tools/invoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${gatewayToken}`,
      },
      body: JSON.stringify({
        tool: 'cron',
        action: 'run',
        args: { jobId: cronJobId, runMode: 'force' },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json({ error: 'Failed to trigger morning brief', details: text }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json({ success: true, result: data });
  } catch (error) {
    console.error('[QuickActions] Morning brief error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
