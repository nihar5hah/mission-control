'use client';

import { useEffect, useMemo, useState } from 'react';

interface GatewayHealthResponse {
  processCount: number;
  openclawCount: number;
  gatewayCount: number;
  port: number;
  portBound: boolean;
  lastHeartbeatAt: string | null;
  heartbeatOk: boolean;
  checkedAt: string;
}

type StatusLevel = 'healthy' | 'degraded' | 'down';

function getStatus(data: GatewayHealthResponse | null): StatusLevel {
  if (!data) return 'down';
  if (data.processCount === 0 && !data.portBound) return 'down';
  if (data.processCount < 2 || !data.portBound) return 'degraded';
  if (!data.heartbeatOk) return 'degraded';
  return 'healthy';
}

function statusLabel(status: StatusLevel) {
  if (status === 'healthy') return '✅ Healthy';
  if (status === 'degraded') return '⚠️ Degraded';
  return '❌ Down';
}

export function GatewayHealthCard() {
  const [data, setData] = useState<GatewayHealthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    const response = await fetch('/api/gateway/health');
    if (!response.ok) {
      setLoading(false);
      return;
    }
    const payload = (await response.json()) as GatewayHealthResponse;
    setData(payload);
    setLoading(false);
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 60_000);
    return () => clearInterval(interval);
  }, []);

  const status = useMemo(() => getStatus(data), [data]);

  if (loading) {
    return (
      <div className="apple-card p-4">
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Loading gateway health...</p>
      </div>
    );
  }

  return (
    <div className="apple-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gradient-metallic">Gateway Health</h3>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Local OpenClaw gateway status</p>
        </div>
        <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{statusLabel(status)}</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <p style={{ color: 'var(--text-tertiary)' }}>Processes</p>
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{data?.processCount ?? 0}</p>
          <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>openclaw: {data?.openclawCount ?? 0} · gateway: {data?.gatewayCount ?? 0}</p>
        </div>
        <div className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <p style={{ color: 'var(--text-tertiary)' }}>Port 18789</p>
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{data?.portBound ? 'Bound' : 'Not bound'}</p>
        </div>
        <div className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <p style={{ color: 'var(--text-tertiary)' }}>Heartbeat</p>
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{data?.heartbeatOk ? 'OK' : 'No response'}</p>
          <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{data?.lastHeartbeatAt ?? '—'}</p>
        </div>
        <div className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <p style={{ color: 'var(--text-tertiary)' }}>Last checked</p>
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{data?.checkedAt ?? '—'}</p>
        </div>
      </div>
    </div>
  );
}
