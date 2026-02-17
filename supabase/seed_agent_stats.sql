-- Seed realistic agent stats (run in Supabase SQL editor)
UPDATE agent_stats SET 
  total_tokens_used = 500000,
  daily_tokens_used = 45000,
  total_tasks_completed = 150,
  daily_tasks_completed = 12,
  daily_active_seconds = 14400
WHERE agent_id = 'begubot';

UPDATE agent_stats SET 
  total_tokens_used = 1200000,
  daily_tokens_used = 95000,
  total_tasks_completed = 89,
  daily_tasks_completed = 8,
  daily_active_seconds = 28800
WHERE agent_id = 'coder';

UPDATE agent_stats SET 
  total_tokens_used = 350000,
  daily_tokens_used = 28000,
  total_tasks_completed = 45,
  daily_tasks_completed = 5,
  daily_active_seconds = 10800
WHERE agent_id = 'researcher';
