'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, taskCompletionsApi } from '@/lib/supabase';
import type { TaskCompletionStatus } from '@/types/database';

// Completion status for a specific task on a specific date
export interface TaskCompletionRecord {
  [key: string]: TaskCompletionStatus; // key: `${taskId}_${date}`
}

/**
 * Hook to manage date-specific task completions
 * Uses Supabase real-time subscriptions for live updates across tabs
 * 
 * Storage: Supabase task_completions table
 * Key format: `${taskId}_${YYYY-MM-DD}`
 */
export function useTaskCompletions() {
  const [completions, setCompletions] = useState<TaskCompletionRecord>({});
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get the completion key for a task on a specific date
   */
  const getCompletionKey = useCallback((taskId: number, date: Date): string => {
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    return `${taskId}_${dateStr}`;
  }, []);

  /**
   * Load initial completions from Supabase
   * This happens once on mount for each task we interact with
   */
  const loadCompletionForDate = useCallback(async (taskId: number, date: Date) => {
    try {
      const key = getCompletionKey(taskId, date);
      
      // Only load if we don't have this data yet
      if (completions[key] === undefined) {
        const status = await taskCompletionsApi.getCompletion(taskId, date);
        setCompletions(prev => ({
          ...prev,
          [key]: status,
        }));
      }
    } catch (err) {
      console.error('Failed to load task completion:', err);
      setError(err instanceof Error ? err.message : 'Failed to load completion');
    }
  }, [completions, getCompletionKey]);

  /**
   * Check if a task is completed on a specific date
   */
  const isCompletedOnDate = useCallback((taskId: number, date: Date): boolean => {
    const key = getCompletionKey(taskId, date);
    return completions[key] === 'completed';
  }, [completions, getCompletionKey]);

  /**
   * Get completion status for a task on a specific date
   */
  const getStatusOnDate = useCallback((taskId: number, date: Date): TaskCompletionStatus => {
    const key = getCompletionKey(taskId, date);
    return completions[key] || 'pending';
  }, [completions, getCompletionKey]);

  /**
   * Toggle completion status for a task on a specific date
   * Updates both local state and Supabase
   */
  const toggleCompletion = useCallback(async (taskId: number, date: Date): Promise<void> => {
    const key = getCompletionKey(taskId, date);
    const currentStatus = completions[key];
    const newStatus: TaskCompletionStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    
    // Optimistic update
    setCompletions(prev => ({
      ...prev,
      [key]: newStatus,
    }));

    // Persist to Supabase
    try {
      await taskCompletionsApi.setCompletion(taskId, date, newStatus);
    } catch (err) {
      console.error('Failed to toggle task completion:', err);
      // Revert on error
      setCompletions(prev => ({
        ...prev,
        [key]: currentStatus || 'pending',
      }));
      setError(err instanceof Error ? err.message : 'Failed to toggle completion');
    }
  }, [completions, getCompletionKey]);

  /**
   * Set completion status for a task on a specific date
   */
  const setCompletion = useCallback(async (taskId: number, date: Date, status: TaskCompletionStatus): Promise<void> => {
    const key = getCompletionKey(taskId, date);
    
    // Optimistic update
    setCompletions(prev => ({
      ...prev,
      [key]: status,
    }));

    // Persist to Supabase
    try {
      await taskCompletionsApi.setCompletion(taskId, date, status);
    } catch (err) {
      console.error('Failed to set task completion:', err);
      // Revert on error
      setCompletions(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setError(err instanceof Error ? err.message : 'Failed to set completion');
    }
  }, [getCompletionKey]);

  /**
   * Preload completions for tasks on specific dates
   * Call this before rendering to avoid loading during render
   */
  const preloadCompletions = useCallback(async (taskIds: number[], dates: Date[]) => {
    const keys = new Set<string>();
    
    // Collect all keys we need to load
    for (const taskId of taskIds) {
      for (const date of dates) {
        const key = getCompletionKey(taskId, date);
        if (completions[key] === undefined) {
          keys.add(key);
        }
      }
    }

    // Load all missing completions in parallel
    const loadPromises = Array.from(keys).map(async (key) => {
      const match = key.match(/^(\d+)_/);
      if (match) {
        const taskId = parseInt(match[1], 10);
        const dateStr = key.split('_')[1];
        const date = new Date(dateStr);
        
        try {
          const status = await taskCompletionsApi.getCompletion(taskId, date);
          setCompletions(prev => ({
            ...prev,
            [key]: status,
          }));
        } catch (err) {
          console.error(`Failed to load completion for task ${taskId}:`, err);
        }
      }
    });

    await Promise.all(loadPromises);
  }, [completions, getCompletionKey]);

  /**
   * Clear all completions (useful for testing)
   * Note: This only clears local state, not Supabase
   */
  const clearAllCompletions = useCallback(() => {
    setCompletions({});
  }, []);

  const normalizeStatus = useCallback((status: string | null | undefined): TaskCompletionStatus => {
    if (!status) return 'pending';
    if (status === 'running') return 'in_progress';
    if (status === 'in_progress' || status === 'completed' || status === 'pending' || status === 'failed') {
      return status;
    }
    return 'pending';
  }, []);

  // Initial load (when component mounts, we start with empty state)
  useEffect(() => {
    setLoaded(true);
  }, []);

  // Realtime subscription for task completion updates
  useEffect(() => {
    const channel = supabase
      .channel('task_completions_channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'task_completions',
      }, (payload) => {
        if (payload.eventType === 'DELETE') {
          const oldRow = payload.old as { task_id?: number; completion_date?: string } | null;
          if (oldRow?.task_id && oldRow.completion_date) {
            const key = `${oldRow.task_id}_${oldRow.completion_date}`;
            setCompletions(prev => {
              const next = { ...prev };
              delete next[key];
              return next;
            });
          }
          return;
        }

        const newRow = payload.new as { task_id?: number; completion_date?: string; status?: string } | null;
        if (newRow?.task_id && newRow.completion_date) {
          const key = `${newRow.task_id}_${newRow.completion_date}`;
          const status = normalizeStatus(newRow.status);
          setCompletions(prev => ({
            ...prev,
            [key]: status,
          }));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [normalizeStatus]);

  return {
    completions,
    loaded,
    error,
    isCompletedOnDate,
    getStatusOnDate,
    toggleCompletion,
    setCompletion,
    clearAllCompletions,
    getCompletionKey,
    loadCompletionForDate,
    preloadCompletions,
  };
}
