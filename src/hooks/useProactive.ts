'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { ProactiveAction, Pattern, Opportunity, Decision, DashboardSummary, DashboardStats } from '@/types/proactive';

// =============================================
// PROACTIVE HOOK
// =============================================
export function useProactive() {
  const [actions, setActions] = useState<ProactiveAction[]>([]);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [
        { data: actionsData },
        { data: patternsData },
        { data: opportunitiesData },
        { data: decisionsData }
      ] = await Promise.all([
        supabase
          .from('proactive_actions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('patterns')
          .select('*')
          .eq('is_active', true)
          .order('impact_score', { ascending: false })
          .limit(20),
        supabase
          .from('opportunities')
          .select('*')
          .in('status', ['discovered', 'investigating', 'validated'])
          .order('priority_score', { ascending: false })
          .limit(20),
        supabase
          .from('decisions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20),
      ]);

      setActions(actionsData || []);
      setPatterns(patternsData || []);
      setOpportunities(opportunitiesData || []);
      setDecisions(decisionsData || []);

      // Calculate stats
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayActions = (actionsData || []).filter(
        a => new Date(a.created_at) >= todayStart
      );

      const totalConfidence = (patternsData || []).reduce(
        (acc, p) => acc + (p.confidence || 0), 0
      );

      setStats({
        total_actions_today: todayActions.length,
        completed_actions_today: todayActions.filter(a => a.status === 'completed').length,
        opportunities_found: (opportunitiesData || []).length,
        opportunities_implemented: (opportunitiesData || []).filter(
          o => o.status === 'implemented'
        ).length,
        patterns_detected: (patternsData || []).length,
        avg_confidence_score: patternsData?.length 
          ? totalConfidence / patternsData.length 
          : 0,
      });

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch proactive data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('proactive_realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'proactive_actions'
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setActions(prev => [payload.new as ProactiveAction, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setActions(prev => 
            prev.map(a => a.id === payload.new.id ? payload.new as ProactiveAction : a)
          );
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'patterns'
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setPatterns(prev => [payload.new as Pattern, ...prev]);
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'opportunities'
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setOpportunities(prev => [payload.new as Opportunity, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setOpportunities(prev =>
            prev.map(o => o.id === payload.new.id ? payload.new as Opportunity : o)
          );
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  // Create a new action
  const createAction = async (action: Omit<ProactiveAction, 'id' | 'created_at' | 'completed_at'>) => {
    const { data, error } = await supabase
      .from('proactive_actions')
      .insert(action)
      .select()
      .single();

    if (error) throw error;
    if (data) {
      setActions(prev => [data as ProactiveAction, ...prev]);
    }
    return data;
  };

  // Update action status
  const updateActionStatus = async (id: number, status: string) => {
    const updates: Record<string, unknown> = { status };
    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('proactive_actions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (data) {
      setActions(prev => prev.map(a => a.id === id ? data as ProactiveAction : a));
    }
    return data;
  };

  // Update opportunity status
  const updateOpportunityStatus = async (id: number, status: string) => {
    const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
    if (status === 'implemented') {
      updates.implemented_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('opportunities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (data) {
      setOpportunities(prev => prev.map(o => o.id === id ? data as Opportunity : o));
    }
    return data;
  };

  // Create a decision
  const createDecision = async (decision: Omit<Decision, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('decisions')
      .insert(decision)
      .select()
      .single();

    if (error) throw error;
    if (data) {
      setDecisions(prev => [data as Decision, ...prev]);
    }
    return data;
  };

  // Dismiss an action
  const dismissAction = async (id: number) => {
    return updateActionStatus(id, 'dismissed');
  };

  // Trigger pattern analysis
  const analyzePatterns = async () => {
    const response = await fetch('/api/proactive/analyze', {
      method: 'POST',
    });
    return response.json();
  };

  // Find opportunities
  const findOpportunities = async () => {
    const response = await fetch('/api/proactive/opportunities', {
      method: 'POST',
    });
    return response.json();
  };

  return {
    actions,
    patterns,
    opportunities,
    decisions,
    stats,
    loading,
    error,
    refresh: fetchData,
    createAction,
    updateActionStatus,
    updateOpportunityStatus,
    createDecision,
    dismissAction,
    analyzePatterns,
    findOpportunities,
  };
}

export default useProactive;
