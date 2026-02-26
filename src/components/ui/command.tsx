'use client';

import * as React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, Clock, FileText, Calendar, Bot, Zap, Settings, HelpCircle, X } from 'lucide-react';

interface CommandItem {
  id: string;
  label: string;
  shortcut?: string;
  icon?: React.ComponentType<{ className?: string }>;
  category?: string;
  action?: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate?: (tab: string) => void;
  recentActions?: CommandItem[];
}

export function CommandPalette({ open, onOpenChange, onNavigate, recentActions = [] }: CommandPaletteProps) {
  const [query, setQuery] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    // Navigation
    { id: 'nav-dashboard', label: 'Go to Dashboard', shortcut: 'G D', icon: Zap, category: 'Navigation', action: () => onNavigate?.('dashboard') },
    { id: 'nav-activity', label: 'Go to Activity Feed', shortcut: 'G A', icon: Clock, category: 'Navigation', action: () => onNavigate?.('activity') },
    { id: 'nav-calendar', label: 'Go to Calendar', shortcut: 'G C', icon: Calendar, category: 'Navigation', action: () => onNavigate?.('calendar') },
    { id: 'nav-tasks', label: 'Go to Tasks Board', shortcut: 'G T', icon: FileText, category: 'Navigation', action: () => onNavigate?.('tasks') },
    { id: 'nav-docs', label: 'Go to Documentation', shortcut: 'G D', icon: FileText, category: 'Navigation', action: () => onNavigate?.('documentation') },
    { id: 'nav-health', label: 'Go to Health', shortcut: 'G H', icon: Bot, category: 'Navigation', action: () => onNavigate?.('health') },
    { id: 'nav-review', label: 'Go to Daily Review', shortcut: 'G R', icon: Clock, category: 'Navigation', action: () => onNavigate?.('review') },

    // Quick Actions
    { id: 'quick-task', label: 'Create Quick Task', shortcut: 'T', icon: FileText, category: 'Quick Actions', action: () => onNavigate?.('tasks') },
    { id: 'quick-log', label: 'Log Activity', shortcut: 'L', icon: Clock, category: 'Quick Actions', action: () => onNavigate?.('activity') },
    { id: 'quick-start-focus', label: 'Start Focus Session', shortcut: 'F', icon: Zap, category: 'Quick Actions', action: () => onNavigate?.('focus') },

    // Settings
    { id: 'settings-theme', label: 'Toggle Dark Mode', shortcut: '⌘⇧D', icon: Settings, category: 'Settings' },
    { id: 'settings-help', label: 'Keyboard Shortcuts', shortcut: '?', icon: HelpCircle, category: 'Settings' },
  ];

  const filteredCommands = React.useMemo(() => {
    if (!query) return commands;
    const q = query.toLowerCase();
    return commands.filter(cmd => 
      cmd.label.toLowerCase().includes(q) || 
      cmd.category?.toLowerCase().includes(q)
    );
  }, [query, commands]);

  const groupedCommands = React.useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filteredCommands.forEach(cmd => {
      const cat = cmd.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  const handleSelect = (item: CommandItem) => {
    item.action?.();
    onOpenChange(false);
    setQuery('');
  };

  React.useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden border-0 bg-transparent shadow-none max-w-xl" style={{ background: 'transparent' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <Search className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a command or search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-base"
              style={{ color: 'var(--text-primary)' }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  onOpenChange(false);
                }
              }}
            />
            <kbd
              className="px-2 py-0.5 rounded text-xs"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-tertiary)' }}
            >
              ESC
            </kbd>
          </div>

          {/* Commands List */}
          <div className="max-h-80 overflow-y-auto py-2">
            {Object.entries(groupedCommands).map(([category, items]) => (
              <div key={category}>
                <p className="px-4 py-2 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                  {category}
                </p>
                {items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/5"
                    >
                      {Icon && <div style={{ color: 'var(--text-tertiary)' }}><Icon className="w-4 h-4" /></div>}
                      <span className="flex-1 text-sm" style={{ color: 'var(--text-primary)' }}>
                        {item.label}
                      </span>
                      {item.shortcut && (
                        <kbd
                          className="px-2 py-0.5 rounded text-xs"
                          style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-tertiary)' }}
                        >
                          {item.shortcut}
                        </kbd>
                      )}
                      <div style={{ color: 'var(--text-tertiary)' }}><ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100" /></div>
                    </button>
                  );
                })}
              </div>
            ))}

            {filteredCommands.length === 0 && (
              <div className="px-4 py-8 text-center">
                <p style={{ color: 'var(--text-tertiary)' }}>No commands found for "{query}"</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 text-xs" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-tertiary)' }}>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.1)' }}>↑↓</kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.1)' }}>↵</kbd>
                to select
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.1)' }}>⌘K</kbd>
              to toggle
            </span>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

// Hook for keyboard shortcut
export function useCommandPalette() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { open, setOpen };
}
