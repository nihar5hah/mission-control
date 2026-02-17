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
  'research': { label: 'Researching', icon: Microscope, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
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
  'memory-save': { label: 'Memory Saved', icon: Brain, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  'memory-recall': { label: 'Memory Retrieved', icon: Brain, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  'git-commit': { label: 'Git Commit', icon: GitBranch, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  'git-push': { label: 'Git Push', icon: ArrowUpRight, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  'system-log': { label: 'System Log', icon: Terminal, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
};

/* ============ MAIN COMPONENT ============ */
export default function MissionControl() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'activity' | 'calendar' | 'office' | 'search' | 'documentation' | 'hierarchy'>('dashboard');
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
  const [scheduleAgentFilter, setScheduleAgentFilter] = useState<AgentId | 'all'>('all');
  const [docsAgentFilter, setDocsAgentFilter] = useState<AgentId | 'all'>('all');
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

  const { activities, loading: activitiesLoading, deleteActivity, updateActivity } = useActivities();
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
      case 'completed': return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', icon: CheckCircle2 };
      case 'in_progress': return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', icon: Play };
      case 'failed': return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', icon: AlertTriangle };
      default: return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', icon: null };
    }
  };

  const getActivityConfig = (type: string) => {
    return actionTypeConfig[type] || { label: 'Action', icon: Zap, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' };
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
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-40 shadow-sm transition-all duration-300"
      style={{
        backgroundColor: 'var(--background)',
        borderBottom: '1px solid var(--border)'
      }}
    >
      <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.02 }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-11 h-11 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
            style={{
              border: '1px solid var(--border)',
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)'
            }}
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center overflow-hidden shadow-lg shadow-teal-500/20">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
              <Building className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </motion.div>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-semibold transition-colors duration-300" style={{ color: 'var(--foreground)' }}>The Begu Company</h1>
            <p className="text-[11px] sm:text-xs transition-colors duration-300" style={{ color: 'var(--subtle)' }}>Mission Control</p>
          </div>
        </motion.div>

        <div className="flex items-center gap-3">
          <motion.div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300"
            style={{
              backgroundColor: 'var(--muted-bg)',
              border: '1px solid var(--border)'
            }}
            animate={{ opacity: [0.8, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div className="w-2 h-2 bg-emerald-500 rounded-full" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} />
            <span className="text-xs font-medium transition-colors duration-300" style={{ color: 'var(--foreground)' }}>{agentStates.filter(s => s.isOnline).length}/3 Agents Online</span>
          </motion.div>
          <ThemeToggle />
        </div>
      </div>
    </motion.header>
  );

  /* ============ RENDER: TAB NAVIGATION ============ */
  const renderTabs = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="flex gap-1 mb-6 sm:mb-8 rounded-lg p-1 w-full md:w-fit overflow-x-auto shadow-sm"
      style={{
        backgroundColor: 'var(--background)',
        borderColor: 'var(--border)',
        borderWidth: '1px'
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className="relative px-3 sm:px-4 py-2.5 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center gap-2 min-h-[44px] whitespace-nowrap"
            whileHover={{ y: -1 }}
            whileTap={{ y: 0 }}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="active-tab"
                className="absolute inset-0 rounded-md"
                style={{ background: 'var(--gradient-primary)', opacity: 0.1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <span className={`relative z-10 flex items-center gap-2 font-medium transition-colors ${activeTab === tab.id ? 'font-semibold' : ''}`}
              style={{
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--subtle)'
              }}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.badge && <span className="ml-1 px-2 py-0.5 text-xs rounded-full text-white" style={{ background: 'var(--gradient-primary)' }}>{tab.badge}</span>}
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
          <h2 className="text-2xl font-semibold mb-1 transition-colors duration-300" style={{ color: 'var(--foreground)' }}>Dashboard Overview</h2>
          <p className="text-sm transition-colors duration-300" style={{ color: 'var(--subtle)' }}>Real-time statistics for all agents</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
          <motion.div variants={item} className="rounded-lg shadow-sm p-4 hover:shadow-md transition-all duration-300" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-md bg-purple-50 border border-purple-200">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-xs transition-colors duration-300" style={{ color: 'var(--subtle)' }}>Active Agents</span>
            </div>
            <p className="text-2xl font-semibold transition-colors duration-300" style={{ color: 'var(--foreground)' }}>{agentStates.filter(s => s.isOnline).length}/3</p>
          </motion.div>

          <motion.div variants={item} className="rounded-lg shadow-sm p-4 hover:shadow-md transition-all duration-300" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-md bg-teal-50 border border-teal-200">
                <Zap className="w-4 h-4 text-teal-600" />
              </div>
              <span className="text-xs transition-colors duration-300" style={{ color: 'var(--subtle)' }}>Tokens Today</span>
            </div>
            <p className="text-2xl font-semibold transition-colors duration-300" style={{ color: 'var(--foreground)' }}>{totalTokens.toLocaleString()}</p>
          </motion.div>

          <motion.div variants={item} className="rounded-lg shadow-sm p-4 hover:shadow-md transition-all duration-300" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-md bg-emerald-50 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-xs transition-colors duration-300" style={{ color: 'var(--subtle)' }}>Tasks Completed</span>
            </div>
            <p className="text-2xl font-semibold transition-colors duration-300" style={{ color: 'var(--foreground)' }}>{totalTasks}</p>
          </motion.div>

          <motion.div variants={item} className="rounded-lg shadow-sm p-4 hover:shadow-md transition-all duration-300" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-md bg-amber-50 border border-amber-200">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-xs transition-colors duration-300" style={{ color: 'var(--subtle)' }}>Active Time</span>
            </div>
            <p className="text-2xl font-semibold transition-colors duration-300" style={{ color: 'var(--foreground)' }}>{formatDuration(totalActiveTime)}</p>
          </motion.div>
        </div>

        {/* Agent Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {agentStates.map((state) => {
            const config = AGENT_CONFIG[state.agent.id];
            return (
              <motion.div
                key={state.agent.id}
                variants={item}
                className="rounded-lg p-4 hover:shadow-md transition-all duration-300"
                style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}
                whileHover={{ y: -2, borderColor: 'var(--primary)' }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${config.color}15`, border: `1.5px solid ${config.color}30` }}
                  >
                    {state.agent.id === 'begubot' ? (
                      <Bot className="w-5 h-5" style={{ color: config.color }} />
                    ) : state.agent.id === 'coder' ? (
                      <Code className="w-5 h-5" style={{ color: config.color }} />
                    ) : (
                      <Microscope className="w-5 h-5" style={{ color: config.color }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold transition-colors duration-300" style={{ color: 'var(--foreground)' }}>{config.name}</h3>
                    <p className="text-xs transition-colors duration-300" style={{ color: 'var(--subtle)' }}>{config.role}</p>
                  </div>
                  <motion.div
                    className={`w-2 h-2 rounded-full ${state.isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`}
                    animate={state.isOnline ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>

                {state.latestActivity && (
                  <div className="text-xs rounded p-2 transition-all duration-300" style={{ color: 'var(--foreground)', backgroundColor: 'var(--muted-bg)' }}>
                    {state.latestActivity.description}
                  </div>
                )}

                {state.stats && (
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center">
                      <p className="transition-colors duration-300" style={{ color: 'var(--subtle)' }}>Tokens</p>
                      <p className="font-medium transition-colors duration-300" style={{ color: 'var(--foreground)' }}>{state.stats.daily_tokens_used.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="transition-colors duration-300" style={{ color: 'var(--subtle)' }}>Tasks</p>
                      <p className="font-medium transition-colors duration-300" style={{ color: 'var(--foreground)' }}>{state.stats.daily_tasks_completed}</p>
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

    const statusStyles: Record<string, string> = {
      running: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      completed: 'bg-blue-50 text-blue-700 border-blue-200',
      failed: 'bg-red-50 text-red-700 border-red-200',
      idle: 'bg-slate-50 border-slate-200 transition-colors duration-300',
      pending: 'bg-amber-50 text-amber-700 border-amber-200',
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
        <div className="rounded-lg shadow-sm p-4 flex flex-col transition-all duration-300" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{config.emoji}</span>
              <div>
                <h3 className="text-sm font-semibold transition-colors duration-300" style={{ color: 'var(--foreground)' }}>{config.name}</h3>
                <p className="text-[11px] transition-colors duration-300" style={{ color: 'var(--subtle)' }}>{config.role}</p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-1 rounded-full" style={{ backgroundColor: `${config.color}15`, color: config.color }}>
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
                  <div key={activity.id} className="flex items-start gap-2 p-2 rounded-md bg-slate-50 border border-slate-200">
                    <div className="p-1.5 rounded bg-slate-100 border border-slate-200">
                      <CategoryIcon className="w-3.5 h-3.5 text-slate-700" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs line-clamp-1 transition-colors duration-300" style={{ color: 'var(--foreground)' }}>{activity.description}</p>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] mt-1 transition-colors duration-300" style={{ color: 'var(--subtle)' }}>
                        <span>{category.label}</span>
                        <span>•</span>
                        <span>{formatTime(activity.timestamp)}</span>
                        <span className={`px-2 py-0.5 rounded-full border ${StatusClass}`}>
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
          <h2 className="text-2xl font-semibold mb-1 transition-colors duration-300" style={{ color: 'var(--foreground)' }}>Live Agent Activity</h2>
          <p className="text-sm transition-colors duration-300" style={{ color: 'var(--subtle)' }}>Newest on top • Last 50 per agent</p>
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
            <h2 className="text-2xl font-semibold mb-1 transition-colors duration-300" style={{ color: 'var(--foreground)' }}>Agent Schedules</h2>
            <p className="text-sm transition-colors duration-300" style={{ color: 'var(--subtle)' }}>{scheduleItems.length} items scheduled</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ y: 0 }}
              onClick={() => setScheduleAgentFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs border transition-all ${scheduleAgentFilter === 'all' ? 'border-teal-600 text-teal-700 bg-teal-50' : ''}`}
              style={scheduleAgentFilter !== 'all' ? { border: '1px solid var(--border)', color: 'var(--foreground)', backgroundColor: 'var(--background)' } : {}}
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
                  className="px-3 py-1.5 rounded-full text-xs border transition-all"
                  style={isActive ? { borderColor: config.color, backgroundColor: config.color, color: 'white' } : { borderColor: 'var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
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
                  className={`rounded-lg border overflow-hidden hover:shadow-md transition-all ${isToday ? 'border-teal-600 bg-teal-50' : ''}`}
                  style={!isToday ? { backgroundColor: 'var(--background)', border: '1px solid var(--border)' } : {}}
                >
                  <div className={`p-3 border-b ${isToday ? 'border-teal-200 bg-teal-50' : ''}`} style={!isToday ? { borderBottom: '1px solid var(--border)', backgroundColor: 'var(--background)' } : {}}>
                    <p className="text-xs font-medium uppercase transition-colors duration-300" style={{ color: 'var(--subtle)' }}>{date.toLocaleDateString('en-US', { weekday: 'short', month: 'short' })}</p>
                    <p className={`text-2xl font-semibold ${isToday ? 'text-teal-700' : ''}`} style={!isToday ? { color: 'var(--foreground)' } : {}}>{date.getDate()}</p>
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
          <h2 className="text-2xl font-semibold mb-1 transition-colors duration-300" style={{ color: 'var(--foreground)' }}>Documentation</h2>
          <p className="text-sm transition-colors duration-300" style={{ color: 'var(--subtle)' }}>Real-time agent documentation (workspace + memory)</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <motion.div className="relative flex-1 min-w-[220px]" whileHover={{ y: -1 }}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search agent docs..."
              value={docsQuery}
              onChange={(e) => setDocsQuery(e.target.value)}
              className="w-full rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all"
              style={{ backgroundColor: 'var(--input)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            />
          </motion.div>

          <div className="flex flex-wrap items-center gap-2">
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ y: 0 }}
              onClick={() => setDocsAgentFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs border transition-all ${docsAgentFilter === 'all' ? 'border-teal-600 text-teal-700 bg-teal-50' : ''}`}
              style={docsAgentFilter !== 'all' ? { border: '1px solid var(--border)', color: 'var(--foreground)', backgroundColor: 'var(--background)' } : {}}
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
                  className="px-3 py-1.5 rounded-full text-xs border transition-all"
                  style={isActive ? { borderColor: config.color, backgroundColor: config.color, color: 'white' } : { borderColor: 'var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
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
            <div className="rounded-lg shadow-sm p-3 max-h-[600px] overflow-y-auto transition-all duration-300" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}>
              <FileTree
                files={tree}
                selectedFile={selectedDoc?.file || null}
                onSelectFile={(file) => setSelectedDoc({ file, content: file.content || '' })}
              />
            </div>

            <div className="rounded-lg shadow-sm p-4 min-h-[360px] transition-all duration-300" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}>
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
          <h2 className="text-2xl font-semibold mb-1 transition-colors duration-300" style={{ color: 'var(--foreground)' }}>Office Playground</h2>
          <p className="text-sm transition-colors duration-300" style={{ color: 'var(--subtle)' }}>Animated live office + real-time agent activity</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4">
        <OfficeScene agentStates={agentStates} />

        <div className="rounded-lg shadow-sm p-4 transition-all duration-300" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}>
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
                      <p className="text-xs text-slate-900">
                        <span className="font-semibold">{config.name}</span> · {activity.action}
                      </p>
                      <p className="text-[11px] text-slate-600 line-clamp-2">{activity.description}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{formatTime(activity.timestamp)}</p>
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
        <h2 className="text-2xl font-semibold mb-4 transition-colors duration-300" style={{ color: 'var(--foreground)' }}>Global Search</h2>
        <motion.div className="relative" whileHover={{ y: -2 }}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search activities, documents, tasks, memories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all"
            style={{ backgroundColor: 'var(--input)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
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
          <p className="text-sm text-slate-600">Search your workspace</p>
        </motion.div>
      ) : documents.length === 0 ? (
        <motion.div className="text-center py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-sm transition-colors duration-300" style={{ color: 'var(--subtle)' }}>No results found for <span className="font-medium transition-colors duration-300" style={{ color: 'var(--foreground)' }}>"{searchQuery}"</span></p>
        </motion.div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
          {documents.map((doc) => (
            <motion.div key={doc.id} variants={item} className="rounded-lg shadow-sm p-4 hover:shadow-md transition-all group" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }} whileHover={{ x: 2 }}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold group-hover:text-teal-700 transition-colors" style={{ color: 'var(--foreground)' }}>{doc.title}</h3>
                  {doc.category && <span className="inline-block mt-1 px-2 py-1 rounded-sm bg-teal-50 text-teal-700 text-xs font-medium">{doc.category}</span>}
                </div>
                <motion.div className="opacity-0 group-hover:opacity-100 transition-opacity" whileHover={{ x: 4 }}>
                  <ArrowUpRight className="w-5 h-5 text-teal-600" />
                </motion.div>
              </div>
              <p className="text-sm line-clamp-2 mb-2 transition-colors duration-300" style={{ color: 'var(--subtle)' }}>{doc.content.substring(0, 150)}...</p>
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
