-- Seed sample agent activities (optional)
INSERT INTO agent_activities (agent_id, action, description, status, metadata, timestamp)
VALUES
  ('begubot', 'coordinating', 'Coordinating daily priorities and assignments', 'running', '{}', NOW()),
  ('begubot', 'meeting', 'Leading standup with team leads', 'completed', '{}', NOW() - INTERVAL '30 minutes'),
  ('begubot', 'syncing', 'Syncing roadmap updates to dashboard', 'completed', '{}', NOW() - INTERVAL '1 hour'),
  ('coder', 'building', 'Building responsive Mission Control layout', 'running', '{}', NOW()),
  ('coder', 'testing', 'Testing Office Playground animations', 'completed', '{}', NOW() - INTERVAL '25 minutes'),
  ('coder', 'fixing', 'Fixing mobile layout overflow', 'completed', '{}', NOW() - INTERVAL '55 minutes'),
  ('researcher', 'researching', 'Researching best practices for agent telemetry', 'running', '{}', NOW()),
  ('researcher', 'documenting', 'Documenting agent sync workflow', 'completed', '{}', NOW() - INTERVAL '40 minutes'),
  ('researcher', 'analyzing', 'Analyzing token usage patterns', 'completed', '{}', NOW() - INTERVAL '2 hours');
