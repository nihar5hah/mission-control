import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qbtlslagwbgrnnuaasma.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFidGxzbGFnd2Jncm5udWFhc21hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwOTAzNzksImV4cCI6MjA4NjY2NjM3OX0.95mIKqkW4Q6wtx6vvJk_XdDVK8vobmX2v98f1KRITSk';

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
  async getCompletion(taskId: number, date: Date): Promise<'pending' | 'completed'> {
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

    return data?.status || 'pending';
  },

  /**
   * Set completion status for a task on a specific date
   */
  async setCompletion(taskId: number, date: Date, status: 'pending' | 'completed'): Promise<void> {
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD

    // First try to get existing record
    const { data: existing } = await db.taskCompletions()
      .select('id')
      .eq('task_id', taskId)
      .eq('completion_date', dateStr)
      .single();

    if (existing) {
      // Update existing record
      const { error } = await db.taskCompletions()
        .update({ status })
        .eq('task_id', taskId)
        .eq('completion_date', dateStr);

      if (error) throw error;
    } else {
      // Insert new record
      const { error } = await db.taskCompletions()
        .insert({
          task_id: taskId,
          completion_date: dateStr,
          status,
        });

      if (error) throw error;
    }
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
