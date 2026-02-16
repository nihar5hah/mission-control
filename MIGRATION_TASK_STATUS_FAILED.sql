-- ============================================================
-- MIGRATION: Allow failed status for tasks and task_completions
-- ============================================================

-- Extend tasks.status to include 'failed'
ALTER TABLE tasks
  DROP CONSTRAINT IF EXISTS tasks_status_check;

ALTER TABLE tasks
  ADD CONSTRAINT tasks_status_check
  CHECK (status IN ('pending', 'in_progress', 'completed', 'failed'));

-- Extend task_completions.status to include 'failed'
ALTER TABLE task_completions
  DROP CONSTRAINT IF EXISTS task_completions_status_check;

ALTER TABLE task_completions
  ADD CONSTRAINT task_completions_status_check
  CHECK (status IN ('pending', 'in_progress', 'completed', 'failed'));
