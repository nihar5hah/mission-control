-- ============================================================
-- MISSION CONTROL DATABASE SCHEMA
-- For real-time integration with Begubot via Supabase
-- ============================================================

-- 1. ACTIVITIES TABLE (logs of Begubot actions)
DROP TABLE IF EXISTS activities CASCADE;
CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  agent TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'completed',
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  timestamp TIMESTAMP DEFAULT NOW()
);

-- 2. TASKS TABLE (scheduled tasks)
DROP TABLE IF EXISTS tasks CASCADE;
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_for TIMESTAMP,
  status TEXT DEFAULT 'pending',
  day TEXT,
  type TEXT DEFAULT 'one-time' CHECK (type IN ('daily', 'one-time')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. DOCUMENTS TABLE (searchable content)
DROP TABLE IF EXISTS documents CASCADE;
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX idx_activities_timestamp ON activities(timestamp DESC);
CREATE INDEX idx_activities_status ON activities(status);
CREATE INDEX idx_activities_agent ON activities(agent);
CREATE INDEX idx_tasks_scheduled ON tasks(scheduled_for);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_documents_title ON documents USING GIN(to_tsvector('english', title));
CREATE INDEX idx_documents_content ON documents USING GIN(to_tsvector('english', content));
CREATE INDEX idx_documents_tags ON documents USING GIN(tags);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables
CREATE POLICY "Enable read access for all users" ON activities FOR SELECT USING (true);
CREATE POLICY "Enable insert for demo" ON activities FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for demo" ON activities FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON tasks FOR SELECT USING (true);
CREATE POLICY "Enable insert for demo" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for demo" ON tasks FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for demo" ON tasks FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON documents FOR SELECT USING (true);
CREATE POLICY "Enable insert for demo" ON documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for demo" ON documents FOR UPDATE USING (true) WITH CHECK (true);

-- ============================================================
-- ENABLE REAL-TIME SUBSCRIPTIONS
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE activities;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE documents;

-- ============================================================
-- SAMPLE DATA
-- ============================================================
-- Insert sample activities
INSERT INTO activities (agent, action, description, status, metadata, timestamp) VALUES
('Main Agent', 'agent-start', 'Mission Control dashboard initialized', 'completed', '{"duration": 1200, "tokens": 450}', NOW() - INTERVAL '5 minutes'),
('Begubot', 'api-call', 'Fetched Telegram messages from core', 'completed', '{"duration": 2300, "api": "telegram", "tokens": 750}', NOW() - INTERVAL '30 minutes'),
('Subagent', 'file-create', 'Created MEMORY.md for session tracking', 'completed', '{"duration": 850, "files": 1}', NOW() - INTERVAL '1 hour'),
('Main Agent', 'db-query', 'Queried activity log from Supabase', 'completed', '{"duration": 320, "rows": 150}', NOW() - INTERVAL '2 hours'),
('System', 'memory-save', 'Saved agent memory to persistent storage', 'completed', '{"duration": 560, "tokens": 200}', NOW() - INTERVAL '3 hours'),
('Begubot', 'agent-complete', 'Task processing pipeline completed', 'completed', '{"duration": 5600, "tokens": 2100}', NOW() - INTERVAL '4 hours'),
('Main Agent', 'git-commit', 'Committed latest changes to master', 'completed', '{"commit": "abc123", "files": 5}', NOW() - INTERVAL '5 hours'),
('Subagent', 'memory-recall', 'Retrieved context from MEMORY.md', 'completed', '{"tokens": 300}', NOW() - INTERVAL '6 hours');

-- Insert sample tasks
INSERT INTO tasks (title, description, scheduled_for, status, day) VALUES
('Morning Brief', 'Daily briefing from OpenClaw agents', NOW() + INTERVAL '1 day', 'pending', 'Monday'),
('Research Report', 'Compile weekly AI research findings', NOW() + INTERVAL '3 days', 'pending', 'Wednesday'),
('Code Review', 'Review and validate mission-control integration', NOW() + INTERVAL '5 days', 'pending', 'Friday'),
('System Maintenance', 'Database cleanup and optimization', NOW() + INTERVAL '7 days', 'pending', 'Sunday'),
('Begubot Sync', 'Synchronize Begubot state with Supabase', NOW() + INTERVAL '2 hours', 'pending', 'Today');

-- Insert sample documents
INSERT INTO documents (title, content, category, tags, metadata) VALUES
('Supabase Real-time Setup', 'Complete guide for setting up real-time subscriptions with Supabase. This integration allows the Mission Control dashboard to receive live updates from Begubot activities. Tables: activities, tasks, documents.', 'documentation', ARRAY['setup', 'supabase', 'realtime'], '{"version": "2.0", "author": "OpenClaw"}'),
('Begubot API Integration', 'Reference documentation for Begubot message passing protocol. Includes agent communication, task scheduling, and memory management APIs.', 'guide', ARRAY['api', 'begubot', 'integration'], '{"version": "1.5", "updated": "2026-02-14"}'),
('Dashboard Feature Overview', 'Complete feature set for Mission Control dashboard: activity log, task scheduler, global search, real-time subscriptions, and agent monitoring.', 'documentation', ARRAY['dashboard', 'features', 'guide'], '{"status": "active", "last_updated": "2026-02-14"}');
