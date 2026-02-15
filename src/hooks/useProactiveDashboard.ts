/**
 * Proactive Dashboard Hook
 * Manages reactive data fetching for the proactive dashboard
 */

import { useState, useEffect, useCallback } from 'react';
import type { 
  ProactiveAction, 
  Pattern, 
  Opportunity, 
  Decision,
  DashboardSummary,
  DashboardStats 
} from '@/types/proactive';

interface UseProactiveDashboardReturn {
  // Data
  actions: ProactiveAction[];
  patterns: Pattern[];
  opportunities: Opportunity[];
  suggestions: Array<{
    decision: string;
    reasoning: string;
    confidence: number;
    suggested_actions: string[];
  }>;
  predictions: Array<{
    type: string;
    description: string;
    likelihood: number;
    timeframe: string;
    action_items: string[];
  }>;
  stats: DashboardStats | null;
  
  // Loading states
  loading: boolean;
  refreshing: boolean;
  
  // Actions
  refresh: () => Promise<void>;
  triggerAnalysis: () => Promise<void>;
  triggerScan: () => Promise<void>;
  dismissAction: (id: number) => Promise<void>;
  completeAction: (id: number) => Promise<void>;
  updateOpportunityStatus: (id: number, status: string) => Promise<void>;
}

export function useProactiveDashboard(): UseProactiveDashboardReturn {
  const [actions, setActions] = useState<ProactiveAction[]>([]);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const url = isRefresh 
        ? '/api/proactive/dashboard?refresh=true' 
        : '/api/proactive/dashboard';
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard');
      }

      const data = await response.json();
      
      setActions(data.actions_last_24h || []);
      setPatterns(data.patterns || []);
      setOpportunities(data.opportunities || []);
      setSuggestions(data.suggestions || []);
      setPredictions(data.predictions || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('Failed to fetch proactive dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const refresh = useCallback(async () => {
    await fetchDashboard(true);
  }, [fetchDashboard]);

  const triggerAnalysis = useCallback(async () => {
    try {
      await fetch('/api/proactive/patterns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyze' }),
      });
      await refresh();
    } catch (error) {
      console.error('Failed to trigger analysis:', error);
    }
  }, [refresh]);

  const triggerScan = useCallback(async () => {
    try {
      await fetch('/api/proactive/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'scan' }),
      });
      await refresh();
    } catch (error) {
      console.error('Failed to trigger scan:', error);
    }
  }, [refresh]);

  const dismissAction = useCallback(async (id: number) => {
    try {
      await fetch(`/api/proactive/actions?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'dismissed' }),
      });
      await refresh();
    } catch (error) {
      console.error('Failed to dismiss action:', error);
    }
  }, [refresh]);

  const completeAction = useCallback(async (id: number) => {
    try {
      await fetch(`/api/proactive/actions?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });
      await refresh();
    } catch (error) {
      console.error('Failed to complete action:', error);
    }
  }, [refresh]);

  const updateOpportunityStatus = useCallback(async (id: number, status: string) => {
    try {
      await fetch(`/api/proactive/opportunities?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      await refresh();
    } catch (error) {
      console.error('Failed to update opportunity:', error);
    }
  }, [refresh]);

  return {
    actions,
    patterns,
    opportunities,
    suggestions,
    predictions,
    stats,
    loading,
    refreshing,
    refresh,
    triggerAnalysis,
    triggerScan,
    dismissAction,
    completeAction,
    updateOpportunityStatus,
  };
}

export default useProactiveDashboard;
