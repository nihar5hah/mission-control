export interface Activity {
  id: number;
  agent: string;
  action: string;
  description?: string;
  status: 'running' | 'completed' | 'failed' | 'pending';
  metadata?: Record<string, unknown>;
  timestamp: string;
  created_at: string;
}

export interface Task {
  id: number;
  title: string;
  scheduled_for: string;
  status: 'pending' | 'in_progress' | 'completed';
  day: string;
  type: 'daily' | 'one-time';
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: number;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface StudySubject {
  id: number;
  name: string;
  total_lectures: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface StudySession {
  id: number;
  subject_id: number;
  lecture_number: number;
  duration_minutes: number;
  notes?: string;
  completed_at: string;
  created_at: string;
}

export interface StudyStats {
  today_minutes: number;
  week_total: number;
  current_streak: number;
  timestamp: string;
}

// Insert types (id is auto-generated)
export type ActivityInsert = Omit<Activity, 'id' | 'created_at'>;
export type TaskInsert = Omit<Task, 'id' | 'created_at' | 'updated_at'>;
export type DocumentInsert = Omit<Document, 'id' | 'created_at' | 'updated_at'>;
export type StudySubjectInsert = Omit<StudySubject, 'id' | 'created_at' | 'updated_at'>;
export type StudySessionInsert = Omit<StudySession, 'id' | 'created_at'>;
