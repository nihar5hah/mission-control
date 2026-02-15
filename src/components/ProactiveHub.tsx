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
    color: 'text-[#5EAD5E]',
    bg: 'bg-[#5EAD5E]/10',
    border: 'border-[#5EAD5E]/30',
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
    color: 'text-[#F59E0B]',
    bg: 'bg-[#F59E0B]/10',
    border: 'border-[#F59E0B]/30',
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
    color: 'text-[#5E6AD2]',
    bg: 'bg-[#5E6AD2]/10',
    border: 'border-[#5E6AD2]/30',
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
    color: 'text-[#F59E0B]',
    bg: 'bg-[#F59E0B]/10',
    border: 'border-[#F59E0B]/30',
  },
  opportunity: {
    label: 'Opportunity',
    icon: TrendingUp,
    color: 'text-[#10B981]',
    bg: 'bg-[#10B981]/10',
    border: 'border-[#10B981]/30',
  },
  learning: {
    label: 'Learning',
    icon: GraduationCap,
    color: 'text-[#5E6AD2]',
    bg: 'bg-[#5E6AD2]/10',
    border: 'border-[#5E6AD2]/30',
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
    color: 'text-[#10B981]',
    bg: 'bg-[#10B981]/10',
    border: 'border-[#10B981]/30',
  },
  automation: {
    label: 'Automation',
    icon: Wrench,
    color: 'text-[#F59E0B]',
    bg: 'bg-[#F59E0B]/10',
    border: 'border-[#F59E0B]/30',
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
    color: 'text-[#5E6AD2]',
    bg: 'bg-[#5E6AD2]/10',
    border: 'border-[#5E6AD2]/30',
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
    color: 'text-[#5EAD5E]',
    bg: 'bg-[#5EAD5E]/10',
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
    color: 'text-[#5EAD5E]',
    bg: 'bg-[#5EAD5E]/10',
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
      color: 'text-[#F59E0B]',
      bg: 'bg-[#F59E0B]/10',
    },
    {
      label: 'Opportunities',
      value: stats?.opportunities_found || 0,
      subValue: `${stats?.opportunities_implemented || 0} implemented`,
      icon: Lightbulb,
      color: 'text-[#10B981]',
      bg: 'bg-[#10B981]/10',
    },
    {
      label: 'Patterns',
      value: stats?.patterns_detected || 0,
      subValue: 'active detected',
      icon: Brain,
      color: 'text-[#8B5CF6]',
      bg: 'bg-[#8B5CF6]/10',
    },
    {
      label: 'Confidence',
      value: stats?.avg_confidence_score 
        ? `${Math.round(stats.avg_confidence_score * 100)}%` 
        : '0%',
      subValue: 'avg pattern confidence',
      icon: Target,
      color: 'text-[#06B6D4]',
      bg: 'bg-[#06B6D4]/10',
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
            className="bg-[#161616] border border-[#262626] rounded-lg p-4 hover:border-[#333] transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#888] uppercase tracking-wide">{card.label}</span>
              <div className={`p-2 rounded-md ${card.bg}`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{card.value}</p>
            <p className="text-xs text-[#666] mt-1">{card.subValue}</p>
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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-[#161616] border border-[#262626] rounded-lg p-4 hover:border-[#333] transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-md ${config.bg} border ${config.border}`}>
          <Icon className={`w-4 h-4 ${config.color}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-semibold ${config.color}`}>{config.label}</span>
            <span className="text-xs text-[#666]">•</span>
            <span className={`text-xs px-2 py-0.5 rounded ${status.bg} ${status.color}`}>
              {status.label}
            </span>
          </div>
          <p className="text-sm text-[#888] line-clamp-2">{action.description}</p>
          
          {action.confidence_score && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1 bg-[#262626] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${action.confidence_score * 100}%` }}
                  className="h-full bg-[#5E6AD2]"
                />
              </div>
              <span className="text-xs text-[#666]">{Math.round(action.confidence_score * 100)}%</span>
            </div>
          )}
        </div>

        {action.status === 'pending' && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onDismiss(action.id)}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-[#262626] transition-all"
          >
            <XCircle className="w-4 h-4 text-[#666]" />
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#161616] border border-[#262626] rounded-lg p-4 hover:border-[#333] transition-all"
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-md ${config.bg} border ${config.border}`}>
          <Icon className={`w-4 h-4 ${config.color}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-white">{pattern.name}</span>
            <span className="text-xs text-[#666]">•</span>
            <span className="text-xs text-[#666]">{pattern.frequency}</span>
          </div>
          
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <div className="w-16 h-1.5 bg-[#262626] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pattern.confidence * 100}%` }}
                  className="h-full bg-[#10B981]"
                />
              </div>
              <span className="text-xs text-[#666]">{Math.round(pattern.confidence * 100)}% conf</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-16 h-1.5 bg-[#262626] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pattern.impact_score * 100}%` }}
                  className="h-full bg-[#F59E0B]"
                />
              </div>
              <span className="text-xs text-[#666]">{Math.round(pattern.impact_score * 100)}% impact</span>
            </div>
          </div>

          {pattern.suggested_action && (
            <p className="text-xs text-[#5E6AD2] mt-3 bg-[#5E6AD2]/5 border border-[#5E6AD2]/20 rounded px-2 py-1.5">
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
    low: 'text-[#666]',
    medium: 'text-[#FBBF24]',
    high: 'text-[#F59E0B]',
    transformative: 'text-[#10B981]',
  };

  const effortColors = {
    low: 'text-[#10B981]',
    medium: 'text-[#FBBF24]',
    high: 'text-[#EF4444]',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#161616] border border-[#262626] rounded-lg p-4 hover:border-[#333] transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-md ${config.bg} border ${config.border}`}>
            <Icon className={`w-4 h-4 ${config.color}`} />
          </div>
          <div>
            <span className={`text-xs font-semibold ${config.color}`}>{config.label}</span>
            <span className="text-xs text-[#666] mx-1.5">•</span>
            <span className={`text-xs ${status.color}`}>{status.label}</span>
          </div>
        </div>
      </div>

      <h4 className="text-sm font-semibold text-white mb-2">{opportunity.title}</h4>
      <p className="text-xs text-[#888] line-clamp-2 mb-3">{opportunity.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-xs text-[#666]">Value</span>
            <p className={`text-sm font-medium ${valueColors[opportunity.potential_value as keyof typeof valueColors] || valueColors.medium}`}>
              {opportunity.potential_value}
            </p>
          </div>
          <div>
            <span className="text-xs text-[#666]">Effort</span>
            <p className={`text-sm font-medium ${effortColors[opportunity.effort_estimate as keyof typeof effortColors] || effortColors.medium}`}>
              {opportunity.effort_estimate}
            </p>
          </div>
          <div>
            <span className="text-xs text-[#666]">Score</span>
            <p className="text-sm font-medium text-white">{Math.round((opportunity.priority_score || 0.5) * 100)}%</p>
          </div>
        </div>

        {opportunity.status === 'discovered' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onUpdate(opportunity.id, 'investigating')}
            className="px-3 py-1.5 rounded bg-[#5E6AD2] text-white text-xs font-medium hover:bg-[#4A55BF] transition-all"
          >
            Investigate
          </motion.button>
        )}
        {opportunity.status === 'validated' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onUpdate(opportunity.id, 'implemented')}
            className="px-3 py-1.5 rounded bg-[#10B981] text-white text-xs font-medium hover:bg-[#059669] transition-all"
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
      <div className="inline-block p-3 rounded-full bg-[#161616] border border-[#262626] mb-4">
        <Icon className="w-6 h-6 text-[#666]" />
      </div>
      <p className="text-sm text-white font-medium mb-1">{config.title}</p>
      <p className="text-xs text-[#666]">{config.description}</p>
      {onAction && config.actionLabel && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className="mt-4 px-4 py-2 rounded bg-[#5E6AD2] text-white text-sm font-medium hover:bg-[#4A55BF] transition-all"
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
          <Zap className="w-8 h-8 text-[#5E6AD2]" />
        </motion.div>
        <span className="ml-3 text-[#888]">Loading Proactive Intelligence...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="w-8 h-8 text-[#EF4444] mx-auto mb-4" />
        <p className="text-white font-medium mb-2">Error loading data</p>
        <p className="text-sm text-[#666] mb-4">{error}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={refresh}
          className="px-4 py-2 rounded bg-[#5E6AD2] text-white text-sm font-medium"
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
          <h2 className="text-2xl font-semibold text-white mb-1 flex items-center gap-2">
            <Bot className="w-6 h-6 text-[#5E6AD2]" />
            Proactive Intelligence
          </h2>
          <p className="text-sm text-[#888]">
            Begubot analyzes patterns and finds opportunities for you
          </p>
        </div>

        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAnalyze}
            disabled={analyzing}
            className="px-4 py-2 rounded-lg bg-[#161616] border border-[#262626] text-sm text-[#888] hover:text-white hover:border-[#333] transition-all flex items-center gap-2 disabled:opacity-50"
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
            className="px-4 py-2 rounded-lg bg-[#5E6AD2] text-white text-sm font-medium hover:bg-[#4A55BF] transition-all flex items-center gap-2 disabled:opacity-50"
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
            className="p-2 rounded-lg bg-[#161616] border border-[#262626] text-[#888] hover:text-white hover:border-[#333] transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-1 mb-6 bg-[#161616] rounded-lg p-1 border border-[#262626] w-fit">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <motion.button
              key={section.id}
              onClick={() => setActiveSection(section.id as any)}
              className={`relative px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                activeSection === section.id ? 'text-white' : 'text-[#888] hover:text-white'
              }`}
              whileHover={{ y: -1 }}
              whileTap={{ y: 0 }}
            >
              {activeSection === section.id && (
                <motion.div
                  layoutId="proactive-section"
                  className="absolute inset-0 bg-[#262626] rounded-md"
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
              <div className="bg-[#161616] border border-[#262626] rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#F59E0B]" />
                    Recent Actions
                  </h3>
                  <button
                    onClick={() => setActiveSection('actions')}
                    className="text-xs text-[#5E6AD2] hover:text-[#4A55BF] flex items-center gap-1"
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
              <div className="bg-[#161616] border border-[#262626] rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Brain className="w-4 h-4 text-[#8B5CF6]" />
                    Detected Patterns
                  </h3>
                  <button
                    onClick={() => setActiveSection('patterns')}
                    className="text-xs text-[#5E6AD2] hover:text-[#4A55BF] flex items-center gap-1"
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
              <div className="bg-[#161616] border border-[#262626] rounded-lg p-4 lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-[#10B981]" />
                    Top Opportunities
                  </h3>
                  <button
                    onClick={() => setActiveSection('opportunities')}
                    className="text-xs text-[#5E6AD2] hover:text-[#4A55BF] flex items-center gap-1"
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
              <h3 className="text-lg font-semibold text-white">Proactive Actions</h3>
              <span className="text-sm text-[#666]">{actions.length} total</span>
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
              <h3 className="text-lg font-semibold text-white">Detected Patterns</h3>
              <span className="text-sm text-[#666]">{patterns.length} active</span>
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
              <h3 className="text-lg font-semibold text-white">Opportunities</h3>
              <span className="text-sm text-[#666]">{opportunities.length} found</span>
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
