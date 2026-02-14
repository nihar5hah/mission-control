'use client';

import { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Flag,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  scheduledDate: string;
  scheduledTime?: string;
  tags?: string[];
}

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 14));

  const tasks: Task[] = [
    {
      id: '1',
      title: 'Database Migration',
      priority: 'critical',
      status: 'in_progress',
      scheduledDate: '2026-02-14',
      scheduledTime: '14:00',
    },
    {
      id: '2',
      title: 'Code Review Sprint',
      priority: 'high',
      status: 'pending',
      scheduledDate: '2026-02-15',
      scheduledTime: '10:00',
    },
    {
      id: '3',
      title: 'Team Standup',
      priority: 'medium',
      status: 'pending',
      scheduledDate: '2026-02-16',
      scheduledTime: '09:30',
    },
    {
      id: '4',
      title: 'Deploy to Production',
      priority: 'critical',
      status: 'pending',
      scheduledDate: '2026-02-18',
      scheduledTime: '20:00',
    },
    {
      id: '5',
      title: 'Documentation Update',
      priority: 'medium',
      status: 'pending',
      scheduledDate: '2026-02-20',
      scheduledTime: '15:00',
    },
    {
      id: '6',
      title: 'Security Audit',
      priority: 'high',
      status: 'pending',
      scheduledDate: '2026-02-21',
      scheduledTime: '11:00',
    },
  ];

  const getWeekDays = (date: Date) => {
    const week = [];
    const curr = new Date(date);
    const first = curr.getDate() - curr.getDay();
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(curr.setDate(first + i));
      week.push(new Date(day));
    }
    return week;
  };

  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500/20 border-red-500/50 text-red-400';
      case 'high':
        return 'bg-orange-500/20 border-orange-500/50 text-orange-400';
      case 'medium':
        return 'bg-amber-500/20 border-amber-500/50 text-amber-400';
      default:
        return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'completed') return <CheckCircle className="w-3 h-3" />;
    if (status === 'in_progress') return <Clock className="w-3 h-3 animate-spin" />;
    return <Flag className="w-3 h-3" />;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getTasksForDay = (date: Date) => {
    const dateStr = formatDate(date);
    return tasks.filter((t) => t.scheduledDate === dateStr);
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const previousWeek = () => {
    setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)));
  };

  const nextWeek = () => {
    setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)));
  };

  const goToToday = () => {
    setCurrentDate(new Date(2026, 1, 14));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-cyan-400" />
            {monthName}
          </h2>
          <p className="text-sm text-slate-400 mt-1">Week of {weekDays[0].toLocaleDateString()} - {weekDays[6].toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={previousWeek}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button variant="outline" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={nextWeek}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Week View */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, idx) => {
          const dayTasks = getTasksForDay(day);
          const isToday = day.toDateString() === new Date(2026, 1, 14).toDateString();
          const isWeekend = idx === 0 || idx === 6;

          return (
            <Card
              key={day.toString()}
              className={`rounded-lg min-h-96 flex flex-col ${
                isToday
                  ? 'bg-slate-900/50 border-cyan-500/50'
                  : isWeekend
                  ? 'bg-slate-900/30 border-slate-800'
                  : 'bg-slate-900/50 border-slate-800'
              }`}
            >
              <CardHeader className="pb-2">
                <p className="text-xs font-semibold text-slate-400 uppercase">
                  {dayNames[idx]}
                </p>
                <p className={`text-2xl font-bold ${isToday ? 'text-cyan-400' : 'text-slate-200'}`}>
                  {day.getDate()}
                </p>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                <div className="space-y-2">
                  {dayTasks.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">No tasks</p>
                  ) : (
                    dayTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`p-2 rounded text-xs border cursor-pointer hover:shadow-lg transition-all group ${getPriorityColor(task.priority)}`}
                      >
                        <div className="flex items-start gap-2">
                          <div className="mt-0.5">{getStatusIcon(task.status)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate group-hover:text-white">
                              {task.title}
                            </p>
                            {task.scheduledTime && (
                              <p className="text-xs opacity-75 mt-0.5">{task.scheduledTime}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Upcoming Tasks Summary */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-cyan-400" />
            Upcoming Critical Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tasks
              .filter((t) => t.priority === 'critical' || t.priority === 'high')
              .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
              .map((task) => (
                <div key={task.id} className="flex items-center gap-3 pb-3 border-b border-slate-800 last:border-0 last:pb-0">
                  <div className={`flex-shrink-0 rounded p-2 ${getPriorityColor(task.priority)}`}>
                    {getStatusIcon(task.status)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-200">{task.title}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(task.scheduledDate).toLocaleDateString()} {task.scheduledTime || ''}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                    {task.priority.toUpperCase()}
                  </span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
