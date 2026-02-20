import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase env variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export type AgentId = 'begubot' | 'coder' | 'researcher' | 'extractor';
export type ActivityStatus = 'running' | 'completed' | 'failed' | 'pending';

export interface LogActivityParams {
  agent_id: AgentId;
  action: string;
  description: string;
  status?: ActivityStatus;
  tokens_used?: number;
  metadata?: Record<string, any>;
}

export async function logActivity({
  agent_id,
  action,
  description,
  status = 'completed',
  tokens_used,
  metadata = {},
}: LogActivityParams): Promise<void> {
  try {
    const timestamp = new Date().toISOString();
    
    const { error } = await supabase
      .from('agent_activities')
      .insert({
        agent_id,
        action,
        description,
        status,
        metadata: {
          ...metadata,
          ...(typeof tokens_used === 'number' ? { tokens_used } : {}),
        },
        timestamp,
      });

    if (error) {
      console.error(`[ActivityLogger] Failed to log activity for ${agent_id}:`, error);
    }
    
    // Update agent stats
    const today = new Date().toISOString().split('T')[0];
    const { data: currentStats } = await supabase
      .from('agent_stats')
      .select('*')
      .eq('agent_id', agent_id)
      .single();

    const tokensDelta = typeof tokens_used === 'number' ? tokens_used : 0;
    const tasksDelta = status === 'completed' ? 1 : 0;

    await supabase
      .from('agent_stats')
      .upsert({
        agent_id,
        total_tokens_used: (currentStats?.total_tokens_used || 0) + tokensDelta,
        total_tasks_completed: (currentStats?.total_tasks_completed || 0) + tasksDelta,
        total_tasks_failed: currentStats?.total_tasks_failed || 0,
        total_uptime_seconds: currentStats?.total_uptime_seconds || 0,
        last_reset: currentStats?.last_reset || timestamp,
        updated_at: timestamp,
        daily_tokens_used: (currentStats?.daily_tokens_used || 0) + tokensDelta,
        daily_tasks_completed: (currentStats?.daily_tasks_completed || 0) + tasksDelta,
        daily_active_seconds: currentStats?.daily_active_seconds || 0,
        daily_date: today,
      }, { onConflict: 'agent_id' });
  } catch (error) {
    console.error('[ActivityLogger] Error:', error);
  }
}
