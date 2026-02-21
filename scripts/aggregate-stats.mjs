#!/usr/bin/env node
// Aggregate agent stats and update agent_stats table
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qbtlslagwbgrnnuaasma.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFidGxzbGFnd2Jncm5udWFhc21hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwOTAzNzksImV4cCI6MjA4NjY2NjM3OX0.95mIKqkW4Q6wtx6vvJk_XdDVK8vobmX2v98f1KRITSk';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const today = new Date().toISOString().split('T')[0];

console.log(`📊 Aggregating stats for ${today}...\n`);

// Get today's activities
const { data: activities, error } = await supabase
  .from('agent_activities')
  .select('agent_id, action, status, metadata, timestamp')
  .gte('timestamp', `${today}T00:00:00Z`);

if (error) {
  console.error('Error fetching activities:', error);
  process.exit(1);
}

// Aggregate by agent
const stats = {};
for (const a of activities || []) {
  if (!stats[a.agent_id]) {
    stats[a.agent_id] = { tokens: 0, tasks: 0, seconds: 0 };
  }
  
  const tokensFromMeta = Number(a.metadata?.tokens_used || 0);
  const secondsFromMeta = Number(a.metadata?.active_seconds || a.metadata?.duration_seconds || 0);
  
  stats[a.agent_id].tokens += tokensFromMeta;
  stats[a.agent_id].seconds += secondsFromMeta;
  if (a.status === 'completed') stats[a.agent_id].tasks++;
}

// Special handling for Begubot: estimate tokens based on tasks and work done
// Begubot coordinates other agents and processes messages, so it has hidden work
if (stats['begubot']) {
  // If tokens seem low (only from sync activities), estimate based on:
  // - Number of tasks coordinated (each task = ~500-2000 tokens for coordination)
  // - Number of sessions managed
  // - Messages processed
  
  const begubotTasks = stats['begubot'].tasks || 0;
  const begubotSeconds = stats['begubot'].seconds || 0;
  const loggedTokens = stats['begubot'].tokens || 0;
  
  // Estimate: if logged tokens < 1000 but tasks > 0, it's undercounted
  // Estimate ~1000 tokens per task coordinated, minimum 5000 per day for active coordination
  const estimatedTokens = Math.max(
    loggedTokens,
    begubotTasks * 800,  // ~800 tokens per task
    Math.min(begubotSeconds * 2, 50000)  // ~2 tokens per second, capped at 50k
  );
  
  stats['begubot'].tokens = estimatedTokens;
  console.log(`🔧 Begubot: estimated ${estimatedTokens} tokens (${begubotTasks} tasks, ${begubotSeconds}s active)`);
}

// Update agent_stats
for (const [agent_id, data] of Object.entries(stats)) {
  const { error: updateError } = await supabase
    .from('agent_stats')
    .update({
      daily_tokens_used: data.tokens,
      daily_tasks_completed: data.tasks,
      daily_active_seconds: data.seconds,
      daily_date: today,
      updated_at: new Date().toISOString()
    })
    .eq('agent_id', agent_id);
  
  if (updateError) {
    console.error(`❌ Error updating ${agent_id}:`, updateError);
  } else {
    console.log(`✅ ${agent_id}: ${data.tokens} tokens, ${data.tasks} tasks, ${Math.floor(data.seconds/60)}m active`);
  }
}

// Also update total_tokens_used (cumulative)
for (const [agent_id, data] of Object.entries(stats)) {
  const { data: currentStats } = await supabase
    .from('agent_stats')
    .select('total_tokens_used')
    .eq('agent_id', agent_id)
    .single();
  
  if (currentStats) {
    const newTotal = (currentStats.total_tokens_used || 0) + data.tokens;
    await supabase
      .from('agent_stats')
      .update({ total_tokens_used: newTotal })
      .eq('agent_id', agent_id);
  }
}

console.log(`\n✅ Aggregated stats for ${Object.keys(stats).length} agents`);
