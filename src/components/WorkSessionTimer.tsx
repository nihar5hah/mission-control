'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, Focus, Timer, Check, X } from 'lucide-react';
import { toast } from 'sonner';

type SessionType = 'focus' | 'break' | 'admin';

const SESSION_CONFIGS = {
  focus: {
    label: 'Focus Session',
    defaultMinutes: 25,
    color: 'var(--accent)',
    bg: 'var(--accent-muted)',
    icon: Focus,
  },
  break: {
    label: 'Break',
    defaultMinutes: 5,
    color: 'var(--color-orange)',
    bg: 'rgba(245, 158, 11, 0.1)',
    icon: Coffee,
  },
  admin: {
    label: 'Admin Work',
    defaultMinutes: 15,
    color: 'var(--color-purple)',
    bg: 'rgba(139, 92, 246, 0.1)',
    icon: Timer,
  },
};

interface SessionLog {
  type: SessionType;
  duration_seconds: number;
  started_at: string;
  ended_at: string;
  completed: boolean;
}

export function WorkSessionTimer() {
  const [sessionType, setSessionType] = useState<SessionType>('focus');
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionStart, setSessionStart] = useState<Date | null>(null);
  const [todaySessions, setTodaySessions] = useState<SessionLog[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const config = SESSION_CONFIGS[sessionType];
  const Icon = config.icon;

  // Load today's sessions from localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem('work_sessions');
    if (stored) {
      try {
        const allSessions: SessionLog[] = JSON.parse(stored);
        const todayOnly = allSessions.filter(s => new Date(s.started_at).toDateString() === today);
        setTodaySessions(todayOnly);
      } catch (e) {
        console.error('Failed to parse sessions:', e);
      }
    }
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSessionEnd(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused]);

  const startSession = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
    setSessionStart(new Date());
    setTimeLeft(durationMinutes * 60);
  }, [durationMinutes]);

  const pauseSession = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeSession = useCallback(() => {
    setIsPaused(false);
  }, []);

  const cancelSession = useCallback(() => {
    handleSessionEnd(false);
  }, []);

  const handleSessionEnd = useCallback((completed: boolean) => {
    setIsRunning(false);
    setIsPaused(false);

    if (sessionStart) {
      const now = new Date();
      const durationSeconds = completed
        ? durationMinutes * 60
        : durationMinutes * 60 - timeLeft;

      const sessionLog: SessionLog = {
        type: sessionType,
        duration_seconds: durationSeconds,
        started_at: sessionStart.toISOString(),
        ended_at: now.toISOString(),
        completed,
      };

      // Save to localStorage
      const stored = localStorage.getItem('work_sessions');
      const allSessions: SessionLog[] = stored ? JSON.parse(stored) : [];
      allSessions.push(sessionLog);
      localStorage.setItem('work_sessions', JSON.stringify(allSessions));

      // Update today's sessions
      setTodaySessions(prev => [...prev, sessionLog]);

      // Log to activity API
      fetch('/api/activities/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: 'begubot',
          action: completed ? 'session-complete' : 'session-cancel',
          description: `${completed ? 'Completed' : 'Cancelled'} ${sessionType} session (${Math.floor(durationSeconds / 60)}m)`,
          status: completed ? 'completed' : 'pending',
          metadata: {
            session_type: sessionType,
            duration_seconds: durationSeconds,
            completed,
          },
        }),
      }).catch(console.error);

      // Show notification
      if (completed) {
        toast.success(`Session complete! Great focus 🎯`);
      }
    }

    setSessionStart(null);
    setTimeLeft(durationMinutes * 60);
  }, [sessionStart, sessionType, durationMinutes, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = isRunning ? ((durationMinutes * 60 - timeLeft) / (durationMinutes * 60)) * 100 : 0;

  // Stats
  const todayStats = {
    focusMinutes: todaySessions.filter(s => s.type === 'focus' && s.completed).reduce((sum, s) => sum + s.duration_seconds, 0) / 60,
    breakMinutes: todaySessions.filter(s => s.type === 'break' && s.completed).reduce((sum, s) => sum + s.duration_seconds, 0) / 60,
    totalSessions: todaySessions.filter(s => s.completed).length,
  };

  return (
    <div className="apple-card p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Timer className="w-5 h-5" style={{ color: config.color }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Work Session Timer</h3>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
          <span>{todayStats.totalSessions} sessions</span>
          <span>·</span>
          <span>{Math.round(todayStats.focusMinutes)}m focus</span>
        </div>
      </div>

      {/* Session Type Selector */}
      <div className="flex gap-2 mb-5">
        {(Object.keys(SESSION_CONFIGS) as SessionType[]).map((type) => {
          const cfg = SESSION_CONFIGS[type];
          const TypeIcon = cfg.icon;
          const isActive = sessionType === type;
          return (
            <button
              key={type}
              onClick={() => {
                if (!isRunning) {
                  setSessionType(type);
                  setDurationMinutes(cfg.defaultMinutes);
                  setTimeLeft(cfg.defaultMinutes * 60);
                }
              }}
              disabled={isRunning}
              className="flex-1 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              style={{
                background: isActive ? cfg.bg : 'rgba(255,255,255,0.04)',
                color: isActive ? cfg.color : 'var(--text-tertiary)',
                border: `1px solid ${isActive ? cfg.color + '40' : 'rgba(255,255,255,0.08)'}`,
              }}
            >
              <TypeIcon className="w-3.5 h-3.5" />
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Timer Display */}
      <div className="relative flex flex-col items-center justify-center py-6">
        {/* Progress Circle */}
        <div className="relative w-40 h-40">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="8"
            />
            {isRunning && (
              <motion.circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke={config.color}
                strokeWidth="8"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: progress / 100 }}
                transition={{ duration: 0.5 }}
                style={{
                  strokeDasharray: '439.8',
                  strokeDashoffset: 439.8 * (1 - progress / 100),
                }}
              />
            )}
          </svg>
          
          {/* Time Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              key={timeLeft}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-4xl font-bold tabular-nums"
              style={{ color: isRunning ? config.color : 'var(--text-primary)' }}
            >
              {formatTime(timeLeft)}
            </motion.span>
            {isRunning && (
              <span className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                {isPaused ? 'Paused' : sessionType}
              </span>
            )}
          </div>
        </div>

        {/* Duration Selector (when not running) */}
        {!isRunning && (
          <div className="flex items-center gap-2 mt-4">
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Duration:</span>
            {[5, 15, 25, 45, 60].map((mins) => (
              <button
                key={mins}
                onClick={() => {
                  setDurationMinutes(mins);
                  setTimeLeft(mins * 60);
                }}
                className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: durationMinutes === mins ? config.bg : 'rgba(255,255,255,0.04)',
                  color: durationMinutes === mins ? config.color : 'var(--text-tertiary)',
                }}
              >
                {mins}m
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        <AnimatePresence mode="wait">
          {!isRunning ? (
            <motion.button
              key="start"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={startSession}
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: config.color, boxShadow: `0 4px 20px ${config.color}40` }}
            >
              <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
            </motion.button>
          ) : (
            <>
              {isPaused ? (
                <motion.button
                  key="resume"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  onClick={resumeSession}
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: config.color }}
                >
                  <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
                </motion.button>
              ) : (
                <motion.button
                  key="pause"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  onClick={pauseSession}
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                >
                  <Pause className="w-6 h-6" style={{ color: 'var(--text-primary)' }} fill="var(--text-primary)" />
                </motion.button>
              )}
              <motion.button
                key="cancel"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                onClick={cancelSession}
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(239,68,68,0.1)' }}
              >
                <X className="w-6 h-6 text-red-500" />
              </motion.button>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Today's Sessions */}
      {todaySessions.length > 0 && (
        <div className="mt-5 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-xs mb-2" style={{ color: 'var(--text-tertiary)' }}>Today's Sessions</p>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {todaySessions.slice(-5).reverse().map((session, idx) => {
              const cfg = SESSION_CONFIGS[session.type];
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  <div className="flex items-center gap-2">
                    <span style={{ color: cfg.color }}>{session.completed ? '✓' : '○'}</span>
                    <span style={{ color: 'var(--text-primary)' }}>{cfg.label}</span>
                    <span style={{ color: 'var(--text-tertiary)' }}>
                      {Math.floor(session.duration_seconds / 60)}m
                    </span>
                  </div>
                  <span style={{ color: 'var(--text-tertiary)' }}>
                    {new Date(session.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
