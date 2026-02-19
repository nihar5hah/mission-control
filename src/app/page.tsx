'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useActivities, useTasks, useDocuments } from '@/hooks/useSupabase';
import { useTaskCompletions } from '@/hooks/useTaskCompletions';
import { useAgentState, useAgentSchedules, useAgentDocuments, useAgentActivities } from '@/hooks/useAgents';
import type { Task } from '@/types/database';
import {
  Activity,
  Calendar,
  Search,
  Bot,
  Clock,
  CheckCircle2,
  Zap,
  ArrowUpRight,
  ChevronRight,
  Sparkles,
  FileText,
  AlertCircle,
  ArrowDown,
  Code,
  Database,
  Brain,
  GitBranch,
  Terminal,
  Trash2,
  Plus,
  Filter,
  MoreVertical,
  X,
  Save,
  Eye,
  Hammer,
  Microscope,
  RefreshCw,
  Wrench,
  Rocket,
  TestTube,
  Bug,
  Beaker,
  Play,
  Send,
  AlertTriangle,
  Cog,
  DollarSign,
  GraduationCap,
  Lightbulb,
  Target,
  TrendingUp,
  Users,
  Workflow,
  Building,
  Command,
  Coffee,
  Circle,
  Menu,
} from 'lucide-react';

import { FileTree } from '@/components/FileTree';
import { MarkdownViewer } from '@/components/MarkdownViewer';
import type { FileNode } from '@/hooks/useWorkspaceFiles';
import { AgentStatus } from '@/components/AgentStatus';
import { AgentsSidebar } from '@/components/AgentsSidebar';
import { HierarchyTab } from '@/components/HierarchyTab';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AGENT_CONFIG } from '@/types/agents';
import type { AgentId } from '@/types/agents';
import { OfficeScene } from '@/components/OfficeScene';
import { QuickActions } from '@/components/QuickActions';
import { Toaster } from '@/components/ui/sonner';

/* ============ ANIMATION VARIANTS ============ */
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 8, x: -4 },
  show: { opacity: 1, y: 0, x: 0 },
};

const tabVariants = {
  hidden: { opacity: 0, x: 10 },
  show: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 },
};

const headerVariants = {
  hidden: { opacity: 0, y: -10 },
  show: { opacity: 1, y: 0 },
};

/* ============ ACTION TYPE DEFINITIONS ============ */
const actionTypeConfig: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string; border: string }> = {
  'build': { label: 'Building', icon: Hammer, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  'research': { label: 'Researching', icon: Microscope, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200' },
  'sync': { label: 'Syncing', icon: RefreshCw, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200' },
  'fix': { label: 'Fixing Bug', icon: Wrench, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  'deploy': { label: 'Deploying', icon: Rocket, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  'test': { label: 'Testing', icon: TestTube, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  'agent-start': { label: 'Agent Started', icon: Bot, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200' },
  'agent-complete': { label: 'Task Completed', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  'agent-error': { label: 'Error Encountered', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  'file-create': { label: 'File Created', icon: FileText, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200' },
  'file-update': { label: 'File Updated', icon: ArrowDown, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  'file-delete': { label: 'File Deleted', icon: Trash2, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  'api-call': { label: 'API Request', icon: Code, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  'db-query': { label: 'Database Query', icon: Database, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  'memory-save': { label: 'Memory Saved', icon: Brain, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200' },
  'memory-recall': { label: 'Memory Retrieved', icon: Brain, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200' },
  'git-commit': { label: 'Git Commit', icon: GitBranch, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  'git-push': { label: 'Git Push', icon: ArrowUpRight, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  'system-log': { label: 'System Log', icon: Terminal, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
};

/* ============ MAIN COMPONENT ============ */
export default function MissionControl() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'activity' | 'calendar' | 'office' | 'search' | 'documentation' | 'hierarchy'>(() => {
    if (typeof window === 'undefined') return 'dashboard';
    return (localStorage.getItem('mc_activeTab') as any) || 'dashboard';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedActivity, setExpandedActivity] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'activity' | 'task'; id: number } | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [newTaskForm, setNewTaskForm] = useState({ title: '', scheduled_for: '', day: '', type: 'one-time' as 'daily' | 'one-time' });
  const [statusDropdown, setStatusDropdown] = useState<{ type: 'activity' | 'task'; id: number } | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scheduleAgentFilter, setScheduleAgentFilter] = useState<AgentId | 'all'>(() => {
    if (typeof window === 'undefined') return 'all';
    return (localStorage.getItem('mc_scheduleFilter') as any) || 'all';
  });
  const [docsAgentFilter, setDocsAgentFilter] = useState<AgentId | 'all'>(() => {
    if (typeof window === 'undefined') return 'all';
    return (localStorage.getItem('mc_docsFilter') as any) || 'all';
  });
  const [docsQuery, setDocsQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<{ file: FileNode; content: string } | null>(null);

  // Log Activity Modal State
  const [showLogModal, setShowLogModal] = useState(false);
  const [logForm, setLogForm] = useState({
    agent: 'Main Agent',
    action: 'build' as string,
    description: '',
    status: 'completed' as 'running' | 'completed' | 'failed' | 'pending',
  });
  const [logging, setLogging] = useState(false);

  const { activities, loading: activitiesLoading } = useAgentActivities(undefined, 200);
  const { deleteActivity, updateActivity } = useActivities();
  const { tasks, loading: tasksLoading, updateStatus, updateTask, createTask, deleteTask } = useTasks();
  const { documents, loading: documentsLoading } = useDocuments(searchQuery);
  const { agentStates, loading: agentsLoading } = useAgentState();
  const { schedules: agentSchedules, loading: schedulesLoading, error: schedulesError } = useAgentSchedules();
  const { documents: agentDocuments, loading: agentDocsLoading, error: agentDocsError } = useAgentDocuments();
  const { activities: agentActivities, loading: agentActivitiesLoading } = useAgentActivities(undefined, 15);

  // Hooks for additional functionality
  const { isCompletedOnDate, toggleCompletion: toggleDateCompletion, getStatusOnDate, preloadCompletions } = useTaskCompletions();

  /* ============ ENHANCED ACTIVITY DATA ============ */
  const enhancedActivities = activities.map((activity) => ({
    ...activity,
    type: activity.action.toLowerCase().replace(/\s+/g, '-'),
    metadata: {
      duration: Math.floor(Math.random() * 5000) + 100,
      memory_used: Math.floor(Math.random() * 256) + 32,
      tokens_used: Math.floor(Math.random() * 1000) + 50,
      files_touched: Math.floor(Math.random() * 5) + 1,
    },
  }));

  const filteredActivities = filterType
    ? enhancedActivities.filter((a) => a.type === filterType)
    : enhancedActivities;

  /* ============ HANDLERS ============ */
  const handleToggleTaskCompletion = async (task: Task, date: Date) => {
    const normalizedType = task.type || (task.day === 'Daily' ? 'daily' : 'one-time');
    const isDaily = normalizedType === 'daily' || task.day === 'Daily';

    if (isDaily) {
      await toggleDateCompletion(task.id, date);
    } else {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      updateStatus(task.id, newStatus);
    }
  };

  const handleDeleteActivity = async (id: number) => {
    setDeletingIds((prev) => new Set([...prev, id]));
    try {
      await deleteActivity(id);
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setDeleteConfirm(null);
    }
  };

  const handleDeleteTask = async (id: number) => {
    setDeletingIds((prev) => new Set([...prev, id]));
    try {
      await deleteTask(id);
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setDeleteConfirm(null);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskForm.title.trim()) return;

    const now = new Date();
    const scheduled_for = newTaskForm.scheduled_for || now.toISOString();

    if (editingTaskId) {
      await updateTask(editingTaskId, {
        title: newTaskForm.title,
        scheduled_for,
        day: newTaskForm.day || now.toLocaleDateString('en-US', { weekday: 'long' }),
        type: newTaskForm.type,
      });
    } else {
      await createTask({
        title: newTaskForm.title,
        scheduled_for,
        day: newTaskForm.day || now.toLocaleDateString('en-US', { weekday: 'long' }),
        status: 'pending',
        type: newTaskForm.type,
      });
    }

    setNewTaskForm({ title: '', scheduled_for: '', day: '', type: 'one-time' });
    setEditingTaskId(null);
    setShowTaskModal(false);
  };

  const handleEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setNewTaskForm({
      title: task.title,
      scheduled_for: task.scheduled_for,
      day: task.day || '',
      type: (task.type || 'one-time') as 'daily' | 'one-time',
    });
    setShowTaskModal(true);
  };

  const handleUpdateActivityStatus = async (id: number, status: string) => {
    await updateActivity(id, { status: status as any });
    setStatusDropdown(null);
  };

  const handleLogActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logForm.description.trim()) return;

    setLogging(true);
    try {
      const response = await fetch('/api/activities/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logForm),
      });

      if (!response.ok) throw new Error('Failed to log activity');

      setLogForm({ agent: 'Main Agent', action: 'build', description: '', status: 'completed' });
      setShowLogModal(false);
    } catch (error) {
      console.error('Failed to log activity:', error);
    } finally {
      setLogging(false);
    }
  };

  /* ============ UTILITY FUNCTIONS ============ */
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  };

  const normalizeTaskStatus = (status?: string) => {
    if (!status) return 'pending' as const;
    if (status === 'running' || status === 'in_progress') return 'in_progress' as const;
    if (status === 'failed') return 'failed' as const;
    if (status === 'completed') return 'completed' as const;
    return 'pending' as const;
  };

  const getTaskStatusConfig = (status: ReturnType<typeof normalizeTaskStatus>) => {
    switch (status) {
      case 'completed': return { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', border: 'rgba(16, 185, 129, 0.2)', icon: CheckCircle2 };
      case 'in_progress': return { bg: 'rgba(217, 119, 6, 0.1)', text: '#d97706', border: 'rgba(217, 119, 6, 0.2)', icon: Play };
      case 'failed': return { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.2)', icon: AlertTriangle };
      default: return { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.2)', icon: null };
    }
  };

  const getActivityConfig = (type: string) => {
    return actionTypeConfig[type] || { label: 'Action', icon: Zap, color: '#475569', bg: 'rgba(71, 85, 105, 0.1)', border: 'rgba(71, 85, 105, 0.2)' };
  };

  const getWeekStart = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + diff);
    start.setHours(0, 0, 0, 0);
    return start;
  };

  const getWeekDays = () => {
    const days = [];
    const weekStart = getWeekStart(new Date());
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const getAllTaskDays = () => getWeekDays();

  const getTasksForDay = (date: Date) => {
    return tasks.map((task) => {
      const normalizedType = task.type || (task.day === 'Daily' ? 'daily' : 'one-time');
      const isDaily = normalizedType === 'daily' || task.day === 'Daily';
      const isOneTime = normalizedType === 'one-time';
      const scheduledDateMatches = new Date(task.scheduled_for).toDateString() === date.toDateString();
      const shouldDisplay = isDaily || (isOneTime && scheduledDateMatches);

      if (!shouldDisplay) return null;

      if (isDaily) {
        return { ...task, status: normalizeTaskStatus(getStatusOnDate(task.id, date)) };
      }
      return { ...task, status: normalizeTaskStatus(task.status) };
    }).filter((t): t is typeof tasks[0] => t !== null);
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Zap },
    { id: 'activity', label: 'Activity Log', icon: Activity, badge: activities.length },
    { id: 'calendar', label: 'Schedule', icon: Calendar, badge: agentSchedules.length },
    { id: 'office', label: 'Office', icon: Coffee },
    { id: 'documentation', label: 'Documentation', icon: FileText },
    { id: 'hierarchy', label: 'Hierarchy', icon: Building },
    { id: 'search', label: 'Search', icon: Search },
  ];

  useEffect(() => {
    if (tasks.length > 0 && activeTab === 'calendar') {
      preloadCompletions(tasks.map(t => t.id), getAllTaskDays());
    }
  }, [tasks, activeTab, preloadCompletions]);

  /* ============ RENDER: HEADER ============ */
  const renderHeader = () => (
    <motion.header
      initial="hidden"
      animate="show"
      variants={headerVariants}
      transition={{ duration: 0.2 }}
      className="sticky top-0 z-40 apple-header"
    >
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Left: sidebar toggle + logo */}
        <div className="flex items-center gap-3">
          <motion.button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-tertiary)';
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </motion.button>

          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #06402B 0%, #04311f 100%)',
                boxShadow: '0 4px 12px rgba(6, 64, 43, 0.4)',
              }}
            >
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
                <Command className="w-4 h-4 text-white" />
              </motion.div>
            </div>

            <div>
              <h1 className="text-sm font-semibold leading-tight" style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                CCPL
              </h1>
              <p className="text-[11px] leading-tight" style={{ color: 'var(--text-tertiary)' }}>
                Mission Control
              </p>
            </div>
          </div>
        </div>

        {/* Right: agent status + theme toggle */}
        <div className="flex items-center gap-2">
          <motion.div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.06)' }}
            animate={{ opacity: [0.8, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              className="dot-online animate-pulse-dot"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
              {agentStates.filter(s => s.isOnline).length}/3 Online
            </span>
          </motion.div>

          <ThemeToggle />
        </div>
      </div>
    </motion.header>
  );

  /* ============ RENDER: TAB NAVIGATION ============ */
  const renderTabs = () => (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.05 }}
      className="flex mb-6 sm:mb-8 rounded-xl p-1 overflow-x-auto apple-tabs w-full md:w-fit"
      style={{ scrollbarWidth: 'none' } as React.CSSProperties}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className="relative px-3 sm:px-4 py-2 rounded-[9px] text-xs sm:text-sm font-medium flex items-center gap-1.5 whitespace-nowrap min-h-[36px] transition-colors"
            style={{ color: isActive ? '#ffffff' : 'var(--text-tertiary)' }}
            whileTap={{ scale: 0.97 }}
          >
            {isActive && (
              <motion.div
                layoutId="active-tab"
                className="absolute inset-0 rounded-[9px]"
                style={{ background: 'var(--accent)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.badge ? (
                <span
                  className="ml-0.5 px-1.5 py-0.5 text-[10px] rounded-full font-medium"
                  style={{
                    background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--accent-muted)',
                    color: isActive ? '#fff' : 'var(--accent)',
                  }}
                >
                  {tab.badge}
                </span>
              ) : null}
            </span>
          </motion.button>
        );
      })}
    </motion.div>
  );

  /* ============ RENDER: DASHBOARD ============ */
  const renderDashboard = () => {
    const totalTokens = agentStates.reduce((sum, s) => sum + (s.stats?.daily_tokens_used || 0), 0);
    const totalTasks = agentStates.reduce((sum, s) => sum + (s.stats?.daily_tasks_completed || 0), 0);
    const totalActiveTime = agentStates.reduce((sum, s) => sum + (s.stats?.daily_active_seconds || 0), 0);

    const formatDuration = (seconds: number) => {
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      if (hours > 0) return `${hours}h ${mins}m`;
      return `${mins}m`;
    };

    return (
      <motion.div
        key="dashboard"
        variants={tabVariants}
        initial="hidden"
        animate="show"
        exit="exit"
        transition={{ duration: 0.3 }}
      >
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.022em' }}>Dashboard</h2>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Real-time statistics for all agents</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 sm:mb-8">
          {[
            { label: 'Active Agents', value: `${agentStates.filter(s => s.isOnline).length}/3`, icon: Users, color: 'var(--color-purple)', muted: 'var(--color-purple-muted)' },
            { label: 'Tokens Today', value: totalTokens.toLocaleString(), icon: Zap, color: 'var(--color-teal)', muted: 'var(--color-teal-muted)' },
            { label: 'Tasks Done', value: totalTasks.toString(), icon: CheckCircle2, color: 'var(--color-green)', muted: 'var(--color-green-muted)' },
            { label: 'Active Time', value: formatDuration(totalActiveTime), icon: Clock, color: 'var(--color-orange)', muted: 'var(--color-orange-muted)' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                variants={item}
                className="apple-card p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>{stat.label}</span>
                  <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ background: stat.muted }}>
                    <Icon className="w-4 h-4" style={{ color: stat.color }} />
                  </div>
                </div>
                <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.022em' }}>{stat.value}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="mb-8">
          <QuickActions />
        </div>

        {/* Agent Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
          {agentStates.map((state) => {
            const config = AGENT_CONFIG[state.agent.id];
            return (
              <motion.div
                key={state.agent.id}
                variants={item}
                className="apple-card p-4"
                whileHover={{ y: -2 }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0"
                    style={{ background: `${config.color}18`, border: `1px solid ${config.color}30` }}
                  >
                    {state.agent.id === 'begubot' ? (
                      <Bot className="w-5 h-5" style={{ color: config.color }} />
                    ) : state.agent.id === 'coder' ? (
                      <Code className="w-5 h-5" style={{ color: config.color }} />
                    ) : (
                      <Microscope className="w-5 h-5" style={{ color: config.color }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{config.name}</h3>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{config.role}</p>
                  </div>
                  <motion.div
                    className={state.isOnline ? 'dot-online animate-pulse-dot' : 'dot-offline'}
                    animate={state.isOnline ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>

                {state.latestActivity && (
                  <div className="text-xs rounded-xl px-3 py-2" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)' }}>
                    {state.latestActivity.description}
                  </div>
                )}

                {state.stats && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="text-center rounded-xl py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Tokens</p>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{state.stats.daily_tokens_used.toLocaleString()}</p>
                    </div>
                    <div className="text-center rounded-xl py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Tasks</p>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{state.stats.daily_tasks_completed}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    );
  };

      /* ============ RENDER: ACTIVITY FEED ============ */
  const renderActivityFeed = () => {
    const agentIds: AgentId[] = ['begubot', 'coder', 'researcher'];

    const statusStyles: Record<string, { bg: string; text: string }> = {
      running:   { bg: 'var(--color-green-muted)',  text: 'var(--color-green)' },
      completed: { bg: 'var(--color-blue-muted)',   text: 'var(--color-blue)' },
      failed:    { bg: 'var(--color-red-muted)',    text: 'var(--color-red)' },
      idle:      { bg: 'rgba(255,255,255,0.06)',    text: 'var(--text-tertiary)' },
      pending:   { bg: 'var(--color-orange-muted)', text: 'var(--color-orange)' },
    };

    const actionCategory = (action: string) => {
      const normalized = action.toLowerCase();
      if (['build', 'building', 'implementing', 'coding'].some((k) => normalized.includes(k))) return { label: 'Building', icon: Hammer };
      if (['research', 'researching', 'analysis', 'analyzing', 'docs'].some((k) => normalized.includes(k))) return { label: 'Researching', icon: Microscope };
      if (['coordinating', 'meeting', 'sync', 'syncing', 'delegat'].some((k) => normalized.includes(k))) return { label: 'Coordinating', icon: Users };
      if (['fix', 'bug', 'patch', 'debug'].some((k) => normalized.includes(k))) return { label: 'Fixing', icon: Bug };
      return { label: 'Running', icon: Circle };
    };

    const ActivityColumn = ({ agentId }: { agentId: AgentId }) => {
      const config = AGENT_CONFIG[agentId];
      const { activities, loading } = useAgentActivities(agentId, 50);

      return (
        <div className="apple-card p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{config.emoji}</span>
              <div>
                <h3 className="text-sm font-semibold transition-colors duration-300" style={{ color: 'var(--foreground)' }}>{config.name}</h3>
                <p className="text-[11px] transition-colors duration-300" style={{ color: 'var(--subtle)' }}>{config.role}</p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium status-running">
              Live
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-6 text-xs transition-colors duration-300" style={{ color: 'var(--foreground)' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <Zap className="w-4 h-4 text-teal-600" />
              </motion.div>
              <span className="ml-2">Syncing...</span>
            </div>
          ) : activities.length === 0 ? (
            <p className="text-xs transition-colors duration-300" style={{ color: 'var(--subtle)' }}>No activity yet</p>
          ) : (
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {activities.map((activity) => {
                const category = actionCategory(activity.action);
                const StatusClass = statusStyles[activity.status] || statusStyles.pending;
                const CategoryIcon = category.icon;
                return (
                  <div key={activity.id} className="flex items-start gap-2 p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <div className="p-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <CategoryIcon className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs line-clamp-1" style={{ color: 'var(--text-primary)' }}>{activity.description}</p>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
                        <span>{category.label}</span>
                        <span>·</span>
                        <span>{formatTime(activity.timestamp)}</span>
                        <span
                          className="px-2 py-0.5 rounded-full"
                          style={{ background: StatusClass.bg, color: StatusClass.text }}
                        >
                          {activity.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    };

    return (
      <motion.div key="activity" variants={tabVariants} initial="hidden" animate="show" exit="exit" transition={{ duration: 0.3 }}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.022em' }}>Live Activity</h2>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Newest on top · Last 50 per agent</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {agentIds.map((agentId) => (
            <ActivityColumn key={agentId} agentId={agentId} />
          ))}
        </div>
      </motion.div>
    );
  };
/* ============ RENDER: CALENDAR VIEW ============ */
  const renderCalendar = () => {
    const allTaskDays = getAllTaskDays();
    const scheduleItems = scheduleAgentFilter === 'all'
      ? agentSchedules
      : agentSchedules.filter((schedule) => schedule.agent_id === scheduleAgentFilter);

    const getSchedulesForDay = (date: Date) => {
      return scheduleItems.filter((schedule) => {
        const scheduleDate = new Date(schedule.scheduled_for);
        return scheduleDate.toDateString() === date.toDateString();
      });
    };

    const getScheduleStatusConfig = (status: string) => {
      switch (status) {
        case 'completed':
          return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
        case 'in_progress':
          return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
        case 'cancelled':
          return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
        default:
          return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
      }
    };

    const formatScheduleTime = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
      <motion.div key="calendar" variants={tabVariants} initial="hidden" animate="show" exit="exit" transition={{ duration: 0.3 }}>
        <div className="mb-6 flex flex-col gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.022em' }}>Agent Schedules</h2>
            <p className="text-sm transition-colors duration-300" style={{ color: 'var(--text-tertiary)' }}>{scheduleItems.length} items scheduled</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ y: 0 }}
              onClick={() => setScheduleAgentFilter('all')}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={scheduleAgentFilter === 'all'
                ? { background: 'var(--accent-muted)', color: 'var(--accent)', border: '1px solid rgba(6,64,43,0.3)' }
                : { background: 'rgba(255,255,255,0.06)', color: 'var(--text-tertiary)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              All Agents
            </motion.button>
            {(['begubot', 'coder', 'researcher'] as AgentId[]).map((agentId) => {
              const config = AGENT_CONFIG[agentId];
              const isActive = scheduleAgentFilter === agentId;
              return (
                <motion.button
                  key={agentId}
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 0 }}
                  onClick={() => setScheduleAgentFilter(agentId)}
                  className="px-3 py-1.5 rounded-full text-xs transition-all"
                  style={isActive
                    ? { background: config.color, color: 'white', border: `1px solid ${config.color}` }
                    : { background: 'rgba(255,255,255,0.06)', color: 'var(--text-tertiary)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {config.emoji} {config.name}
                </motion.button>
              );
            })}
          </div>
        </div>

        {schedulesLoading ? (
          <div className="flex items-center justify-center py-12">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <Zap className="w-6 h-6 text-teal-600" />
            </motion.div>
            <span className="ml-2 transition-colors duration-300" style={{ color: 'var(--foreground)' }}>Loading agent schedules...</span>
          </div>
        ) : schedulesError ? (
          <motion.div className="text-center py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-sm text-red-600">Failed to load agent schedules</p>
          </motion.div>
        ) : scheduleItems.length === 0 ? (
          <motion.div className="text-center py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-sm transition-colors duration-300" style={{ color: 'var(--subtle)' }}>No schedules found for this agent</p>
          </motion.div>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {allTaskDays.map((date, idx) => {
              const daySchedules = getSchedulesForDay(date);
              const isToday = date.getDate() === new Date().getDate() && date.getMonth() === new Date().getMonth() && date.getFullYear() === new Date().getFullYear();

              return (
                <motion.div
                  key={idx}
                  variants={item}
                  className="rounded-2xl overflow-hidden transition-all"
                  style={isToday
                    ? { border: '1px solid rgba(6,64,43,0.5)', background: 'rgba(6,64,43,0.08)' }
                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <div className="p-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-xs font-medium uppercase transition-colors duration-300" style={{ color: 'var(--text-tertiary)' }}>{date.toLocaleDateString('en-US', { weekday: 'short', month: 'short' })}</p>
                    <p className="text-2xl font-bold" style={{ color: isToday ? 'var(--accent)' : 'var(--text-primary)', letterSpacing: '-0.022em' }}>{date.getDate()}</p>
                  </div>

                  <div className="p-3 space-y-2 min-h-[120px]">
                    {daySchedules.length > 0 ? daySchedules.map((schedule) => {
                      const config = AGENT_CONFIG[schedule.agent_id];
                      const statusConfig = getScheduleStatusConfig(schedule.status);
                      return (
                        <motion.div
                          key={schedule.id}
                          className={`w-full text-left p-2 rounded text-xs font-medium transition-all border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${config.color}15`, color: config.color }}>
                              {config.emoji}
                            </span>
                            <span className="flex-1 line-clamp-1">{schedule.title}</span>
                            <span className="text-[10px] transition-colors duration-300" style={{ color: 'var(--subtle)' }}>{formatScheduleTime(schedule.scheduled_for)}</span>
                          </div>
                          {schedule.description && (
                            <p className="mt-1 text-[10px] line-clamp-1 transition-colors duration-300" style={{ color: 'var(--subtle)' }}>{schedule.description}</p>
                          )}
                        </motion.div>
                      );
                    }) : <p className="text-xs text-center py-4 transition-colors duration-300" style={{ color: 'var(--subtle)' }}>No schedules</p>}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.div>
    );
  };

      /* ============ RENDER: DOCUMENTATION ============ */
  const renderDocumentation = () => (
    <motion.div key="documentation" variants={tabVariants} initial="hidden" animate="show" exit="exit" transition={{ duration: 0.3 }}>
      <div className="mb-6 flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.022em' }}>Documentation</h2>
          <p className="text-sm transition-colors duration-300" style={{ color: 'var(--text-tertiary)' }}>Real-time agent documentation (workspace + memory)</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <motion.div className="relative flex-1 min-w-[220px]" whileHover={{ y: -1 }}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search agent docs..."
              value={docsQuery}
              onChange={(e) => setDocsQuery(e.target.value)}
              className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm"
              style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
            />
          </motion.div>

          <div className="flex flex-wrap items-center gap-2">
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ y: 0 }}
              onClick={() => setDocsAgentFilter('all')}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={docsAgentFilter === 'all'
                ? { background: 'var(--accent-muted)', color: 'var(--accent)', border: '1px solid rgba(6,64,43,0.3)' }
                : { background: 'rgba(255,255,255,0.06)', color: 'var(--text-tertiary)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              All Agents
            </motion.button>
            {(['begubot', 'coder', 'researcher'] as AgentId[]).map((agentId) => {
              const config = AGENT_CONFIG[agentId];
              const isActive = docsAgentFilter === agentId;
              return (
                <motion.button
                  key={agentId}
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 0 }}
                  onClick={() => setDocsAgentFilter(agentId)}
                  className="px-3 py-1.5 rounded-full text-xs transition-all"
                  style={isActive
                    ? { background: config.color, color: 'white', border: `1px solid ${config.color}` }
                    : { background: 'rgba(255,255,255,0.06)', color: 'var(--text-tertiary)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {config.emoji} {config.name}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {agentDocsLoading ? (
        <div className="flex items-center justify-center py-12">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
            <Zap className="w-6 h-6 text-teal-600" />
          </motion.div>
          <span className="ml-2 transition-colors duration-300" style={{ color: 'var(--foreground)' }}>Loading documentation...</span>
        </div>
      ) : agentDocsError ? (
        <motion.div className="text-center py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-sm text-red-600">Failed to load agent documentation</p>
        </motion.div>
      ) : (() => {
        const filteredDocs = agentDocuments
          .filter((doc) => docsAgentFilter === 'all' || doc.agent_id === docsAgentFilter)
          .filter((doc) => !docsQuery || doc.title.toLowerCase().includes(docsQuery.toLowerCase()) || doc.content.toLowerCase().includes(docsQuery.toLowerCase()));

        if (filteredDocs.length === 0) {
          return (
            <motion.div className="text-center py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <FileText className="w-12 h-12 text-teal-500/20 mx-auto mb-4" />
              <p className="text-sm transition-colors duration-300" style={{ color: 'var(--subtle)' }}>No documents found for this filter</p>
            </motion.div>
          );
        }

        const buildAgentTree = (agentId: AgentId): FileNode => {
          const config = AGENT_CONFIG[agentId];
          const docs = filteredDocs.filter((doc) => doc.agent_id === agentId);
          const memoryDocs = docs.filter((doc) => doc.source_file?.includes('/memory/'));
          const rootDocs = docs.filter((doc) => !doc.source_file?.includes('/memory/'));

          const toFileNode = (doc: typeof docs[number]): FileNode => ({
            name: doc.title,
            path: doc.source_file || `${doc.agent_id}-${doc.id}`,
            type: 'file',
            isPriority: ['IDENTITY.md', 'MEMORY.md', 'SOUL.md'].includes(doc.title),
            content: doc.content,
          });

          const children: FileNode[] = [];
          if (rootDocs.length > 0) {
            children.push(...rootDocs.map(toFileNode));
          }
          if (memoryDocs.length > 0) {
            children.push({
              name: 'memory',
              path: `${agentId}-memory`,
              type: 'directory',
              children: memoryDocs
                .sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || ''))
                .map(toFileNode),
            });
          }

          return {
            name: `${config.emoji} ${config.name}`,
            path: agentId,
            type: 'directory',
            children,
          };
        };

        const tree: FileNode[] = ['begubot', 'coder', 'researcher']
          .filter((agentId) => docsAgentFilter === 'all' || agentId === docsAgentFilter)
          .map((agentId) => buildAgentTree(agentId as AgentId));

        return (
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4">
            <div className="apple-card p-3 max-h-[600px] overflow-y-auto">
              <FileTree
                files={tree}
                selectedFile={selectedDoc?.file || null}
                onSelectFile={(file) => setSelectedDoc({ file, content: file.content || '' })}
              />
            </div>

            <div className="apple-card p-4 min-h-[360px]">
              <MarkdownViewer
                content={selectedDoc?.content || ''}
                fileName={selectedDoc?.file.name || 'Select a document'}
              />
            </div>
          </div>
        );
      })()}
    </motion.div>
  );

  /* ============ RENDER: OFFICE SCENE ============ */
/* ============ RENDER: OFFICE SCENE ============ */
  const renderOffice = () => (
    <motion.div key="office" variants={tabVariants} initial="hidden" animate="show" exit="exit" transition={{ duration: 0.3 }}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.022em' }}>Office Playground</h2>
          <p className="text-sm transition-colors duration-300" style={{ color: 'var(--text-tertiary)' }}>Animated live office + real-time agent activity</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4">
        <OfficeScene agentStates={agentStates} />

        <div className="apple-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold transition-colors duration-300" style={{ color: 'var(--foreground)' }}>Live Agent Activity</h3>
            <span className="text-xs transition-colors duration-300" style={{ color: 'var(--subtle)' }}>Real-time sync</span>
          </div>

          {agentActivitiesLoading ? (
            <div className="flex items-center justify-center py-8">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <Zap className="w-5 h-5 text-teal-600" />
              </motion.div>
              <span className="ml-2 text-xs transition-colors duration-300" style={{ color: 'var(--foreground)' }}>Syncing...</span>
            </div>
          ) : agentActivities.length === 0 ? (
            <p className="text-xs transition-colors duration-300" style={{ color: 'var(--subtle)' }}>No recent agent activity</p>
          ) : (
            <div className="space-y-3">
              {agentActivities.map((activity) => {
                const config = AGENT_CONFIG[activity.agent_id];
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${config.color}15`, color: config.color }}>
                      {config.emoji}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs" style={{ color: 'var(--text-primary)' }}>
                        <span className="font-semibold">{config.name}</span> · {activity.action}
                      </p>
                      <p className="text-[11px] line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{activity.description}</p>
                      <p className="text-[10px] mt-1" style={{ color: 'var(--text-tertiary)' }}>{formatTime(activity.timestamp)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  /* ============ RENDER: SEARCH ============ */
  const renderSearch = () => (
    <motion.div key="search" variants={tabVariants} initial="hidden" animate="show" exit="exit" transition={{ duration: 0.3 }}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)', letterSpacing: '-0.022em' }}>Global Search</h2>
        <motion.div className="relative" whileHover={{ y: -2 }}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search activities, documents, tasks, memories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl pl-12 pr-4 py-3 text-sm"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
          />
        </motion.div>
      </div>

      {documentsLoading ? (
        <div className="flex items-center justify-center py-12">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
            <Zap className="w-6 h-6 text-teal-600" />
          </motion.div>
          <span className="ml-2 text-slate-600">Searching...</span>
        </div>
      ) : !searchQuery ? (
        <motion.div className="text-center py-16" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="inline-block mb-4">
            <Sparkles className="w-12 h-12 text-teal-500/20" />
          </motion.div>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Search your workspace</p>
        </motion.div>
      ) : documents.length === 0 ? (
        <motion.div className="text-center py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-sm transition-colors duration-300" style={{ color: 'var(--subtle)' }}>No results found for <span className="font-medium transition-colors duration-300" style={{ color: 'var(--foreground)' }}>"{searchQuery}"</span></p>
        </motion.div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
          {documents.map((doc) => (
            <motion.div key={doc.id} variants={item} className="apple-card p-4 group" whileHover={{ x: 2 }}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold transition-colors" style={{ color: 'var(--text-primary)' }}>{doc.title}</h3>
                  {doc.category && <span className="inline-block mt-1 px-2 py-1 rounded-lg text-xs font-medium" style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}>{doc.category}</span>}
                </div>
                <motion.div className="opacity-0 group-hover:opacity-100 transition-opacity" whileHover={{ x: 4 }}>
                  <ArrowUpRight className="w-5 h-5 text-teal-600" />
                </motion.div>
              </div>
              <p className="text-sm line-clamp-2 mb-2 transition-colors duration-300" style={{ color: 'var(--text-tertiary)' }}>{doc.content.substring(0, 150)}...</p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );

  /* ============ MAIN RENDER ============ */
  return (
    <div className="flex h-screen relative overflow-hidden transition-colors duration-300" style={{ backgroundColor: 'var(--muted-bg)' }}>
      {/* Agents Sidebar */}
      <AgentsSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {renderHeader()}
        <Toaster />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {renderTabs()}

          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'activity' && renderActivityFeed()}
            {activeTab === 'calendar' && renderCalendar()}
            {activeTab === 'office' && renderOffice()}
            {activeTab === 'documentation' && renderDocumentation()}
            {activeTab === 'hierarchy' && <HierarchyTab />}
            {activeTab === 'search' && renderSearch()}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
