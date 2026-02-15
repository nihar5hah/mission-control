-- ============================================================
-- SAMPLE DATA: Daily Recurring Tasks with Type Field
-- ============================================================
-- Insert daily recurring tasks that will appear on every day

-- Morning Brief - Daily
INSERT INTO tasks (title, description, scheduled_for, status, day, type) VALUES
('Morning Brief', 'Daily intelligence briefing from OpenClaw agents', NOW() + INTERVAL '1 hour', 'pending', 'Daily', 'daily')
ON CONFLICT DO NOTHING;

-- Daily Research - Daily  
INSERT INTO tasks (title, description, scheduled_for, status, day, type) VALUES
('Daily Research', 'Compile latest AI research findings and trends', NOW() + INTERVAL '5 hours', 'pending', 'Daily', 'daily')
ON CONFLICT DO NOTHING;

-- Night Shift - Daily
INSERT INTO tasks (title, description, scheduled_for, status, day, type) VALUES
('Night Shift Build', 'Run nightly automated build and test pipeline', NOW() + INTERVAL '20 hours', 'pending', 'Daily', 'daily')
ON CONFLICT DO NOTHING;

-- Eval System - Daily
INSERT INTO tasks (title, description, scheduled_for, status, day, type) VALUES
('Eval System', 'Run evaluation system for agent performance analysis', NOW() + INTERVAL '8 hours', 'completed', 'Daily', 'daily')
ON CONFLICT DO NOTHING;

-- ============================================================
-- One-time/Specific Date Tasks
-- ============================================================
INSERT INTO tasks (title, description, scheduled_for, status, day, type) VALUES
('Research Report', 'Compile weekly AI research findings', NOW() + INTERVAL '3 days', 'pending', 'Wednesday', 'one-time')
ON CONFLICT DO NOTHING;

INSERT INTO tasks (title, description, scheduled_for, status, day, type) VALUES
('Code Review', 'Review and validate mission-control integration', NOW() + INTERVAL '5 days', 'pending', 'Friday', 'one-time')
ON CONFLICT DO NOTHING;

INSERT INTO tasks (title, description, scheduled_for, status, day, type) VALUES
('System Maintenance', 'Database cleanup and optimization', NOW() + INTERVAL '7 days', 'pending', 'Sunday', 'one-time')
ON CONFLICT DO NOTHING;

-- Verify the data
-- SELECT id, title, type, status, scheduled_for, day FROM tasks ORDER BY created_at DESC;
