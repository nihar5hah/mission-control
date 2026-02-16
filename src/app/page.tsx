'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useActivities, useTasks, useDocuments } from '@/hooks/useSupabase';
import { useTaskCompletions } from '@/hooks/useTaskCompletions';
import { useProactiveDashboard } from '@/hooks/useProactiveDashboard';
import { useWorkspaceFiles } from '@/hooks/useWorkspaceFiles';
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
  Lock,
  Trash2,
  Plus,
  Filter,
  MoreVertical,
  X,
  Save,
  Eye,
  // New activity type icons
  Hammer,        // build
  Microscope,    // research
  RefreshCw,     // sync
  Wrench,        // fix
  Rocket,        // deploy
  TestTube,      // test
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
} from 'lucide-react';

import { FileTree } from '@/components/FileTree';
import { MarkdownViewer } from '@/components/MarkdownViewer';
import { AgentStatus } from '@/components/AgentStatus';

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
const actionTypeConfig = {
  // Core Activity Types (New)
  'build': {
    label: 'Building',
    icon: Hammer,
    color: 'text-[#F59E0B]',
    bg: 'bg-[#F59E0B]/10',
    border: 'border-[#F59E0B]/30',
  },
  'research': {
    label: 'Researching',
    icon: Microscope,
    color: 'text-[#8B5CF6]',
    bg: 'bg-[#8B5CF6]/10',
    border: 'border-[#8B5CF6]/30',
  },
  'sync': {
    label: 'Syncing',
    icon: RefreshCw,
    color: 'text-[#06B6D4]',
    bg: 'bg-[#06B6D4]/10',
    border: 'border-[#06B6D4]/30',
  },
  'fix': {
    label: 'Fixing Bug',
    icon: Wrench,
    color: 'text-[#EF4444]',
    bg: 'bg-[#EF4444]/10',
    border: 'border-[#EF4444]/30',
  },
  'deploy': {
    label: 'Deploying',
    icon: Rocket,
    color: 'text-[#10B981]',
    bg: 'bg-[#10B981]/10',
    border: 'border-[#10B981]/30',
  },
  'test': {
    label: 'Testing',
    icon: TestTube,
    color: 'text-[#3B82F6]',
    bg: 'bg-[#3B82F6]/10',
    border: 'border-[#3B82F6]/30',
  },

  // Agent Actions
  'agent-start': {
    label: 'Agent Started',
    icon: Bot,
    color: 'text-[#5E6AD2]',
    bg: 'bg-[#5E6AD2]/10',
    border: 'border-[#5E6AD2]/30',
  },
  'agent-complete': {
    label: 'Task Completed',
    icon: CheckCircle2,
    color: 'text-[#5EAD5E]',
    bg: 'bg-[#5EAD5E]/10',
    border: 'border-[#5EAD5E]/30',
  },
  'agent-error': {
    label: 'Error Encountered',
    icon: AlertCircle,
    color: 'text-[#E55454]',
    bg: 'bg-[#E55454]/10',
    border: 'border-[#E55454]/30',
  },

  // File Operations
  'file-create': {
    label: 'File Created',
    icon: FileText,
    color: 'text-[#5E6AD2]',
    bg: 'bg-[#5E6AD2]/10',
    border: 'border-[#5E6AD2]/30',
  },
  'file-update': {
    label: 'File Updated',
    icon: ArrowDown,
    color: 'text-[#6F7BDB]',
    bg: 'bg-[#6F7BDB]/10',
    border: 'border-[#6F7BDB]/30',
  },
  'file-delete': {
    label: 'File Deleted',
    icon: Trash2,
    color: 'text-[#E55454]',
    bg: 'bg-[#E55454]/10',
    border: 'border-[#E55454]/30',
  },

  // API/Database
  'api-call': {
    label: 'API Request',
    icon: Code,
    color: 'text-[#D4A853]',
    bg: 'bg-[#D4A853]/10',
    border: 'border-[#D4A853]/30',
  },
  'db-query': {
    label: 'Database Query',
    icon: Database,
    color: 'text-[#5E8FAD]',
    bg: 'bg-[#5E8FAD]/10',
    border: 'border-[#5E8FAD]/30',
  },

  // Memory/Thinking
  'memory-save': {
    label: 'Memory Saved',
    icon: Brain,
    color: 'text-[#9F5EAD]',
    bg: 'bg-[#9F5EAD]/10',
    border: 'border-[#9F5EAD]/30',
  },
  'memory-recall': {
    label: 'Memory Retrieved',
    icon: Brain,
    color: 'text-[#9F5EAD]',
    bg: 'bg-[#9F5EAD]/10',
    border: 'border-[#9F5EAD]/30',
  },

  // Git/Version Control
  'git-commit': {
    label: 'Git Commit',
    icon: GitBranch,
    color: 'text-[#F97316]',
    bg: 'bg-[#F97316]/10',
    border: 'border-[#F97316]/30',
  },
  'git-push': {
    label: 'Git Push',
    icon: ArrowUpRight,
    color: 'text-[#F97316]',
    bg: 'bg-[#F97316]/10',
    border: 'border-[#F97316]/30',
  },

  // System
  'system-log': {
    label: 'System Log',
    icon: Terminal,
    color: 'text-[#888]',
    bg: 'bg-[#888]/10',
    border: 'border-[#888]/30',
  },
};

/* ============ MAIN COMPONENT ============ */
export default function MissionControl() {
  const [activeTab, setActiveTab] = useState<'activity' | 'calendar' | 'proactive' | 'search' | 'documentation'>('activity');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedActivity, setExpandedActivity] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'activity' | 'task'; id: number } | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [newTaskForm, setNewTaskForm] = useState({ title: '', scheduled_for: '', day: '', type: 'one-time' as 'daily' | 'one-time' });
  const [statusDropdown, setStatusDropdown] = useState<{ type: 'activity' | 'task'; id: number } | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const [showTaskDropdown, setShowTaskDropdown] = useState<number | null>(null);

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
  const { files, selectedFile, fileContent, loading: filesLoading, contentLoading, selectFile, refresh: refreshFiles } = useWorkspaceFiles();
  const { stats, actions, patterns, opportunities, suggestions, predictions, loading: proactiveLoading, refreshing, refresh: refreshProactive, triggerAnalysis, triggerScan, updateOpportunityStatus, completeAction, dismissAction } = useProactiveDashboard();
  
  // Date-specific completion tracking for daily tasks
  const { isCompletedOnDate, toggleCompletion: toggleDateCompletion, getStatusOnDate } = useTaskCompletions();

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
    // For daily tasks, use date-specific completion tracking
    if (task.type === 'daily' || task.day === 'Daily') {
      await toggleDateCompletion(task.id, date);
    } else {
      // For one-time tasks, toggle the task status in the database
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
      // Edit existing task
      await updateTask(editingTaskId, {
        title: newTaskForm.title,
        scheduled_for,
        day: newTaskForm.day || now.toLocaleDateString('en-US', { weekday: 'long' }),
        type: newTaskForm.type,
      });
    } else {
      // Create new task
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

  // Log Activity Handler
  const handleLogActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logForm.description.trim()) return;

    setLogging(true);
    try {
      const response = await fetch('/api/activities/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logForm),
      });

      if (!response.ok) {
        throw new Error('Failed to log activity');
      }

      // Reset form and close modal
      setLogForm({
        agent: 'Main Agent',
        action: 'build',
        description: '',
        status: 'completed',
      });
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getActivityConfig = (type: string) => {
    return (
      actionTypeConfig[type as keyof typeof actionTypeConfig] || {
        label: 'Action',
        icon: Zap,
        color: 'text-[#888]',
        bg: 'bg-[#888]/10',
        border: 'border-[#888]/30',
      }
    );
  };

  const getWeekDays = () => {
    const days = [];
    const today = new Date();
    
    // Start from today + next 6 days (full week from today)
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const getAllTaskDays = () => {
    // Show exactly 7 days: today + next 6 days
    // This is the weekly view for the schedule tab
    return getWeekDays();
  };

  const getTasksForDay = (date: Date) => {
    return tasks.map((task) => {
      // Check if task should be displayed on this date
      const shouldDisplay = task.type === 'daily' || task.day === 'Daily' || 
        (task.type === 'one-time' && 
         new Date(task.scheduled_for).toDateString() === date.toDateString());

      if (!shouldDisplay) return null;

      // For daily tasks, use date-specific completion status
      if (task.type === 'daily' || task.day === 'Daily') {
        const completionStatus = getStatusOnDate(task.id, date);
        return {
          ...task,
          status: completionStatus as 'pending' | 'completed',
        };
      }

      // For one-time tasks, use the task's own status
      return task;
    }).filter((t): t is typeof tasks[0] => t !== null);
  };

  const getAllTasks = () => {
    return tasks.sort((a, b) => {
      return new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime();
    });
  };

  const tabs = [
    { id: 'activity', label: 'Activity Log', icon: Activity, badge: activities.length },
    { id: 'calendar', label: 'Schedule', icon: Calendar, badge: tasks.length },
    { id: 'proactive', label: 'Proactive', icon: Brain },
    { id: 'documentation', label: 'Documentation', icon: FileText },
    { id: 'search', label: 'Search', icon: Search },
  ];

  /* ============ RENDER: HEADER ============ */
  const renderHeader = () => (
    <motion.header
      initial="hidden"
      animate="show"
      variants={headerVariants}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-40 border-b border-[#262626] bg-gradient-to-r from-[#0F0F0F] via-[#0F0F0F] to-[#1A1A1A]/50 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.02 }}>
          <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-[#5E6AD2] to-[#4A55BF] flex items-center justify-center overflow-hidden shadow-lg shadow-[#5E6AD2]/20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <Bot className="w-6 h-6 text-white" />
            </motion.div>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">OpenClaw</h1>
            <p className="text-xs text-[#888]">Agent Operations Dashboard</p>
          </div>
        </motion.div>

        <motion.div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#161616] border border-[#262626]"
          animate={{ opacity: [0.6, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            className="w-2 h-2 bg-[#5EAD5E] rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-xs font-medium text-[#888]">Live</span>
        </motion.div>
      </div>
    </motion.header>
  );

  /* ============ RENDER: TAB NAVIGATION ============ */
  const renderTabs = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="flex gap-1 mb-8 bg-[#161616] rounded-lg p-1 border border-[#262626] w-fit"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className="relative px-4 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
            whileHover={{ y: -1 }}
            whileTap={{ y: 0 }}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="active-tab"
                className="absolute inset-0 bg-[#262626] rounded-md"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <span className={`relative z-10 flex items-center gap-2 ${activeTab === tab.id ? 'text-white' : 'text-[#888]'}`}>
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.badge && <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-[#5E6AD2] text-white">{tab.badge}</span>}
            </span>
          </motion.button>
        );
      })}
    </motion.div>
  );

  /* ============ RENDER: ACTIVITY FEED ============ */
  const renderActivityFeed = () => (
    <motion.div
      key="activity"
      variants={tabVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      transition={{ duration: 0.3 }}
    >
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-1">Activity Log</h2>
          <p className="text-sm text-[#888]">{filteredActivities.length} actions logged</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Log Activity Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowLogModal(true)}
            className="px-4 py-2 rounded-lg bg-[#5E6AD2] text-white text-sm font-medium hover:bg-[#4A55BF] transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Log Activity
          </motion.button>

          {/* Filter Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilterType(filterType ? null : 'agent-complete')}
            className="px-3 py-2 rounded-lg bg-[#161616] border border-[#262626] text-sm text-[#888] hover:text-white hover:border-[#333] transition-all flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </motion.button>
        </div>
      </div>

      {activitiesLoading ? (
        <div className="flex items-center justify-center py-12">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
            <Zap className="w-6 h-6 text-[#5E6AD2]" />
          </motion.div>
          <span className="ml-2 text-[#888]">Loading activity log...</span>
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-2">
          {filteredActivities.map((activity) => {
            const config = getActivityConfig(activity.type);
            const Icon = config.icon;
            const isExpanded = expandedActivity === activity.id;
            const isDeleting = deletingIds.has(activity.id);

            return (
              <motion.div
                key={activity.id}
                variants={item}
                onClick={() => !isDeleting && setExpandedActivity(isExpanded ? null : activity.id)}
                className="group cursor-pointer"
              >
                <motion.div
                  layout
                  className={`bg-[#161616] border border-[#262626] rounded-lg overflow-hidden hover:border-[#333] hover:bg-[#1A1A1A] transition-all ${isDeleting ? 'opacity-50' : ''}`}
                  whileHover={!isDeleting ? { x: 2 } : {}}
                >
                  {/* Main Row */}
                  <div className="p-4 flex items-start gap-3">
                    <motion.div className={`flex-shrink-0 p-2 rounded-md ${config.bg} border ${config.border}`} whileHover={!isDeleting ? { scale: 1.1 } : {}}>
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    </motion.div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-semibold ${config.color}`}>{config.label}</span>
                        <span className="text-xs text-[#666]">•</span>
                        <span className="text-xs text-[#666]">{formatTime(activity.timestamp)}</span>
                      </div>
                      <p className="text-sm text-[#888] line-clamp-1">{activity.description}</p>
                    </div>

                    <motion.div className="flex-shrink-0 flex items-center gap-2">
                      {/* Status Dropdown Button */}
                      <div className="relative group/dropdown">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setStatusDropdown(statusDropdown?.type === 'activity' && statusDropdown?.id === activity.id ? null : { type: 'activity', id: activity.id });
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-[#262626]"
                          disabled={isDeleting}
                        >
                          <MoreVertical className="w-4 h-4 text-[#666]" />
                        </motion.button>

                        {/* Dropdown Menu */}
                        <AnimatePresence>
                          {statusDropdown?.type === 'activity' && statusDropdown?.id === activity.id && (
                            <motion.div
                              initial={{ opacity: 0, y: -8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              className="absolute right-0 mt-1 w-40 bg-[#1A1A1A] border border-[#262626] rounded-lg shadow-lg z-50"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="p-2 space-y-1">
                                <button
                                  onClick={() => handleUpdateActivityStatus(activity.id, 'running')}
                                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                    activity.status === 'running'
                                      ? 'bg-[#5E6AD2]/20 text-[#5E6AD2]'
                                      : 'text-[#888] hover:bg-[#262626]'
                                  }`}
                                >
                                  Running
                                </button>
                                <button
                                  onClick={() => handleUpdateActivityStatus(activity.id, 'completed')}
                                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                    activity.status === 'completed'
                                      ? 'bg-[#5EAD5E]/20 text-[#5EAD5E]'
                                      : 'text-[#888] hover:bg-[#262626]'
                                  }`}
                                >
                                  Completed
                                </button>
                                <button
                                  onClick={() => handleUpdateActivityStatus(activity.id, 'failed')}
                                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                    activity.status === 'failed'
                                      ? 'bg-[#E55454]/20 text-[#E55454]'
                                      : 'text-[#888] hover:bg-[#262626]'
                                  }`}
                                >
                                  Failed
                                </button>
                                <div className="border-t border-[#262626]" />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteConfirm({ type: 'activity', id: activity.id });
                                  }}
                                  className="w-full text-left px-3 py-2 rounded text-sm text-[#E55454] hover:bg-[#E55454]/10 transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Expand Indicator */}
                      <motion.div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronRight className="w-5 h-5 text-[#666]" />
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-[#262626] bg-[#0F0F0F]/50 px-4 py-3"
                      >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          <div>
                            <p className="text-[#666] mb-1">Time</p>
                            <p className="text-white font-mono text-[11px]">{formatDateTime(activity.timestamp)}</p>
                          </div>
                          <div>
                            <p className="text-[#666] mb-1">Agent</p>
                            <p className="text-white">{activity.agent}</p>
                          </div>
                          <div>
                            <p className="text-[#666] mb-1">Duration</p>
                            <p className="text-white font-mono">{activity.metadata?.duration}ms</p>
                          </div>
                          <div>
                            <p className="text-[#666] mb-1">Status</p>
                            <span className={`inline-block px-2 py-1 rounded text-[10px] font-medium ${config.bg} ${config.color} border ${config.border}`}>
                              {activity.status}
                            </span>
                          </div>
                          {activity.metadata?.tokens_used && (
                            <div>
                              <p className="text-[#666] mb-1">Tokens</p>
                              <p className="text-white font-mono">{activity.metadata.tokens_used}</p>
                            </div>
                          )}
                          {activity.metadata?.memory_used && (
                            <div>
                              <p className="text-[#666] mb-1">Memory</p>
                              <p className="text-white font-mono">{activity.metadata.memory_used}MB</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );

  /* ============ RENDER: CALENDAR VIEW ============ */
  const renderCalendar = () => {
    const allTaskDays = getAllTaskDays();

    return (
      <motion.div
        key="calendar"
        variants={tabVariants}
        initial="hidden"
        animate="show"
        exit="exit"
        transition={{ duration: 0.3 }}
      >
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-1">Schedule (All Tasks)</h2>
            <p className="text-sm text-[#888]">{tasks.length} total tasks across all dates</p>
          </div>
          
          {/* Create Task Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTaskModal(true)}
            className="px-4 py-2 rounded-lg bg-[#5E6AD2] text-white text-sm font-medium hover:bg-[#4A55BF] transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Task
          </motion.button>
        </div>

        {tasksLoading ? (
          <div className="flex items-center justify-center py-12">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <Zap className="w-6 h-6 text-[#5E6AD2]" />
            </motion.div>
            <span className="ml-2 text-[#888]">Loading schedule...</span>
          </div>
        ) : tasks.length === 0 ? (
          <motion.div className="text-center py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-sm text-[#888]">No tasks scheduled yet</p>
          </motion.div>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {allTaskDays.map((date, idx) => {
              const dayTasks = getTasksForDay(date);
              const isToday =
                date.getDate() === new Date().getDate() &&
                date.getMonth() === new Date().getMonth() &&
                date.getFullYear() === new Date().getFullYear();

              return (
                <motion.div
                  key={idx}
                  variants={item}
                  className={`rounded-lg border ${isToday ? 'border-[#5E6AD2] bg-[#5E6AD2]/5' : 'border-[#262626] bg-[#161616]'} overflow-hidden hover:border-[#333] transition-all`}
                >
                  {/* Day Header */}
                  <div className={`p-3 border-b ${isToday ? 'border-[#5E6AD2]/30 bg-[#5E6AD2]/10' : 'border-[#262626]'}`}>
                    <p className="text-xs font-medium text-[#888] uppercase">
                      {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short' })}
                    </p>
                    <p className={`text-2xl font-semibold ${isToday ? 'text-[#5E6AD2]' : 'text-white'}`}>{date.getDate()}</p>
                  </div>

                  {/* Tasks */}
                  <div className="p-3 space-y-2 min-h-[120px]">
                    {dayTasks.length > 0 ? (
                      dayTasks.map((task) => {
                        const isDeleting = deletingIds.has(task.id);

                        return (
                          <motion.div
                            key={task.id}
                            className="group relative"
                            initial={{ opacity: 1 }}
                            animate={{ opacity: isDeleting ? 0.5 : 1 }}
                          >
                            <motion.button
                              onClick={() => !isDeleting && handleToggleTaskCompletion(task, date)}
                              className={`w-full text-left p-2 rounded text-xs font-medium transition-all border ${
                                task.status === 'completed'
                                  ? 'bg-[#5EAD5E]/10 text-[#5EAD5E] border-[#5EAD5E]/30'
                                  : 'bg-[#5E8FAD]/10 text-[#5E8FAD] border-[#5E8FAD]/30 hover:bg-[#5E8FAD]/15'
                              }`}
                              whileHover={!isDeleting ? { scale: 1.02 } : {}}
                              whileTap={!isDeleting ? { scale: 0.98 } : {}}
                              disabled={isDeleting}
                            >
                              <div className="flex items-center gap-1.5">
                                {task.status === 'completed' ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                                ) : (
                                  <div className="w-3.5 h-3.5 rounded-full border border-current flex-shrink-0" />
                                )}
                                <span className="line-clamp-1 flex-1">{task.title}</span>
                              </div>
                            </motion.button>

                            {/* Action Buttons */}
                            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <motion.button
                                onClick={() => handleEditTask(task)}
                                className="p-1 rounded hover:bg-[#5E6AD2]/20"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                disabled={isDeleting}
                                title="Edit task"
                              >
                                <svg className="w-3 h-3 text-[#5E6AD2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </motion.button>
                              <motion.button
                                onClick={() => setDeleteConfirm({ type: 'task', id: task.id })}
                                className="p-1 rounded hover:bg-[#E55454]/20"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                disabled={isDeleting}
                                title="Delete task"
                              >
                                <Trash2 className="w-3 h-3 text-[#E55454]" />
                              </motion.button>
                            </div>
                          </motion.div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-[#666] text-center py-4">No tasks</p>
                    )}
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
    <motion.div
      key="documentation"
      variants={tabVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      transition={{ duration: 0.3 }}
    >
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-1">Documentation</h2>
        <p className="text-sm text-[#888]">Browse workspace files and agent documentation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-280px)] min-h-[500px]">
        {/* File Tree Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="lg:col-span-1 bg-[#161616] border border-[#262626] rounded-lg overflow-hidden flex flex-col"
        >
          <div className="p-4 border-b border-[#262626]">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#5E6AD2]" />
                Workspace Files
              </h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={refreshFiles}
                className="p-1.5 rounded hover:bg-[#262626] text-[#666] hover:text-white transition-colors"
                title="Refresh files"
              >
                <RefreshCw className={`w-4 h-4 ${filesLoading ? 'animate-spin' : ''}`} />
              </motion.button>
            </div>
            <p className="text-xs text-[#666] mt-1">Auto-refreshes every 10 seconds</p>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {filesLoading ? (
              <div className="flex items-center justify-center py-8">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <Zap className="w-5 h-5 text-[#5E6AD2]" />
                </motion.div>
              </div>
            ) : (
              <FileTree 
                files={files} 
                selectedFile={selectedFile} 
                onSelectFile={selectFile} 
              />
            )}
          </div>

          {/* Agent Status */}
          <div className="p-4 border-t border-[#262626]">
            <AgentStatus compact />
          </div>
        </motion.div>

        {/* Markdown Viewer Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="lg:col-span-2 bg-[#161616] border border-[#262626] rounded-lg overflow-hidden p-4"
        >
          <MarkdownViewer
            content={fileContent}
            fileName={selectedFile?.name || ''}
            loading={contentLoading}
            onRefresh={() => selectedFile && selectFile(selectedFile)}
          />
        </motion.div>
      </div>
    </motion.div>
  );

  /* ============ RENDER: SEARCH ============ */
  const renderSearch = () => (
    <motion.div
      key="search"
      variants={tabVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      transition={{ duration: 0.3 }}
    >
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-4">Global Search</h2>

        <motion.div className="relative" whileHover={{ y: -2 }}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888]" />
          <input
            type="text"
            placeholder="Search activities, documents, tasks, memories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#161616] border border-[#262626] rounded-lg pl-12 pr-4 py-3 text-white placeholder:text-[#666] focus:outline-none focus:border-[#5E6AD2] focus:bg-[#1A1A1A] transition-all"
          />
        </motion.div>
      </div>

      {documentsLoading && (
        <div className="flex items-center justify-center py-12">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
            <Zap className="w-6 h-6 text-[#5E6AD2]" />
          </motion.div>
          <span className="ml-2 text-[#888]">Searching...</span>
        </div>
      )}

      {!searchQuery && !documentsLoading && (
        <motion.div className="text-center py-16" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block mb-4"
          >
            <Sparkles className="w-12 h-12 text-[#5E6AD2]/40" />
          </motion.div>
          <p className="text-sm text-[#888]">Search your workspace</p>
        </motion.div>
      )}

      {searchQuery && !documentsLoading && documents.length === 0 && (
        <motion.div className="text-center py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-sm text-[#888]">
            No results found for <span className="text-white font-medium">"{searchQuery}"</span>
          </p>
        </motion.div>
      )}

      {documents.length > 0 && (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
          {documents.map((doc) => (
            <motion.div
              key={doc.id}
              variants={item}
              className="bg-[#161616] border border-[#262626] rounded-lg p-4 hover:border-[#333] hover:bg-[#1A1A1A] transition-all group"
              whileHover={{ x: 2 }}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-white group-hover:text-[#5E6AD2] transition-colors">{doc.title}</h3>
                  {doc.category && (
                    <span className="inline-block mt-1 px-2 py-1 rounded-sm bg-[#5E6AD2]/15 text-[#5E6AD2] text-xs font-medium">
                      {doc.category}
                    </span>
                  )}
                </div>
                <motion.div
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  whileHover={{ x: 4 }}
                >
                  <ArrowUpRight className="w-5 h-5 text-[#5E6AD2]" />
                </motion.div>
              </div>

              <p className="text-sm text-[#888] line-clamp-2 mb-2">{doc.content.substring(0, 150)}...</p>

              {doc.tags && doc.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {doc.tags.slice(0, 3).map((tag, idx) => (
                    <motion.span
                      key={idx}
                      className="px-2 py-1 rounded-sm bg-white/5 border border-white/10 text-[#888] text-xs hover:text-[#5E6AD2] hover:border-[#5E6AD2] transition-colors"
                      whileHover={{ scale: 1.05 }}
                    >
                      {tag}
                    </motion.span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );

  /* ============ RENDER: PROACTIVE INTELLIGENCE DASHBOARD ============ */
  const renderProactiveDashboard = () => (
    <motion.div
      key="proactive"
      variants={tabVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      transition={{ duration: 0.3 }}
    >
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-1">Proactive Intelligence</h2>
          <p className="text-sm text-[#888]">
            {stats?.patterns_detected || 0} patterns detected • {stats?.opportunities_found || 0} opportunities found
          </p>
        </div>

        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={triggerAnalysis}
            disabled={refreshing}
            className="px-4 py-2 rounded-lg bg-[#5E6AD2]/20 border border-[#5E6AD2]/30 text-[#5E6AD2] text-sm font-medium hover:bg-[#5E6AD2]/30 transition-all flex items-center gap-2"
          >
            <Eye className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Analyze
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={triggerScan}
            disabled={refreshing}
            className="px-4 py-2 rounded-lg bg-[#10B981]/20 border border-[#10B981]/30 text-[#10B981] text-sm font-medium hover:bg-[#10B981]/30 transition-all flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Scan Opportunities
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={refreshProactive}
            disabled={refreshing}
            className="p-2 rounded-lg bg-[#161616] border border-[#262626] text-[#888] hover:text-white hover:border-[#333] transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
      </div>

      {proactiveLoading ? (
        <div className="flex items-center justify-center py-12">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
            <Zap className="w-6 h-6 text-[#5E6AD2]" />
          </motion.div>
          <span className="ml-2 text-[#888]">Loading intelligence...</span>
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div variants={item} className="bg-[#161616] border border-[#262626] rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-md bg-[#5E6AD2]/10 border border-[#5E6AD2]/30">
                  <Zap className="w-4 h-4 text-[#5E6AD2]" />
                </div>
                <span className="text-xs text-[#888]">Actions Today</span>
              </div>
              <p className="text-2xl font-semibold text-white">{stats?.total_actions_today || 0}</p>
              <p className="text-xs text-[#5EAD5E]">{stats?.completed_actions_today || 0} completed</p>
            </motion.div>

            <motion.div variants={item} className="bg-[#161616] border border-[#262626] rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-md bg-[#10B981]/10 border border-[#10B981]/30">
                  <Lightbulb className="w-4 h-4 text-[#10B981]" />
                </div>
                <span className="text-xs text-[#888]">Opportunities</span>
              </div>
              <p className="text-2xl font-semibold text-white">{stats?.opportunities_found || 0}</p>
              <p className="text-xs text-[#888]">{stats?.opportunities_implemented || 0} implemented</p>
            </motion.div>

            <motion.div variants={item} className="bg-[#161616] border border-[#262626] rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-md bg-[#8B5CF6]/10 border border-[#8B5CF6]/30">
                  <TrendingUp className="w-4 h-4 text-[#8B5CF6]" />
                </div>
                <span className="text-xs text-[#888]">Patterns</span>
              </div>
              <p className="text-2xl font-semibold text-white">{stats?.patterns_detected || 0}</p>
              <p className="text-xs text-[#888]">detected</p>
            </motion.div>

            <motion.div variants={item} className="bg-[#161616] border border-[#262626] rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-md bg-[#F59E0B]/10 border border-[#F59E0B]/30">
                  <Target className="w-4 h-4 text-[#F59E0B]" />
                </div>
                <span className="text-xs text-[#888]">Avg Confidence</span>
              </div>
              <p className="text-2xl font-semibold text-white">{Math.round((stats?.avg_confidence_score || 0) * 100)}%</p>
              <p className="text-xs text-[#888]">pattern accuracy</p>
            </motion.div>
          </div>

          {/* Smart Suggestions */}
          {suggestions.length > 0 && (
            <motion.div variants={item} className="bg-gradient-to-r from-[#5E6AD2]/10 to-[#8B5CF6]/10 border border-[#5E6AD2]/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-[#8B5CF6]" />
                <h3 className="text-lg font-semibold text-white">Smart Suggestions</h3>
              </div>
              <div className="space-y-3">
                {suggestions.map((suggestion, idx) => (
                  <motion.div
                    key={idx}
                    variants={item}
                    className="bg-[#161616]/50 border border-[#262626] rounded-lg p-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{suggestion.reasoning}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-xs text-[#666]">Confidence: {Math.round(suggestion.confidence * 100)}%</span>
                          <span className="text-xs text-[#666]">•</span>
                          <span className="text-xs text-[#666] capitalize">{suggestion.decision.replace(/_/g, ' ')}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {}}
                        className="px-3 py-1 rounded bg-[#5E6AD2]/20 text-[#5E6AD2] text-xs font-medium hover:bg-[#5E6AD2]/30 transition-colors"
                      >
                        Take Action
                      </button>
                    </div>
                    {suggestion.suggested_actions && suggestion.suggested_actions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {suggestion.suggested_actions.slice(0, 3).map((action: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-[#262626] text-[#888] text-xs">
                            {action}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Predictions */}
          {predictions.length > 0 && (
            <motion.div variants={item}>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
                Upcoming Predictions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {predictions.map((prediction, idx) => (
                  <motion.div
                    key={idx}
                    variants={item}
                    className="bg-[#161616] border border-[#262626] rounded-lg p-4 hover:border-[#333] transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        prediction.likelihood > 0.7 
                          ? 'bg-[#EF4444]/20 text-[#EF4444]' 
                          : 'bg-[#F59E0B]/20 text-[#F59E0B]'
                      }`}>
                        {Math.round(prediction.likelihood * 100)}% likely
                      </span>
                      <span className="text-xs text-[#666]">{prediction.timeframe}</span>
                    </div>
                    <p className="text-sm text-white mb-2">{prediction.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {prediction.action_items.slice(0, 2).map((item: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-[#262626] text-[#888] text-xs">
                          {item}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Opportunities */}
          {opportunities.length > 0 && (
            <motion.div variants={item}>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#10B981]" />
                Opportunities
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {opportunities.slice(0, 6).map((opp: any, idx: number) => (
                  <motion.div
                    key={idx}
                    variants={item}
                    className="bg-[#161616] border border-[#262626] rounded-lg p-4 hover:border-[#333] transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {opp.type === 'monetization' && <DollarSign className="w-4 h-4 text-[#10B981]" />}
                        {opp.type === 'automation' && <Cog className="w-4 h-4 text-[#5E6AD2]" />}
                        {opp.type === 'learning' && <GraduationCap className="w-4 h-4 text-[#8B5CF6]" />}
                        {opp.type === 'collaboration' && <Users className="w-4 h-4 text-[#F59E0B]" />}
                        <span className="text-xs font-medium text-[#888] uppercase">{opp.type}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        opp.potential_value === 'transformative' ? 'bg-[#10B981]/20 text-[#10B981]' :
                        opp.potential_value === 'high' ? 'bg-[#5EAD5E]/20 text-[#5EAD5E]' :
                        'bg-[#888]/20 text-[#888]'
                      }`}>
                        {opp.potential_value}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-white mb-1">{opp.title}</h4>
                    <p className="text-xs text-[#888] mb-3 line-clamp-2">{opp.description}</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateOpportunityStatus(opp.id, 'validated')}
                        className="flex-1 px-3 py-1.5 rounded bg-[#5E6AD2]/20 text-[#5E6AD2] text-xs font-medium hover:bg-[#5E6AD2]/30 transition-colors"
                      >
                        Validate
                      </button>
                      <button
                        onClick={() => updateOpportunityStatus(opp.id, 'dismissed')}
                        className="px-3 py-1.5 rounded bg-[#262626] text-[#888] text-xs hover:text-[#E55454] hover:bg-[#E55454]/10 transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Patterns */}
          {patterns.length > 0 && (
            <motion.div variants={item}>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Workflow className="w-5 h-5 text-[#8B5CF6]" />
                Detected Patterns
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {patterns.slice(0, 6).map((pattern: any, idx: number) => (
                  <motion.div
                    key={idx}
                    variants={item}
                    className="bg-[#161616] border border-[#262626] rounded-lg p-4 hover:border-[#333] transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        pattern.category === 'time' ? 'bg-[#06B6D4]/20 text-[#06B6D4]' :
                        pattern.category === 'workflow' ? 'bg-[#5E6AD2]/20 text-[#5E6AD2]' :
                        pattern.category === 'attention' ? 'bg-[#F59E0B]/20 text-[#F59E0B]' :
                        'bg-[#8B5CF6]/20 text-[#8B5CF6]'
                      }`}>
                        {pattern.category}
                      </span>
                      <span className="text-xs text-[#666]">
                        {Math.round(pattern.confidence * 100)}% confidence
                      </span>
                    </div>
                    <p className="text-sm text-white mb-2">
                      {pattern.suggested_action || 'Pattern detected'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[#666]">
                      <span>Seen {pattern.occurrence_count || 1} times</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Recent Actions */}
          {actions.length > 0 && (
            <motion.div variants={item}>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#5E8FAD]" />
                Recent Autonomous Actions
              </h3>
              <div className="bg-[#161616] border border-[#262626] rounded-lg overflow-hidden">
                {actions.slice(0, 5).map((action: any, idx: number) => (
                  <motion.div
                    key={idx}
                    variants={item}
                    className={`p-3 flex items-center justify-between border-b border-[#262626] last:border-0 ${
                      action.status === 'completed' ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        action.status === 'completed' ? 'bg-[#5EAD5E]' :
                        action.status === 'pending' ? 'bg-[#F59E0B]' :
                        action.status === 'failed' ? 'bg-[#E55454]' :
                        'bg-[#5E6AD2]'
                      }`} />
                      <div>
                        <p className="text-sm text-white">{action.description}</p>
                        <p className="text-xs text-[#666]">{action.type} • {action.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {action.status === 'pending' && (
                        <>
                          <button
                            onClick={() => completeAction(action.id)}
                            className="px-2 py-1 rounded bg-[#5EAD5E]/20 text-[#5EAD5E] text-xs hover:bg-[#5EAD5E]/30 transition-colors"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => dismissAction(action.id)}
                            className="px-2 py-1 rounded bg-[#262626] text-[#888] text-xs hover:text-[#E55454] hover:bg-[#E55454]/10 transition-colors"
                          >
                            Dismiss
                          </button>
                        </>
                      )}
                      <span className="text-xs text-[#666]">
                        {new Date(action.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {suggestions.length === 0 && predictions.length === 0 && opportunities.length === 0 && patterns.length === 0 && (
            <motion.div variants={item} className="text-center py-12">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block mb-4"
              >
                <Brain className="w-12 h-12 text-[#5E6AD2]/40" />
              </motion.div>
              <p className="text-sm text-[#888] mb-2">No intelligence gathered yet</p>
              <p className="text-xs text-[#666]">Click "Analyze" to detect patterns and find opportunities</p>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );

  /* ============ RENDER: DELETE CONFIRMATION DIALOG ============ */
  const renderDeleteConfirm = () => (
    <AnimatePresence>
      {deleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setDeleteConfirm(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-[#161616] border border-[#262626] rounded-lg shadow-lg max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Delete {deleteConfirm.type === 'activity' ? 'Activity' : 'Task'}?</h3>
              <p className="text-sm text-[#888] mb-6">
                This action cannot be undone. The {deleteConfirm.type === 'activity' ? 'activity' : 'task'} will be permanently deleted.
              </p>

              <div className="flex gap-3 justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 rounded-lg bg-[#262626] text-white text-sm font-medium hover:bg-[#333] transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (deleteConfirm.type === 'activity') {
                      handleDeleteActivity(deleteConfirm.id);
                    } else {
                      handleDeleteTask(deleteConfirm.id);
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-[#E55454] text-white text-sm font-medium hover:bg-[#D43636] transition-all"
                >
                  Delete
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  /* ============ RENDER: TASK CREATION MODAL ============ */
  const renderTaskModal = () => (
    <AnimatePresence>
      {showTaskModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowTaskModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-[#161616] border border-[#262626] rounded-lg shadow-lg max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">{editingTaskId ? 'Edit Task' : 'Create New Task'}</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setShowTaskModal(false);
                    setEditingTaskId(null);
                    setNewTaskForm({ title: '', scheduled_for: '', day: '', type: 'one-time' });
                  }}
                  className="p-1 hover:bg-[#262626] rounded transition-colors"
                >
                  <X className="w-5 h-5 text-[#888]" />
                </motion.button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-sm text-[#888] mb-2">Task Title</label>
                  <input
                    type="text"
                    placeholder="Enter task title..."
                    value={newTaskForm.title}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                    className="w-full bg-[#0F0F0F] border border-[#262626] rounded-lg px-3 py-2 text-white placeholder:text-[#666] focus:outline-none focus:border-[#5E6AD2] focus:bg-[#1A1A1A] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#888] mb-2">Scheduled Date</label>
                  <input
                    type="datetime-local"
                    value={newTaskForm.scheduled_for.slice(0, 16) || ''}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, scheduled_for: new Date(e.target.value).toISOString() })}
                    className="w-full bg-[#0F0F0F] border border-[#262626] rounded-lg px-3 py-2 text-white placeholder:text-[#666] focus:outline-none focus:border-[#5E6AD2] focus:bg-[#1A1A1A] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#888] mb-2">Day of Week</label>
                  <select
                    value={newTaskForm.day}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, day: e.target.value })}
                    className="w-full bg-[#0F0F0F] border border-[#262626] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#5E6AD2] focus:bg-[#1A1A1A] transition-all"
                  >
                    <option value="">Auto-detect</option>
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-[#888] mb-2">Task Type</label>
                  <select
                    value={newTaskForm.type}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, type: e.target.value as 'daily' | 'one-time' })}
                    className="w-full bg-[#0F0F0F] border border-[#262626] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#5E6AD2] focus:bg-[#1A1A1A] transition-all"
                  >
                    <option value="one-time">One-time Task</option>
                    <option value="daily">Daily Recurring</option>
                  </select>
                  <p className="text-xs text-[#666] mt-1">
                    {newTaskForm.type === 'daily' ? 'Will appear every day in the calendar' : 'Will appear only on scheduled date'}
                  </p>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowTaskModal(false)}
                    className="px-4 py-2 rounded-lg bg-[#262626] text-white text-sm font-medium hover:bg-[#333] transition-all"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-lg bg-[#5E6AD2] text-white text-sm font-medium hover:bg-[#4A55BF] transition-all flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editingTaskId ? 'Update Task' : 'Create Task'}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  /* ============ RENDER: LOG ACTIVITY MODAL ============ */
  const renderLogModal = () => (
    <AnimatePresence>
      {showLogModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowLogModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-[#161616] border border-[#262626] rounded-lg shadow-lg max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Log Activity</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowLogModal(false)}
                  className="p-1 hover:bg-[#262626] rounded transition-colors"
                >
                  <X className="w-5 h-5 text-[#888]" />
                </motion.button>
              </div>

              <form onSubmit={handleLogActivity} className="space-y-4">
                <div>
                  <label className="block text-sm text-[#888] mb-2">Agent</label>
                  <input
                    type="text"
                    placeholder="Agent name..."
                    value={logForm.agent}
                    onChange={(e) => setLogForm({ ...logForm, agent: e.target.value })}
                    className="w-full bg-[#0F0F0F] border border-[#262626] rounded-lg px-3 py-2 text-white placeholder:text-[#666] focus:outline-none focus:border-[#5E6AD2] focus:bg-[#1A1A1A] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#888] mb-2">Activity Type</label>
                  <select
                    value={logForm.action}
                    onChange={(e) => setLogForm({ ...logForm, action: e.target.value })}
                    className="w-full bg-[#0F0F0F] border border-[#262626] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#5E6AD2] focus:bg-[#1A1A1A] transition-all"
                  >
                    <optgroup label="Core Activity Types">
                      <option value="build">🔨 Build - Building features/projects</option>
                      <option value="research">🔬 Research - Research tasks</option>
                      <option value="sync">🔄 Sync - Data synchronization</option>
                      <option value="fix">🔧 Fix - Bug fixes</option>
                      <option value="deploy">🚀 Deploy - Deployments</option>
                      <option value="test">🧪 Test - Testing</option>
                    </optgroup>
                    <optgroup label="Legacy Activity Types">
                      <option value="agent-start">Agent Started</option>
                      <option value="agent-complete">Task Completed</option>
                      <option value="file-create">File Created</option>
                      <option value="file-update">File Updated</option>
                      <option value="api-call">API Request</option>
                      <option value="db-query">Database Query</option>
                      <option value="git-commit">Git Commit</option>
                      <option value="git-push">Git Push</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-[#888] mb-2">Description</label>
                  <textarea
                    placeholder="Describe the activity..."
                    value={logForm.description}
                    onChange={(e) => setLogForm({ ...logForm, description: e.target.value })}
                    rows={3}
                    className="w-full bg-[#0F0F0F] border border-[#262626] rounded-lg px-3 py-2 text-white placeholder:text-[#666] focus:outline-none focus:border-[#5E6AD2] focus:bg-[#1A1A1A] transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#888] mb-2">Status</label>
                  <select
                    value={logForm.status}
                    onChange={(e) => setLogForm({ ...logForm, status: e.target.value as any })}
                    className="w-full bg-[#0F0F0F] border border-[#262626] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#5E6AD2] focus:bg-[#1A1A1A] transition-all"
                  >
                    <option value="completed">✅ Completed</option>
                    <option value="running">⏳ Running</option>
                    <option value="pending">📋 Pending</option>
                    <option value="failed">❌ Failed</option>
                  </select>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowLogModal(false)}
                    className="px-4 py-2 rounded-lg bg-[#262626] text-white text-sm font-medium hover:bg-[#333] transition-all"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={logging || !logForm.description.trim()}
                    className="px-4 py-2 rounded-lg bg-[#5E6AD2] text-white text-sm font-medium hover:bg-[#4A55BF] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {logging ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </motion.div>
                        Logging...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Log Activity
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  /* ============ MAIN RENDER ============ */
  return (
    <>
      {renderDeleteConfirm()}
      {renderTaskModal()}
      {renderLogModal()}
      <div className="min-h-screen bg-[#0F0F0F]">
        {renderHeader()}

        <div className="max-w-7xl mx-auto px-6 py-8">
          {renderTabs()}

          <AnimatePresence mode="wait">
            {activeTab === 'activity' && renderActivityFeed()}
            {activeTab === 'calendar' && renderCalendar()}
            {activeTab === 'proactive' && renderProactiveDashboard()}
            {activeTab === 'documentation' && renderDocumentation()}
            {activeTab === 'search' && renderSearch()}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
