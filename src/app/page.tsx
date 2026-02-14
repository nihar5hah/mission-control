'use client';

import { useState, useEffect } from 'react';
import { Zap, Activity, Calendar, Search, CheckCircle, XCircle, Clock, Play, Pause, Settings, FileText, Brain, ListTodo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActivitiesList } from '@/components/ActivitiesList';
import { TasksList } from '@/components/TasksList';
import { SearchPanel } from '@/components/SearchPanel';

export const dynamic = 'force-dynamic';

// Types
interface CronJob {
  id: string;
  name: string;
  enabled: boolean;
  schedule: { expr: string; tz: string };
  state: {
    nextRunAtMs: number;
    lastRunAtMs?: number;
    lastStatus?: string;
    lastDurationMs?: number;
  };
}

interface Activity {
  id: string;
  type: 'cron' | 'session' | 'task' | 'memory';
  title: string;
  description: string;
  status: 'running' | 'completed' | 'failed' | 'pending';
  timestamp: number;
  duration?: number;
}

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
}

interface SearchResult {
  type: 'memory' | 'document' | 'cron' | 'task';
  id: string;
  title: string;
  content: string;
  date?: string;
}

// Real data from OpenClaw
const cronJobs: CronJob[] = [
  {
    id: '0f9a832d',
    name: 'morning-brief',
    enabled: true,
    schedule: { expr: '30 3 * * *', tz: 'Asia/Kolkata' },
    state: { nextRunAtMs: 1771106400000, lastRunAtMs: 1771068000000, lastStatus: 'ok', lastDurationMs: 45000 }
  },
  {
    id: '3b9fd363',
    name: 'daily-research-report',
    enabled: true,
    schedule: { expr: '0 14 * * *', tz: 'Asia/Kolkata' },
    state: { nextRunAtMs: 1771144200000, lastRunAtMs: 1771068085108, lastStatus: 'ok', lastDurationMs: 33253 }
  },
  {
    id: 'e4a1a3a4',
    name: 'build-eval-system',
    enabled: true,
    schedule: { expr: '30 20 * * *', tz: 'UTC' },
    state: { nextRunAtMs: 1771187400000, lastRunAtMs: 1771102995130, lastStatus: 'ok', lastDurationMs: 66910 }
  },
  {
    id: 'd23d1993',
    name: 'night-shift',
    enabled: true,
    schedule: { expr: '0 2 * * *', tz: 'Asia/Kolkata' },
    state: { nextRunAtMs: 1771187400000, lastRunAtMs: 1771101238187, lastStatus: 'ok', lastDurationMs: 602876 }
  }
];

const activities: Activity[] = [
  {
    id: '1',
    type: 'cron',
    title: 'Night Shift Completed',
    description: 'Built & deployed Mission Control dashboard to Vercel',
    status: 'completed',
    timestamp: Date.now() - 30 * 60000,
    duration: 602876
  },
  {
    id: '2',
    type: 'cron',
    title: 'Morning Brief',
    description: 'Weather, tasks, emails, trending news compiled',
    status: 'completed',
    timestamp: Date.now() - 8 * 3600000,
    duration: 45000
  },
  {
    id: '3',
    type: 'session',
    title: 'GitHub Integration',
    description: 'Repository created: nihar5hah/mission-control',
    status: 'completed',
    timestamp: Date.now() - 45 * 60000,
  },
  {
    id: '4',
    type: 'task',
    title: 'Deploy to Vercel',
    description: 'Mission Control dashboard live',
    status: 'completed',
    timestamp: Date.now() - 2 * 3600000,
  },
  {
    id: '5',
    type: 'cron',
    title: 'Daily Research Report',
    description: 'AI/LLM research: Agent evaluation systems',
    status: 'completed',
    timestamp: Date.now() - 10 * 3600000,
    duration: 33253
  },
  {
    id: '6',
    type: 'memory',
    title: 'Memory Snapshot',
    description: 'Daily context saved to memory/2026-02-14.md',
    status: 'completed',
    timestamp: Date.now() - 15 * 3600000,
  },
  {
    id: '7',
    type: 'cron',
    title: 'Build Eval System',
    description: 'eval_framework.py created with test cases',
    status: 'running',
    timestamp: Date.now() - 5 * 60000,
  }
];

const tasks: Task[] = [
  { id: '1', title: 'Update Vercel auth settings', status: 'in_progress', priority: 'high' },
  { id: '2', title: 'Add more cron jobs', status: 'pending', priority: 'medium' },
  { id: '3', title: 'Connect real-time data', status: 'pending', priority: 'high' },
  { id: '4', title: 'Add session monitoring', status: 'pending', priority: 'medium' },
  { id: '5', title: 'Configure email notifications', status: 'pending', priority: 'low' },
];

const memoryFiles = [
  { title: '2026-02-14', content: 'Built & deployed Mission Control dashboard, Updated kilo models to :free tier, Opencode CLI verified' },
  { title: '2026-02-13', content: 'Research on agent evaluation frameworks, Created research-automation repo' },
];

const searchData: SearchResult[] = [
  { type: 'memory', id: 'm1', title: '2026-02-14', content: 'Built & deployed Mission Control dashboard to Vercel. Updated kilo models to :free tier (minimax-m2.5:free, glm-5:free). Opencode CLI verified working (v1.1.59). Mission Control URL...', date: '2026-02-14' },
  { type: 'cron', id: 'c1', title: 'night-shift', content: 'Night shift build - Created nihar5hah/mission-control repo, Built Real-time Agent Dashboard with Next.js, Convex, shadcn/ui', date: '2026-02-14' },
  { type: 'task', id: 't1', title: 'Deploy Mission Control', content: 'Build and deploy Mission Control dashboard', date: '2026-02-14' },
  { type: 'document', id: 'd1', title: 'AGENTS.md', content: 'Workspace configuration for AI agents. Defines agent capabilities, tools, and behaviors.', date: '2026-02-14' },
  { type: 'memory', id: 'm2', title: '2026-02-13', content: 'Research on agent evaluation frameworks. Created research-automation repo. Supabase setup completed.', date: '2026-02-13' },
  { type: 'cron', id: 'c2', title: 'morning-brief', content: 'Morning brief for Begu - Weather, tasks, emails, trending YouTube videos, productivity recommendations', date: '2026-02-14' },
];

// Components
function ActivityPanel() {
  return <ActivitiesList />;
}

function CronJobsPanel() {
  const cronJobs = [
    {
      id: '0f9a832d',
      name: 'morning-brief',
      enabled: true,
      schedule: { expr: '30 3 * * *', tz: 'Asia/Kolkata' },
      state: { nextRunAtMs: 1771106400000, lastRunAtMs: 1771068000000, lastStatus: 'ok', lastDurationMs: 45000 }
    },
    {
      id: '3b9fd363',
      name: 'daily-research-report',
      enabled: true,
      schedule: { expr: '0 14 * * *', tz: 'Asia/Kolkata' },
      state: { nextRunAtMs: 1771144200000, lastRunAtMs: 1771068085108, lastStatus: 'ok', lastDurationMs: 33253 }
    },
    {
      id: 'e4a1a3a4',
      name: 'build-eval-system',
      enabled: true,
      schedule: { expr: '30 20 * * *', tz: 'UTC' },
      state: { nextRunAtMs: 1771187400000, lastRunAtMs: 1771102995130, lastStatus: 'ok', lastDurationMs: 66910 }
    },
    {
      id: 'd23d1993',
      name: 'night-shift',
      enabled: true,
      schedule: { expr: '0 2 * * *', tz: 'Asia/Kolkata' },
      state: { nextRunAtMs: 1771187400000, lastRunAtMs: 1771101238187, lastStatus: 'ok', lastDurationMs: 602876 }
    }
  ];

  const formatSchedule = (expr: string) => {
    const [min, hour, , ,] = expr.split(' ');
    return `${hour}:${min}`;
  };

  const formatNextRun = (ts: number) => {
    const date = new Date(ts);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    if (diff < 0) return 'Overdue';
    if (diff < 3600000) return `${Math.round(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.round(diff / 3600000)}h`;
    return date.toLocaleDateString();
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '-';
    if (ms > 60000) return `${Math.round(ms / 60000)}m`;
    return `${Math.round(ms / 1000)}s`;
  };

  return (
    <div className="space-y-3">
      {cronJobs.map(job => (
        <div
          key={job.id}
          className="flex items-center justify-between p-3 rounded-md bg-[#141414] border border-[#2A2A2A]"
        >
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${job.state.lastStatus === 'ok' ? 'bg-[#5EAD5E]' : 'bg-[#E55454]'}`} />
            <div>
              <p className="font-medium text-sm text-white">{job.name}</p>
              <p className="text-xs text-[#8A8A8A]">{formatSchedule(job.schedule.expr)} ({job.schedule.tz})</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#8A8A8A]">Next: {formatNextRun(job.state.nextRunAtMs)}</p>
            <p className="text-xs text-[#5E6AD2]">Last: {formatDuration(job.state.lastDurationMs)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function TasksPanel() {
  return <TasksList />;
}

function SearchPanelWrapper() {
  return <SearchPanel />;
}

function Sidebar() {
  return (
    <div className="w-64 bg-[#0D0D0D] border-r border-[#2A2A2A] p-4 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#5E6AD2]" />
          Mission Control
        </h2>
        <p className="text-xs text-[#8A8A8A] mt-1">Begu's AI Agent Operations</p>
      </div>

      <nav className="space-y-1">
        <div className="px-3 py-1.5 text-xs font-medium text-[#8A8A8A] uppercase">Overview</div>
        <div className="px-3 py-2 rounded-md bg-[#141414] text-white text-sm">Dashboard</div>
      </nav>

      <div>
        <div className="px-3 py-1.5 text-xs font-medium text-[#8A8A8A] uppercase mb-2">Quick Stats</div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#8A8A8A]">Active Jobs</span>
            <span className="text-[#5EAD5E]">4</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#8A8A8A]">Sessions Today</span>
            <span className="text-white">3</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#8A8A8A]">Tasks Pending</span>
            <span className="text-[#D4A853]">5</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('activity');

  return (
    <div className="flex min-h-screen bg-[#0D0D0D]">
      <Sidebar />
      
      <div className="flex-1">
        {/* Header */}
        <header className="border-b border-[#2A2A2A] bg-[#0D0D0D] px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-white">Dashboard</h1>
              <p className="text-xs text-[#8A8A8A]">Real-time agent activity monitoring</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#5EAD5E] animate-pulse" />
              <span className="text-sm text-[#8A8A8A]">Live</span>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="border-b border-[#2A2A2A] px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-transparent border-b-0 h-auto p-0">
              <TabsTrigger 
                value="activity" 
                className="px-4 py-3 text-sm text-[#8A8A8A] data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-[#5E6AD2] rounded-none bg-transparent"
              >
                Activity
              </TabsTrigger>
              <TabsTrigger 
                value="schedule" 
                className="px-4 py-3 text-sm text-[#8A8A8A] data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-[#5E6AD2] rounded-none bg-transparent"
              >
                Schedule
              </TabsTrigger>
              <TabsTrigger 
                value="tasks" 
                className="px-4 py-3 text-sm text-[#8A8A8A] data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-[#5E6AD2] rounded-none bg-transparent"
              >
                Tasks
              </TabsTrigger>
              <TabsTrigger 
                value="search" 
                className="px-4 py-3 text-sm text-[#8A8A8A] data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-[#5E6AD2] rounded-none bg-transparent"
              >
                Search
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content */}
        <main className="p-6">
          {activeTab === 'activity' && <ActivityPanel />}
          {activeTab === 'schedule' && <CronJobsPanel />}
          {activeTab === 'tasks' && <TasksPanel />}
          {activeTab === 'search' && <SearchPanelWrapper />}
        </main>
      </div>
    </div>
  );
}
