'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Circle, Wifi, WifiOff, Clock } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  status: 'online' | 'busy' | 'offline';
  lastActivity: Date;
  currentTask?: string;
}

interface AgentStatusProps {
  compact?: boolean;
}

// Mock agent data - in production this would come from a real-time source
const mockAgents: Agent[] = [
  {
    id: 'main',
    name: 'Main Agent',
    status: 'online',
    lastActivity: new Date(),
    currentTask: 'Processing request',
  },
  {
    id: 'subagent',
    name: 'Documentation Bot',
    status: 'busy',
    lastActivity: new Date(Date.now() - 60000),
    currentTask: 'Building docs tab',
  },
];

const statusConfig = {
  online: {
    color: 'var(--color-green)',
    bg: 'var(--color-green-muted)',
    label: 'Online',
  },
  busy: {
    color: 'var(--color-orange)',
    bg: 'var(--color-orange-muted)',
    label: 'Busy',
  },
  offline: {
    color: '#636366',
    bg: 'rgba(255,255,255,0.04)',
    label: 'Offline',
  },
};

export function AgentStatus({ compact = false }: AgentStatusProps) {
  const [agents, setAgents] = useState<Agent[]>(mockAgents);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => ({
        ...agent,
        lastActivity: new Date(),
      })));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatLastActivity = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / 60000);
    
    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    return date.toLocaleTimeString();
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {agents.map((agent) => {
            const config = statusConfig[agent.status];
            return (
              <motion.div
                key={agent.id}
                className="relative w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors duration-300"
                style={{
                  backgroundColor: config.bg,
                  borderColor: 'var(--bg-card)',
                }}
                whileHover={{ scale: 1.1, zIndex: 10 }}
              >
                <Bot className="w-4 h-4" style={{ color: config.color }} />
                <motion.div
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                  style={{
                    backgroundColor: config.color,
                    borderColor: 'var(--bg-card)',
                  }}
                  animate={agent.status === 'busy' ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </motion.div>
            );
          })}
        </div>
        <span className="text-xs transition-colors duration-300" style={{ color: 'var(--text-tertiary)' }}>
          {agents.filter(a => a.status === 'online').length}/{agents.length} agents
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="apple-card p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold flex items-center gap-2 transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>
          <Bot className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          Agent Status
        </h3>
        <div className="flex items-center gap-1.5 text-xs transition-colors duration-300" style={{ color: 'var(--text-tertiary)' }}>
          <Wifi className="w-3.5 h-3.5" style={{ color: 'var(--color-green)' }} />
          <span>Connected</span>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {agents.map((agent) => {
            const config = statusConfig[agent.status];

            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                {/* Avatar */}
                <motion.div
                  className="relative w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: config.bg,
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Bot className="w-5 h-5" style={{ color: config.color }} />

                  {/* Status indicator */}
                  <motion.div
                    className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2"
                    style={{
                      backgroundColor: config.color,
                      borderColor: 'var(--bg-card)',
                    }}
                    animate={agent.status === 'busy' ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </motion.div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>{agent.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full transition-colors duration-300" style={{ backgroundColor: config.bg, color: config.color }}>
                      {config.label}
                    </span>
                  </div>
                  {agent.currentTask && (
                    <p className="text-xs truncate mt-0.5 transition-colors duration-300" style={{ color: 'var(--text-tertiary)' }}>{agent.currentTask}</p>
                  )}
                </div>

                {/* Last activity */}
                <div className="flex items-center gap-1 text-xs transition-colors duration-300" style={{ color: 'var(--text-tertiary)' }}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatLastActivity(agent.lastActivity)}</span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
