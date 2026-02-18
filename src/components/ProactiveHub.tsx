'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProactive } from '@/hooks/useProactive';
import type { ProactiveAction, Pattern, Opportunity } from '@/types/proactive';
import {
  Zap,
  Brain,
  Lightbulb,
  Target,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  RefreshCw,
  ChevronRight,
  Sparkles,
  BarChart3,
  Activity,
  Workflow,
  DollarSign,
  GraduationCap,
  Users,
  Wrench,
  ArrowRight,
  LightbulbIcon,
  Bot,
  Timer,
  Gauge,
  Layers,
  Cpu,
} from 'lucide-react';

// =============================================
// TYPE CONFIGURATIONS
// =============================================
const actionTypeConfig = {
  notification: {
    label: 'Notification',
    icon: Bell,
    color: 'text-[#FBBF24]',
    bg: 'bg-[#FBBF24]/10',
    border: 'border-[#FBBF24]/30',
  },
  task_create: {
    label: 'Task Created',
    icon: CheckCircle2,
    color: 'text-[#30D158]',
    bg: 'bg-[#30D158]/10',
    border: 'border-[#30D158]/30',
  },
  reminder: {
    label: 'Reminder',
    icon: Clock,
    color: 'text-[#06B6D4]',
    bg: 'bg-[#06B6D4]/10',
    border: 'border-[#06B6D4]/30',
  },
  suggestion: {
    label: 'Suggestion',
    icon: LightbulbIcon,
    color: 'text-[#FF9F0A]',
    bg: 'bg-[#FF9F0A]/10',
    border: 'border-[#FF9F0A]/30',
  },
  auto_fix: {
    label: 'Auto Fix',
    icon: Wrench,
    color: 'text-[#EF4444]',
    bg: 'bg-[#EF4444]/10',
    border: 'border-[#EF4444]/30',
  },
  sync: {
    label: 'Sync',
    icon: RefreshCw,
    color: 'text-[#8B5CF6]',
    bg: 'bg-[#8B5CF6]/10',
    border: 'border-[#8B5CF6]/30',
  },
  analysis: {
    label: 'Analysis',
    icon: Brain,
    color: 'text-[#06402B]',
    bg: 'bg-[#06402B]/10',
    border: 'border-[#06402B]/30',
  },
};

const patternCategoryConfig = {
  time: {
    label: 'Time Pattern',
    icon: Clock,
    color: 'text-[#06B6D4]',
    bg: 'bg-[#06B6D4]/10',
    border: 'border-[#06B6D4]/30',
  },
  workflow: {
    label: 'Workflow',
    icon: Workflow,
    color: 'text-[#8B5CF6]',
    bg: 'bg-[#8B5CF6]/10',
    border: 'border-[#8B5CF6]/30',
  },
  attention: {
    label: 'Attention',
    icon: Target,
    color: 'text-[#FF9F0A]',
    bg: 'bg-[#FF9F0A]/10',
    border: 'border-[#FF9F0A]/30',
  },
  opportunity: {
    label: 'Opportunity',
    icon: TrendingUp,
    color: 'text-[#30D158]',
    bg: 'bg-[#30D158]/10',
    border: 'border-[#30D158]/30',
  },
  learning: {
    label: 'Learning',
    icon: GraduationCap,
    color: 'text-[#06402B]',
    bg: 'bg-[#06402B]/10',
    border: 'border-[#06402B]/30',
  },
  collaboration: {
    label: 'Collaboration',
    icon: Users,
    color: 'text-[#EC4899]',
    bg: 'bg-[#EC4899]/10',
    border: 'border-[#EC4899]/30',
  },
};

const opportunityTypeConfig = {
  monetization: {
    label: 'Monetization',
    icon: DollarSign,
    color: 'text-[#30D158]',
    bg: 'bg-[#30D158]/10',
    border: 'border-[#30D158]/30',
  },
  automation: {
    label: 'Automation',
    icon: Wrench,
    color: 'text-[#FF9F0A]',
    bg: 'bg-[#FF9F0A]/10',
    border: 'border-[#FF9F0A]/30',
  },
  collaboration: {
    label: 'Collaboration',
    icon: Users,
    color: 'text-[#EC4899]',
    bg: 'bg-[#EC4899]/10',
    border: 'border-[#EC4899]/30',
  },
  learning: {
    label: 'Learning',
    icon: GraduationCap,
    color: 'text-[#06402B]',
    bg: 'bg-[#06402B]/10',
    border: 'border-[#06402B]/30',
  },
  efficiency: {
    label: 'Efficiency',
    icon: Gauge,
    color: 'text-[#06B6D4]',
    bg: 'bg-[#06B6D4]/10',
    border: 'border-[#06B6D4]/30',
  },
};

const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'text-[#FBBF24]',
    bg: 'bg-[#FBBF24]/10',
  },
  running: {
    label: 'Running',
    color: 'text-[#06B6D4]',
    bg: 'bg-[#06B6D4]/10',
  },
  completed: {
    label: 'Completed',
    color: 'text-[#30D158]',
    bg: 'bg-[#30D158]/10',
  },
  failed: {
    label: 'Failed',
    color: 'text-[#EF4444]',
    bg: 'bg-[#EF4444]/10',
  },
  dismissed: {
    label: 'Dismissed',
    color: 'text-[#666]',
    bg: 'bg-[#666]/10',
  },
  discovered: {
    label: 'Discovered',
    color: 'text-[#8B5CF6]',
    bg: 'bg-[#8B5CF6]/10',
  },
  investigating: {
    label: 'Investigating',
    color: 'text-[#FBBF24]',
    bg: 'bg-[#FBBF24]/10',
  },
  validated: {
    label: 'Validated',
    color: 'text-[#06B6D4]',
    bg: 'bg-[#06B6D4]/10',
  },
  implemented: {
    label: 'Implemented',
    color: 'text-[#30D158]',
    bg: 'bg-[#30D158]/10',
  },
};

// Need to import Bell separately
import { Bell } from 'lucide-react';

// =============================================
// SUB-COMPONENTS
// =============================================

// Stats Cards Row
function StatsCards({ stats }: { stats: any }) {
  const cards = [
    {
      label: 'Actions Today',
      value: stats?.total_actions_today || 0,
      subValue: `${stats?.completed_actions_today || 0} completed`,
      icon: Zap,
      color: 'var(--color-orange)',
      bg: 'rgba(245, 158, 11, 0.1)',
    },
    {
      label: 'Opportunities',
      value: stats?.opportunities_found || 0,
      subValue: `${stats?.opportunities_implemented || 0} implemented`,
      icon: Lightbulb,
      color: 'var(--color-green)',
      bg: 'rgba(16, 185, 129, 0.1)',
    },
    {
      label: 'Patterns',
      value: stats?.patterns_detected || 0,
      subValue: 'active detected',
      icon: Brain,
      color: '#8B5CF6',
      bg: 'rgba(139, 92, 246, 0.1)',
    },
    {
      label: 'Confidence',
      value: stats?.avg_confidence_score
        ? `${Math.round(stats.avg_confidence_score * 100)}%`
        : '0%',
      subValue: 'avg pattern confidence',
      icon: Target,
      color: '#06B6D4',
      bg: 'rgba(6, 182, 212, 0.1)',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="apple-card p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wide transition-colors duration-300" style={{ color: 'var(--text-tertiary)' }}>{card.label}</span>
              <div className="p-2 rounded-md" style={{ backgroundColor: card.bg }}>
                <Icon className="w-4 h-4" style={{ color: card.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>{card.value}</p>
            <p className="text-xs mt-1 transition-colors duration-300" style={{ color: 'var(--text-tertiary)' }}>{card.subValue}</p>
          </motion.div>
        );
      })}
    </div>
  );
}

// Action Card
function ActionCard({ action, onDismiss }: { action: ProactiveAction; onDismiss: (id: number) => void }) {
  const config = actionTypeConfig[action.type as keyof typeof actionTypeConfig] || actionTypeConfig.suggestion;
  const Icon = config.icon;
  const status = statusConfig[action.status as keyof typeof statusConfig] || statusConfig.pending;

  // Extract hex from config and convert to rgba
  const getColorValue = (hexColor: string) => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return { hex: hexColor, rgba: `rgba(${r}, ${g}, ${b}, 0.1)` };
  };

  const configColor = getColorValue(config.color.replace('text-[#', '#').replace(']', ''));
  const statusColor = getColorValue(status.color.replace('text-[#', '#').replace(']', ''));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="apple-card p-4 group"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-md" style={{ backgroundColor: configColor.rgba, border: `1px solid ${configColor.hex}33` }}>
          <Icon className="w-4 h-4" style={{ color: configColor.hex }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold" style={{ color: configColor.hex }}>{config.label}</span>
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>•</span>
            <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: statusColor.rgba, color: statusColor.hex }}>
              {status.label}
            </span>
          </div>
          <p className="text-sm line-clamp-2" style={{ color: 'var(--text-tertiary)' }}>{action.description}</p>

          {action.confidence_score && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${action.confidence_score * 100}%` }}
                  style={{ backgroundColor: 'var(--accent)' }}
                />
              </div>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{Math.round(action.confidence_score * 100)}%</span>
            </div>
          )}
        </div>

        {action.status === 'pending' && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onDismiss(action.id)}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded transition-all"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--border)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <XCircle className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// Pattern Card
function PatternCard({ pattern }: { pattern: Pattern }) {
  const config = patternCategoryConfig[pattern.category as keyof typeof patternCategoryConfig] || patternCategoryConfig.time;
  const Icon = config.icon;

  // Extract hex from config and convert to rgba
  const getColorValue = (hexColor: string) => {
    const hex = hexColor.replace('text-[#', '#').replace(']', '');
    const hexClean = hex.replace('#', '');
    const r = parseInt(hexClean.slice(0, 2), 16);
    const g = parseInt(hexClean.slice(2, 4), 16);
    const b = parseInt(hexClean.slice(4, 6), 16);
    return { hex: '#' + hexClean, rgba: `rgba(${r}, ${g}, ${b}, 0.1)` };
  };

  const configColor = getColorValue(config.color);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="apple-card p-4"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-md" style={{ backgroundColor: configColor.rgba, border: `1px solid ${configColor.hex}33` }}>
          <Icon className="w-4 h-4" style={{ color: configColor.hex }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>{pattern.name}</span>
            <span className="text-xs transition-colors duration-300" style={{ color: 'var(--text-tertiary)' }}>•</span>
            <span className="text-xs transition-colors duration-300" style={{ color: 'var(--text-tertiary)' }}>{pattern.frequency}</span>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pattern.confidence * 100}%` }}
                  style={{ backgroundColor: 'var(--color-green)' }}
                />
              </div>
              <span className="text-xs transition-colors duration-300" style={{ color: 'var(--text-tertiary)' }}>{Math.round(pattern.confidence * 100)}% conf</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pattern.impact_score * 100}%` }}
                  style={{ backgroundColor: 'var(--color-orange)' }}
                />
              </div>
              <span className="text-xs transition-colors duration-300" style={{ color: 'var(--text-tertiary)' }}>{Math.round(pattern.impact_score * 100)}% impact</span>
            </div>
          </div>

          {pattern.suggested_action && (
            <p className="text-xs mt-3 rounded px-2 py-1.5 transition-colors duration-300" style={{ color: 'var(--accent)', backgroundColor: 'var(--accent-muted)', border: '1px solid rgba(6, 64, 43, 0.2)' }}>
              💡 {pattern.suggested_action}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Opportunity Card
function OpportunityCard({ opportunity, onUpdate }: { opportunity: Opportunity; onUpdate: (id: number, status: string) => void }) {
  const config = opportunityTypeConfig[opportunity.type as keyof typeof opportunityTypeConfig] || opportunityTypeConfig.efficiency;
  const Icon = config.icon;
  const status = statusConfig[opportunity.status as keyof typeof statusConfig] || statusConfig.discovered;

  const valueColors = {
    low: '#999',
    medium: '#FBBF24',
    high: '#FF9F0A',
    transformative: '#30D158',
  };

  const effortColors = {
    low: '#30D158',
    medium: '#FBBF24',
    high: '#EF4444',
  };

  // Extract hex from config and convert to rgba
  const getColorValue = (hexColor: string) => {
    const hex = hexColor.replace('text-[#', '#').replace(']', '');
    const hexClean = hex.replace('#', '');
    const r = parseInt(hexClean.slice(0, 2), 16);
    const g = parseInt(hexClean.slice(2, 4), 16);
    const b = parseInt(hexClean.slice(4, 6), 16);
    return { hex: '#' + hexClean, rgba: `rgba(${r}, ${g}, ${b}, 0.1)` };
  };

  const configColor = getColorValue(config.color);
  const statusColor = getColorValue(status.color);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="apple-card p-4"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-md" style={{ backgroundColor: configColor.rgba, border: `1px solid ${configColor.hex}33` }}>
            <Icon className="w-4 h-4" style={{ color: configColor.hex }} />
          </div>
          <div>
            <span className="text-xs font-semibold" style={{ color: configColor.hex }}>{config.label}</span>
            <span className="text-xs mx-1.5 transition-colors duration-300" style={{ color: 'var(--text-tertiary)' }}>•</span>
            <span className="text-xs" style={{ color: statusColor.hex }}>{status.label}</span>
          </div>
        </div>
      </div>

      <h4 className="text-sm font-semibold mb-2 transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>{opportunity.title}</h4>
      <p className="text-xs line-clamp-2 mb-3 transition-colors duration-300" style={{ color: 'var(--text-tertiary)' }}>{opportunity.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-xs transition-colors duration-300" style={{ color: 'var(--text-tertiary)' }}>Value</span>
            <p className="text-sm font-medium" style={{ color: valueColors[opportunity.potential_value as keyof typeof valueColors] || valueColors.medium }}>
              {opportunity.potential_value}
            </p>
          </div>
          <div>
            <span className="text-xs transition-colors duration-300" style={{ color: 'var(--text-tertiary)' }}>Effort</span>
            <p className="text-sm font-medium" style={{ color: effortColors[opportunity.effort_estimate as keyof typeof effortColors] || effortColors.medium }}>
              {opportunity.effort_estimate}
            </p>
          </div>
          <div>
            <span className="text-xs transition-colors duration-300" style={{ color: 'var(--text-tertiary)' }}>Score</span>
            <p className="text-sm font-medium transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>{Math.round((opportunity.priority_score || 0.5) * 100)}%</p>
          </div>
        </div>

        {opportunity.status === 'discovered' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onUpdate(opportunity.id, 'investigating')}
            className="px-3 py-1.5 rounded-xl text-white text-xs font-medium btn-apple-primary"
          >
            Investigate
          </motion.button>
        )}
        {opportunity.status === 'validated' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onUpdate(opportunity.id, 'implemented')}
            className="px-3 py-1.5 rounded-xl text-white text-xs font-medium transition-all"
            style={{ background: 'var(--color-green)', boxShadow: '0 2px 8px rgba(48,209,88,0.3)' }}
          >
            Implement
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// Empty State
function EmptyState({ type, onAction }: { type: string; onAction?: () => void }) {
  const configs: Record<string, { icon: any; title: string; description: string; actionLabel?: string }> = {
    actions: {
      icon: Zap,
      title: 'No recent actions',
      description: 'Begubot will take proactive actions based on your patterns',
    },
    patterns: {
      icon: Brain,
      title: 'No patterns detected yet',
      description: 'Patterns will be detected as you use the system',
    },
    opportunities: {
      icon: Lightbulb,
      title: 'No opportunities found',
      description: 'Begubot will find opportunities for you',
    },
  };

  const config = configs[type] || configs.actions;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-8"
    >
      <div className="inline-block p-3 rounded-full mb-4 transition-colors duration-300" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-tertiary)' }}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-sm font-medium mb-1 transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>{config.title}</p>
      <p className="text-xs transition-colors duration-300" style={{ color: 'var(--text-tertiary)' }}>{config.description}</p>
      {onAction && config.actionLabel && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className="mt-4 px-4 py-2 rounded-xl text-white text-sm font-medium btn-apple-primary"
        >
          {config.actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
}

// =============================================
// MAIN COMPONENT
// =============================================
export default function ProactiveHub() {
  const {
    actions,
    patterns,
    opportunities,
    stats,
    loading,
    error,
    refresh,
    dismissAction,
    updateOpportunityStatus,
    analyzePatterns,
    findOpportunities,
  } = useProactive();

  const [activeSection, setActiveSection] = useState<'overview' | 'actions' | 'patterns' | 'opportunities'>('overview');
  const [analyzing, setAnalyzing] = useState(false);
  const [findingOpp, setFindingOpp] = useState(false);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      await analyzePatterns();
      await refresh();
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFindOpportunities = async () => {
    setFindingOpp(true);
    try {
      await findOpportunities();
      await refresh();
    } finally {
      setFindingOpp(false);
    }
  };

  const handleDismissAction = async (id: number) => {
    await dismissAction(id);
  };

  const handleUpdateOpportunity = async (id: number, status: string) => {
    await updateOpportunityStatus(id, status);
  };

  // Section buttons
  const sections = [
    { id: 'overview', label: 'Overview', icon: Sparkles },
    { id: 'actions', label: 'Actions', icon: Zap },
    { id: 'patterns', label: 'Patterns', icon: Brain },
    { id: 'opportunities', label: 'Opportunities', icon: Lightbulb },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Zap className="w-8 h-8" style={{ color: 'var(--accent)' }} />
        </motion.div>
        <span className="ml-3 transition-colors duration-300" style={{ color: 'var(--text-tertiary)' }}>Loading Proactive Intelligence...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="w-8 h-8 mx-auto mb-4" style={{ color: '#EF4444' }} />
        <p className="font-medium mb-2 transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>Error loading data</p>
        <p className="text-sm mb-4 transition-colors duration-300" style={{ color: 'var(--text-tertiary)' }}>{error}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={refresh}
          className="px-4 py-2 rounded-xl text-white text-sm font-medium btn-apple-primary"
        >
          Retry
        </motion.button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-1 flex items-center gap-2 transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>
            <Bot className="w-6 h-6" style={{ color: 'var(--accent)' }} />
            Proactive Intelligence
          </h2>
          <p className="text-sm transition-colors duration-300" style={{ color: 'var(--text-tertiary)' }}>
            Begubot analyzes patterns and finds opportunities for you
          </p>
        </div>

        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAnalyze}
            disabled={analyzing}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50 btn-apple-secondary"
          >
            <motion.div
              animate={{ rotate: analyzing ? 360 : 0 }}
              transition={{ duration: 1, repeat: analyzing ? Infinity : 0, ease: 'linear' }}
            >
              <Brain className="w-4 h-4" />
            </motion.div>
            {analyzing ? 'Analyzing...' : 'Analyze Patterns'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFindOpportunities}
            disabled={findingOpp}
            className="px-4 py-2 rounded-xl text-white text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50 btn-apple-primary"
          >
            <motion.div
              animate={{ rotate: findingOpp ? 360 : 0 }}
              transition={{ duration: 1, repeat: findingOpp ? Infinity : 0, ease: 'linear' }}
            >
              <Lightbulb className="w-4 h-4" />
            </motion.div>
            {findingOpp ? 'Finding...' : 'Find Opportunities'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={refresh}
            className="p-2 rounded-xl transition-all btn-apple-secondary"
          >
            <RefreshCw className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-1 mb-6 rounded-xl p-1 w-fit apple-tabs">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <motion.button
              key={section.id}
              onClick={() => setActiveSection(section.id as any)}
              className="relative px-4 py-2 rounded-[9px] text-sm font-medium flex items-center gap-2 transition-colors"
              style={{ color: activeSection === section.id ? '#ffffff' : 'var(--text-tertiary)' }}
              whileTap={{ scale: 0.97 }}
            >
              {activeSection === section.id && (
                <motion.div
                  layoutId="proactive-section"
                  className="absolute inset-0 rounded-md transition-colors duration-300"
                  style={{ background: 'var(--accent)' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {section.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Section Content */}
      <AnimatePresence mode="wait">
        {activeSection === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Stats Cards */}
            <StatsCards stats={stats} />

            {/* Quick View Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Actions */}
              <div className="apple-card p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2 transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>
                    <Zap className="w-4 h-4" style={{ color: 'var(--color-orange)' }} />
                    Recent Actions
                  </h3>
                  <button
                    onClick={() => setActiveSection('actions')}
                    className="text-xs flex items-center gap-1 transition-colors duration-300"
                    style={{ color: 'var(--accent)' }}
                  >
                    View all <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-2">
                  {actions.slice(0, 3).length > 0 ? (
                    actions.slice(0, 3).map((action) => (
                      <ActionCard key={action.id} action={action} onDismiss={handleDismissAction} />
                    ))
                  ) : (
                    <EmptyState type="actions" onAction={handleAnalyze} />
                  )}
                </div>
              </div>

              {/* Top Patterns */}
              <div className="apple-card p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2 transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>
                    <Brain className="w-4 h-4" style={{ color: '#8B5CF6' }} />
                    Detected Patterns
                  </h3>
                  <button
                    onClick={() => setActiveSection('patterns')}
                    className="text-xs flex items-center gap-1 transition-colors duration-300"
                    style={{ color: 'var(--accent)' }}
                  >
                    View all <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-2">
                  {patterns.slice(0, 3).length > 0 ? (
                    patterns.slice(0, 3).map((pattern) => (
                      <PatternCard key={pattern.id} pattern={pattern} />
                    ))
                  ) : (
                    <EmptyState type="patterns" onAction={handleAnalyze} />
                  )}
                </div>
              </div>

              {/* Top Opportunities */}
              <div className="apple-card p-4 lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2 transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>
                    <Lightbulb className="w-4 h-4" style={{ color: 'var(--color-green)' }} />
                    Top Opportunities
                  </h3>
                  <button
                    onClick={() => setActiveSection('opportunities')}
                    className="text-xs flex items-center gap-1 transition-colors duration-300"
                    style={{ color: 'var(--accent)' }}
                  >
                    View all <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {opportunities.slice(0, 3).length > 0 ? (
                    opportunities.slice(0, 3).map((opp) => (
                      <OpportunityCard key={opp.id} opportunity={opp} onUpdate={handleUpdateOpportunity} />
                    ))
                  ) : (
                    <div className="col-span-3">
                      <EmptyState type="opportunities" onAction={handleFindOpportunities} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeSection === 'actions' && (
          <motion.div
            key="actions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>Proactive Actions</h3>
              <span className="text-sm transition-colors duration-300" style={{ color: 'var(--text-tertiary)' }}>{actions.length} total</span>
            </div>
            <div className="space-y-2">
              {actions.length > 0 ? (
                actions.map((action) => (
                  <ActionCard key={action.id} action={action} onDismiss={handleDismissAction} />
                ))
              ) : (
                <EmptyState type="actions" onAction={handleAnalyze} />
              )}
            </div>
          </motion.div>
        )}

        {activeSection === 'patterns' && (
          <motion.div
            key="patterns"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>Detected Patterns</h3>
              <span className="text-sm transition-colors duration-300" style={{ color: 'var(--text-tertiary)' }}>{patterns.length} active</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patterns.length > 0 ? (
                patterns.map((pattern) => (
                  <PatternCard key={pattern.id} pattern={pattern} />
                ))
              ) : (
                <div className="col-span-2">
                  <EmptyState type="patterns" onAction={handleAnalyze} />
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeSection === 'opportunities' && (
          <motion.div
            key="opportunities"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>Opportunities</h3>
              <span className="text-sm transition-colors duration-300" style={{ color: 'var(--text-tertiary)' }}>{opportunities.length} found</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {opportunities.length > 0 ? (
                opportunities.map((opp) => (
                  <OpportunityCard key={opp.id} opportunity={opp} onUpdate={handleUpdateOpportunity} />
                ))
              ) : (
                <div className="col-span-3">
                  <EmptyState type="opportunities" onAction={handleFindOpportunities} />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
