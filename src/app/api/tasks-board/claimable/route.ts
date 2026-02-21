import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireApiKey } from '@/lib/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase env variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Default capabilities per agent (fallback if column doesn't exist)
const DEFAULT_CAPABILITIES: Record<string, string[]> = {
  'coder': ['coding', 'frontend', 'backend', 'deployment'],
  'researcher': ['research', 'analysis', 'web-search'],
  'extractor': ['analysis', 'learning-extraction', 'summarization'],
  'begubot': ['coordination', 'planning', 'review'],
};

function scoreMatch(taskText: string, capabilities: string[]) {
  if (capabilities.length === 0) return 0.2;
  const normalized = taskText.toLowerCase();
  const hits = capabilities.filter((cap) => normalized.includes(cap.toLowerCase()));
  return Math.min(1, hits.length / Math.max(1, capabilities.length));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agent_id');

    if (!agentId) {
      return NextResponse.json({ error: 'Missing agent_id' }, { status: 400 });
    }

    const auth = requireApiKey(request);
    if (auth) return auth;

    // Use default capabilities for this agent
    const capabilities = DEFAULT_CAPABILITIES[agentId] || [];

    // Fetch all TODO tasks (assigned_to column doesn't exist yet, so just filter by status)
    const { data: tasks, error } = await supabase
      .from('tasks_board')
      .select('id,title,description,priority,status,created_at')
      .eq('status', 'TODO')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[TasksClaiming] Query error:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch tasks', 
        details: error.message 
      }, { status: 500 });
    }

    if (!tasks || tasks.length === 0) {
      return NextResponse.json({ tasks: [] });
    }

    const mapped = tasks.map((task: any) => {
      // Try to parse labels from description or use empty array
      const labels: string[] = [];
      const haystack = `${task.title || ''} ${task.description || ''} ${labels.join(' ')}`;
      const matchScore = scoreMatch(haystack, capabilities);
      const why = capabilities.length
        ? `Matches your capabilities: ${capabilities.filter((cap) => haystack.toLowerCase().includes(cap.toLowerCase())).join(', ') || capabilities[0]}`
        : 'No capabilities set';

      return {
        id: task.id,
        title: task.title,
        priority: task.priority,
        labels,
        match_score: Number(matchScore.toFixed(2)),
        why,
      };
    });

    return NextResponse.json({ tasks: mapped });
  } catch (err) {
    console.error('[TasksClaiming] Unexpected error:', err);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}
