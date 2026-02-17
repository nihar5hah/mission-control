'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AgentId, AgentState } from '@/types/agents';
import { AGENT_CONFIG } from '@/types/agents';
import { Coffee, Users, Sparkles } from 'lucide-react';

const PHASES = ['work', 'chat', 'meeting', 'water', 'return'] as const;
type OfficePhase = (typeof PHASES)[number];

const DESK_POSITIONS: Record<AgentId, { x: number; y: number }> = {
  begubot: { x: 18, y: 62 },
  coder: { x: 44, y: 72 },
  researcher: { x: 70, y: 62 },
};

const MEETING_SPOTS: Record<AgentId, { x: number; y: number }> = {
  begubot: { x: 34, y: 22 },
  coder: { x: 46, y: 18 },
  researcher: { x: 58, y: 22 },
};

const WATER_COOLER_SPOTS: Record<AgentId, { x: number; y: number }> = {
  begubot: { x: 64, y: 78 },
  coder: { x: 52, y: 82 },
  researcher: { x: 74, y: 84 },
};

const CHAT_SPOTS: Record<AgentId, { x: number; y: number }> = {
  begubot: { x: 30, y: 50 },
  coder: { x: 42, y: 54 },
  researcher: { x: 54, y: 50 },
};

const speechLines = [
  'Syncing status updates…',
  'Pushing a new build.',
  'Let’s align on priorities.',
  'I found a quicker path.',
  'Live agents look good.',
  'Water break?',
  'Meeting in 2 minutes.',
  'Documenting the changes.',
];

function getPosition(agentId: AgentId, phase: OfficePhase) {
  if (phase === 'meeting') return MEETING_SPOTS[agentId];
  if (phase === 'water') return WATER_COOLER_SPOTS[agentId];
  if (phase === 'chat') return CHAT_SPOTS[agentId];
  return DESK_POSITIONS[agentId];
}

function getAgentAction(state?: AgentState) {
  return state?.session?.current_action || state?.latestActivity?.action || 'idle';
}

function isWorkingState(action: string | undefined, status: string | undefined) {
  if (!action) return false;
  if (status === 'running') return true;
  return ['building', 'researching', 'deploying', 'testing', 'syncing', 'fixing', 'documenting', 'coordinating'].includes(action);
}

export function OfficeScene({ agentStates }: { agentStates: AgentState[] }) {
  const [phase, setPhase] = useState<OfficePhase>('work');
  const [speech, setSpeech] = useState<{ agentId: AgentId; text: string } | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const speechTimerRef = useRef<NodeJS.Timeout | null>(null);

  const agentStateMap = useMemo(() => {
    return agentStates.reduce<Record<AgentId, AgentState | undefined>>((acc, state) => {
      acc[state.agent.id] = state;
      return acc;
    }, { begubot: undefined, coder: undefined, researcher: undefined });
  }, [agentStates]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const scheduleNext = () => {
      if (phase === 'work') {
        timerRef.current = setTimeout(() => {
          const next = (['chat', 'meeting', 'water'] as OfficePhase[])[Math.floor(Math.random() * 3)];
          setPhase(next);
        }, 6500 + Math.random() * 4500);
      } else if (phase === 'return') {
        timerRef.current = setTimeout(() => setPhase('work'), 2500 + Math.random() * 1500);
      } else {
        timerRef.current = setTimeout(() => setPhase('return'), 4200 + Math.random() * 2800);
      }
    };

    scheduleNext();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase]);

  useEffect(() => {
    if (speechTimerRef.current) clearTimeout(speechTimerRef.current);

    if (phase === 'chat' || phase === 'meeting' || phase === 'water') {
      const agentIds: AgentId[] = ['begubot', 'coder', 'researcher'];
      const talker = agentIds[Math.floor(Math.random() * agentIds.length)];
      const line = speechLines[Math.floor(Math.random() * speechLines.length)];
      speechTimerRef.current = setTimeout(() => {
        setSpeech({ agentId: talker, text: line });
        setTimeout(() => setSpeech(null), 2200 + Math.random() * 1200);
      }, 600 + Math.random() * 800);
    } else {
      setSpeech(null);
    }

    return () => {
      if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
    };
  }, [phase]);

  return (
    <div className="relative w-full overflow-hidden rounded-lg shadow-sm transition-all duration-300" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}>
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(20, 184, 166, 0.1) 0%, transparent 45%), radial-gradient(circle at 80% 10%, rgba(15, 118, 110, 0.05) 0%, transparent 40%)' }} />

      <div className="relative px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-semibold tracking-tight transition-colors duration-300" style={{ color: 'var(--foreground)' }}>Office Playground</h3>
          <p className="text-[11px] sm:text-xs transition-colors duration-300" style={{ color: 'var(--subtle)' }}>Live office scene with agent animations</p>
        </div>
        <div className="flex items-center gap-2 text-xs transition-colors duration-300" style={{ color: 'var(--foreground)' }}>
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 transition-all duration-300" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--muted-bg)' }}>
            <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: '#10b981' }} /> Live Sync
          </span>
        </div>
      </div>

      <div className="relative h-[340px] sm:h-[420px] px-4 sm:px-6 pb-4 sm:pb-6">
        {/* Floor */}
        <div className="absolute inset-4 sm:inset-6 rounded-2xl bg-gradient-to-br transition-all duration-300" style={{
          backgroundImage: 'linear-gradient(to bottom right, var(--muted-bg), var(--input), var(--muted-bg))',
          border: '1px solid var(--border)'
        }} />

        {/* Meeting room */}
        <div className="absolute top-8 sm:top-10 left-1/2 -translate-x-1/2 w-[70%] sm:w-[55%] h-[90px] sm:h-[120px] rounded-2xl backdrop-blur transition-all duration-300" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--background)', opacity: 0.6 }}>
          <div className="absolute inset-x-4 top-4 flex items-center gap-2 text-xs transition-colors duration-300" style={{ color: 'var(--foreground)' }}>
            <Users className="w-3 h-3" />
            <span>Meeting Room</span>
          </div>
          <div className="absolute inset-x-10 bottom-4 h-2 rounded-full transition-all duration-300" style={{ backgroundColor: 'var(--muted-bg)', border: '1px solid var(--border)' }} />
        </div>

        {/* Water cooler */}
        <div className="absolute right-6 sm:right-10 bottom-6 sm:bottom-10 w-24 sm:w-28 h-16 sm:h-20 rounded-2xl flex flex-col items-center justify-center gap-1 sm:gap-2 transition-all duration-300" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--background)' }}>
          <Coffee className="w-5 h-5" style={{ color: '#14b8a6' }} />
          <span className="text-[10px] transition-colors duration-300" style={{ color: 'var(--foreground)' }}>Water Cooler</span>
        </div>

        {/* Desks */}
        {(['begubot', 'coder', 'researcher'] as AgentId[]).map((agentId) => {
          const desk = DESK_POSITIONS[agentId];
          const config = AGENT_CONFIG[agentId];
          return (
            <div
              key={`desk-${agentId}`}
              className="absolute w-24 h-14 sm:w-28 sm:h-16 rounded-xl transition-all duration-300"
              style={{
                left: `${desk.x}%`,
                top: `${desk.y}%`,
                border: '1px solid var(--border)',
                backgroundColor: 'var(--background)',
                opacity: 0.8
              }}
            >
              <div className="absolute -top-3 left-4 px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: `${config.color}12`, color: config.color }}>
                {config.emoji} {config.name}
              </div>
              <div className="absolute bottom-3 left-4 h-1.5 w-12 rounded-full transition-all duration-300" style={{ backgroundColor: 'var(--muted-bg)' }} />
              <div className="absolute bottom-3 right-4 h-1.5 w-6 rounded-full transition-all duration-300" style={{ backgroundColor: 'var(--muted-bg)' }} />
            </div>
          );
        })}

        {/* Agents */}
        {(['begubot', 'coder', 'researcher'] as AgentId[]).map((agentId) => {
          const config = AGENT_CONFIG[agentId];
          const state = agentStateMap[agentId];
          const action = getAgentAction(state);
          const isWorking = isWorkingState(action, state?.latestActivity?.status);
          const position = getPosition(agentId, phase);

          return (
            <motion.div
              key={agentId}
              className="absolute"
              animate={{ left: `${position.x}%`, top: `${position.y}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            >
              <motion.div
                className="relative w-12 h-12 sm:w-16 sm:h-16"
                animate={isWorking ? { y: [0, -2, 0] } : { y: [0, -4, 0] }}
                transition={{ duration: isWorking ? 1.2 : 2.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div
                  className="absolute inset-0 rounded-2xl shadow-md transition-all duration-300"
                  style={{
                    backgroundColor: `${config.color}12`,
                    border: '1px solid var(--border)'
                  }}
                />
                <div
                  className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-base sm:text-lg"
                  style={{ backgroundColor: `${config.color}20`, color: config.color }}
                >
                  {config.emoji}
                </div>
                <div className="absolute bottom-2 left-2 text-[10px] transition-colors duration-300" style={{ color: 'var(--foreground)' }}>
                  {action}
                </div>

                {isWorking && (
                  <div className="absolute -top-2 right-0 flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: config.color }}
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                )}
              </motion.div>

              <AnimatePresence>
                {speech?.agentId === agentId && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute -top-12 left-0 px-3 py-1.5 rounded-full text-[10px] shadow-lg transition-all duration-300"
                    style={{
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--background)',
                      color: 'var(--foreground)'
                    }}
                  >
                    {speech.text}
                    <span className="absolute -bottom-1 left-3 w-2 h-2 rotate-45 transition-all duration-300" style={{ backgroundColor: 'var(--background)', borderLeft: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {/* Ambient sparkles */}
        <motion.div
          className="absolute left-10 bottom-16"
          animate={{ opacity: [0.2, 0.8, 0.2], y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{ color: 'rgba(20, 184, 166, 0.4)' }}
        >
          <Sparkles className="w-4 h-4" />
        </motion.div>
      </div>
    </div>
  );
}
