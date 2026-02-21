import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL;

export async function GET() {
  const status: Record<string, unknown> = {
    ok: true,
    gateway: { ok: false },
    database: { ok: false },
    tunnelUrl: GATEWAY_URL || null,
    timestamp: new Date().toISOString(),
  };

  // Gateway health check
  if (GATEWAY_URL) {
    try {
      const response = await fetch(`${GATEWAY_URL}/health`, { method: 'GET' });
      status.gateway = { ok: response.ok, status: response.status };
    } catch (error) {
      status.gateway = { ok: false, error: String(error) };
    }
  }

  // Database health check
  try {
    const { error } = await supabase.from('agent_sessions').select('id').limit(1);
    status.database = { ok: !error, error: error?.message || null };
  } catch (error) {
    status.database = { ok: false, error: String(error) };
  }

  status.ok = Boolean((status.gateway as any)?.ok) && Boolean((status.database as any)?.ok);
  return NextResponse.json(status, { status: status.ok ? 200 : 500 });
}
