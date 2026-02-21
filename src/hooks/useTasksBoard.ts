'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { tasksBoardApi } from '@/lib/tasks-board';
import type { TaskBoardItem, TaskBoardInsert, TaskBoardStatus } from '@/types/tasks-board';

export function useTasksBoard() {
  const [tasks, setTasks] = useState<TaskBoardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndSubscribe = async () => {
      try {
        const data = await tasksBoardApi.getAll();
        setTasks(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
        setLoading(false);
      }
    };

    fetchAndSubscribe();

    const channel = supabase
      .channel('tasks_board_channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks_board',
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setTasks((prev) => [...prev, payload.new as TaskBoardItem]);
        } else if (payload.eventType === 'UPDATE') {
          setTasks((prev) => prev.map((t) => t.id === payload.new.id ? payload.new as TaskBoardItem : t));
        } else if (payload.eventType === 'DELETE') {
          setTasks((prev) => prev.filter((t) => t.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const createTask = async (task: TaskBoardInsert) => {
    const newTask = await tasksBoardApi.create(task);
    setTasks((prev) => [...prev, newTask]);
  };

  const claimTask = async (id: string, agentId: string, reason?: string) => {
    const response = await fetch(`/api/tasks-board/${id}/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent_id: agentId, reason }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.error || 'Failed to claim task');
    }

    const data = await response.json();
    setTasks((prev) => prev.map((task) => task.id === id ? data.task : task));
  };

  const updateTask = async (id: string, data: Partial<TaskBoardItem>) => {
    const updated = await tasksBoardApi.update(id, data);
    setTasks((prev) => prev.map((t) => t.id === id ? updated : t));
  };

  const updateStatus = async (id: string, status: TaskBoardStatus) => {
    const updated = await tasksBoardApi.updateStatus(id, status);
    setTasks((prev) => prev.map((t) => t.id === id ? updated : t));
  };

  const deleteTask = async (id: string) => {
    await tasksBoardApi.delete(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return { tasks, loading, error, createTask, updateTask, updateStatus, deleteTask, claimTask };
}
