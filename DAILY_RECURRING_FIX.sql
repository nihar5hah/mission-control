-- Add Daily Recurring Tasks for Mission Control
-- These tasks should appear on every day of the week

-- Clear old sample tasks if they exist
DELETE FROM tasks WHERE day != 'Daily';

-- Insert new daily recurring tasks
INSERT INTO tasks (title, scheduled_for, status, day) VALUES
('Morning Brief', NOW() + INTERVAL '1 hour', 'pending', 'Daily'),
('Daily Research Report', NOW() + INTERVAL '5 hours 30 minutes', 'pending', 'Daily'),
('Night Shift Build', NOW() + INTERVAL '20 hours 30 minutes', 'pending', 'Daily'),
('Eval System Run', NOW() + INTERVAL '8 hours', 'completed', 'Daily');

-- Verify the tasks were created
SELECT id, title, day, status, scheduled_for FROM tasks ORDER BY scheduled_for;
