import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [oppsResult, scansResult] = await Promise.all([
      supabase
        .from('polymarket_opportunities')
        .select('id, market_name, profit_percent, scanned_at')
        .order('scanned_at', { ascending: false })
        .limit(10),
      supabase
        .from('polymarket_scans')
        .select('scanned_at, markets_scanned, opportunities_count')
        .order('scanned_at', { ascending: false })
        .limit(1),
    ]);

    const opportunities = oppsResult.data || [];
    const lastScan = scansResult.data?.[0] || null;

    return NextResponse.json({
      opportunities,
      lastScan,
    });
  } catch (error) {
    console.error('[PolymarketOpportunities] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
