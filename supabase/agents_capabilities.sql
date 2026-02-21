-- Add capabilities + workload to agents
alter table agents add column if not exists capabilities text[] default '{}';
alter table agents add column if not exists current_workload int default 0;

-- Example capabilities
update agents set capabilities = ARRAY['coding','frontend','backend','deployment'] where id = 'coder';
update agents set capabilities = ARRAY['research','analysis','web-search'] where id = 'researcher';
update agents set capabilities = ARRAY['analysis','learning-extraction','summarization'] where id = 'extractor';
update agents set capabilities = ARRAY['coordination','planning','review'] where id = 'begubot';
