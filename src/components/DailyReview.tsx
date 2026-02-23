'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAgentActivities } from '@/hooks/useAgents';
import { useTasksBoard } from '@/hooks/useTasksBoard';
import {
  CheckCircle2,
  Clock,
  Zap,
  TrendingUp,
  Target,
  Timer,
  Sparkles,
  ArrowUpRight,
  Coffee,
} from 'lucide-react';
import { AGENT_CONFIG } from '@/types/agents';
import type { AgentId } from '@/types/agents';

export function DailyReview() {
  const { activities, loading: activitiesLoading } = useAgentActivities(undefined, 200);
  const { tasks, loading: tasksLoading } = useTasksBoard();

  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const stats = useMemo(() => {
    const todayActivities = activities.filter(a => new Date(a.timestamp) >= todayStart);
    
    const completedTasks = todayActivities.filter(a => a.status === 'completed').length;
    const totalTokens = todayActivities.reduce((sum, a) => sum + (Number(a.metadata?.tokens_used) || 0), 0);
    const totalSeconds = todayActivities.reduce((sum, a) => sum + (Number(a.metadata?.active_seconds) || Number(a.metadata?.duration_seconds) || 0), 0);
    
    // Group by agent
    const byAgent: Record<string, { tasks: number; tokens: number; seconds: number }> = {};
    for (const activity of todayActivities) {
      if (!byAgent[activity.agent_id]) {
        byAgent[activity.agent_id] = { tasks: 0, tokens: 0, seconds: 0 };
      }
      byAgent[activity.agent_id].tokens += Number(activity.metadata?.tokens_used) || 0;
      byAgent[activity.agent_id].seconds += Number(activity.metadata?.active_seconds) || Number(activity.metadata?.duration_seconds) || 0;
      if (activity.status === 'completed') {
        byAgent[activity.agent_id].tasks += 1;
      }
    }

    // Get unique action types
    const actionTypes = [...new Set(todayActivities.map(a => a.action))];
    
    // Find key accomplishments (completed activities with descriptions)
    const accomplishments = todayActivities
      .filter(a => a.status === 'completed' && a.description)
      .slice(0, 5)
      .map(a => ({
        agent: a.agent_id,
        action: a.action,
        description: a.description,
        time: new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));

    return {
      totalActivities: todayActivities.length,
      completedTasks,
      totalTokens,
      totalSeconds,
      byAgent,
      actionTypes,
      accomplishments,
    };
  }, [activities, todayStart]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const loading = activitiesLoading || tasksLoading;

  if (loading) {
    return (
      <div className="apple-card p-5">
        <div className="flex items-center justify-center py-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="w-5 h-5" style={{ color: 'var(--accent)' }} />
          </motion.div>
          <span className="ml-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>Analyzing your day...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="apple-card p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>Tasks Done</span>
            <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--color-green)' }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.completedTasks}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="apple-card p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>Active Time</span>
            <Clock className="w-4 h-4" style={{ color: 'var(--color-orange)' }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{formatDuration(stats.totalSeconds)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="apple-card p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>Tokens Used</span>
            <Zap className="w-4 h-4" style={{ color: 'var(--color-teal)' }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.totalTokens.toLocaleString()}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="apple-card p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>Activities</span>
            <TrendingUp className="w-4 h-4" style={{ color: 'var(--color-purple)' }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.totalActivities}</p>
        </motion.div>
      </div>

      {/* Key Accomplishments */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="apple-card p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Key Accomplishments</h3>
          </div>
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Today</span>
        </div>

        {stats.accomplishments.length === 0 ? (
          <div className="text-center py-6">
            <Coffee className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-tertiary)' }} />
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No completed tasks yet today</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Start working and check back!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {stats.accomplishments.map((item, idx) => {
              const config = AGENT_CONFIG[item.agent as AgentId];
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + idx * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${config?.color}18` }}>
                    <span className="text-sm">{config?.emoji || '🤖'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{item.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{config?.name}</span>
                      <span style={{ color: 'var(--text-tertiary)' }}>·</span>
                      <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{item.time}</span>
                      <span style={{ color: 'var(--text-tertiary)' }}>·</span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}>{item.action}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Agent Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="apple-card p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Timer className="w-5 h-5" style={{ color: 'var(--color-teal)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Agent Activity</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(stats.byAgent).map(([agentId, data]) => {
            const config = AGENT_CONFIG[agentId as AgentId];
            return (
              <div
                key={agentId}
                className="p-3 rounded-xl"
                style={{ background: `${config?.color}10`, border: `1px solid ${config?.color}20` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{config?.emoji || '🤖'}</span>
                  <span className="text-xs font-medium" style={{ color: config?.color }}>{config?.name}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Tasks</span>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{data.tasks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Time</span>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{formatDuration(data.seconds)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Tokens</span>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{data.tokens.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
