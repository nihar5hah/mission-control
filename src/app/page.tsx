'use client';

import { useState } from 'react';
import { Activity, Calendar, Search, Bot, Clock, CheckCircle, Zap } from 'lucide-react';

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
}

export default function MissionControl() {
  const [activeTab, setActiveTab] = useState<'activity' | 'calendar' | 'search'>('activity');
  const [searchQuery, setSearchQuery] = useState('');

  // Demo data
  const [activities] = useState<Activity[]>([
    { id: 1, agent: 'Begubot', action: 'Research', description: 'Daily research report on AI agents', status: 'completed', timestamp: new Date() },
    { id: 2, agent: 'Begubot', action: 'Build', description: 'Mission Control dashboard', status: 'completed', timestamp: new Date() },
    { id: 3, agent: 'Begubot', action: 'Morning Brief', description: 'Delivered morning brief', status: 'completed', timestamp: new Date() },
  ]);

  const [tasks] = useState<Task[]>([
    { id: 1, title: 'Morning Brief', scheduledFor: new Date(Date.now() + 86400000 * 9), status: 'pending' },
    { id: 2, title: 'Research Report', scheduledFor: new Date(Date.now() + 86400000 * 14), status: 'pending' },
    { id: 3, title: 'Night Shift', scheduledFor: new Date(Date.now() + 86400000 * 20), status: 'pending' },
  ]);

  const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#5E6AD2] rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-semibold">Mission Control</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-white/10 px-6">
        <div className="flex gap-1">
          <button onClick={() => setActiveTab('activity')} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'activity' ? 'border-[#5E6AD2] text-white' : 'border-transparent text-gray-400 hover:text-white'}`}>
            <Activity className="w-4 h-4 inline-block mr-2" />
            Activity
          </button>
          <button onClick={() => setActiveTab('calendar')} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'calendar' ? 'border-[#5E6AD2] text-white' : 'border-transparent text-gray-400 hover:text-white'}`}>
            <Calendar className="w-4 h-4 inline-block mr-2" />
            Calendar
          </button>
          <button onClick={() => setActiveTab('search')} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'search' ? 'border-[#5E6AD2] text-white' : 'border-transparent text-gray-400 hover:text-white'}`}>
            <Search className="w-4 h-4 inline-block mr-2" />
            Search
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="p-6">
        {activeTab === 'activity' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Agent Activity Feed</h2>
            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.status === 'completed' ? 'bg-green-500/20 text-green-500' : activity.status === 'running' ? 'bg-blue-500/20 text-blue-500' : 'bg-red-500/20 text-red-500'}`}>
                    {activity.status === 'completed' ? <CheckCircle className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{activity.agent}</span>
                      <span className="text-[#5E6AD2] text-sm">{activity.action}</span>
                    </div>
                    <p className="text-gray-400 text-sm">{activity.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-400 text-sm flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(activity.timestamp)}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded ${activity.status === 'completed' ? 'bg-green-500/20 text-green-500' : activity.status === 'running' ? 'bg-blue-500/20 text-blue-500' : 'bg-red-500/20 text-red-500'}`}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Weekly Schedule</h2>
            <div className="grid gap-3">
              {tasks.map((task) => (
                <div key={task.id} className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex flex-col items-center justify-center">
                    <span className="text-xs text-gray-400">{formatDate(task.scheduledFor).split(' ')[0]}</span>
                    <span className="text-lg font-semibold">{task.scheduledFor.getDate()}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{task.title}</div>
                    <div className="text-gray-400 text-sm flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(task.scheduledFor)}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded ${task.status === 'completed' ? 'bg-green-500/20 text-green-500' : task.status === 'in_progress' ? 'bg-blue-500/20 text-blue-500' : 'bg-white/10 text-gray-400'}`}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Global Search</h2>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Search memories, documents, tasks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:border-[#5E6AD2]" />
            </div>
            {searchQuery && (
              <div className="text-center py-12 text-gray-400">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Search for "{searchQuery}"</p>
                <p className="text-sm mt-2">Results will appear here</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
