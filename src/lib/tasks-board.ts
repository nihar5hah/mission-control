import type { TaskBoardItem, TaskBoardInsert, TaskBoardStatus } from '@/types/tasks-board';

export const tasksBoardApi = {
  async getAll(): Promise<TaskBoardItem[]> {
    const res = await fetch('/api/tasks-board');
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return res.json();
  },

  async create(task: TaskBoardInsert): Promise<TaskBoardItem> {
    const res = await fetch('/api/tasks-board', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || 'Failed to create task');
    }
    return res.json();
  },

  async update(id: string, data: Partial<TaskBoardItem>): Promise<TaskBoardItem> {
    const res = await fetch(`/api/tasks-board/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || 'Failed to update task');
    }
    return res.json();
  },

  async updateStatus(id: string, status: TaskBoardStatus): Promise<TaskBoardItem> {
    return this.update(id, { status });
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`/api/tasks-board/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || 'Failed to delete task');
    }
  },
};
