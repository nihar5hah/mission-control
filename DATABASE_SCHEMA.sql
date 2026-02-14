-- Create Activities Table (Agent Logs)
CREATE TABLE IF NOT EXISTS activities (
  id BIGSERIAL PRIMARY KEY,
  agent TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Tasks Table (Scheduled Work)
CREATE TABLE IF NOT EXISTS tasks (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed')),
  day TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Documents Table (Searchable Data)
CREATE TABLE IF NOT EXISTS documents (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_activities_timestamp ON activities(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_tasks_scheduled ON tasks(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_documents_title ON documents USING GIN(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_documents_content ON documents USING GIN(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING GIN(tags);

-- Enable Row Level Security (RLS)
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create public read-access policies
CREATE POLICY "Enable read access for all users" ON activities FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON tasks FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON documents FOR SELECT USING (true);

-- Optional: Enable insert/update/delete for demo mode
CREATE POLICY "Enable all operations for demo" ON activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for demo" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for demo" ON documents FOR ALL USING (true) WITH CHECK (true);

-- Optional: Insert sample data
INSERT INTO activities (agent, action, description, status, timestamp) VALUES
('Main Agent', 'Build', 'Updated Mission Control dashboard UI', 'completed', NOW() - INTERVAL '5 minutes'),
('Main Agent', 'Research', 'Daily research report on AI architecture', 'completed', NOW() - INTERVAL '30 minutes'),
('Subagent', 'Review', 'Code review and validation completed', 'completed', NOW() - INTERVAL '1 hour'),
('Main Agent', 'Brief', 'Morning briefing delivered to team', 'completed', NOW() - INTERVAL '2 hours'),
('System', 'Sync', 'Data synchronization across nodes', 'running', NOW() - INTERVAL '15 minutes');

INSERT INTO tasks (title, scheduled_for, status, day) VALUES
('Morning Brief', NOW() + INTERVAL '1 day', 'pending', 'Monday'),
('Research Report', NOW() + INTERVAL '3 days', 'pending', 'Wednesday'),
('Code Review', NOW() + INTERVAL '5 days', 'pending', 'Friday'),
('Team Standup', NOW() + INTERVAL '7 days', 'pending', 'Sunday');

INSERT INTO documents (title, content, category, tags) VALUES
('API Documentation', 'Complete API reference with examples for integrating with external services. This guide covers authentication, rate limiting, and error handling.', 'documentation', ARRAY['api', 'reference']),
('Deployment Guide', 'Step-by-step guide for deploying to production environments. Includes setup, testing, and rollback procedures.', 'guide', ARRAY['deployment', 'production']),
('Architecture Overview', 'High-level system architecture and design patterns used throughout the application. Explains component relationships and data flow.', 'documentation', ARRAY['architecture', 'design']);
