import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase env variables');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

export async function POST() {
  try {
    // Check if columns exist
    const { data: existingColumns, error: checkError } = await supabase
      .rpc('exec_sql', {
        query: "SELECT column_name FROM information_schema.columns WHERE table_name = 'tasks_board'"
      });

    // Try to add columns using raw SQL via RPC
    // Note: This requires the pg_net extension or a custom RPC function
    // For now, we'll return a message asking to run migrations manually

    // Alternative: Use Supabase management API or psql
    const migrations = `
-- Run these in Supabase SQL Editor:

-- Add claiming fields to tasks_board
ALTER TABLE tasks_board ADD COLUMN IF NOT EXISTS assigned_to TEXT;
ALTER TABLE tasks_board ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;
ALTER TABLE tasks_board ADD COLUMN IF NOT EXISTS labels TEXT[] DEFAULT '{}';

-- Create index
CREATE INDEX IF NOT EXISTS tasks_board_assigned_idx ON tasks_board(assigned_to);

-- Add capabilities to agents
ALTER TABLE agents ADD COLUMN IF NOT EXISTS capabilities TEXT[] DEFAULT '{}';
ALTER TABLE agents ADD COLUMN IF NOT EXISTS current_workload INT DEFAULT 0;

-- Set capabilities
UPDATE agents SET capabilities = ARRAY['coding','frontend','backend','deployment'] WHERE id = 'coder';
UPDATE agents SET capabilities = ARRAY['research','analysis','web-search'] WHERE id = 'researcher';
UPDATE agents SET capabilities = ARRAY['analysis','learning-extraction','summarization'] WHERE id = 'extractor';
UPDATE agents SET capabilities = ARRAY['coordination','planning','review'] WHERE id = 'begubot';
    `;

    return NextResponse.json({
      message: 'Please run migrations manually in Supabase SQL Editor',
      sql: migrations.trim(),
      docs: 'https://supabase.com/dashboard/project/qbtlslagwbgrnnuaasma/sql/new'
    });
  } catch (error) {
    console.error('[Migrations] Error:', error);
    return NextResponse.json({ error: 'Migration check failed' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Check if columns exist by trying to select them
    const { error: assignedToError } = await supabase
      .from('tasks_board')
      .select('assigned_to')
      .limit(1);

    const { error: labelsError } = await supabase
      .from('tasks_board')
      .select('labels')
      .limit(1);

    const { error: capabilitiesError } = await supabase
      .from('agents')
      .select('capabilities')
      .limit(1);

    const status = {
      tasks_board: {
        assigned_to: !assignedToError,
        labels: !labelsError,
        claimed_at: null // Can't check without another query
      },
      agents: {
        capabilities: !capabilitiesError
      }
    };

    return NextResponse.json({
      status,
      allApplied: status.tasks_board.assigned_to && status.tasks_board.labels && status.agents.capabilities,
      sqlUrl: 'https://supabase.com/dashboard/project/qbtlslagwbgrnnuaasma/sql/new'
    });
  } catch (error) {
    console.error('[Migrations] Check error:', error);
    return NextResponse.json({ error: 'Status check failed' }, { status: 500 });
  }
}

