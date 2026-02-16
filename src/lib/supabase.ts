import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Shorthand query helpers
export const db = {
  activities: () => supabase.from('activities'),
  tasks: () => supabase.from('tasks'),
  documents: () => supabase.from('documents'),
  taskCompletions: () => supabase.from('task_completions'),
};

// Task Completion API
export const taskCompletionsApi = {
  /**
   * Get completion status for a task on a specific date
   */
  async getCompletion(taskId: number, date: Date): Promise<'pending' | 'in_progress' | 'completed' | 'failed'> {
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    const { data, error } = await db.taskCompletions()
      .select('status')
      .eq('task_id', taskId)
      .eq('completion_date', dateStr)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is OK (means pending)
      throw error;
    }

    return (data?.status as any) || 'pending';
  },

  /**
   * Set completion status for a task on a specific date
   */
  async setCompletion(taskId: number, date: Date, status: 'pending' | 'in_progress' | 'completed' | 'failed'): Promise<void> {
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD

    const { error } = await db.taskCompletions()
      .upsert({
        task_id: taskId,
        completion_date: dateStr,
        status,
      }, { onConflict: 'task_id,completion_date' });

    if (error) throw error;
  },

  /**
   * Toggle completion status for a task on a specific date
   */
  async toggleCompletion(taskId: number, date: Date): Promise<'pending' | 'completed'> {
    const currentStatus = await this.getCompletion(taskId, date);
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    
    await this.setCompletion(taskId, date, newStatus);
    
    return newStatus;
  },

  /**
   * Get all completions for a task across all dates
   */
  async getTaskCompletions(taskId: number): Promise<Array<{ date: string; status: 'pending' | 'completed' }>> {
    const { data, error } = await db.taskCompletions()
      .select('completion_date, status')
      .eq('task_id', taskId)
      .order('completion_date', { ascending: true });

    if (error) throw error;
    
    return (data || []).map(d => ({
      date: d.completion_date,
      status: d.status,
    }));
  },

  /**
   * Subscribe to real-time updates for task completions
   */
  subscribeToTaskCompletions(taskId: number, callback: (update: any) => void) {
    const channel = supabase
      .channel(`task_completions:${taskId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'task_completions',
        filter: `task_id=eq.${taskId}`,
      }, (payload) => {
        callback(payload);
      })
      .subscribe();

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(channel);
    };
  },
};
