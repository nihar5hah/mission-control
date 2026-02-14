'use client';

import { useState, useEffect } from 'react';
import {
  CheckCircle,
  AlertCircle,
  Loader,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
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
        return <Loader className="w-4 h-4 text-slate-400" />;
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
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className={filter === f ? 'bg-cyan-500 hover:bg-cyan-600' : ''}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
        <Button
          variant={autoRefresh ? 'default' : 'outline'}
          size="sm"
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={autoRefresh ? 'bg-cyan-500 hover:bg-cyan-600' : ''}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
          Auto-refresh
        </Button>
      </div>

      {/* Activities List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      ) : filteredActivities.length === 0 ? (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Zap className="w-12 h-12 text-slate-600 mb-3" />
            <p className="text-slate-400">No activities found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredActivities.map((activity) => (
            <Card key={activity.id} className="bg-slate-900/50 border-slate-800 hover:border-cyan-500/50 transition-colors cursor-pointer">
              <CardContent className="p-4">
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
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
