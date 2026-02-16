/**
 * Test Suite: useTaskCompletions Hook
 * 
 * Tests for date-specific task completion tracking using Supabase
 * Key requirements:
 * - Marking a daily task complete on one day doesn't affect other days
 * - Completion status persists and syncs in real-time
 * - Changes reflect across browser tabs
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useTaskCompletions } from '../useTaskCompletions';
import * as supabaseModule from '@/lib/supabase';

// Mock the Supabase API
jest.mock('@/lib/supabase');

const mockTaskCompletionsApi = supabaseModule.taskCompletionsApi as jest.Mocked<typeof supabaseModule.taskCompletionsApi>;

describe('useTaskCompletions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCompletionKey', () => {
    it('should generate correct key format', () => {
      const { result } = renderHook(() => useTaskCompletions());
      const date = new Date('2025-02-16');
      const key = result.current.getCompletionKey(1, date);
      
      expect(key).toBe('1_2025-02-16');
    });

    it('should generate different keys for different dates', () => {
      const { result } = renderHook(() => useTaskCompletions());
      const date1 = new Date('2025-02-16');
      const date2 = new Date('2025-02-17');
      
      const key1 = result.current.getCompletionKey(1, date1);
      const key2 = result.current.getCompletionKey(1, date2);
      
      expect(key1).not.toBe(key2);
    });

    it('should generate different keys for different tasks', () => {
      const { result } = renderHook(() => useTaskCompletions());
      const date = new Date('2025-02-16');
      
      const key1 = result.current.getCompletionKey(1, date);
      const key2 = result.current.getCompletionKey(2, date);
      
      expect(key1).not.toBe(key2);
    });
  });

  describe('getStatusOnDate', () => {
    it('should return pending for uncompleted task', async () => {
      mockTaskCompletionsApi.getCompletion.mockResolvedValue('pending');
      
      const { result } = renderHook(() => useTaskCompletions());
      const date = new Date('2025-02-16');
      
      await act(async () => {
        await result.current.loadCompletionForDate(1, date);
      });
      
      const status = result.current.getStatusOnDate(1, date);
      expect(status).toBe('pending');
    });

    it('should return completed for completed task', async () => {
      mockTaskCompletionsApi.getCompletion.mockResolvedValue('completed');
      
      const { result } = renderHook(() => useTaskCompletions());
      const date = new Date('2025-02-16');
      
      await act(async () => {
        await result.current.loadCompletionForDate(1, date);
      });
      
      const status = result.current.getStatusOnDate(1, date);
      expect(status).toBe('completed');
    });

    it('should isolate completion status per day', async () => {
      mockTaskCompletionsApi.getCompletion.mockImplementation((taskId, date) => {
        const dateStr = date.toISOString().split('T')[0];
        // Mock: task 1 is completed on 2025-02-16, pending on 2025-02-17
        if (dateStr === '2025-02-16') {
          return Promise.resolve('completed');
        }
        return Promise.resolve('pending');
      });
      
      const { result } = renderHook(() => useTaskCompletions());
      const date1 = new Date('2025-02-16');
      const date2 = new Date('2025-02-17');
      
      await act(async () => {
        await result.current.loadCompletionForDate(1, date1);
        await result.current.loadCompletionForDate(1, date2);
      });
      
      const status1 = result.current.getStatusOnDate(1, date1);
      const status2 = result.current.getStatusOnDate(1, date2);
      
      expect(status1).toBe('completed');
      expect(status2).toBe('pending');
    });
  });

  describe('toggleCompletion', () => {
    it('should toggle from pending to completed', async () => {
      mockTaskCompletionsApi.getCompletion.mockResolvedValue('pending');
      mockTaskCompletionsApi.setCompletion.mockResolvedValue(undefined);
      
      const { result } = renderHook(() => useTaskCompletions());
      const date = new Date('2025-02-16');
      
      await act(async () => {
        await result.current.loadCompletionForDate(1, date);
      });
      
      await act(async () => {
        await result.current.toggleCompletion(1, date);
      });
      
      const status = result.current.getStatusOnDate(1, date);
      expect(status).toBe('completed');
      expect(mockTaskCompletionsApi.setCompletion).toHaveBeenCalledWith(1, date, 'completed');
    });

    it('should toggle from completed to pending', async () => {
      mockTaskCompletionsApi.getCompletion.mockResolvedValue('completed');
      mockTaskCompletionsApi.setCompletion.mockResolvedValue(undefined);
      
      const { result } = renderHook(() => useTaskCompletions());
      const date = new Date('2025-02-16');
      
      await act(async () => {
        await result.current.loadCompletionForDate(1, date);
      });
      
      await act(async () => {
        await result.current.toggleCompletion(1, date);
      });
      
      const status = result.current.getStatusOnDate(1, date);
      expect(status).toBe('pending');
      expect(mockTaskCompletionsApi.setCompletion).toHaveBeenCalledWith(1, date, 'pending');
    });

    it('should not affect other days when toggling', async () => {
      mockTaskCompletionsApi.getCompletion.mockImplementation((taskId, date) => {
        const dateStr = date.toISOString().split('T')[0];
        if (dateStr === '2025-02-16') {
          return Promise.resolve('pending');
        }
        return Promise.resolve('pending');
      });
      mockTaskCompletionsApi.setCompletion.mockResolvedValue(undefined);
      
      const { result } = renderHook(() => useTaskCompletions());
      const date1 = new Date('2025-02-16');
      const date2 = new Date('2025-02-17');
      
      await act(async () => {
        await result.current.loadCompletionForDate(1, date1);
        await result.current.loadCompletionForDate(1, date2);
      });
      
      // Toggle date1
      await act(async () => {
        await result.current.toggleCompletion(1, date1);
      });
      
      // date1 should be completed, date2 should still be pending
      const status1 = result.current.getStatusOnDate(1, date1);
      const status2 = result.current.getStatusOnDate(1, date2);
      
      expect(status1).toBe('completed');
      expect(status2).toBe('pending');
    });
  });

  describe('setCompletion', () => {
    it('should set completion status', async () => {
      mockTaskCompletionsApi.setCompletion.mockResolvedValue(undefined);
      
      const { result } = renderHook(() => useTaskCompletions());
      const date = new Date('2025-02-16');
      
      await act(async () => {
        await result.current.setCompletion(1, date, 'completed');
      });
      
      expect(mockTaskCompletionsApi.setCompletion).toHaveBeenCalledWith(1, date, 'completed');
    });

    it('should update local state optimistically', async () => {
      mockTaskCompletionsApi.setCompletion.mockResolvedValue(undefined);
      
      const { result } = renderHook(() => useTaskCompletions());
      const date = new Date('2025-02-16');
      
      // Note: We need to mock getCompletion to return pending initially
      mockTaskCompletionsApi.getCompletion.mockResolvedValue('pending');
      
      // Set to completed
      await act(async () => {
        await result.current.setCompletion(1, date, 'completed');
      });
      
      // Check local state immediately (before Supabase response)
      const status = result.current.getStatusOnDate(1, date);
      expect(status).toBe('completed');
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Supabase error');
      mockTaskCompletionsApi.setCompletion.mockRejectedValue(error);
      mockTaskCompletionsApi.getCompletion.mockResolvedValue('pending');
      
      const { result } = renderHook(() => useTaskCompletions());
      const date = new Date('2025-02-16');
      
      await act(async () => {
        await result.current.loadCompletionForDate(1, date);
      });
      
      await act(async () => {
        await result.current.setCompletion(1, date, 'completed');
      });
      
      // Check error state
      expect(result.current.error).toBeTruthy();
      expect(result.current.error).toContain('Supabase error');
    });
  });

  describe('real-time synchronization', () => {
    it('should maintain consistency across multiple task/date combinations', async () => {
      mockTaskCompletionsApi.getCompletion.mockResolvedValue('pending');
      mockTaskCompletionsApi.setCompletion.mockResolvedValue(undefined);
      
      const { result } = renderHook(() => useTaskCompletions());
      
      const task1Date1 = new Date('2025-02-16');
      const task1Date2 = new Date('2025-02-17');
      const task2Date1 = new Date('2025-02-16');
      
      // Load all combinations
      await act(async () => {
        await result.current.loadCompletionForDate(1, task1Date1);
        await result.current.loadCompletionForDate(1, task1Date2);
        await result.current.loadCompletionForDate(2, task2Date1);
      });
      
      // Toggle each one
      await act(async () => {
        await result.current.toggleCompletion(1, task1Date1);
        await result.current.toggleCompletion(1, task1Date2);
        await result.current.toggleCompletion(2, task2Date1);
      });
      
      // All should be completed independently
      expect(result.current.getStatusOnDate(1, task1Date1)).toBe('completed');
      expect(result.current.getStatusOnDate(1, task1Date2)).toBe('completed');
      expect(result.current.getStatusOnDate(2, task2Date1)).toBe('completed');
    });
  });

  describe('isCompletedOnDate', () => {
    it('should return true for completed tasks', async () => {
      mockTaskCompletionsApi.getCompletion.mockResolvedValue('completed');
      
      const { result } = renderHook(() => useTaskCompletions());
      const date = new Date('2025-02-16');
      
      await act(async () => {
        await result.current.loadCompletionForDate(1, date);
      });
      
      expect(result.current.isCompletedOnDate(1, date)).toBe(true);
    });

    it('should return false for pending tasks', async () => {
      mockTaskCompletionsApi.getCompletion.mockResolvedValue('pending');
      
      const { result } = renderHook(() => useTaskCompletions());
      const date = new Date('2025-02-16');
      
      await act(async () => {
        await result.current.loadCompletionForDate(1, date);
      });
      
      expect(result.current.isCompletedOnDate(1, date)).toBe(false);
    });
  });

  describe('clearAllCompletions', () => {
    it('should clear local state', async () => {
      mockTaskCompletionsApi.getCompletion.mockResolvedValue('completed');
      
      const { result } = renderHook(() => useTaskCompletions());
      const date = new Date('2025-02-16');
      
      await act(async () => {
        await result.current.loadCompletionForDate(1, date);
      });
      
      act(() => {
        result.current.clearAllCompletions();
      });
      
      expect(result.current.completions).toEqual({});
    });
  });
});
