import { db } from './supabase';
import type { Activity, ActivityInsert, Task, TaskInsert, Document } from '@/types/database';

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
    return data;
  },

  async updateStatus(id: number, status: string): Promise<Task> {
    const { data, error } = await db.tasks()
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: number, data: Partial<Task>): Promise<Task> {
    const { data: result, error } = await db.tasks()
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  async delete(id: number): Promise<void> {
    const { error } = await db.tasks()
      .delete()
      .eq('id', id);

    if (error) throw error;
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
