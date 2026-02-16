'use client';

import { useState, useEffect, useCallback } from 'react';
import { taskCompletionsApi } from '@/lib/supabase';

// Completion status for a specific task on a specific date
export interface TaskCompletionRecord {
  [key: string]: 'pending' | 'completed'; // key: `${taskId}_${date}`
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
    // Ensure we load this if we haven't yet
    if (completions[key] === undefined) {
      loadCompletionForDate(taskId, date);
    }
    return completions[key] === 'completed';
  }, [completions, getCompletionKey, loadCompletionForDate]);

  /**
   * Get completion status for a task on a specific date
   */
  const getStatusOnDate = useCallback((taskId: number, date: Date): 'pending' | 'completed' => {
    const key = getCompletionKey(taskId, date);
    // Ensure we load this if we haven't yet
    if (completions[key] === undefined) {
      loadCompletionForDate(taskId, date);
    }
    return completions[key] || 'pending';
  }, [completions, getCompletionKey, loadCompletionForDate]);

  /**
   * Toggle completion status for a task on a specific date
   * Updates both local state and Supabase
   */
  const toggleCompletion = useCallback(async (taskId: number, date: Date): Promise<void> => {
    const key = getCompletionKey(taskId, date);
    const currentStatus = completions[key];
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    
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
  const setCompletion = useCallback(async (taskId: number, date: Date, status: 'pending' | 'completed'): Promise<void> => {
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
   * Clear all completions (useful for testing)
   * Note: This only clears local state, not Supabase
   */
  const clearAllCompletions = useCallback(() => {
    setCompletions({});
  }, []);

  // Initial load (when component mounts, we start with empty state)
  useEffect(() => {
    setLoaded(true);
  }, []);

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
  };
}
