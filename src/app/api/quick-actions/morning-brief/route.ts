import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const cronUrl = process.env.OPENCLAW_CRON_RUN_URL;
    const cronJobId = process.env.OPENCLAW_MORNING_BRIEF_JOB_ID;

    if (!cronUrl || !cronJobId) {
      return NextResponse.json({ error: 'Morning brief trigger not configured' }, { status: 400 });
    }

    const response = await fetch(cronUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: cronJobId }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to trigger morning brief' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[QuickActions] Morning brief error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
