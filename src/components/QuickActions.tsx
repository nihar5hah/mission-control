'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Sun,
  RefreshCw,
  FileText,
  Trash2,
  Download,
  Bell,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

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
    description: 'Download a JSON summary of today’s activity.',
  },
  {
    id: 'test-notification',
    label: 'Test Telegram Notification',
    icon: Bell,
    description: 'Send a test Telegram message.',
  },
];

export function QuickActions() {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const runAction = async (actionId: string) => {
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-card liquid-border p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Quick Actions</h3>
          <p className="text-xs" style={{ color: 'var(--subtle)' }}>Trigger key workflows instantly</p>
        </div>
        <FileText className="w-5 h-5 text-[#8B5CF6]" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          const isLoading = loadingAction === action.id;
          return (
            <Button
              key={action.id}
              variant="glow"
              onClick={() => runAction(action.id)}
              disabled={isLoading}
              className="justify-start h-auto py-3 px-4 text-left"
            >
              <span className="flex items-center gap-3">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Icon className="w-4 h-4 text-[#8B5CF6]" />
                )}
                <span>
                  <span className="text-sm font-medium block" style={{ color: 'var(--foreground)' }}>{action.label}</span>
                  <span className="text-[11px]" style={{ color: 'var(--subtle)' }}>{action.description}</span>
                </span>
              </span>
            </Button>
          );
        })}

        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="destructive"
              className="justify-start h-auto py-3 px-4 text-left"
            >
              <span className="flex items-center gap-3">
                <Trash2 className="w-4 h-4" />
                <span>
                  <span className="text-sm font-medium block" style={{ color: 'var(--foreground)' }}>Clear Old Activities</span>
                  <span className="text-[11px]" style={{ color: 'var(--danger-light)' }}>Delete 7+ day entries</span>
                </span>
              </span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Clear old activities?</DialogTitle>
              <DialogDescription>
                This permanently deletes all agent activity entries older than 7 days.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost">Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => runAction('clear-activities')}
                disabled={loadingAction === 'clear-activities'}
              >
                {loadingAction === 'clear-activities' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Confirm Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </motion.div>
  );
}
