-- Migration: Add work_sessions table and enhance activities
-- Run this in Supabase SQL Editor

-- Work Sessions Table
CREATE TABLE IF NOT EXISTS work_sessions (
  id BIGSERIAL PRIMARY KEY,
  agent_id TEXT NOT NULL DEFAULT 'begu',
  session_type TEXT NOT NULL CHECK (session_type IN ('focus', 'break', 'admin', 'meeting', 'learning')),
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  completed BOOLEAN DEFAULT true,
  project_id TEXT,
  task_id BIGINT REFERENCES tasks(id) ON DELETE SET NULL,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for work_sessions
CREATE INDEX IF NOT EXISTS idx_work_sessions_agent_id ON work_sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_work_sessions_started_at ON work_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_work_sessions_session_type ON work_sessions(session_type);

-- Add missing columns to activities if needed
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'metadata') THEN
    ALTER TABLE activities ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'tokens_used') THEN
    ALTER TABLE activities ADD COLUMN tokens_used INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'duration_ms') THEN
    ALTER TABLE activities ADD COLUMN duration_ms INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create index for overnight queries
CREATE INDEX IF NOT EXISTS idx_activities_timestamp_desc ON activities(timestamp DESC);

-- Row Level Security (optional - uncomment if needed)
-- ALTER TABLE work_sessions ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all for now" ON work_sessions FOR ALL USING (true);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_work_sessions_updated_at ON work_sessions;
CREATE TRIGGER update_work_sessions_updated_at
  BEFORE UPDATE ON work_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON work_sessions TO anon, authenticated, service_role;

-- Sample data for testing (optional)
-- INSERT INTO work_sessions (agent_id, session_type, duration_seconds, completed) VALUES
--   ('begu', 'focus', 1500, true),
--   ('begu', 'break', 300, true);
