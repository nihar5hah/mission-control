'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Sun,
  RefreshCw,
  Sparkles,
  Download,
  Bell,
  Trash2,
  Loader2,
  Zap,
  Lock,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/lib/auth-context';

const ACTIONS = [
  {
    id: 'morning-brief',
    label: 'Run Morning Brief Now',
    icon: Sun,
    description: 'Trigger the morning brief cron immediately.',
  },
  {
    id: 'sync-docs',
    label: 'Sync All Documents',
    icon: RefreshCw,
    description: 'Sync all agent docs into Supabase.',
  },
  {
    id: 'refresh-activities',
    label: 'Refresh Activity Feed',
    icon: Sparkles,
    description: 'Force refresh live activity streams.',
  },
  {
    id: 'export-summary',
    label: "Export Today's Summary",
    icon: Download,
    description: "Download a JSON summary of today's activity.",
  },
  {
    id: 'test-notification',
    label: 'Test Telegram Notification',
    icon: Bell,
    description: 'Send a test Telegram message.',
  },
];

export function QuickActions() {
  const { isViewer } = useAuth();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const runAction = async (actionId: string) => {
    if (isViewer) return;

    setLoadingAction(actionId);
    try {
      const response = await fetch(`/api/quick-actions/${actionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || 'Action failed');
      }

      if (actionId === 'export-summary') {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `mission-control-summary-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success('Summary exported');
      } else {
        toast.success('Action completed');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Action failed');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="apple-card p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Quick Actions</h3>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {isViewer ? 'Admin access required to trigger actions' : 'Trigger key workflows instantly'}
          </p>
        </div>
        <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ background: 'var(--accent-muted)' }}>
          {isViewer ? (
            <Lock className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
          ) : (
            <Zap className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          const isLoading = loadingAction === action.id;
          const disabled = isLoading || isViewer;

          return (
            <div
              key={action.id}
              title={isViewer ? 'Admin only — log in as Admin to use this action' : undefined}
              className="relative"
            >
              <button
                onClick={() => runAction(action.id)}
                disabled={disabled}
                className="flex items-start gap-3 w-full p-3.5 rounded-xl text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
                onMouseEnter={(e) => {
                  if (!disabled) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.borderColor = 'rgba(6, 64, 43, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                }}
              >
                <div
                  className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0"
                  style={{ background: isViewer ? 'rgba(255,255,255,0.06)' : 'var(--accent-muted)' }}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--accent)' }} />
                  ) : isViewer ? (
                    <Icon className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                  ) : (
                    <Icon className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                  )}
                </div>
                <div>
                  <span className="text-sm font-medium block" style={{ color: 'var(--text-primary)' }}>
                    {action.label}
                  </span>
                  <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                    {isViewer ? 'Admin only' : action.description}
                  </span>
                </div>
              </button>
            </div>
          );
        })}

        {/* Destructive: Clear Old Activities */}
        {isViewer ? (
          <div
            title="Admin only — log in as Admin to use this action"
            className="flex items-start gap-3 w-full p-3.5 rounded-xl text-left opacity-40 cursor-not-allowed"
            style={{
              background: 'var(--color-red-muted)',
              border: '1px solid rgba(255,69,58,0.2)',
            }}
          >
            <div
              className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,69,58,0.2)' }}
            >
              <Trash2 className="w-4 h-4" style={{ color: 'var(--color-red)' }} />
            </div>
            <div>
              <span className="text-sm font-medium block" style={{ color: 'var(--color-red)' }}>
                Clear Old Activities
              </span>
              <span className="text-[11px]" style={{ color: 'rgba(255,69,58,0.7)' }}>
                Admin only
              </span>
            </div>
          </div>
        ) : (
          <Dialog>
            <DialogTrigger asChild>
              <button
                className="flex items-start gap-3 w-full p-3.5 rounded-xl text-left transition-all"
                style={{
                  background: 'var(--color-red-muted)',
                  border: '1px solid rgba(255,69,58,0.2)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,69,58,0.22)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-red-muted)'; }}
              >
                <div
                  className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,69,58,0.2)' }}
                >
                  <Trash2 className="w-4 h-4" style={{ color: 'var(--color-red)' }} />
                </div>
                <div>
                  <span className="text-sm font-medium block" style={{ color: 'var(--color-red)' }}>
                    Clear Old Activities
                  </span>
                  <span className="text-[11px]" style={{ color: 'rgba(255,69,58,0.7)' }}>
                    Delete 7+ day entries
                  </span>
                </div>
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Clear old activities?</DialogTitle>
                <DialogDescription>
                  This permanently deletes all agent activity entries older than 7 days.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <button className="px-4 py-2 rounded-xl text-sm font-medium btn-apple-secondary">
                  Cancel
                </button>
                <button
                  onClick={() => runAction('clear-activities')}
                  disabled={loadingAction === 'clear-activities'}
                  className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                  style={{ background: 'var(--color-red)', color: 'white' }}
                >
                  {loadingAction === 'clear-activities' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Confirm Delete
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </motion.div>
  );
}
