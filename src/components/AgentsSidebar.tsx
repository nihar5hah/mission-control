// =====================================================
// THREE AGENTS SIDEBAR COMPONENT - COMPACT VIEW
// Shows Begubot, Coder, and Researcher with live status
// Modal opens on click for full agent details
// =====================================================

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Code,
  Microscope,
  AlertCircle,
  Zap,
  Users,
  X,
} from 'lucide-react';
import { useAgentState, useAgentActivities } from '@/hooks/useAgents';
import type { AgentId, AgentState, AgentActivity } from '@/types/agents';
import { AGENT_CONFIG } from '@/types/agents';
import { formatTimeAgo } from '@/lib/formatters';
import { useState } from 'react';
import AgentDetailsModal from './AgentDetailsModal';

// Status indicator component (simplified for compact view)
function StatusIndicator({ isOnline, status }: { isOnline: boolean; status?: string }) {
  const statusConfig = {
    online: { color: '#10b981', label: 'Online' },
    offline: { color: '#ef4444', label: 'Offline' },
    idle: { color: '#f59e0b', label: 'Idle' },
  };

  let config = statusConfig.offline;
  if (isOnline) {
    config = status === 'idle' ? statusConfig.idle : statusConfig.online;
  }

  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: config.color }}
      />
      <span className="text-xs capitalize" style={{ color: 'var(--text-tertiary)' }}>
        {config.label}
      </span>
    </div>
  );
}

// Helper to get agent icon component
function getAgentIcon(agentId: AgentId) {
  if (agentId === 'begubot') return Bot;
  if (agentId === 'coder') return Code;
  if (agentId === 'researcher') return Microscope;
  return Bot; // default
}

// Agent avatar component
function AgentAvatar({ agentId, color, size = 'sm' }: { agentId: AgentId; color: string; size?: 'sm' | 'lg' }) {
  const Icon = getAgentIcon(agentId);
  const sizeClass = size === 'lg' ? 'w-20 h-20' : 'w-10 h-10';
  const iconSize = size === 'lg' ? 'w-10 h-10' : 'w-5 h-5';

  return (
    <motion.div
      className={`${sizeClass} rounded-lg flex items-center justify-center relative overflow-hidden flex-shrink-0`}
      style={{ backgroundColor: `${color}18`, border: `1px solid ${color}28` }}
      whileHover={{ scale: 1.05 }}
    >
      <Icon className={iconSize} style={{ color }} />
    </motion.div>
  );
}

// Compact agent row component
function CompactAgentRow({
  state,
  onSelect,
}: {
  state: AgentState;
  onSelect: () => void;
}) {
  const { agent, session, stats, isOnline } = state;
  const config = AGENT_CONFIG[agent.id];

  return (
    <motion.div
      onClick={onSelect}
      className="cursor-pointer group transition-all duration-200"
      style={{
        padding: '12px',
        backgroundColor: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '10px',
        minHeight: '64px',
      }}
      whileHover={{
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderColor: 'rgba(6, 64, 43, 0.3)',
        y: -2,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center gap-2">
        {/* Avatar */}
        <AgentAvatar agentId={agent.id} color={config.color} />

        {/* Info - left aligned */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
            {config.name}
          </p>
          <p className="text-xs line-clamp-1" style={{ color: 'var(--text-tertiary)' }}>
            {config.role}
          </p>
        </div>

        {/* Status indicator - right aligned */}
        <StatusIndicator isOnline={isOnline} status={session?.status} />

        {/* Quick stat badge */}
        {stats && (
          <div
            className="px-2 py-1 rounded-lg text-xs font-medium flex-shrink-0"
            style={{
              backgroundColor: 'rgba(255,255,255,0.06)',
              color: 'var(--text-tertiary)',
            }}
          >
            {stats.daily_tasks_completed} tasks
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Main sidebar component
export function AgentsSidebar({ isOpen = false, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const { agentStates, loading, error } = useAgentState();
  const [selectedAgent, setSelectedAgent] = useState<AgentState | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Get activities for modal (only when an agent is selected)
  const shouldFetchActivities = selectedAgent !== null;
  const { activities: modalActivities } = useAgentActivities(
    selectedAgent?.agent.id,
    10,
    shouldFetchActivities  // Pass the enabled flag as 3rd parameter
  );

  const handleSelectAgent = (agent: AgentState) => {
    setSelectedAgent(agent);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    // Keep selectedAgent state for smooth transitions
  };

  const sidebarContent = loading ? (
    <div className="flex items-center justify-center py-12">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
        <Zap className="w-6 h-6 text-teal-600" />
      </motion.div>
    </div>
  ) : error ? (
    <div className="text-center py-12">
      <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
      <p className="text-sm text-red-600">{error}</p>
    </div>
  ) : (
    <>
      {/* Header - Compact */}
      <div className="p-3 transition-all duration-300" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 className="font-semibold flex items-center gap-2 text-sm transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>
          <Users className="w-4 h-4 text-teal-600" />
          Agents
        </h2>
      </div>

      {/* Agent list - Compact rows */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {agentStates.map((state) => (
          <CompactAgentRow
            key={state.agent.id}
            state={state}
            onSelect={() => handleSelectAgent(state)}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 transition-all duration-300" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between text-xs transition-colors duration-300" style={{ color: 'var(--text-tertiary)' }}>
          <span>Real-time sync active</span>
          <motion.div
            className="flex items-center gap-1"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Live</span>
          </motion.div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar - Collapsible */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="hidden md:flex flex-col h-full shadow-sm transition-all duration-300"
            style={{
              backgroundColor: '#1c1c1e',
              borderRight: '1px solid rgba(255,255,255,0.06)',
              width: '320px'
            }}
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          >
            {sidebarContent}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <motion.div
              className="absolute left-0 top-0 h-full w-72 flex flex-col shadow-lg transition-all duration-300"
              style={{
                backgroundColor: '#1c1c1e',
                borderRight: '1px solid rgba(255,255,255,0.06)'
              }}
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            >
              <div className="p-4 flex items-center justify-between transition-all duration-300" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <h2 className="font-semibold text-sm transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>Agents</h2>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
                  style={{
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg-elevated)', color: 'var(--text-tertiary)'
                  }}
                  aria-label="Close sidebar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {sidebarContent}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Agent Details Modal */}
      {selectedAgent && (
        <AgentDetailsModal
          agent={selectedAgent}
          activities={modalActivities}
          isOpen={showModal}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}

export default AgentsSidebar;
