'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';
import { useActivities, useTasks, useDocuments } from '@/hooks/useSupabase';

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
  const [activeTab, setActiveTab] = useState<'activity' | 'calendar' | 'search'>('activity');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedActivity, setExpandedActivity] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'activity' | 'task'; id: number } | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState({ title: '', scheduled_for: '', day: '' });
  const [statusDropdown, setStatusDropdown] = useState<{ type: 'activity' | 'task'; id: number } | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

  const { activities, loading: activitiesLoading, deleteActivity, updateActivity } = useActivities();
  const { tasks, loading: tasksLoading, updateStatus, createTask, deleteTask } = useTasks();
  const { documents, loading: documentsLoading } = useDocuments(searchQuery);

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

    await createTask({
      title: newTaskForm.title,
      scheduled_for,
      day: newTaskForm.day || now.toLocaleDateString('en-US', { weekday: 'long' }),
      status: 'pending',
    });

    setNewTaskForm({ title: '', scheduled_for: '', day: '' });
    setShowTaskModal(false);
  };

  const handleUpdateActivityStatus = async (id: number, status: string) => {
    await updateActivity(id, { status: status as any });
    setStatusDropdown(null);
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
    today.setDate(today.getDate() - today.getDay());

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const getAllTaskDays = () => {
    const daysMap = new Map<string, Date>();
    
    // Add all tasks' dates to the map
    tasks.forEach((task) => {
      const taskDate = new Date(task.scheduled_for);
      const dateKey = taskDate.toISOString().split('T')[0];
      if (!daysMap.has(dateKey)) {
        daysMap.set(dateKey, taskDate);
      }
    });

    // Also include current week
    const weekDays = getWeekDays();
    weekDays.forEach((date) => {
      const dateKey = date.toISOString().split('T')[0];
      if (!daysMap.has(dateKey)) {
        daysMap.set(dateKey, date);
      }
    });

    return Array.from(daysMap.values()).sort((a, b) => a.getTime() - b.getTime());
  };

  const getTasksForDay = (date: Date) => {
    return tasks.filter((task) => {
      const taskDate = new Date(task.scheduled_for);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getAllTasks = () => {
    return tasks.sort((a, b) => {
      return new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime();
    });
  };

  const tabs = [
    { id: 'activity', label: 'Activity Log', icon: Activity, badge: activities.length },
    { id: 'calendar', label: 'Schedule', icon: Calendar, badge: tasks.length },
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
                              onClick={() => !isDeleting && updateStatus(task.id, task.status === 'completed' ? 'pending' : 'completed')}
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

                            {/* Delete Button */}
                            <motion.button
                              onClick={() => setDeleteConfirm({ type: 'task', id: task.id })}
                              className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-[#E55454]/20"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              disabled={isDeleting}
                            >
                              <Trash2 className="w-3 h-3 text-[#E55454]" />
                            </motion.button>
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
                <h3 className="text-lg font-semibold text-white">Create New Task</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowTaskModal(false)}
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
                    Create Task
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
      <div className="min-h-screen bg-[#0F0F0F]">
        {renderHeader()}

        <div className="max-w-7xl mx-auto px-6 py-8">
          {renderTabs()}

          <AnimatePresence mode="wait">
            {activeTab === 'activity' && renderActivityFeed()}
            {activeTab === 'calendar' && renderCalendar()}
            {activeTab === 'search' && renderSearch()}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
