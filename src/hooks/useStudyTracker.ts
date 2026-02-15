'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { StudySubject, StudySession, StudyStats } from '@/types/database';

// Study Subjects Hook
export function useStudySubjects() {
  const [subjects, setSubjects] = useState<StudySubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndSubscribe = async () => {
      try {
        const response = await fetch('/api/study/subjects');
        const data = await response.json();
        setSubjects(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch subjects');
        setLoading(false);
      }
    };

    fetchAndSubscribe();

    // Real-time subscription
    const channel = supabase
      .channel('study_subjects_channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'study_subjects'
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setSubjects((prev) => [payload.new as StudySubject, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setSubjects((prev) =>
            prev.map((s) => s.id === payload.new.id ? payload.new as StudySubject : s)
          );
        } else if (payload.eventType === 'DELETE') {
          setSubjects((prev) => prev.filter((s) => s.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addSubject = async (name: string, totalLectures: number, description?: string) => {
    try {
      const response = await fetch('/api/study/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          total_lectures: totalLectures,
          description: description || ''
        }),
      });
      const newSubject = await response.json();
      setSubjects((prev) => [newSubject, ...prev]);
      return newSubject;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add subject');
      throw err;
    }
  };

  const deleteSubject = async (id: number) => {
    try {
      await supabase.from('study_subjects').delete().eq('id', id);
      setSubjects((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete subject');
      throw err;
    }
  };

  return { subjects, loading, error, addSubject, deleteSubject };
}

// Study Sessions Hook
export function useStudySessions(subjectId?: number) {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndSubscribe = async () => {
      try {
        const url = subjectId 
          ? `/api/study/sessions?subject_id=${subjectId}`
          : '/api/study/sessions';
        const response = await fetch(url);
        const data = await response.json();
        setSessions(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch sessions');
        setLoading(false);
      }
    };

    fetchAndSubscribe();

    // Real-time subscription
    const channel = supabase
      .channel('study_sessions_channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'study_sessions'
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newSession = payload.new as StudySession;
          if (!subjectId || newSession.subject_id === subjectId) {
            setSessions((prev) => [newSession, ...prev]);
          }
        } else if (payload.eventType === 'UPDATE') {
          setSessions((prev) =>
            prev.map((s) => s.id === payload.new.id ? payload.new as StudySession : s)
          );
        } else if (payload.eventType === 'DELETE') {
          setSessions((prev) => prev.filter((s) => s.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [subjectId]);

  const addSession = async (
    subjectId: number,
    lectureNumber: number,
    durationMinutes: number,
    notes?: string
  ) => {
    try {
      const response = await fetch('/api/study/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject_id: subjectId,
          lecture_number: lectureNumber,
          duration_minutes: durationMinutes,
          notes: notes || ''
        }),
      });
      const newSession = await response.json();
      setSessions((prev) => [newSession, ...prev]);
      return newSession;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add session');
      throw err;
    }
  };

  const deleteSession = async (id: number) => {
    try {
      await fetch(`/api/study/sessions?id=${id}`, { method: 'DELETE' });
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete session');
      throw err;
    }
  };

  return { sessions, loading, error, addSession, deleteSession };
}

// Study Stats Hook
export function useStudyStats() {
  const [stats, setStats] = useState<StudyStats>({
    today_minutes: 0,
    week_total: 0,
    current_streak: 0,
    timestamp: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/study/stats');
        const data = await response.json();
        setStats(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stats');
        setLoading(false);
      }
    };

    fetchStats();

    // Refresh stats every minute
    const interval = setInterval(fetchStats, 60000);

    return () => clearInterval(interval);
  }, []);

  return { stats, loading, error };
}

// Global sessions state (for managing sessions across the app)
let globalSessionsState: StudySession[] = [];

export function getGlobalSession(id: number): StudySession | undefined {
  return globalSessionsState.find((s) => s.id === id);
}

export async function deleteGlobalSession(id: number) {
  try {
    await fetch(`/api/study/sessions?id=${id}`, { method: 'DELETE' });
    globalSessionsState = globalSessionsState.filter((s) => s.id !== id);
  } catch (err) {
    console.error('Failed to delete session:', err);
    throw err;
  }
}
