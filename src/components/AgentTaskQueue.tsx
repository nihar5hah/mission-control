'use client';

import { useMemo } from 'react';
import { useTasksBoard } from '@/hooks/useTasksBoard';
import { AGENT_CONFIG } from '@/types/agents';

export function AgentTaskQueue() {
  const { tasks } = useTasksBoard();

  const grouped = useMemo(() => {
    const map: Record<string, typeof tasks> = {};
    for (const task of tasks) {
      const owner = task.assigned_to || task.owner;
      if (!map[owner]) map[owner] = [];
      map[owner].push(task);
    }
    return map;
  }, [tasks]);

  return (
    <div className="apple-card p-4">
      <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Agent Task Queue</h3>
      <div className="space-y-3">
        {Object.entries(grouped).map(([agentId, agentTasks]) => {
          const config = AGENT_CONFIG[agentId as keyof typeof AGENT_CONFIG];
          const todo = agentTasks.filter((task) => task.status !== 'DONE');

          return (
            <div key={agentId} className="rounded-xl px-3 py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{config?.emoji}</span>
                  <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{config?.name || agentId}</span>
                </div>
                <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{todo.length} open</span>
              </div>
              {todo.slice(0, 3).map((task) => (
                <p key={task.id} className="text-[11px] mt-2" style={{ color: 'var(--text-tertiary)' }}>{task.title}</p>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
