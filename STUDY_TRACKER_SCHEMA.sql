-- ============================================================
-- STUDY TRACKER SCHEMA
-- For tracking ICAI lecture progress and study sessions
-- ============================================================

-- STUDY SUBJECTS TABLE
-- Tracks subjects/courses (e.g., Financial Reporting, Law, etc.)
CREATE TABLE IF NOT EXISTS study_subjects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  total_lectures INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- STUDY SESSIONS TABLE
-- Individual study sessions with lecture progress and time tracking
CREATE TABLE IF NOT EXISTS study_sessions (
  id SERIAL PRIMARY KEY,
  subject_id INTEGER NOT NULL REFERENCES study_subjects(id) ON DELETE CASCADE,
  lecture_number INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_study_subjects_name ON study_subjects(name);
CREATE INDEX IF NOT EXISTS idx_study_sessions_subject ON study_sessions(subject_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_created ON study_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_sessions_completed ON study_sessions(completed_at);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE study_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

-- Public read/write access for all users (demo mode)
CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON study_subjects FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Enable insert for demo" ON study_subjects FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Enable update for demo" ON study_subjects FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Enable delete for demo" ON study_subjects FOR DELETE USING (true);

CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON study_sessions FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Enable insert for demo" ON study_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Enable update for demo" ON study_sessions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Enable delete for demo" ON study_sessions FOR DELETE USING (true);

-- ============================================================
-- ENABLE REAL-TIME SUBSCRIPTIONS
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE study_subjects;
ALTER PUBLICATION supabase_realtime ADD TABLE study_sessions;

-- ============================================================
-- SAMPLE DATA (Optional - comment out if not needed)
-- ============================================================
-- INSERT INTO study_subjects (name, total_lectures, description) VALUES
-- ('Financial Reporting', 50, 'ICAI Financial Reporting Module'),
-- ('Taxation', 45, 'ICAI Taxation and Compliance'),
-- ('Law', 40, 'Corporate and Business Law');
