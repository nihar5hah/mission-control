'use client';

import { useState } from 'react';
import { Activity, Calendar, Search, Bot, Clock, CheckCircle, Zap, ArrowRight } from 'lucide-react';

interface Activity {
  id: number;
  agent: string;
  action: string;
  description: string;
  status: 'running' | 'completed' | 'failed';
  timestamp: Date;
}

interface Task {
  id: number;
  title: string;
  scheduledFor: Date;
  status: 'pending' | 'in_progress' | 'completed';
  day: string;
}

export default function MissionControl() {
  const [activeTab, setActiveTab] = useState<'activity' | 'calendar' | 'search'>('activity');
  const [searchQuery, setSearchQuery] = useState('');

  // Demo data
  const [activities] = useState<Activity[]>([
    { id: 1, agent: 'Main Agent', action: 'Build', description: 'Updated Mission Control dashboard UI', status: 'completed', timestamp: new Date(Date.now() - 300000) },
    { id: 2, agent: 'Main Agent', action: 'Research', description: 'Daily research report on AI architecture', status: 'completed', timestamp: new Date(Date.now() - 1800000) },
    { id: 3, agent: 'Subagent', action: 'Review', description: 'Code review and validation completed', status: 'completed', timestamp: new Date(Date.now() - 3600000) },
    { id: 4, agent: 'Main Agent', action: 'Brief', description: 'Morning briefing delivered to team', status: 'completed', timestamp: new Date(Date.now() - 7200000) },
    { id: 5, agent: 'System', action: 'Sync', description: 'Data synchronization across nodes', status: 'running', timestamp: new Date(Date.now() - 900000) },
  ]);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const [tasks] = useState<Task[]>([
    { id: 1, title: 'Morning Brief', scheduledFor: new Date(Date.now() + 86400000), day: 'Monday', status: 'pending' },
    { id: 2, title: 'Research Report', scheduledFor: new Date(Date.now() + 86400000 * 3), day: 'Wednesday', status: 'pending' },
    { id: 3, title: 'Code Review', scheduledFor: new Date(Date.now() + 86400000 * 5), day: 'Friday', status: 'pending' },
    { id: 4, title: 'Team Standup', scheduledFor: new Date(Date.now() + 86400000 * 7), day: 'Sunday', status: 'pending' },
  ]);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'running':
        return 'text-blue-400';
      case 'failed':
        return 'text-red-400';
      case 'pending':
        return 'text-gray-400';
      case 'in_progress':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10';
      case 'running':
        return 'bg-blue-500/10';
      case 'failed':
        return 'bg-red-500/10';
      case 'pending':
        return 'bg-white/5';
      case 'in_progress':
        return 'bg-blue-500/10';
      default:
        return 'bg-white/5';
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#5E6AD2] rounded-lg flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Mission Control</h1>
            <p className="text-xs text-gray-400">Agent Dashboard</p>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          <button
            onClick={() => setActiveTab('activity')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
              activeTab === 'activity'
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Activity className="w-4 h-4" />
            Activity Feed
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
              activeTab === 'calendar'
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Calendar
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
              activeTab === 'search'
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Search className="w-4 h-4" />
            Search
          </button>
        </nav>

        <div className="border-t border-white/10 pt-4 mt-4">
          <div className="flex items-center gap-2 px-2 py-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-gray-400">System Status</span>
          </div>
          <p className="text-xs text-gray-500">All systems operational</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-white/10 px-8 py-4 flex items-center justify-between">
          <div>
            {activeTab === 'activity' && <h2 className="text-xl font-semibold">Activity Feed</h2>}
            {activeTab === 'calendar' && <h2 className="text-xl font-semibold">Weekly Schedule</h2>}
            {activeTab === 'search' && <h2 className="text-xl font-semibold">Global Search</h2>}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span>Live</span>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'activity' && (
            <div className="space-y-3 max-w-3xl">
              {activities.map((activity, idx) => (
                <div
                  key={activity.id}
                  className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/7 hover:border-white/20 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getStatusBgColor(activity.status)}`}>
                      {activity.status === 'completed' ? (
                        <CheckCircle className={`w-5 h-5 ${getStatusColor(activity.status)}`} />
                      ) : (
                        <Bot className={`w-5 h-5 ${getStatusColor(activity.status)}`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{activity.agent}</span>
                        <span className="text-[#5E6AD2] text-xs font-medium bg-[#5E6AD2]/10 px-2 py-0.5 rounded">
                          {activity.action}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">{activity.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-gray-500 text-xs">{formatTime(activity.timestamp)}</div>
                      <div className={`text-xs font-medium mt-1 ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="space-y-6 max-w-3xl">
              <div className="grid gap-4">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white/5 border border-white/10 rounded-lg p-5 hover:bg-white/7 hover:border-white/20 transition-all flex items-center gap-4"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-white/10 rounded-lg flex flex-col items-center justify-center">
                        <span className="text-xs text-gray-400 font-medium">{task.day.substring(0, 3)}</span>
                        <span className="text-2xl font-semibold">{task.scheduledFor.getDate()}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-base">{task.title}</div>
                      <div className="text-gray-400 text-sm flex items-center gap-1 mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(task.scheduledFor)}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded ${getStatusBgColor(task.status)} ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'search' && (
            <div className="max-w-2xl space-y-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search memories, documents, tasks, agents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#5E6AD2] focus:bg-white/7 transition-all text-sm"
                />
              </div>

              {!searchQuery && (
                <div className="text-center py-16 text-gray-400">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-40" />
                  <p className="text-sm">Start typing to search</p>
                </div>
              )}

              {searchQuery && (
                <div className="text-center py-16 text-gray-400">
                  <div className="inline-block bg-white/5 border border-white/10 rounded-lg p-6">
                    <p className="text-sm">No results found for "{searchQuery}"</p>
                    <p className="text-xs text-gray-500 mt-2">Try searching for agent names, activities, or dates</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
