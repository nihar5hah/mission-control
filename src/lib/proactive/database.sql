-- Proactive Intelligence System - Database Schema
-- Run this SQL in your Supabase SQL Editor

-- =============================================
-- PROACTIVE ACTIONS - Autonomous actions taken by Begubot
-- =============================================
CREATE TABLE IF NOT EXISTS proactive_actions (
  id BIGSERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- 'notification', 'task_create', 'reminder', 'suggestion', 'auto_fix', 'sync'
  category VARCHAR(50) NOT NULL, -- 'time_management', 'automation', 'monetization', 'learning', 'collaboration'
  description TEXT NOT NULL,
  impact VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed', 'dismissed'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  source VARCHAR(100), -- What triggered this action (e.g., 'pattern_engine', 'opportunity_finder')
  confidence_score DECIMAL(3,2) -- 0.00-1.00 confidence in the action
);

-- =============================================
-- PATTERNS - Detected patterns in user behavior
-- =============================================
CREATE TABLE IF NOT EXISTS patterns (
  id BIGSERIAL PRIMARY KEY,
  category VARCHAR(50) NOT NULL, -- 'time', 'workflow', 'attention', 'opportunity'
  name VARCHAR(100) NOT NULL,
  pattern_data JSONB NOT NULL, -- The actual pattern data (times, frequencies, etc.)
  frequency VARCHAR(20) DEFAULT 'unknown', -- 'daily', 'weekly', 'monthly', 'rare', 'constant'
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  impact_score DECIMAL(3,2) DEFAULT 0.5, -- 0.00-1.00 how much this affects productivity
  confidence DECIMAL(3,2) DEFAULT 0.5, -- 0.00-1.00 confidence in the pattern
  occurrence_count INT DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  suggested_action TEXT -- What to do about this pattern
);

-- =============================================
-- OPPORTUNITIES - Potential value opportunities detected
-- =============================================
CREATE TABLE IF NOT EXISTS opportunities (
  id BIGSERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- 'monetization', 'automation', 'collaboration', 'learning'
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  potential_value VARCHAR(50), -- 'low', 'medium', 'high', 'transformative'
  effort_estimate VARCHAR(20), -- 'low', 'medium', 'high'
  status VARCHAR(20) DEFAULT 'discovered', -- 'discovered', 'investigating', 'validated', 'implemented', 'dismissed'
  source_pattern_id BIGINT REFERENCES patterns(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  implemented_at TIMESTAMPTZ,
  tags TEXT[] DEFAULT '{}',
  priority_score DECIMAL(3,2) DEFAULT 0.5 -- 0.00-1.00
);

-- =============================================
-- DECISIONS - Autonomous decision logs
-- =============================================
CREATE TABLE IF NOT EXISTS decisions (
  id BIGSERIAL PRIMARY KEY,
  context JSONB NOT NULL, -- The context/data that led to the decision
  decision VARCHAR(100) NOT NULL,
  reasoning TEXT NOT NULL,
  outcome TEXT, -- What happened after the decision
  confidence_score DECIMAL(3,2) DEFAULT 0.5,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'executed'
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  related_action_id BIGINT REFERENCES proactive_actions(id),
  metadata JSONB DEFAULT '{}'
);

-- =============================================
-- INTELLIGENCE CACHE - Cached external data for quick access
-- =============================================
CREATE TABLE IF NOT EXISTS intelligence_cache (
  id BIGSERIAL PRIMARY KEY,
  source VARCHAR(50) NOT NULL, -- 'github', 'vercel', 'calendar', 'filesystem'
  data_key VARCHAR(100) NOT NULL,
  data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source, data_key)
);

-- =============================================
-- USER PREFERENCES - For proactive system tuning
-- =============================================
CREATE TABLE IF NOT EXISTS proactive_preferences (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(50) DEFAULT 'default',
  preference_key VARCHAR(100) NOT NULL,
  preference_value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, preference_key)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_proactive_actions_status ON proactive_actions(status);
CREATE INDEX IF NOT EXISTS idx_proactive_actions_type ON proactive_actions(type);
CREATE INDEX IF NOT EXISTS idx_proactive_actions_created ON proactive_actions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_patterns_category ON patterns(category);
CREATE INDEX IF NOT EXISTS idx_patterns_last_seen ON patterns(last_seen DESC);
CREATE INDEX IF NOT EXISTS idx_patterns_active ON patterns(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_opportunities_type ON opportunities(type);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_priority ON opportunities(priority_score DESC);

CREATE INDEX IF NOT EXISTS idx_decisions_status ON decisions(status);
CREATE INDEX IF NOT EXISTS idx_decisions_created ON decisions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_intelligence_cache_source ON intelligence_cache(source);
CREATE INDEX IF NOT EXISTS idx_intelligence_cache_expires ON intelligence_cache(expires_at);

-- =============================================
-- REALTIME SUBSCRIPTIONS ENABLEMENT
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE proactive_actions;
ALTER PUBLICATION supabase_realtime ADD TABLE patterns;
ALTER PUBLICATION supabase_realtime ADD TABLE opportunities;
ALTER PUBLICATION supabase_realtime ADD TABLE decisions;
