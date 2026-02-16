// =====================================================
// THE BEGU COMPANY - AGENTS HOOKS
// Real-time hooks for agent data
// =====================================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  agentsApi,
  agentActivitiesApi,
  agentSessionsApi,
  agentStatsApi,
  agentSchedulesApi,
  agentDocumentsApi,
} from '@/lib/agents-api';
import type {
  Agent,
  AgentId,
  AgentActivity,
  AgentSession,
  AgentStats,
  AgentSchedule,
  AgentDocument,
  AgentState,
} from '@/types/agents';

// Default agents for fallback
const DEFAULT_AGENTS: Agent[] = [
  { id: 'begubot', name: 'Begubot', role: 'Chief of Staff', color: '#8B5CF6', reports_to: undefined, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'coder', name: 'Coder', role: 'Employee', color: '#10B981', reports_to: 'begubot', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'researcher', name: 'Researcher', role: 'Employee', color: '#F59E0B', reports_to: 'begubot', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

// =====================================================
// USE AGENTS HOOK
// Get all agents with real-time updates
// =====================================================
export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const data = await agentsApi.getAll();
        setAgents(data.length > 0 ? data : DEFAULT_AGENTS);
        setLoading(false);
      } catch (err) {
        // Use default agents if table doesn't exist
        console.log('Using default agents (table may not exist yet)');
        setAgents(DEFAULT_AGENTS);
        setLoading(false);
      }
    };

    fetchAgents();

    // Real-time subscription for agent changes
    const channel = supabase
      .channel('agents_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'agents' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAgents((prev) => [...prev, payload.new as Agent]);
          } else if (payload.eventType === 'UPDATE') {
            setAgents((prev) =>
              prev.map((a) => (a.id === (payload.new as Agent).id ? (payload.new as Agent) : a))
            );
          } else if (payload.eventType === 'DELETE') {
            setAgents((prev) => prev.filter((a) => a.id !== (payload.old as Agent).id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { agents, loading, error };
}

// =====================================================
// USE AGENT ACTIVITIES HOOK
// Get activities with real-time updates
// =====================================================
export function useAgentActivities(agentId?: AgentId, limit: number = 20) {
  const [activities, setActivities] = useState<AgentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = agentId
          ? await agentActivitiesApi.getByAgent(agentId, limit)
          : await agentActivitiesApi.getAll(limit);
        setActivities(data.length > 0 ? data : DEFAULT_ACTIVITIES);
        setLoading(false);
      } catch (err) {
        // Use default activities if table doesn't exist
        console.log('Using default activities (table may not exist yet)');
        setActivities(DEFAULT_ACTIVITIES.filter(a => !agentId || a.agent_id === agentId));
        setLoading(false);
      }
    };

    fetchActivities();

    // Real-time subscription
    const channel = supabase
      .channel(`agent_activities_${agentId || 'all'}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_activities',
          ...(agentId ? { filter: `agent_id=eq.${agentId}` } : {}),
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setActivities((prev) => [payload.new as AgentActivity, ...prev].slice(0, limit));
          } else if (payload.eventType === 'UPDATE') {
            setActivities((prev) =>
              prev.map((a) =>
                a.id === (payload.new as AgentActivity).id ? (payload.new as AgentActivity) : a
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setActivities((prev) => prev.filter((a) => a.id !== (payload.old as AgentActivity).id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [agentId, limit]);

  const logActivity = useCallback(
    async (
      action: string,
      description: string,
      status: 'running' | 'completed' | 'failed' | 'pending' | 'idle' = 'running',
      metadata?: Record<string, unknown>
    ) => {
      if (!agentId) return;
      try {
        await agentActivitiesApi.log(agentId, action, description, status, metadata);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to log activity');
      }
    },
    [agentId]
  );

  return { activities, loading, error, logActivity };
}

// =====================================================
// USE AGENT SESSIONS HOOK
// Get active sessions with real-time updates
// =====================================================
export function useAgentSessions() {
  const [sessions, setSessions] = useState<AgentSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await agentSessionsApi.getActive();
        setSessions(data.length > 0 ? data : DEFAULT_SESSIONS);
        setLoading(false);
      } catch (err) {
        // Use default sessions if table doesn't exist
        console.log('Using default sessions (table may not exist yet)');
        setSessions(DEFAULT_SESSIONS);
        setLoading(false);
      }
    };

    fetchSessions();

    // Real-time subscription
    const channel = supabase
      .channel('agent_sessions_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'agent_sessions' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setSessions((prev) => [...prev, payload.new as AgentSession]);
          } else if (payload.eventType === 'UPDATE') {
            const newSession = payload.new as AgentSession;
            setSessions((prev) => {
              const filtered = prev.filter((s) => s.id !== newSession.id);
              // Only add if session is still active
              if (newSession.status !== 'offline' && !newSession.ended_at) {
                return [...filtered, newSession];
              }
              return filtered;
            });
          } else if (payload.eventType === 'DELETE') {
            setSessions((prev) => prev.filter((s) => s.id !== (payload.old as AgentSession).id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { sessions, loading, error };
}

// =====================================================
// USE AGENT STATS HOOK
// Get stats with real-time updates
// =====================================================
export function useAgentStats(agentId?: AgentId) {
  const [stats, setStats] = useState<AgentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await agentStatsApi.getAll();
        setStats(data.length > 0 ? data : DEFAULT_STATS);
        setLoading(false);
      } catch (err) {
        // Use default stats if table doesn't exist
        console.log('Using default stats (table may not exist yet)');
        setStats(DEFAULT_STATS);
        setLoading(false);
      }
    };

    fetchStats();

    // Real-time subscription
    const channel = supabase
      .channel('agent_stats_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'agent_stats' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setStats((prev) => [...prev, payload.new as AgentStats]);
          } else if (payload.eventType === 'UPDATE') {
            setStats((prev) =>
              prev.map((s) =>
                s.id === (payload.new as AgentStats).id ? (payload.new as AgentStats) : s
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [agentId]);

  const getStatsForAgent = useCallback(
    (id: AgentId): AgentStats | undefined => {
      return stats.find((s) => s.agent_id === id);
    },
    [stats]
  );

  return { stats, loading, error, getStatsForAgent };
}

// =====================================================
// USE AGENT SCHEDULES HOOK
// Get schedules with real-time updates
// =====================================================
export function useAgentSchedules(agentId?: AgentId) {
  const [schedules, setSchedules] = useState<AgentSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const data = agentId
          ? await agentSchedulesApi.getByAgent(agentId)
          : await agentSchedulesApi.getAll();
        setSchedules(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch schedules');
        setLoading(false);
      }
    };

    fetchSchedules();

    // Real-time subscription
    const channel = supabase
      .channel(`agent_schedules_${agentId || 'all'}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_schedules',
          ...(agentId ? { filter: `agent_id=eq.${agentId}` } : {}),
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setSchedules((prev) => [...prev, payload.new as AgentSchedule]);
          } else if (payload.eventType === 'UPDATE') {
            setSchedules((prev) =>
              prev.map((s) =>
                s.id === (payload.new as AgentSchedule).id ? (payload.new as AgentSchedule) : s
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setSchedules((prev) => prev.filter((s) => s.id !== (payload.old as AgentSchedule).id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [agentId]);

  return { schedules, loading, error };
}

// =====================================================
// USE AGENT DOCUMENTS HOOK
// Get documents with real-time updates
// =====================================================
export function useAgentDocuments(agentId?: AgentId) {
  const [documents, setDocuments] = useState<AgentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const data = agentId
          ? await agentDocumentsApi.getByAgent(agentId)
          : await agentDocumentsApi.getAll();
        setDocuments(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch documents');
        setLoading(false);
      }
    };

    fetchDocuments();

    // Real-time subscription
    const channel = supabase
      .channel(`agent_documents_${agentId || 'all'}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_documents',
          ...(agentId ? { filter: `agent_id=eq.${agentId}` } : {}),
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setDocuments((prev) => [payload.new as AgentDocument, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setDocuments((prev) =>
              prev.map((d) =>
                d.id === (payload.new as AgentDocument).id ? (payload.new as AgentDocument) : d
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setDocuments((prev) => prev.filter((d) => d.id !== (payload.old as AgentDocument).id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [agentId]);

  return { documents, loading, error };
}

// Default stats for fallback
const DEFAULT_STATS: AgentStats[] = [
  { id: 1, agent_id: 'begubot', total_tokens_used: 125000, total_tasks_completed: 47, total_tasks_failed: 2, total_uptime_seconds: 86400, last_reset: new Date().toISOString(), updated_at: new Date().toISOString(), daily_tokens_used: 15000, daily_tasks_completed: 8, daily_active_seconds: 28800, daily_date: new Date().toISOString().split('T')[0] },
  { id: 2, agent_id: 'coder', total_tokens_used: 89000, total_tasks_completed: 32, total_tasks_failed: 1, total_uptime_seconds: 72000, last_reset: new Date().toISOString(), updated_at: new Date().toISOString(), daily_tokens_used: 12000, daily_tasks_completed: 5, daily_active_seconds: 21600, daily_date: new Date().toISOString().split('T')[0] },
  { id: 3, agent_id: 'researcher', total_tokens_used: 67000, total_tasks_completed: 28, total_tasks_failed: 0, total_uptime_seconds: 57600, last_reset: new Date().toISOString(), updated_at: new Date().toISOString(), daily_tokens_used: 8500, daily_tasks_completed: 4, daily_active_seconds: 18000, daily_date: new Date().toISOString().split('T')[0] },
];

// Default activities for fallback
const DEFAULT_ACTIVITIES: AgentActivity[] = [
  { id: 1, agent_id: 'begubot', action: 'coordinating', description: 'Managing daily operations and task assignments', status: 'running', metadata: {}, timestamp: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 2, agent_id: 'coder', action: 'building', description: 'Implementing new Mission Control features', status: 'running', metadata: {}, timestamp: new Date(Date.now() - 600000).toISOString(), created_at: new Date(Date.now() - 600000).toISOString() },
  { id: 3, agent_id: 'researcher', action: 'researching', description: 'Analyzing best practices for agent architecture', status: 'running', metadata: {}, timestamp: new Date(Date.now() - 300000).toISOString(), created_at: new Date(Date.now() - 300000).toISOString() },
];

// Default sessions for fallback
const DEFAULT_SESSIONS: AgentSession[] = [
  { id: 1, agent_id: 'begubot', session_key: 'begubot-main-session', status: 'active', current_action: 'coordinating', started_at: new Date(Date.now() - 28800000).toISOString(), last_active: new Date().toISOString(), metadata: {} },
  { id: 2, agent_id: 'coder', session_key: 'coder-main-session', status: 'active', current_action: 'building', started_at: new Date(Date.now() - 14400000).toISOString(), last_active: new Date(Date.now() - 120000).toISOString(), metadata: {} },
  { id: 3, agent_id: 'researcher', session_key: 'researcher-main-session', status: 'active', current_action: 'researching', started_at: new Date(Date.now() - 21600000).toISOString(), last_active: new Date(Date.now() - 300000).toISOString(), metadata: {} },
];

// =====================================================
// USE AGENT STATE HOOK
// Combined hook for complete agent state
// =====================================================
export function useAgentState(): {
  agentStates: AgentState[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
} {
  const [agentStates, setAgentStates] = useState<AgentState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      
      // Try to fetch all data in parallel
      const [agentsResult, sessionsResult, statsResult, activitiesResult] = await Promise.allSettled([
        agentsApi.getAll(),
        agentSessionsApi.getActive(),
        agentStatsApi.getAll(),
        agentActivitiesApi.getAll(3),
      ]);

      // Use fallback data if any request failed
      const agents = agentsResult.status === 'fulfilled' && agentsResult.value.length > 0 
        ? agentsResult.value 
        : DEFAULT_AGENTS;
      const sessions = sessionsResult.status === 'fulfilled' 
        ? sessionsResult.value 
        : DEFAULT_SESSIONS;
      const stats = statsResult.status === 'fulfilled' && statsResult.value.length > 0
        ? statsResult.value 
        : DEFAULT_STATS;
      const activities = activitiesResult.status === 'fulfilled' 
        ? activitiesResult.value 
        : DEFAULT_ACTIVITIES;

      // Build combined state
      const states: AgentState[] = agents.map((agent) => {
        const session = sessions.find((s) => s.agent_id === agent.id);
        const agentStats = stats.find((s) => s.agent_id === agent.id);
        const latestActivity = activities.find((a) => a.agent_id === agent.id);
        
        return {
          agent,
          session,
          stats: agentStats,
          latestActivity,
          isOnline: !!session && session.status !== 'offline',
        };
      });

      setAgentStates(states);
      setLoading(false);
    } catch (err) {
      // Use default data on error
      console.log('Using default agent states (tables may not exist yet)');
      const states: AgentState[] = DEFAULT_AGENTS.map((agent, idx) => ({
        agent,
        session: DEFAULT_SESSIONS[idx],
        stats: DEFAULT_STATS[idx],
        latestActivity: DEFAULT_ACTIVITIES[idx],
        isOnline: true,
      }));
      setAgentStates(states);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();

    // Subscribe to all relevant tables
    const agentsChannel = supabase
      .channel('agents_state_agents')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agents' }, fetchAll)
      .subscribe();

    const sessionsChannel = supabase
      .channel('agents_state_sessions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agent_sessions' }, fetchAll)
      .subscribe();

    const statsChannel = supabase
      .channel('agents_state_stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agent_stats' }, fetchAll)
      .subscribe();

    const activitiesChannel = supabase
      .channel('agents_state_activities')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agent_activities' }, fetchAll)
      .subscribe();

    return () => {
      supabase.removeChannel(agentsChannel);
      supabase.removeChannel(sessionsChannel);
      supabase.removeChannel(statsChannel);
      supabase.removeChannel(activitiesChannel);
    };
  }, [fetchAll]);

  return { agentStates, loading, error, refresh: fetchAll };
}
