import { db } from './supabase';
import { sendTaskNotification } from './notifications';
import type { Activity, ActivityInsert, Task, TaskInsert, Document } from '@/types/database';

// Activity Types for logging
export type ActivityType = 
  | 'build'      // Building features/projects
  | 'research'   // Research tasks
  | 'sync'       // Data synchronization
  | 'fix'        // Bug fixes
  | 'deploy'     // Deployments
  | 'test'       // Testing
  | 'agent-start'
  | 'agent-complete'
  | 'agent-error'
  | 'file-create'
  | 'file-update'
  | 'file-delete'
  | 'api-call'
  | 'db-query'
  | 'memory-save'
  | 'memory-recall'
  | 'git-commit'
  | 'git-push'
  | 'system-log';

// Log Activity Request
export interface LogActivityRequest {
  agent: string;
  action: ActivityType | string;
  description?: string;
  status?: 'running' | 'completed' | 'failed' | 'pending';
  metadata?: Record<string, unknown>;
}

// Activities API
export const activitiesApi = {
  async getAll(limit?: number): Promise<Activity[]> {
    let query = db.activities()
      .select('*')
      .order('timestamp', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async create(activity: ActivityInsert): Promise<Activity> {
    const { data, error } = await db.activities()
      .insert(activity)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Log an activity via the /api/activities/log endpoint
   * This is the preferred way to log activities from agents
   */
  async log(request: LogActivityRequest): Promise<Activity> {
    const response = await fetch('/api/activities/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to log activity');
    }

    const result = await response.json();
    return result.activity;
  },

  /**
   * Get recent activities via the /api/activities/log endpoint
   */
  async getRecent(limit?: number, agent?: string, action?: string): Promise<Activity[]> {
    const params = new URLSearchParams();
    if (limit) params.set('limit', limit.toString());
    if (agent) params.set('agent', agent);
    if (action) params.set('action', action);

    const response = await fetch(`/api/activities/log?${params.toString()}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch activities');
    }

    const result = await response.json();
    return result.activities;
  },

  async updateStatus(id: number, status: string): Promise<Activity> {
    const { data, error } = await db.activities()
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: number, data: Partial<Activity>): Promise<Activity> {
    const { data: result, error } = await db.activities()
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  async delete(id: number): Promise<void> {
    const { error } = await db.activities()
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Tasks API
export const tasksApi = {
  async getAll(): Promise<Task[]> {
    const { data, error } = await db.tasks()
      .select('*')
      .order('scheduled_for', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getDailyTasks(): Promise<Task[]> {
    const { data, error } = await db.tasks()
      .select('*')
      .eq('type', 'daily')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getTasksForDate(date: string): Promise<Task[]> {
    const { data, error } = await db.tasks()
      .select('*')
      .eq('scheduled_for', date)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async create(task: TaskInsert): Promise<Task> {
    const { data, error } = await db.tasks()
      .insert(task)
      .select()
      .single();

    if (error) throw error;
    
    // Send notification
    await sendTaskNotification({
      type: 'created',
      taskTitle: data.title,
      taskId: data.id,
      timestamp: new Date().toISOString(),
    });

    return data;
  },

  async updateStatus(id: number, status: string): Promise<Task> {
    const { data, error } = await db.tasks()
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    // Send notification for completion
    if (status === 'completed') {
      await sendTaskNotification({
        type: 'completed',
        taskTitle: data.title,
        taskId: data.id,
        timestamp: new Date().toISOString(),
      });
    }

    return data;
  },

  async update(id: number, data: Partial<Task>): Promise<Task> {
    const { data: result, error } = await db.tasks()
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    // Send notification for update
    await sendTaskNotification({
      type: 'updated',
      taskTitle: result.title,
      taskId: result.id,
      timestamp: new Date().toISOString(),
    });

    return result;
  },

  async delete(id: number): Promise<void> {
    // Get task info before deletion for notification
    const { data: taskData } = await db.tasks()
      .select('title')
      .eq('id', id)
      .single();

    const { error } = await db.tasks()
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    // Send notification
    if (taskData) {
      await sendTaskNotification({
        type: 'deleted',
        taskTitle: taskData.title,
        taskId: id,
        timestamp: new Date().toISOString(),
      });
    }
  },
};

// Documents API
export const documentsApi = {
  async search(query: string): Promise<Document[]> {
    if (!query) return [];

    const { data, error } = await db.documents()
      .select('*')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data || [];
  },

  async create(document: Omit<Document, 'id' | 'created_at' | 'updated_at'>): Promise<Document> {
    const { data, error } = await db.documents()
      .insert(document)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
