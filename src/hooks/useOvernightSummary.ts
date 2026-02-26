'use client';

import { useState, useEffect, useCallback } from 'react';

interface OvernightActivity {
  id: number;
  agent_id: string;
  action: string;
  description: string;
  status: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

interface OvernightStats {
  total: number;
  completed: number;
  failed: number;
  pending: number;
  activeAgents: string[];
  buildsCompleted: number;
  filesChanged: number;
  focusMinutes: number;
}

interface OvernightSummaryData {
  activities: OvernightActivity[];
  stats: OvernightStats;
  byAgent: Record<string, OvernightActivity[]>;
  timeRange: {
    start: string;
    end: string;
    hours: number;
  };
}

interface UseOvernightSummaryOptions {
  hours?: number;
  agentId?: string;
  refreshInterval?: number;
}

export function useOvernightSummary(options: UseOvernightSummaryOptions = {}) {
  const { hours = 8, agentId, refreshInterval = 60000 } = options;

  const [data, setData] = useState<OvernightSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.set('hours', hours.toString());
      if (agentId) params.set('agent_id', agentId);

      const response = await fetch(`/api/overnight-summary?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch overnight summary');
      }

      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        setError(null);
      } else {
        setError(result.error || 'Unknown error');
      }
    } catch (err) {
      console.error('Overnight summary fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }, [hours, agentId]);

  // Initial fetch
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Auto-refresh
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(fetchSummary, refreshInterval);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [fetchSummary, refreshInterval]);

  return {
    data,
    activities: data?.activities || [],
    stats: data?.stats,
    byAgent: data?.byAgent || {},
    loading,
    error,
    refresh: fetchSummary,
  };
}
