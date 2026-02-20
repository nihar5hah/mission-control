'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, User, ChevronRight, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTasksBoard } from '@/hooks/useTasksBoard';
import type { TaskBoardItem, TaskBoardPriority, TaskBoardStatus } from '@/types/tasks-board';

const owners = ['extractor', 'begubot', 'coder', 'researcher'];
const priorities: TaskBoardPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const statusColumns: { id: TaskBoardStatus; label: string; accent: string }[] = [
  { id: 'TODO', label: 'TODO', accent: 'var(--color-teal)' },
  { id: 'IN_PROGRESS', label: 'IN PROGRESS', accent: 'var(--color-orange)' },
  { id: 'DONE', label: 'DONE', accent: 'var(--color-green)' },
];

export function TasksBoard() {
  const { tasks, loading, createTask, updateTask, updateStatus, deleteTask } = useTasksBoard();
  const [form, setForm] = useState({ title: '', description: '', owner: 'extractor', priority: 'MEDIUM' as TaskBoardPriority });

  const grouped = useMemo(() => {
    const map: Record<TaskBoardStatus, TaskBoardItem[]> = { TODO: [], IN_PROGRESS: [], DONE: [] };
    tasks.forEach((task) => map[task.status].push(task));
    return map;
  }, [tasks]);

  const formatDate = (value?: string | null) => {
    if (!value) return '—';
    const date = new Date(value);
    return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.022em' }}>Tasks Board</h2>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Volunteer, claim, and complete tasks in one place.</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <button className="btn-apple-primary px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Task
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Task</DialogTitle>
              <DialogDescription>Capture a task and assign it to an agent or Begu.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <input
                className="w-full glass-tertiary px-3 py-2 text-sm rounded-xl focus:outline-none"
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <textarea
                className="w-full glass-tertiary px-3 py-2 text-sm rounded-xl focus:outline-none min-h-[120px]"
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  className="glass-tertiary px-3 py-2 text-sm rounded-xl"
                  value={form.owner}
                  onChange={(e) => setForm({ ...form, owner: e.target.value })}
                >
                  {owners.map((owner) => (
                    <option key={owner} value={owner}>{owner}</option>
                  ))}
                </select>
                <select
                  className="glass-tertiary px-3 py-2 text-sm rounded-xl"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value as TaskBoardPriority })}
                >
                  {priorities.map((priority) => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <button
                className="btn-apple-secondary px-4 py-2 rounded-xl text-sm"
                onClick={() => setForm({ title: '', description: '', owner: 'begu', priority: 'MEDIUM' })}
              >
                Reset
              </button>
              <button
                className="btn-apple-primary px-4 py-2 rounded-xl text-sm"
                onClick={async () => {
                  if (!form.title.trim()) return;
                  await createTask({
                    title: form.title,
                    description: form.description,
                    owner: form.owner,
                    priority: form.priority,
                    status: 'TODO',
                  });
                  setForm({ title: '', description: '', owner: 'begu', priority: 'MEDIUM' });
                }}
              >
                Create
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="apple-card p-6 text-sm" style={{ color: 'var(--text-tertiary)' }}>Loading tasks...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {statusColumns.map((column) => (
            <div key={column.id} className="apple-card p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{column.label}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${column.accent}22`, color: column.accent }}>
                  {grouped[column.id].length}
                </span>
              </div>

              {grouped[column.id].length === 0 && (
                <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>No tasks here yet.</div>
              )}

              {grouped[column.id].map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl p-3 space-y-2"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{task.title}</p>
                      {task.description && (
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{task.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1 rounded-lg"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                    <User className="w-3 h-3" />
                    {task.owner}
                    <span>·</span>
                    <span>{task.priority}</span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                    <span>Created {formatDate(task.created_at)}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      className="glass-tertiary px-2 py-1 text-xs rounded-lg"
                      value={task.owner}
                      onChange={(e) => updateTask(task.id, { owner: e.target.value })}
                    >
                      {owners.map((owner) => (
                        <option key={owner} value={owner}>{owner}</option>
                      ))}
                    </select>

                    <select
                      className="glass-tertiary px-2 py-1 text-xs rounded-lg"
                      value={task.priority}
                      onChange={(e) => updateTask(task.id, { priority: e.target.value as TaskBoardPriority })}
                    >
                      {priorities.map((priority) => (
                        <option key={priority} value={priority}>{priority}</option>
                      ))}
                    </select>

                    {task.status !== 'DONE' && (
                      <button
                        className="px-2 py-1 text-xs rounded-lg flex items-center gap-1"
                        style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
                        onClick={() => updateStatus(task.id, task.status === 'TODO' ? 'IN_PROGRESS' : 'DONE')}
                      >
                        Move
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}

                    {task.status === 'DONE' && (
                      <button
                        className="px-2 py-1 text-xs rounded-lg"
                        style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
                        onClick={() => updateStatus(task.id, 'TODO')}
                      >
                        Reopen
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
