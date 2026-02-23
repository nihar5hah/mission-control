'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Loader2, Sparkles, ChevronDown } from 'lucide-react';
import { useTasksBoard } from '@/hooks/useTasksBoard';
import { AGENT_CONFIG } from '@/types/agents';
import type { AgentId } from '@/types/agents';
import type { TaskBoardPriority } from '@/types/tasks-board';

const OWNERS: AgentId[] = ['extractor', 'begubot', 'coder', 'researcher'];
const PRIORITIES: { value: TaskBoardPriority; label: string; color: string }[] = [
  { value: 'LOW', label: 'Low', color: 'var(--color-teal)' },
  { value: 'MEDIUM', label: 'Medium', color: 'var(--color-orange)' },
  { value: 'HIGH', label: 'High', color: 'var(--color-red)' },
  { value: 'CRITICAL', label: 'Critical', color: '#EF4444' },
];

export function QuickTaskCapture() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [owner, setOwner] = useState<AgentId>('extractor');
  const [priority, setPriority] = useState<TaskBoardPriority>('MEDIUM');
  const [creating, setCreating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { createTask } = useTasksBoard();

  const handleCreate = async () => {
    if (!title.trim()) return;

    setCreating(true);
    try {
      await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        owner,
        priority,
        status: 'TODO',
        labels: [],
      });

      // Reset form
      setTitle('');
      setDescription('');
      setOwner('extractor');
      setPriority('MEDIUM');
      setIsOpen(false);

      // Show success animation
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleCreate();
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
        style={{
          background: 'linear-gradient(135deg, var(--accent) 0%, #059669 100%)',
          boxShadow: '0 4px 20px rgba(6, 64, 43, 0.4)',
        }}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        aria-label="Quick add task"
      >
        <AnimatePresence mode="wait">
          {showSuccess ? (
            <motion.div
              key="success"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
            >
              <Sparkles className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="plus"
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
            >
              <Plus className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed z-50 bottom-24 right-6 w-[90vw] max-w-md"
              onKeyDown={handleKeyDown}
            >
              <div
                className="rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2">
                    <Plus className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                    <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Quick Task</h3>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ color: 'var(--text-tertiary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form */}
                <div className="p-4 space-y-3">
                  {/* Title */}
                  <div>
                    <input
                      type="text"
                      placeholder="What needs to be done?"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2"
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        color: 'var(--text-primary)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                      autoFocus
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <textarea
                      placeholder="Details (optional)"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 resize-none"
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        color: 'var(--text-primary)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        minHeight: '80px',
                      }}
                    />
                  </div>

                  {/* Owner & Priority */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: 'var(--text-tertiary)' }}>Assign to</label>
                      <select
                        value={owner}
                        onChange={(e) => setOwner(e.target.value as AgentId)}
                        className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none"
                        style={{
                          background: 'rgba(255,255,255,0.08)',
                          color: 'var(--text-primary)',
                          border: '1px solid rgba(255,255,255,0.1)',
                        }}
                      >
                        {OWNERS.map((o) => (
                          <option key={o} value={o} style={{ background: 'var(--bg-elevated)' }}>
                            {AGENT_CONFIG[o]?.emoji} {AGENT_CONFIG[o]?.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs mb-1 block" style={{ color: 'var(--text-tertiary)' }}>Priority</label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as TaskBoardPriority)}
                        className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none"
                        style={{
                          background: 'rgba(255,255,255,0.08)',
                          color: 'var(--text-primary)',
                          border: '1px solid rgba(255,255,255,0.1)',
                        }}
                      >
                        {PRIORITIES.map((p) => (
                          <option key={p.value} value={p.value} style={{ background: 'var(--bg-elevated)' }}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Hint */}
                  <p className="text-xs text-center" style={{ color: 'var(--text-tertiary)' }}>
                    Press <kbd className="px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.08)' }}>⌘</kbd> + <kbd className="px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.08)' }}>Enter</kbd> to create
                  </p>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 p-4" style={{ borderTop: '1px solid var(--border)' }}>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 rounded-xl text-sm font-medium"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!title.trim() || creating}
                    className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'var(--accent)',
                      color: 'white',
                    }}
                  >
                    {creating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Create Task
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
