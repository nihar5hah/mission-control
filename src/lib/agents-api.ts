// =====================================================
// THE BEGU COMPANY - AGENTS API
// Mission Control Revamp
// =====================================================

import { supabase } from './supabase';
import type {
  Agent,
  AgentId,
  AgentActivity,
  AgentActivityInsert,
  AgentSession,
  AgentSessionInsert,
  AgentStats,
  AgentStatsInsert,
  AgentSchedule,
  AgentScheduleInsert,
  AgentDocument,
  AgentDocumentInsert,
} from '@/types/agents';

// =====================================================
// AGENTS API
// =====================================================
export const agentsApi = {
  /**
   * Get all agents
   */
  async getAll(): Promise<Agent[]> {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get a single agent by ID
   */
  async getById(id: AgentId): Promise<Agent | null> {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },
};

// =====================================================
// AGENT ACTIVITIES API
// =====================================================
export const agentActivitiesApi = {
  /**
   * Get activities for a specific agent
   */
  async getByAgent(agentId: AgentId, limit?: number): Promise<AgentActivity[]> {
    let query = supabase
      .from('agent_activities')
      .select('*')
      .eq('agent_id', agentId)
      .order('timestamp', { ascending: false });

    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  /**
   * Get all activities across all agents
   */
  async getAll(limit?: number): Promise<AgentActivity[]> {
    let query = supabase
      .from('agent_activities')
      .select('*')
      .order('timestamp', { ascending: false });

    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  /**
   * Get the latest activity for each agent
   */
  async getLatestForEach(): Promise<AgentActivity[]> {
    // Get all agents first
    const agents = await agentsApi.getAll();
    
    // Get latest activity for each
    const activities: AgentActivity[] = [];
    for (const agent of agents) {
      const { data, error } = await supabase
        .from('agent_activities')
        .select('*')
        .eq('agent_id', agent.id)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        activities.push(data);
      }
    }

    return activities;
  },

  /**
   * Create a new activity
   */
  async create(activity: AgentActivityInsert): Promise<AgentActivity> {
    const { data, error } = await supabase
      .from('agent_activities')
      .insert(activity)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Log an activity (convenience method)
   */
  async log(
    agentId: AgentId,
    action: string,
    description: string,
    status: 'running' | 'completed' | 'failed' | 'pending' | 'idle' = 'running',
    metadata?: Record<string, unknown>
  ): Promise<AgentActivity> {
    return this.create({
      agent_id: agentId,
      action,
      description,
      status,
      metadata: metadata || {},
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Update activity status
   */
  async updateStatus(id: number, status: string): Promise<AgentActivity> {
    const { data, error } = await supabase
      .from('agent_activities')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// =====================================================
// AGENT SESSIONS API
// =====================================================
export const agentSessionsApi = {
  /**
   * Get active sessions for all agents
   */
  async getActive(): Promise<AgentSession[]> {
    const { data, error } = await supabase
      .from('agent_sessions')
      .select('*')
      .in('status', ['active', 'idle'])
      .is('ended_at', null)
      .order('last_active', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get session for a specific agent
   */
  async getByAgent(agentId: AgentId): Promise<AgentSession | null> {
    const { data, error } = await supabase
      .from('agent_sessions')
      .select('*')
      .eq('agent_id', agentId)
      .is('ended_at', null)
      .order('last_active', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Create or update a session
   */
  async upsert(session: AgentSessionInsert): Promise<AgentSession> {
    const { data, error } = await supabase
      .from('agent_sessions')
      .upsert(session, { onConflict: 'session_key' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update session status
   */
  async updateStatus(id: number, status: 'active' | 'idle' | 'offline', currentAction?: string): Promise<AgentSession> {
    const update: Record<string, unknown> = { 
      status, 
      last_active: new Date().toISOString() 
    };
    if (currentAction !== undefined) {
      update.current_action = currentAction;
    }

    const { data, error } = await supabase
      .from('agent_sessions')
      .update(update)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * End a session
   */
  async end(id: number): Promise<void> {
    const { error } = await supabase
      .from('agent_sessions')
      .update({
        status: 'offline',
        ended_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
  },
};

// =====================================================
// AGENT STATS API
// =====================================================
export const agentStatsApi = {
  /**
   * Get stats for all agents
   */
  async getAll(): Promise<AgentStats[]> {
    const { data, error } = await supabase
      .from('agent_stats')
      .select('*');

    if (error) throw error;
    return data || [];
  },

  /**
   * Get stats for a specific agent
   */
  async getByAgent(agentId: AgentId): Promise<AgentStats | null> {
    const { data, error } = await supabase
      .from('agent_stats')
      .select('*')
      .eq('agent_id', agentId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Update stats
   */
  async update(agentId: AgentId, stats: Partial<AgentStatsInsert>): Promise<AgentStats> {
    const { data, error } = await supabase
      .from('agent_stats')
      .update({
        ...stats,
        updated_at: new Date().toISOString(),
      })
      .eq('agent_id', agentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Increment a stat
   */
  async increment(agentId: AgentId, field: keyof AgentStats, amount: number = 1): Promise<void> {
    const { error } = await supabase.rpc('increment_agent_stat', {
      p_agent_id: agentId,
      p_field: field,
      p_amount: amount,
    });

    // If RPC doesn't exist, fall back to manual update
    if (error) {
      const current = await this.getByAgent(agentId);
      if (current) {
        const newValue = (current[field] as number || 0) + amount;
        await this.update(agentId, { [field]: newValue } as any);
      }
    }
  },
};

// =====================================================
// AGENT SCHEDULES API
// =====================================================
export const agentSchedulesApi = {
  /**
   * Get schedules for a specific agent
   */
  async getByAgent(agentId: AgentId): Promise<AgentSchedule[]> {
    const { data, error } = await supabase
      .from('agent_schedules')
      .select('*')
      .eq('agent_id', agentId)
      .order('scheduled_for', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get all schedules
   */
  async getAll(): Promise<AgentSchedule[]> {
    const { data, error } = await supabase
      .from('agent_schedules')
      .select('*')
      .order('scheduled_for', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get upcoming schedules (next 7 days)
   */
  async getUpcoming(days: number = 7): Promise<AgentSchedule[]> {
    const now = new Date();
    const endDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from('agent_schedules')
      .select('*')
      .gte('scheduled_for', now.toISOString())
      .lte('scheduled_for', endDate.toISOString())
      .order('scheduled_for', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Create a schedule
   */
  async create(schedule: AgentScheduleInsert): Promise<AgentSchedule> {
    const { data, error } = await supabase
      .from('agent_schedules')
      .insert(schedule)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update schedule status
   */
  async updateStatus(id: number, status: 'pending' | 'in_progress' | 'completed' | 'cancelled'): Promise<AgentSchedule> {
    const { data, error } = await supabase
      .from('agent_schedules')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a schedule
   */
  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('agent_schedules')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// =====================================================
// AGENT DOCUMENTS API
// =====================================================
export const agentDocumentsApi = {
  /**
   * Get documents for a specific agent
   */
  async getByAgent(agentId: AgentId): Promise<AgentDocument[]> {
    const { data, error } = await supabase
      .from('agent_documents')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get all documents
   */
  async getAll(): Promise<AgentDocument[]> {
    const { data, error } = await supabase
      .from('agent_documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Search documents
   */
  async search(query: string, agentId?: AgentId): Promise<AgentDocument[]> {
    let queryBuilder = supabase
      .from('agent_documents')
      .select('*');

    if (agentId) {
      queryBuilder = queryBuilder.eq('agent_id', agentId);
    }

    const { data, error } = await queryBuilder
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .limit(20);

    if (error) throw error;
    return data || [];
  },

  /**
   * Create or update a document
   */
  async upsert(document: AgentDocumentInsert): Promise<AgentDocument> {
    const { data, error } = await supabase
      .from('agent_documents')
      .upsert(document, { onConflict: 'agent_id,source_file' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a document
   */
  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('agent_documents')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
