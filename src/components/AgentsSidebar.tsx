// =====================================================
// THREE AGENTS SIDEBAR COMPONENT
// Shows Begubot, Coder, and Researcher with live status
// =====================================================

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Code,
  Microscope,
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
  ChevronRight,
  Users,
  Calendar,
  FileText,
  TestTube,
  Wrench,
  Rocket,
  RefreshCw,
  Coffee,
  Hammer,
  Circle,
} from 'lucide-react';
import { useAgentState, useAgentActivities } from '@/hooks/useAgents';
import type { AgentId, AgentState, AgentActivity, AGENT_ACTION_CONFIG } from '@/types/agents';
import { AGENT_CONFIG } from '@/types/agents';
import { useState } from 'react';

// Icon mapping
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Hammer,
  Microscope,
  RefreshCw,
  Wrench,
  Rocket,
  TestTube,
  Users,
  Calendar,
  FileText,
  Clock,
  Coffee,
  Bot,
  Code,
  Circle,
};

// Action config with proper typing
const ACTION_CONFIG: Record<string, { label: string; icon: string; color: string; bg: string; border: string }> = {
  building: { label: 'Building', icon: 'Hammer', color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10', border: 'border-[#F59E0B]/30' },
  researching: { label: 'Researching', icon: 'Microscope', color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/10', border: 'border-[#8B5CF6]/30' },
  syncing: { label: 'Syncing', icon: 'RefreshCw', color: 'text-[#06B6D4]', bg: 'bg-[#06B6D4]/10', border: 'border-[#06B6D4]/30' },
  fixing: { label: 'Fixing Bug', icon: 'Wrench', color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10', border: 'border-[#EF4444]/30' },
  deploying: { label: 'Deploying', icon: 'Rocket', color: 'text-[#10B981]', bg: 'bg-[#10B981]/10', border: 'border-[#10B981]/30' },
  testing: { label: 'Testing', icon: 'TestTube', color: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/10', border: 'border-[#3B82F6]/30' },
  coordinating: { label: 'Coordinating', icon: 'Users', color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/10', border: 'border-[#8B5CF6]/30' },
  meeting: { label: 'In Meeting', icon: 'Calendar', color: 'text-[#EC4899]', bg: 'bg-[#EC4899]/10', border: 'border-[#EC4899]/30' },
  documenting: { label: 'Documenting', icon: 'FileText', color: 'text-[#6366F1]', bg: 'bg-[#6366F1]/10', border: 'border-[#6366F1]/30' },
  idle: { label: 'Idle', icon: 'Clock', color: 'text-[#888]', bg: 'bg-[#888]/10', border: 'border-[#888]/30' },
  water_cooler: { label: 'Water Cooler', icon: 'Coffee', color: 'text-[#14B8A6]', bg: 'bg-[#14B8A6]/10', border: 'border-[#14B8A6]/30' },
};

// Get action config with fallback
function getActionConfig(action: string) {
  return ACTION_CONFIG[action] || {
    label: action.charAt(0).toUpperCase() + action.slice(1),
    icon: 'Circle',
    color: 'text-[#888]',
    bg: 'bg-[#888]/10',
    border: 'border-[#888]/30',
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

// Status indicator component
function StatusIndicator({ isOnline, status }: { isOnline: boolean; status?: string }) {
  if (!isOnline) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-[#666]" />
        <span className="text-xs text-[#666]">Offline</span>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    active: 'bg-[#10B981]',
    idle: 'bg-[#F59E0B]',
    offline: 'bg-[#666]',
  };

  return (
    <div className="flex items-center gap-1.5">
      <motion.div
        className={`w-2 h-2 rounded-full ${statusColors[status || 'active']}`}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <span className="text-xs text-[#888] capitalize">{status || 'Active'}</span>
    </div>
  );
}

// Agent avatar component
function AgentAvatar({ agentId, color, size = 'md' }: { agentId: AgentId; color: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const Icon = agentId === 'begubot' ? Bot : agentId === 'coder' ? Code : Microscope;

  return (
    <motion.div
      className={`${sizeClasses[size]} rounded-lg flex items-center justify-center relative overflow-hidden`}
      style={{ backgroundColor: `${color}20`, border: `1px solid ${color}40` }}
      whileHover={{ scale: 1.05 }}
    >
      <Icon className={iconSizes[size]} style={{ color }} />
    </motion.div>
  );
}

// Single agent card component
function AgentCard({
  state,
  isExpanded,
  onToggle,
  activities,
}: {
  state: AgentState;
  isExpanded: boolean;
  onToggle: () => void;
  activities: AgentActivity[];
}) {
  const { agent, session, stats, latestActivity, isOnline } = state;
  const config = AGENT_CONFIG[agent.id];
  const actionConfig = latestActivity ? getActionConfig(latestActivity.action) : null;
  const ActionIcon = actionConfig ? ICON_MAP[actionConfig.icon] || Circle : Circle;

  return (
    <motion.div
      className="bg-[#161616] border border-[#262626] rounded-lg overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ borderColor: '#333' }}
    >
      {/* Main card */}
      <div className="p-4 cursor-pointer" onClick={onToggle}>
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative">
            <AgentAvatar agentId={agent.id} color={config.color} />
            {/* Online indicator */}
            <motion.div
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#161616] ${
                isOnline ? 'bg-[#10B981]' : 'bg-[#666]'
              }`}
              animate={isOnline ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white text-sm">{config.name}</h3>
              <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: `${config.color}20`, color: config.color }}>
                {config.role}
              </span>
            </div>
            <p className="text-xs text-[#888] mt-0.5 line-clamp-1">{config.description}</p>

            {/* Current activity */}
            {latestActivity && (
              <div className={`flex items-center gap-1.5 mt-2 px-2 py-1 rounded ${actionConfig?.bg} border ${actionConfig?.border}`}>
                <ActionIcon className={`w-3.5 h-3.5 ${actionConfig?.color}`} />
                <span className={`text-xs font-medium ${actionConfig?.color}`}>{actionConfig?.label}</span>
                <span className="text-xs text-[#666]">•</span>
                <span className="text-xs text-[#666]">{formatTimeAgo(latestActivity.timestamp)}</span>
              </div>
            )}
          </div>

          {/* Stats summary */}
          <div className="flex flex-col items-end gap-1">
            <StatusIndicator isOnline={isOnline} status={session?.status} />
            {stats && (
              <div className="text-xs text-[#888]">
                {stats.daily_tasks_completed} tasks today
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-[#262626]"
          >
            <div className="p-4 space-y-4">
              {/* Stats grid */}
              {stats && (
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-[#0F0F0F] rounded p-2 text-center">
                    <p className="text-xs text-[#666]">Tokens Today</p>
                    <p className="text-sm font-semibold text-white">{stats.daily_tokens_used.toLocaleString()}</p>
                  </div>
                  <div className="bg-[#0F0F0F] rounded p-2 text-center">
                    <p className="text-xs text-[#666]">Tasks Done</p>
                    <p className="text-sm font-semibold text-white">{stats.daily_tasks_completed}</p>
                  </div>
                  <div className="bg-[#0F0F0F] rounded p-2 text-center">
                    <p className="text-xs text-[#666]">Active Time</p>
                    <p className="text-sm font-semibold text-white">{formatDuration(stats.daily_active_seconds)}</p>
                  </div>
                </div>
              )}

              {/* Recent activities */}
              <div>
                <h4 className="text-xs font-semibold text-[#888] mb-2 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  Recent Activity
                </h4>
                <div className="space-y-2">
                  {activities.slice(0, 5).map((activity) => {
                    const ac = getActionConfig(activity.action);
                    const AcIcon = ICON_MAP[ac.icon] || Circle;
                    return (
                      <motion.div
                        key={activity.id}
                        className="flex items-center gap-2 p-2 bg-[#0F0F0F] rounded"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <AcIcon className={`w-3.5 h-3.5 ${ac.color}`} />
                        <span className="text-xs text-[#888] flex-1 line-clamp-1">{activity.description}</span>
                        <span className="text-xs text-[#666]">{formatTimeAgo(activity.timestamp)}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Session info */}
              {session && (
                <div className="text-xs text-[#666] flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  Session started {formatTimeAgo(session.started_at)}
                  {session.current_action && (
                    <>
                      <span>•</span>
                      <span>Currently: {session.current_action}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Main sidebar component
export function AgentsSidebar() {
  const { agentStates, loading, error } = useAgentState();
  const [expandedAgent, setExpandedAgent] = useState<AgentId | null>(null);

  // Get activities for expanded agent
  const { activities: expandedActivities } = useAgentActivities(expandedAgent || undefined, 10);

  if (loading) {
    return (
      <div className="w-80 bg-[#0F0F0F] border-r border-[#262626] p-4">
        <div className="flex items-center justify-center py-12">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
            <Zap className="w-6 h-6 text-[#5E6AD2]" />
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-80 bg-[#0F0F0F] border-r border-[#262626] p-4">
        <div className="text-center py-12">
          <AlertCircle className="w-8 h-8 text-[#E55454] mx-auto mb-2" />
          <p className="text-sm text-[#E55454]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-[#0F0F0F] border-r border-[#262626] flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-[#262626]">
        <h2 className="font-semibold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-[#5E6AD2]" />
          The Begu Company
        </h2>
        <p className="text-xs text-[#888] mt-1">3 AI agents • {agentStates.filter(s => s.isOnline).length} online</p>
      </div>

      {/* Agent list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {agentStates.map((state) => (
          <AgentCard
            key={state.agent.id}
            state={state}
            isExpanded={expandedAgent === state.agent.id}
            onToggle={() => setExpandedAgent(expandedAgent === state.agent.id ? null : state.agent.id)}
            activities={expandedAgent === state.agent.id ? expandedActivities : []}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#262626]">
        <div className="flex items-center justify-between text-xs text-[#666]">
          <span>Real-time sync active</span>
          <motion.div
            className="flex items-center gap-1"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            <span>Live</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default AgentsSidebar;
