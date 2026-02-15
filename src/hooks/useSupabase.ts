'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { activitiesApi, tasksApi, documentsApi } from '@/lib/api';
import type { Activity, Task, Document, ActivityInsert, TaskInsert } from '@/types/database';

// Activities Hook
export function useActivities(limit?: number) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndSubscribe = async () => {
      try {
        const data = await activitiesApi.getAll(limit);
        setActivities(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch activities');
        setLoading(false);
      }
    };

    fetchAndSubscribe();

    // Real-time subscription
    const channel = supabase
      .channel('activities_channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'activities'
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setActivities((prev) => [payload.new as Activity, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setActivities((prev) =>
            prev.map((a) => a.id === payload.new.id ? payload.new as Activity : a)
          );
        } else if (payload.eventType === 'DELETE') {
          setActivities((prev) => prev.filter((a) => a.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [limit]);

  const updateActivity = async (id: number, data: Partial<Activity>) => {
    try {
      await activitiesApi.update(id, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update activity');
    }
  };

  const deleteActivity = async (id: number) => {
    try {
      await activitiesApi.delete(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete activity');
    }
  };

  return { activities, loading, error, updateActivity, deleteActivity };
}

// Tasks Hook
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndSubscribe = async () => {
      try {
        const data = await tasksApi.getAll();
        setTasks(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
        setLoading(false);
      }
    };

    fetchAndSubscribe();

    // Real-time subscription
    const channel = supabase
      .channel('tasks_channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks'
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setTasks((prev) => [...prev, payload.new as Task]);
        } else if (payload.eventType === 'UPDATE') {
          setTasks((prev) =>
            prev.map((t) => t.id === payload.new.id ? payload.new as Task : t)
          );
        } else if (payload.eventType === 'DELETE') {
          setTasks((prev) => prev.filter((t) => t.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      const updatedTask = await tasksApi.updateStatus(id, status);
      // Immediately update local state
      setTasks((prev) =>
        prev.map((t) => t.id === id ? updatedTask : t)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  const updateTask = async (id: number, data: Partial<Task>) => {
    try {
      const updatedTask = await tasksApi.update(id, data);
      // Immediately update local state
      setTasks((prev) =>
        prev.map((t) => t.id === id ? updatedTask : t)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  const createTask = async (task: TaskInsert) => {
    try {
      const newTask = await tasksApi.create(task);
      // Immediately add to local state (don't wait for realtime)
      setTasks((prev) => [...prev, newTask]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await tasksApi.delete(id);
      // Immediately remove from local state
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  return { tasks, loading, error, updateStatus, updateTask, createTask, deleteTask };
}

// Documents Hook (with debounced search)
export function useDocuments(searchQuery: string) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!searchQuery) {
      setDocuments([]);
      return;
    }

    setLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const data = await documentsApi.search(searchQuery);
        setDocuments(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setLoading(false);
      }
    }, 300); // Debounce 300ms

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return { documents, loading, error };
}
