-- ============================================================
-- MIGRATION: Add 'type' field to tasks table
-- ============================================================
-- This migration adds support for task types (daily/one-time)
-- Required for proper calendar display of recurring tasks

-- Step 1: Add the type column with default value
ALTER TABLE tasks
ADD COLUMN type TEXT DEFAULT 'one-time' CHECK (type IN ('daily', 'one-time'));

-- Step 2: Update existing tasks with day='Daily' to have type='daily'
UPDATE tasks SET type = 'daily' WHERE day = 'Daily' OR day = 'daily';

-- Step 3: Ensure all other tasks have type='one-time'
UPDATE tasks SET type = 'one-time' WHERE type IS NULL;

-- Step 4: Add index for faster queries
CREATE INDEX idx_tasks_type ON tasks(type);

-- Verification: Check that all tasks have a valid type
-- SELECT id, title, day, type, scheduled_for FROM tasks ORDER BY created_at DESC;
