'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStudySubjects, useStudySessions, useStudyStats } from '@/hooks/useStudyTracker';
import {
  Plus,
  Trash2,
  BookOpen,
  Flame,
  Clock,
  TrendingUp,
} from 'lucide-react';

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export function StudyTracker() {
  const { subjects, addSubject, deleteSubject } = useStudySubjects();
  const { sessions, addSession, deleteSession } = useStudySessions();
  const { stats } = useStudyStats();

  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showLogSession, setShowLogSession] = useState<number | null>(null);
  const [subjectForm, setSubjectForm] = useState({ name: '', totalLectures: '' });
  const [sessionForm, setSessionForm] = useState({
    lectureNumber: '',
    durationMinutes: '',
    notes: '',
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'subject' | 'session'; id: number } | null>(null);

  // Calculate progress for a subject
  const getSubjectProgress = (subjectId: number) => {
    const subjectSessions = sessions.filter((s) => s.subject_id === subjectId);
    const completedLectures = new Set(subjectSessions.map((s) => s.lecture_number)).size;
    const subject = subjects.find((s) => s.id === subjectId);
    return {
      completed: completedLectures,
      total: subject?.total_lectures || 0,
      percentage: subject?.total_lectures ? (completedLectures / subject.total_lectures) * 100 : 0,
    };
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectForm.name || !subjectForm.totalLectures) return;

    try {
      await addSubject(subjectForm.name, parseInt(subjectForm.totalLectures));
      setSubjectForm({ name: '', totalLectures: '' });
      setShowAddSubject(false);
    } catch (error) {
      console.error('Error adding subject:', error);
    }
  };

  const handleLogSession = async (subjectId: number, e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionForm.lectureNumber || !sessionForm.durationMinutes) return;

    try {
      await addSession(
        subjectId,
        parseInt(sessionForm.lectureNumber),
        parseInt(sessionForm.durationMinutes),
        sessionForm.notes
      );
      setSessionForm({ lectureNumber: '', durationMinutes: '', notes: '' });
      setShowLogSession(null);
    } catch (error) {
      console.error('Error logging session:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      if (deleteConfirm.type === 'subject') {
        await deleteSubject(deleteConfirm.id);
      } else {
        await deleteSession(deleteConfirm.id);
      }
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Stats Header */}
      <motion.div variants={item} className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-[#1a1a1a] border border-[#5E6AD2]/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#888] text-sm">Today's Study</p>
              <p className="text-white text-2xl font-bold mt-1">{stats.today_minutes} min</p>
            </div>
            <Clock className="text-[#5E6AD2]" size={24} />
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#1a1a1a] border border-[#5E6AD2]/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#888] text-sm">Current Streak</p>
              <p className="text-white text-2xl font-bold mt-1">{stats.current_streak} days</p>
            </div>
            <Flame className="text-[#F59E0B]" size={24} />
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#1a1a1a] border border-[#5E6AD2]/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#888] text-sm">Week Total</p>
              <p className="text-white text-2xl font-bold mt-1">{stats.week_total} min</p>
            </div>
            <TrendingUp className="text-[#10B981]" size={24} />
          </div>
        </div>
      </motion.div>

      {/* Subjects List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white text-lg font-semibold">Subjects</h3>
          <button
            onClick={() => setShowAddSubject(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#5E6AD2]/20 text-[#5E6AD2] hover:bg-[#5E6AD2]/30 transition-colors text-sm"
          >
            <Plus size={16} />
            Add Subject
          </button>
        </div>

        {subjects.length === 0 ? (
          <div className="p-8 text-center rounded-lg bg-[#1a1a1a] border border-[#333]">
            <BookOpen className="mx-auto mb-3 text-[#888]" size={32} />
            <p className="text-[#888]">No subjects yet. Add one to get started!</p>
          </div>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
            {subjects.map((subject) => {
              const progress = getSubjectProgress(subject.id);
              const subjectSessions = sessions.filter((s) => s.subject_id === subject.id);

              return (
                <motion.div
                  key={subject.id}
                  variants={item}
                  className="p-4 rounded-lg bg-[#1a1a1a] border border-[#333] hover:border-[#5E6AD2]/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-white font-semibold">{subject.name}</h4>
                      {subject.description && (
                        <p className="text-[#888] text-sm mt-1">{subject.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowLogSession(subject.id)}
                        className="px-3 py-1 rounded text-sm bg-[#5E6AD2]/20 text-[#5E6AD2] hover:bg-[#5E6AD2]/30 transition-colors"
                      >
                        Log Session
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ type: 'subject', id: subject.id })}
                        className="p-1.5 rounded hover:bg-red-500/10 text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[#888] text-sm">
                        {progress.completed}/{progress.total} lectures
                      </span>
                      <span className="text-[#5E6AD2] text-sm font-semibold">
                        {Math.round(progress.percentage)}%
                      </span>
                    </div>
                    <div className="h-2 bg-[#333] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#5E6AD2] to-[#8B5CF6] transition-all duration-300"
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Recent Sessions */}
                  {subjectSessions.length > 0 && (
                    <div className="space-y-2 pt-3 border-t border-[#333]">
                      <p className="text-[#888] text-xs font-semibold uppercase tracking-wide">
                        Recent Sessions
                      </p>
                      {subjectSessions.slice(0, 3).map((session) => (
                        <div key={session.id} className="flex items-center justify-between text-sm bg-[#0D0D0D] p-2 rounded">
                          <span className="text-[#888]">
                            Lecture {session.lecture_number} • {session.duration_minutes} min
                          </span>
                          <button
                            onClick={() => setDeleteConfirm({ type: 'session', id: session.id })}
                            className="p-1 hover:bg-red-500/10 text-red-400/50 hover:text-red-400 transition-colors rounded"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Add Subject Modal */}
      {showAddSubject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0D0D0D] rounded-lg p-6 max-w-md w-full border border-[#5E6AD2]/30"
          >
            <h3 className="text-white font-semibold mb-4">Add Subject</h3>
            <form onSubmit={handleAddSubject} className="space-y-4">
              <input
                type="text"
                placeholder="Subject Name (e.g., Financial Reporting)"
                value={subjectForm.name}
                onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                className="w-full px-3 py-2 rounded bg-[#1a1a1a] border border-[#333] text-white placeholder-[#666] focus:outline-none focus:border-[#5E6AD2]"
              />
              <input
                type="number"
                placeholder="Total Lectures"
                value={subjectForm.totalLectures}
                onChange={(e) => setSubjectForm({ ...subjectForm, totalLectures: e.target.value })}
                className="w-full px-3 py-2 rounded bg-[#1a1a1a] border border-[#333] text-white placeholder-[#666] focus:outline-none focus:border-[#5E6AD2]"
              />
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddSubject(false)}
                  className="flex-1 px-4 py-2 rounded bg-[#333] text-white hover:bg-[#444] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded bg-[#5E6AD2] text-white hover:bg-[#7E7CE2] transition-colors"
                >
                  Add Subject
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Log Session Modal */}
      {showLogSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0D0D0D] rounded-lg p-6 max-w-md w-full border border-[#5E6AD2]/30"
          >
            <h3 className="text-white font-semibold mb-4">Log Study Session</h3>
            <form
              onSubmit={(e) => handleLogSession(showLogSession, e)}
              className="space-y-4"
            >
              <input
                type="number"
                placeholder="Lecture Number"
                min="1"
                value={sessionForm.lectureNumber}
                onChange={(e) => setSessionForm({ ...sessionForm, lectureNumber: e.target.value })}
                className="w-full px-3 py-2 rounded bg-[#1a1a1a] border border-[#333] text-white placeholder-[#666] focus:outline-none focus:border-[#5E6AD2]"
              />
              <input
                type="number"
                placeholder="Duration (minutes)"
                min="1"
                value={sessionForm.durationMinutes}
                onChange={(e) => setSessionForm({ ...sessionForm, durationMinutes: e.target.value })}
                className="w-full px-3 py-2 rounded bg-[#1a1a1a] border border-[#333] text-white placeholder-[#666] focus:outline-none focus:border-[#5E6AD2]"
              />
              <textarea
                placeholder="Notes (optional)"
                value={sessionForm.notes}
                onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })}
                className="w-full px-3 py-2 rounded bg-[#1a1a1a] border border-[#333] text-white placeholder-[#666] focus:outline-none focus:border-[#5E6AD2] h-24 resize-none"
              />
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowLogSession(null)}
                  className="flex-1 px-4 py-2 rounded bg-[#333] text-white hover:bg-[#444] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded bg-[#5E6AD2] text-white hover:bg-[#7E7CE2] transition-colors"
                >
                  Log Session
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0D0D0D] rounded-lg p-6 max-w-sm w-full border border-red-500/30"
          >
            <h3 className="text-white font-semibold mb-2">Delete Confirmation</h3>
            <p className="text-[#888] mb-6">
              {deleteConfirm.type === 'subject'
                ? 'Are you sure? This will delete the subject and all its sessions.'
                : 'Are you sure? This will delete the study session.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 rounded bg-[#333] text-white hover:bg-[#444] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
