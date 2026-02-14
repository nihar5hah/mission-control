'use client';

import { useState, useEffect } from 'react';
import {
  CheckCircle,
  AlertCircle,
  Loader,
  Zap,
  Clock,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';

interface Activity {
  id: string;
  type: 'action' | 'task_completed' | 'event' | 'log';
  title: string;
  description?: string;
  status: 'running' | 'completed' | 'failed' | 'pending';
  icon?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'running' | 'completed' | 'failed'>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock data
  useEffect(() => {
    setLoading(true);
    const mockActivities: Activity[] = [
      {
        id: '1',
        type: 'task_completed',
        title: 'Database Sync Completed',
        description: 'Synchronized 1,247 records with Convex database',
        status: 'completed',
        timestamp: Date.now() - 2 * 60000,
      },
      {
        id: '2',
        type: 'action',
        title: 'Scraping Web Content',
        description: 'Fetching latest documentation updates',
        status: 'running',
        timestamp: Date.now() - 5 * 60000,
      },
      {
        id: '3',
        type: 'event',
        title: 'Memory Checkpoint Saved',
        description: 'Daily memory backup completed successfully',
        status: 'completed',
        timestamp: Date.now() - 15 * 60000,
      },
      {
        id: '4',
        type: 'action',
        title: 'Processing Email Queue',
        description: '247 emails processed, 3 flagged for review',
        status: 'completed',
        timestamp: Date.now() - 30 * 60000,
      },
      {
        id: '5',
        type: 'task_completed',
        title: 'API Integration Test',
        description: 'OpenClaw API endpoints verified',
        status: 'completed',
        timestamp: Date.now() - 45 * 60000,
      },
      {
        id: '6',
        type: 'log',
        title: 'System Health Check',
        description: 'CPU: 34%, Memory: 62%, Disk: 41%',
        status: 'completed',
        timestamp: Date.now() - 60 * 60000,
      },
      {
        id: '7',
        type: 'action',
        title: 'Document Generation Failed',
        description: 'PDF export timeout - retrying in 30s',
        status: 'failed',
        timestamp: Date.now() - 90 * 60000,
      },
    ];

    setTimeout(() => {
      setActivities(mockActivities);
      setLoading(false);
    }, 300);
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // In real app, fetch from Convex
      setActivities((prev) => [
        {
          id: Date.now().toString(),
          type: 'log',
          title: 'Auto-refresh Check',
          status: 'completed',
          timestamp: Date.now(),
        },
        ...prev.slice(0, 6),
      ]);
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const filteredActivities =
    filter === 'all'
      ? activities
      : activities.filter((a) => a.status === filter);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Loader className="w-4 h-4 animate-spin text-cyan-400" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          {(['all', 'running', 'completed', 'failed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f
                  ? 'glass border border-cyan-400/50 text-cyan-400'
                  : 'glass text-slate-400 hover:text-slate-300'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`p-2 rounded-lg transition-all ${
              autoRefresh ? 'glass border border-cyan-400/50 text-cyan-400' : 'glass text-slate-400'
            }`}
            title={autoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Activities List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="glass rounded-lg p-12 text-center">
          <Zap className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No activities found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredActivities.map((activity) => (
            <div
              key={activity.id}
              className="glass rounded-lg p-4 hover:border-cyan-400/50 transition-all group cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">{getStatusIcon(activity.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">
                        {activity.title}
                      </h3>
                      {activity.description && (
                        <p className="text-sm text-slate-400 mt-1">{activity.description}</p>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      {formatTime(activity.timestamp)}
                    </span>
                  </div>
                  {activity.metadata && (
                    <div className="mt-2 text-xs text-slate-500">
                      {Object.entries(activity.metadata).map(([key, value]) => (
                        <span key={key} className="inline-block mr-3">
                          <span className="text-slate-600">{key}:</span> {String(value)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
