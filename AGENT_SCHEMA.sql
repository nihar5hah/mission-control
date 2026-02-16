-- =====================================================
-- THE BEGU COMPANY - AGENT SYSTEM SCHEMA
-- Mission Control Revamp
-- =====================================================

-- Agent Definitions
-- 1. begubot - Chief of Staff (top level)
-- 2. coder - Employee (reports to begubot)
-- 3. researcher - Employee (reports to begubot)

-- =====================================================
-- AGENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY, -- 'begubot', 'coder', 'researcher'
  name TEXT NOT NULL,
  role TEXT NOT NULL, -- 'Chief of Staff', 'Employee'
  avatar_url TEXT,
  color TEXT NOT NULL DEFAULT '#5E6AD2', -- Theme color for the agent
  reports_to TEXT, -- NULL for top-level, agent_id for others
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert the three agents
INSERT INTO agents (id, name, role, color, reports_to) VALUES
  ('begubot', 'Begubot', 'Chief of Staff', '#8B5CF6', NULL),
  ('coder', 'Coder', 'Employee', '#10B981', 'begubot'),
  ('researcher', 'Researcher', 'Employee', '#F59E0B', 'begubot')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- AGENT ACTIVITIES TABLE
-- Tracks what each agent is doing/has done
-- =====================================================
CREATE TABLE IF NOT EXISTS agent_activities (
  id BIGSERIAL PRIMARY KEY,
  agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'building', 'researching', 'syncing', 'fixing', 'deploying', 'testing', 'idle', 'meeting'
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed', 'pending', 'idle')),
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast queries by agent
CREATE INDEX IF NOT EXISTS idx_agent_activities_agent_id ON agent_activities(agent_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_agent_activities_status ON agent_activities(status);
CREATE INDEX IF NOT EXISTS idx_agent_activities_timestamp ON agent_activities(timestamp DESC);

-- =====================================================
-- AGENT SESSIONS TABLE
-- Tracks active sessions for each agent
-- =====================================================
CREATE TABLE IF NOT EXISTS agent_sessions (
  id BIGSERIAL PRIMARY KEY,
  agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  session_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('active', 'idle', 'offline')),
  current_action TEXT, -- What the agent is currently doing
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Index for fast lookup of active sessions
CREATE INDEX IF NOT EXISTS idx_agent_sessions_agent_id ON agent_sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_status ON agent_sessions(status);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_session_key ON agent_sessions(session_key);

-- =====================================================
-- AGENT STATS TABLE
-- Aggregated statistics for each agent
-- =====================================================
CREATE TABLE IF NOT EXISTS agent_stats (
  id BIGSERIAL PRIMARY KEY,
  agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE UNIQUE,
  total_tokens_used BIGINT NOT NULL DEFAULT 0,
  total_tasks_completed BIGINT NOT NULL DEFAULT 0,
  total_tasks_failed BIGINT NOT NULL DEFAULT 0,
  total_uptime_seconds BIGINT NOT NULL DEFAULT 0,
  last_reset TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Daily stats (reset daily)
  daily_tokens_used BIGINT NOT NULL DEFAULT 0,
  daily_tasks_completed BIGINT NOT NULL DEFAULT 0,
  daily_active_seconds BIGINT NOT NULL DEFAULT 0,
  daily_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Initialize stats for each agent
INSERT INTO agent_stats (agent_id) VALUES
  ('begubot'),
  ('coder'),
  ('researcher')
ON CONFLICT (agent_id) DO NOTHING;

-- =====================================================
-- AGENT SCHEDULES TABLE
-- Scheduled tasks per agent
-- =====================================================
CREATE TABLE IF NOT EXISTS agent_schedules (
  id BIGSERIAL PRIMARY KEY,
  agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_for TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  recurrence TEXT, -- 'daily', 'weekly', 'monthly', NULL for one-time
  recurrence_config JSONB DEFAULT '{}'::jsonb, -- days of week, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_schedules_agent_id ON agent_schedules(agent_id, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_agent_schedules_status ON agent_schedules(status);
CREATE INDEX IF NOT EXISTS idx_agent_schedules_scheduled_for ON agent_schedules(scheduled_for);

-- =====================================================
-- AGENT DOCUMENTS TABLE
-- Documentation for each agent
-- =====================================================
CREATE TABLE IF NOT EXISTS agent_documents (
  id BIGSERIAL PRIMARY KEY,
  agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT, -- 'guide', 'config', 'memory', 'skills'
  tags TEXT[],
  source_file TEXT, -- Path to source file if synced
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_documents_agent_id ON agent_documents(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_documents_category ON agent_documents(category);
CREATE INDEX IF NOT EXISTS idx_agent_documents_search ON agent_documents USING GIN(to_tsvector('english', title || ' ' || content));

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_documents ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read access" ON agents FOR SELECT USING (true);
CREATE POLICY "Public read access" ON agent_activities FOR SELECT USING (true);
CREATE POLICY "Public read access" ON agent_sessions FOR SELECT USING (true);
CREATE POLICY "Public read access" ON agent_stats FOR SELECT USING (true);
CREATE POLICY "Public read access" ON agent_schedules FOR SELECT USING (true);
CREATE POLICY "Public read access" ON agent_documents FOR SELECT USING (true);

-- Full access for demo/development
CREATE POLICY "Full access for demo" ON agents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full access for demo" ON agent_activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full access for demo" ON agent_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full access for demo" ON agent_stats FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full access for demo" ON agent_schedules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full access for demo" ON agent_documents FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Sample activities
INSERT INTO agent_activities (agent_id, action, description, status, timestamp) VALUES
  ('begubot', 'coordinating', 'Managing daily operations and task assignments', 'running', NOW()),
  ('coder', 'building', 'Implementing new Mission Control features', 'running', NOW() - INTERVAL '10 minutes'),
  ('researcher', 'researching', 'Analyzing best practices for agent architecture', 'running', NOW() - INTERVAL '5 minutes'),
  ('begubot', 'meeting', 'Daily standup coordination', 'completed', NOW() - INTERVAL '1 hour'),
  ('coder', 'testing', 'Running integration tests for Supabase sync', 'completed', NOW() - INTERVAL '2 hours'),
  ('researcher', 'documenting', 'Creating documentation for new API endpoints', 'completed', NOW() - INTERVAL '3 hours');

-- Sample sessions
INSERT INTO agent_sessions (agent_id, session_key, status, current_action, started_at, last_active) VALUES
  ('begubot', 'begubot-main-session', 'active', 'coordinating', NOW() - INTERVAL '8 hours', NOW()),
  ('coder', 'coder-main-session', 'active', 'building', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '2 minutes'),
  ('researcher', 'researcher-main-session', 'active', 'researching', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '5 minutes');

-- Sample schedules
INSERT INTO agent_schedules (agent_id, title, description, scheduled_for, duration_minutes, recurrence) VALUES
  ('begubot', 'Morning Brief', 'Prepare and deliver daily briefing', NOW() + INTERVAL '1 day', 30, 'daily'),
  ('begubot', 'Team Coordination', 'Coordinate tasks between Coder and Researcher', NOW() + INTERVAL '4 hours', 60, NULL),
  ('coder', 'Code Review', 'Review pending pull requests', NOW() + INTERVAL '2 hours', 45, 'daily'),
  ('coder', 'Feature Development', 'Continue Mission Control dashboard work', NOW() + INTERVAL '6 hours', 120, NULL),
  ('researcher', 'Research Block', 'Deep research session on AI architectures', NOW() + INTERVAL '3 hours', 90, 'daily'),
  ('researcher', 'Documentation Update', 'Update project documentation', NOW() + INTERVAL '8 hours', 60, NULL);

-- Sample documents
INSERT INTO agent_documents (agent_id, title, content, category, tags) VALUES
  ('begubot', 'Chief of Staff Guide', 'Begubot is the Chief of Staff for The Begu Company. Responsibilities include: coordinating tasks between agents, managing schedules, delivering daily briefings, and ensuring smooth operations.', 'guide', ARRAY['role', 'responsibilities']),
  ('coder', 'Coding Standards', 'The Coder agent follows strict coding standards including: TypeScript best practices, component-based architecture, comprehensive testing, and clean code principles.', 'guide', ARRAY['coding', 'standards']),
  ('researcher', 'Research Methodology', 'The Researcher agent uses systematic research methods: web search, documentation analysis, best practice synthesis, and knowledge organization.', 'guide', ARRAY['research', 'methodology']);
