-- ============================================================
-- MIGRATION: Task Completions for Date-Specific Tracking
-- Fixes: Daily tasks sync completion across all days
-- ============================================================

-- Create task_completions table to track per-date completion status
CREATE TABLE IF NOT EXISTS task_completions (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  completion_date DATE NOT NULL,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'in_progress', 'completed')),
  completed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(task_id, completion_date)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_task_completions_task_date ON task_completions(task_id, completion_date);
CREATE INDEX IF NOT EXISTS idx_task_completions_date ON task_completions(completion_date);

-- Row Level Security
ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON task_completions FOR SELECT USING (true);
CREATE POLICY "Enable insert for demo" ON task_completions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for demo" ON task_completions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for demo" ON task_completions FOR DELETE USING (true);

-- Enable real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE task_completions;

-- ============================================================
-- HOW IT WORKS:
-- ============================================================
-- For daily tasks:
--   - The task table stores the template (title, type='daily')
--   - task_completions stores completion status per date
--   - When you mark a daily task complete on Monday, it creates:
--     INSERT INTO task_completions (task_id, completion_date, status)
--     VALUES (task_id, '2026-02-16', 'completed')
--   - Tuesday will have no record, so it shows as pending
--
-- For one-time tasks:
--   - Completion status is stored in the tasks.status field (existing behavior)
--   - No task_completions record needed
-- ============================================================
