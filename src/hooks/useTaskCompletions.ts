'use client';

import { useState, useEffect, useCallback } from 'react';

// Storage key for task completions
const STORAGE_KEY = 'mission_control_task_completions';

// Completion status for a specific task on a specific date
export interface TaskCompletionRecord {
  [key: string]: 'pending' | 'completed'; // key: `${taskId}_${date}`
}

/**
 * Hook to manage date-specific task completions
 * Used for daily tasks that need independent completion status per day
 * 
 * Storage: localStorage (until database migration is applied)
 * Key format: `${taskId}_${YYYY-MM-DD}`
 */
export function useTaskCompletions() {
  const [completions, setCompletions] = useState<TaskCompletionRecord>({});
  const [loaded, setLoaded] = useState(false);

  // Load completions from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCompletions(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load task completions:', error);
    }
    setLoaded(true);
  }, []);

  // Save completions to localStorage on change
  useEffect(() => {
    if (loaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(completions));
      } catch (error) {
        console.error('Failed to save task completions:', error);
      }
    }
  }, [completions, loaded]);

  /**
   * Get the completion key for a task on a specific date
   */
  const getCompletionKey = useCallback((taskId: number, date: Date): string => {
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    return `${taskId}_${dateStr}`;
  }, []);

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
  const getStatusOnDate = useCallback((taskId: number, date: Date): 'pending' | 'completed' => {
    const key = getCompletionKey(taskId, date);
    return completions[key] || 'pending';
  }, [completions, getCompletionKey]);

  /**
   * Toggle completion status for a task on a specific date
   */
  const toggleCompletion = useCallback((taskId: number, date: Date): void => {
    const key = getCompletionKey(taskId, date);
    const currentStatus = completions[key];
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    
    setCompletions(prev => ({
      ...prev,
      [key]: newStatus,
    }));
  }, [getCompletionKey]);

  /**
   * Set completion status for a task on a specific date
   */
  const setCompletion = useCallback((taskId: number, date: Date, status: 'pending' | 'completed'): void => {
    const key = getCompletionKey(taskId, date);
    setCompletions(prev => ({
      ...prev,
      [key]: status,
    }));
  }, [getCompletionKey]);

  /**
   * Clear all completions (useful for testing)
   */
  const clearAllCompletions = useCallback(() => {
    setCompletions({});
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    completions,
    loaded,
    isCompletedOnDate,
    getStatusOnDate,
    toggleCompletion,
    setCompletion,
    clearAllCompletions,
    getCompletionKey,
  };
}
