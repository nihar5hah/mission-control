'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Workflow, Play, StopCircle, CheckCircle2, AlertCircle, RefreshCw, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AutomationTask {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'success' | 'error';
  lastRun?: string;
}

export function AutomationHub() {
  const [tasks, setTasks] = useState<AutomationTask[]>([
    { id: 'auto-claim', name: 'Auto-Claim Tasks', description: 'Automatically claims matching tasks from board', status: 'idle', lastRun: '2 hours ago' },
    { id: 'doc-sync', name: 'Memory Sync', description: 'Syncs agent workspace to Supabase memory', status: 'idle', lastRun: '15 mins ago' },
    { id: 'activity-rollup', name: 'Daily Rollup', description: 'Aggregates agent activities into daily stats', status: 'idle', lastRun: '12 hours ago' },
  ]);

  const runTask = async (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'running' } : t));
    
    // Simulate API call
    setTimeout(() => {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'success', lastRun: 'Just now' } : t));
      toast.success(`${id} completed successfully`);
      
      // Reset after 3 seconds
      setTimeout(() => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'idle' } : t));
      }, 3000);
    }, 2000);
  };

  return (
    <div className="apple-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Workflow className="w-5 h-5 text-indigo-500" />
          <h3 className="text-sm font-semibold">Automation Hub</h3>
        </div>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
          <Zap className="w-3 h-3 text-indigo-500" />
          <span className="text-[10px] font-medium text-indigo-500 uppercase tracking-wider">3 ACTIVE</span>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="p-3 rounded-xl bg-white/5 border border-white/10 group">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-xs font-semibold">{task.name}</h4>
                  {task.status === 'running' && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <RefreshCw className="w-3 h-3 text-indigo-400" />
                    </motion.div>
                  )}
                  {task.status === 'success' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                </div>
                <p className="text-[10px] text-slate-400 mb-2">{task.description}</p>
                <div className="flex items-center gap-2 text-[9px] text-slate-500">
                  <span className="flex items-center gap-1 uppercase tracking-tighter">
                    Last run: {task.lastRun}
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => runTask(task.id)}
                disabled={task.status === 'running'}
                className={`w-8 h-8 rounded-lg p-0 transition-all ${
                  task.status === 'running' 
                    ? 'bg-slate-800' 
                    : 'bg-white/10 hover:bg-indigo-500/20 group-hover:bg-indigo-500/10'
                }`}
              >
                <Play className={`w-3.5 h-3.5 ${task.status === 'running' ? 'text-slate-600' : 'text-slate-400 group-hover:text-indigo-400'}`} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-white/5">
        <Button
          variant="ghost"
          className="w-full text-[10px] uppercase tracking-widest h-8 border-white/10 hover:bg-white/5"
        >
          View Automation Logs
        </Button>
      </div>
    </div>
  );
}
