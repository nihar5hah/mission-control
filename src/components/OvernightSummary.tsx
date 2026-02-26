'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Moon, Sun, Clock, CheckCircle2, AlertCircle, ArrowUpRight, 
  Bot, Code, FileText, Zap, Calendar, TrendingUp, Target,
  Coffee, Sparkles, ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';

interface OvernightActivity {
  id: number;
  agent_id: string;
  action: string;
  description: string;
  status: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

interface OvernightStats {
  totalActivities: number;
  completedTasks: number;
  failedTasks: number;
  activeAgents: string[];
  duration: string;
  focusTime: number;
  buildsCompleted: number;
  filesChanged: number;
}

interface OvernightSummaryProps {
  agentActivities?: OvernightActivity[];
  isLoading?: boolean;
}

const AGENT_CONFIG: Record<string, { name: string; emoji: string; color: string }> = {
  'main': { name: 'Begubot', emoji: '⚡', color: '#f59e0b' },
  'coder': { name: 'Codex', emoji: '🔧', color: '#3b82f6' },
  'researcher': { name: 'Researcher', emoji: '🔬', color: '#10b981' },
  'extractor': { name: 'Extractor', emoji: '📥', color: '#8b5cf6' },
  'begubot': { name: 'Begubot', emoji: '⚡', color: '#f59e0b' },
};

export function OvernightSummary({ agentActivities = [], isLoading }: OvernightSummaryProps) {
  const [expanded, setExpanded] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  // Filter overnight activities (last 8 hours or from last "sleep" marker)
  const overnightActivities = useMemo(() => {
    const now = new Date();
    const eightHoursAgo = new Date(now.getTime() - 8 * 60 * 60 * 1000);
    return agentActivities.filter(a => new Date(a.timestamp) >= eightHoursAgo);
  }, [agentActivities]);

  // Calculate stats
  const stats: OvernightStats = useMemo(() => {
    const completed = overnightActivities.filter(a => a.status === 'completed').length;
    const failed = overnightActivities.filter(a => a.status === 'failed').length;
    const agents = [...new Set(overnightActivities.map(a => a.agent_id))];
    const focusMs = overnightActivities
      .filter(a => a.action?.includes('session') || a.action?.includes('focus'))
      .reduce((sum, a) => sum + ((a.metadata?.duration_seconds as number) || 0) * 1000, 0);
    const builds = overnightActivities.filter(a => a.action?.includes('build') || a.action?.includes('deploy')).length;
    const files = overnightActivities.filter(a => a.action?.includes('file')).length;

    return {
      totalActivities: overnightActivities.length,
      completedTasks: completed,
      failedTasks: failed,
      activeAgents: agents,
      duration: '8h',
      focusTime: Math.round(focusMs / 60000),
      buildsCompleted: builds,
      filesChanged: files,
    };
  }, [overnightActivities]);

  // Group by agent
  const byAgent = useMemo(() => {
    const groups: Record<string, OvernightActivity[]> = {};
    overnightActivities.forEach(a => {
      const agent = a.agent_id || 'unknown';
      if (!groups[agent]) groups[agent] = [];
      groups[agent].push(a);
    });
    return groups;
  }, [overnightActivities]);

  // Generate summary text
  const summaryText = useMemo(() => {
    if (stats.totalActivities === 0) return "No overnight activity detected.";
    
    const parts: string[] = [];
    if (stats.completedTasks > 0) {
      parts.push(`${stats.completedTasks} tasks completed`);
    }
    if (stats.buildsCompleted > 0) {
      parts.push(`${stats.buildsCompleted} builds deployed`);
    }
    if (stats.filesChanged > 0) {
      parts.push(`${stats.filesChanged} files updated`);
    }
    if (stats.activeAgents.length > 1) {
      parts.push(`${stats.activeAgents.length} agents active`);
    }
    
    return parts.length > 0 ? `Last night: ${parts.join(', ')}.` : "Light activity overnight.";
  }, [stats]);

  if (isLoading) {
    return (
      <div className="apple-card p-5 animate-pulse">
        <div className="h-4 bg-white/10 rounded w-1/3 mb-4" />
        <div className="h-20 bg-white/5 rounded" />
      </div>
    );
  }

  return (
    <div className="apple-card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)' }}
          >
            <Moon className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Overnight Summary
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {summaryText}
            </p>
          </div>
        </div>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-3 mb-5">
                <StatCard 
                  icon={CheckCircle2} 
                  label="Completed" 
                  value={stats.completedTasks} 
                  color="#10b981" 
                />
                <StatCard 
                  icon={Code} 
                  label="Builds" 
                  value={stats.buildsCompleted} 
                  color="#3b82f6" 
                />
                <StatCard 
                  icon={FileText} 
                  label="Files" 
                  value={stats.filesChanged} 
                  color="#8b5cf6" 
                />
                <StatCard 
                  icon={Bot} 
                  label="Agents" 
                  value={stats.activeAgents.length} 
                  color="#f59e0b" 
                />
              </div>

              {/* Agent Breakdown */}
              {Object.keys(byAgent).length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                    Agent Activity
                  </p>
                  {Object.entries(byAgent).map(([agentId, activities]) => {
                    const config = AGENT_CONFIG[agentId] || { name: agentId, emoji: '🤖', color: '#6b7280' };
                    const completed = activities.filter(a => a.status === 'completed').length;
                    const total = activities.length;
                    
                    return (
                      <motion.div
                        key={agentId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.03)' }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span>{config.emoji}</span>
                            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                              {config.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                            <span>{completed}/{total} tasks</span>
                            <div 
                              className="w-16 h-1.5 rounded-full overflow-hidden"
                              style={{ background: 'rgba(255,255,255,0.1)' }}
                            >
                              <div 
                                className="h-full rounded-full transition-all"
                                style={{ 
                                  width: `${(completed / total) * 100}%`,
                                  background: config.color 
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        
                        {/* Recent activities */}
                        <div className="space-y-1.5">
                          {activities.slice(0, 3).map((activity, idx) => (
                            <div 
                              key={idx}
                              className="flex items-center gap-2 text-xs"
                            >
                              {activity.status === 'completed' ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              ) : activity.status === 'failed' ? (
                                <AlertCircle className="w-3 h-3 text-red-500" />
                              ) : (
                                <Clock className="w-3 h-5 text-amber-500" />
                              )}
                              <span style={{ color: 'var(--text-secondary)' }} className="truncate">
                                {activity.description || activity.action}
                              </span>
                              <span style={{ color: 'var(--text-tertiary)' }} className="ml-auto">
                                {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* No Activity */}
              {stats.totalActivities === 0 && (
                <div className="text-center py-8">
                  <Moon className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: 'var(--text-tertiary)' }} />
                  <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    Quiet night - no agent activity detected
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                    Agents may be idle or waiting for tasks
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <button
                  onClick={() => window.open('https://mission-control-one-gold.vercel.app', '_blank')}
                  className="flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Dashboard
                </button>
                <button
                  className="flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5"
                  style={{ background: 'var(--accent)', color: 'white' }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  View Full Report
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Stat card subcomponent
function StatCard({ icon: Icon, label, value, color }: { 
  icon: React.ComponentType<{ className?: string }>; 
  label: string; 
  value: number;
  color: string;
}) {
  return (
    <div 
      className="p-3 rounded-xl text-center"
      style={{ background: `${color}10` }}
    >
      <div style={{ color }}>
        <Icon className="w-4 h-4 mx-auto mb-1" />
      </div>
      <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
    </div>
  );
}

export default OvernightSummary;
