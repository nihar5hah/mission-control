'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { activitiesApi, tasksApi, documentsApi } from '@/lib/api';
import type { Activity, Task, Document } from '@/types/database';

// Activities Hook
export function useActivities(limit = 50) {
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
          setActivities((prev) => [payload.new as Activity, ...prev].slice(0, limit));
        } else if (payload.eventType === 'UPDATE') {
          setActivities((prev) =>
            prev.map((a) => a.id === payload.new.id ? payload.new as Activity : a)
          );
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [limit]);

  return { activities, loading, error };
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
      await tasksApi.updateStatus(id, status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  return { tasks, loading, error, updateStatus };
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
