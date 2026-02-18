// =====================================================
// AGENT DETAILS MODAL COMPONENT
// Shows full stats and recent activities for an agent
// =====================================================

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Activity,
  Clock,
  Zap,
} from 'lucide-react';
import type { AgentState, AgentActivity } from '@/types/agents';
import { AGENT_CONFIG } from '@/types/agents';
import { useState } from 'react';

// Icon mapping
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Hammer: () => <span className="text-amber-600">⚒️</span>,
  Microscope: () => <span className="text-purple-600">🔬</span>,
  RefreshCw: () => <span className="text-cyan-600">🔄</span>,
  Wrench: () => <span className="text-red-600">🔧</span>,
  Rocket: () => <span className="text-emerald-600">🚀</span>,
  TestTube: () => <span className="text-blue-600">🧪</span>,
  Users: () => <span className="text-purple-600">👥</span>,
  Calendar: () => <span className="text-pink-600">📅</span>,
  FileText: () => <span className="text-indigo-600">📄</span>,
  Clock: () => <span className="text-slate-600">⏱️</span>,
  Coffee: () => <span className="text-cyan-600">☕</span>,
  Circle: () => <span className="text-slate-600">●</span>,
};

// Action config with proper typing
const ACTION_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  building: { label: 'Building', icon: 'Hammer', color: 'text-amber-600' },
  researching: { label: 'Researching', icon: 'Microscope', color: 'text-purple-600' },
  syncing: { label: 'Syncing', icon: 'RefreshCw', color: 'text-cyan-600' },
  fixing: { label: 'Fixing Bug', icon: 'Wrench', color: 'text-red-600' },
  deploying: { label: 'Deploying', icon: 'Rocket', color: 'text-emerald-600' },
  testing: { label: 'Testing', icon: 'TestTube', color: 'text-blue-600' },
  coordinating: { label: 'Coordinating', icon: 'Users', color: 'text-purple-600' },
  meeting: { label: 'In Meeting', icon: 'Calendar', color: 'text-pink-600' },
  documenting: { label: 'Documenting', icon: 'FileText', color: 'text-indigo-600' },
  idle: { label: 'Idle', icon: 'Clock', color: 'text-slate-600' },
  water_cooler: { label: 'Water Cooler', icon: 'Coffee', color: 'text-cyan-600' },
};

// Get action config with fallback
function getActionConfig(action: string) {
  return ACTION_CONFIG[action] || {
    label: action.charAt(0).toUpperCase() + action.slice(1),
    icon: 'Circle',
    color: 'text-slate-600',
  };
}

// Format time ago
function formatTimeAgo(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// Format duration
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

// Agent avatar component
function AgentAvatar({ agentId, color }: { agentId: string; color: string }) {
  const { Bot, Code, Microscope } = require('lucide-react');
  const Icon = agentId === 'begubot' ? Bot : agentId === 'coder' ? Code : Microscope;

  return (
    <div
      className="w-16 h-16 rounded-lg flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: `${color}18`, border: `2px solid ${color}` }}
    >
      <Icon className="w-8 h-8" style={{ color }} />
      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-20"
        style={{ background: `radial-gradient(circle, ${color}, transparent)` }}
      />
    </div>
  );
}

interface AgentDetailsModalProps {
  agent: AgentState;
  activities: AgentActivity[];
  isOpen: boolean;
  onClose: () => void;
}

export function AgentDetailsModal({
  agent,
  activities,
  isOpen,
  onClose,
}: AgentDetailsModalProps) {
  const config = AGENT_CONFIG[agent.agent.id];
  const { stats, session } = agent;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ backdropFilter: 'blur(4px)' }}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
              style={{ backgroundColor: '#1c1c1e', border: '1px solid rgba(255,255,255,0.1)' }}
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with close button */}
              <div
                className="flex items-center justify-between p-4"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              >
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Agent Details
                </h3>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: 'var(--text-tertiary)',
                  }}
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Agent Info */}
                <div className="flex flex-col items-center gap-4">
                  <AgentAvatar agentId={agent.agent.id} color={config.color} />
                  <div className="text-center">
                    <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                      {config.name}
                    </h2>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
                      {config.role}
                    </p>
                  </div>
                </div>

                {/* Stats Grid */}
                {stats && (
                  <div className="grid grid-cols-3 gap-3">
                    <div
                      className="rounded-xl p-3 text-center"
                      style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                    >
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        Tokens Today
                      </p>
                      <p
                        className="text-sm font-semibold mt-1"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {stats.daily_tokens_used.toLocaleString()}
                      </p>
                    </div>
                    <div
                      className="rounded-xl p-3 text-center"
                      style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                    >
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        Tasks Done
                      </p>
                      <p
                        className="text-sm font-semibold mt-1"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {stats.daily_tasks_completed}
                      </p>
                    </div>
                    <div
                      className="rounded-xl p-3 text-center"
                      style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                    >
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        Active Time
                      </p>
                      <p
                        className="text-sm font-semibold mt-1"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {formatDuration(stats.daily_active_seconds)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Recent Activities */}
                <div>
                  <h4
                    className="text-sm font-semibold mb-3 flex items-center gap-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <Activity className="w-4 h-4" />
                    Recent Activities
                  </h4>
                  <div className="space-y-2">
                    {activities && activities.length > 0 ? (
                      activities.slice(0, 5).map((activity) => {
                        const ac = getActionConfig(activity.action);
                        return (
                          <motion.div
                            key={activity.id}
                            className="flex items-start gap-3 p-3 rounded-lg"
                            style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                          >
                            <span className="text-sm mt-0.5">{ac.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p
                                className="text-xs font-medium line-clamp-1"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {ac.label}
                              </p>
                              <p
                                className="text-xs line-clamp-2 mt-0.5"
                                style={{ color: 'var(--text-tertiary)' }}
                              >
                                {activity.description}
                              </p>
                              <p
                                className="text-xs mt-1"
                                style={{ color: 'var(--text-tertiary)' }}
                              >
                                {formatTimeAgo(activity.timestamp)}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-center py-4" style={{ color: 'var(--text-tertiary)' }}>
                        No recent activities
                      </p>
                    )}
                  </div>
                </div>

                {/* Session Info */}
                {session && (
                  <div
                    className="flex items-start gap-3 p-3 rounded-lg"
                    style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                  >
                    <Clock className="w-4 h-4 mt-0.5" style={{ color: 'var(--text-tertiary)' }} />
                    <div className="flex-1">
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        Session started {formatTimeAgo(session.started_at)}
                      </p>
                      {session.current_action && (
                        <p className="text-xs mt-1 font-medium" style={{ color: 'var(--text-primary)' }}>
                          Currently: {session.current_action}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div
                className="p-4 flex justify-end"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
              >
                <motion.button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200"
                  style={{
                    backgroundColor: 'rgba(6, 64, 43, 0.3)',
                    color: 'var(--text-primary)',
                    border: '1px solid rgba(6, 64, 43, 0.4)',
                  }}
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(6, 64, 43, 0.4)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default AgentDetailsModal;
