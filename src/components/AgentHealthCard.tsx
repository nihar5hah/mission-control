'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AGENT_CONFIG } from '@/types/agents';

export type AgentHealthStatus = 'healthy' | 'underutilized' | 'overworked' | 'inactive';

export interface AgentHealth {
  agent_id: string;
  health_score: number;
  activity_score: number;
  success_rate: number;
  utilization_score: number;
  status: AgentHealthStatus;
  activity_count_24h: number;
  success_count_24h: number;
  failed_count_24h: number;
  tokens_used_24h: number;
  last_activity: string | null;
  recommendation: string | null;
}

function getHealthColor(score: number) {
  if (score <= 40) return 'var(--color-red)';
  if (score <= 70) return 'var(--color-orange)';
  return 'var(--color-green)';
}

export function AgentHealthCard() {
  const [health, setHealth] = useState<AgentHealth[]>([]);
  const [summary, setSummary] = useState<Record<string, number>>({
    total_agents: 0,
    healthy: 0,
    underutilized: 0,
    overworked: 0,
    inactive: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    const response = await fetch('/api/agents/health');
    if (!response.ok) return;
    const data = await response.json();
    setHealth(data.agents || []);
    setSummary(data.summary || summary);
    setLoading(false);
  };

  useEffect(() => {
    fetchHealth();

    const channel = supabase
      .channel('agent_health_activity')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agent_activities' }, fetchHealth)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="apple-card p-4">
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Loading agent health...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="apple-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gradient-metallic">Agent Health Summary</h3>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {summary.healthy} healthy · {summary.underutilized} underutilized · {summary.overworked} overworked · {summary.inactive} inactive
            </p>
          </div>
          <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{summary.total_agents} agents</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {health.map((agent) => {
          const config = AGENT_CONFIG[agent.agent_id as keyof typeof AGENT_CONFIG];
          const color = getHealthColor(agent.health_score);

          return (
            <div key={agent.agent_id} className="apple-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{config?.emoji}</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{config?.name || agent.agent_id}</p>
                    <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{agent.status}</p>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: `${color}22`, color }}>
                  <span className="text-sm font-semibold">{agent.health_score}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Activities</p>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{agent.activity_count_24h}</p>
                </div>
                <div className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Success</p>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{agent.success_rate}%</p>
                </div>
                <div className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Tokens</p>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{agent.tokens_used_24h.toLocaleString()}</p>
                </div>
              </div>

              {agent.recommendation && (
                <p className="text-[11px] mt-3" style={{ color: 'var(--text-tertiary)' }}>{agent.recommendation}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
