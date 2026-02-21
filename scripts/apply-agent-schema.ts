/**
 * Apply Agent Schema to Supabase
 * 
 * This script creates the necessary tables for the 4-agent system:
 * - agents
 * - agent_activities
 * - agent_sessions
 * - agent_stats
 * - agent_schedules
 * - agent_documents
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function applySchema() {
  console.log('🚀 Applying Agent Schema to Supabase...\n');

  // Check if agents table exists by trying to select from it
  const { error: checkError } = await supabase.from('agents').select('id').limit(1);
  
  if (checkError?.code === '42P01') {
    console.log('❌ Tables do not exist. Please run the SQL schema manually in Supabase Dashboard.');
    console.log('\n📋 Copy the contents of AGENT_SCHEMA.sql and run it in the SQL Editor:');
    console.log('   https://supabase.com/dashboard/project/qbtlslagwbgrnnuaasma/sql');
    process.exit(1);
  }

  if (checkError) {
    console.error('Error checking tables:', checkError);
    process.exit(1);
  }

  console.log('✅ Tables already exist! Checking data...\n');

  // Check if agents are populated
  const { data: agents, error: agentsError } = await supabase.from('agents').select('*');
  
  if (agentsError) {
    console.error('Error fetching agents:', agentsError);
    process.exit(1);
  }

  if (agents && agents.length > 0) {
    console.log('✅ Agents already populated:');
    agents.forEach(a => console.log(`   - ${a.name} (${a.role})`));
  } else {
    console.log('⚠️ No agents found. Inserting default agents...');
    
    const { error: insertError } = await supabase.from('agents').insert([
      { id: 'begubot', name: 'Begubot', role: 'Chief of Staff', color: '#8B5CF6', reports_to: null },
      { id: 'coder', name: 'Codex', role: 'Employee', color: '#10B981', reports_to: 'begubot' },
      { id: 'researcher', name: 'Slock', role: 'Employee', color: '#F59E0B', reports_to: 'begubot' },
      { id: 'extractor', name: 'Axiom', role: 'Analysis & Learning', color: '#7C3AED', reports_to: 'begubot' },
    ]);

    if (insertError) {
      console.error('Error inserting agents:', insertError);
    } else {
      console.log('✅ Agents inserted successfully!');
    }
  }

  // Check stats
  const { data: stats } = await supabase.from('agent_stats').select('agent_id');
  console.log(`\n📊 Stats records: ${stats?.length || 0}`);

  // Check activities
  const { data: activities } = await supabase.from('agent_activities').select('id', { count: 'exact', head: true });
  console.log(`📝 Activities: ${activities?.length || 0}`);

  // Check sessions
  const { data: sessions } = await supabase.from('agent_sessions').select('id', { count: 'exact', head: true });
  console.log(`🔌 Sessions: ${sessions?.length || 0}`);

  console.log('\n✨ Schema check complete!');
}

applySchema().catch(console.error);
