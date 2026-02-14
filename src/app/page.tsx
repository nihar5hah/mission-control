'use client';

import { useState, useEffect } from 'react';
import {
  Activity,
  Calendar,
  Search as SearchIcon,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader,
} from 'lucide-react';
import ActivityFeed from '@/components/ActivityFeed';
import CalendarView from '@/components/CalendarView';
import SearchPanel from '@/components/SearchPanel';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'activity' | 'calendar' | 'search'>('activity');
  const [stats, setStats] = useState({
    totalActivities: 0,
    activeNow: 0,
    completedToday: 0,
  });

  // Simulate loading stats
  useEffect(() => {
    // In a real app, fetch from Convex
    setStats({
      totalActivities: 247,
      activeNow: 3,
      completedToday: 12,
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg blur opacity-50"></div>
                <div className="relative bg-slate-900 rounded-lg p-2">
                  <Zap className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                  Mission Control
                </h1>
                <p className="text-xs text-slate-400">AI Agent Operations Center</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg glass">
              <div className="w-2 h-2 bg-emerald-400 rounded-full pulse-live"></div>
              <span className="text-sm text-emerald-400 font-medium">System Online</span>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass rounded-lg p-4 flex items-center gap-3">
              <Activity className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="text-xs text-slate-400">Total Activities</p>
                <p className="text-lg font-bold text-cyan-400">{stats.totalActivities}</p>
              </div>
            </div>
            <div className="glass rounded-lg p-4 flex items-center gap-3">
              <Loader className="w-5 h-5 text-amber-400 animate-spin" />
              <div>
                <p className="text-xs text-slate-400">Active Now</p>
                <p className="text-lg font-bold text-amber-400">{stats.activeNow}</p>
              </div>
            </div>
            <div className="glass rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-xs text-slate-400">Completed Today</p>
                <p className="text-lg font-bold text-emerald-400">{stats.completedToday}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b border-slate-700/50 bg-slate-900/40 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-6 py-4 font-medium text-sm transition-all flex items-center gap-2 border-b-2 ${
                activeTab === 'activity'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              <Activity className="w-4 h-4" />
              Activity Feed
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-6 py-4 font-medium text-sm transition-all flex items-center gap-2 border-b-2 ${
                activeTab === 'calendar'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Calendar
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`px-6 py-4 font-medium text-sm transition-all flex items-center gap-2 border-b-2 ${
                activeTab === 'search'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              <SearchIcon className="w-4 h-4" />
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-fade-in">
          {activeTab === 'activity' && <ActivityFeed />}
          {activeTab === 'calendar' && <CalendarView />}
          {activeTab === 'search' && <SearchPanel />}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-slate-900/40 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-400">
          <p>Mission Control v1.0 • Real-time AI Agent Operations Dashboard</p>
        </div>
      </footer>
    </div>
  );
}
