import { NextRequest, NextResponse } from 'next/server';

const OPENCLAW_GATEWAY = process.env.OPENCLAW_GATEWAY_URL;
const OPENCLAW_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN;

export async function GET(request: NextRequest) {
  if (!OPENCLAW_GATEWAY || !OPENCLAW_TOKEN) {
    return NextResponse.json({ 
      error: 'Missing env vars',
      gateway: OPENCLAW_GATEWAY ? 'set' : 'missing',
      token: OPENCLAW_TOKEN ? 'set' : 'missing'
    }, { status: 500 });
  }

  try {
    const response = await fetch(`${OPENCLAW_GATEWAY}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OPENCLAW_TOKEN}`,
      },
    });

    const text = await response.text();

    return NextResponse.json({
      ok: true,
      gateway: OPENCLAW_GATEWAY,
      status: response.status,
      statusText: response.statusText,
      preview: text.substring(0, 200),
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      gateway: OPENCLAW_GATEWAY,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
