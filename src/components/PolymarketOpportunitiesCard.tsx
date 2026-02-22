'use client';

import { useEffect, useMemo, useState } from 'react';

interface Opportunity {
  id: number;
  market_name: string;
  profit_percent: number;
  scanned_at: string;
}

interface LastScan {
  scanned_at: string;
  markets_scanned: number;
  opportunities_count: number;
}

interface OpportunitiesResponse {
  opportunities: Opportunity[];
  lastScan: LastScan | null;
}

export function PolymarketOpportunitiesCard() {
  const [data, setData] = useState<OpportunitiesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const response = await fetch('/api/polymarket/opportunities');
    if (!response.ok) {
      setLoading(false);
      return;
    }
    const payload = (await response.json()) as OpportunitiesResponse;
    setData(payload);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60_000);
    return () => clearInterval(interval);
  }, []);

  const summary = useMemo(() => {
    const lastScan = data?.lastScan;
    return {
      lastScanTime: lastScan?.scanned_at ?? '—',
      marketsScanned: lastScan?.markets_scanned ?? 0,
      opportunitiesCount: lastScan?.opportunities_count ?? (data?.opportunities?.length ?? 0),
    };
  }, [data]);

  if (loading) {
    return (
      <div className="apple-card p-4">
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Loading Polymarket opportunities...</p>
      </div>
    );
  }

  return (
    <div className="apple-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gradient-metallic">Polymarket Opportunities</h3>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Arb scanner feed (60s refresh)</p>
        </div>
        <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Last scan: {summary.lastScanTime}</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4 text-xs">
        <div className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <p style={{ color: 'var(--text-tertiary)' }}>Markets scanned</p>
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{summary.marketsScanned}</p>
        </div>
        <div className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <p style={{ color: 'var(--text-tertiary)' }}>Opportunities</p>
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{summary.opportunitiesCount}</p>
        </div>
      </div>

      {data?.opportunities?.length ? (
        <div className="space-y-2">
          {data.opportunities.map((opp) => (
            <div key={opp.id} className="flex items-center justify-between text-xs rounded-lg px-3 py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className="min-w-0">
                <p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{opp.market_name}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{opp.scanned_at}</p>
              </div>
              <div className="text-sm font-semibold" style={{ color: 'var(--color-green)' }}>{Number(opp.profit_percent).toFixed(2)}%</div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>No opportunities found yet.</p>
      )}
    </div>
  );
}
