import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { AgentId } from '@/types/agents';
import { promises as fs } from 'fs';
import path from 'path';

const AGENT_WORKSPACES: Record<AgentId, string> = {
  begubot: '/home/hyper/.openclaw/workspace',
  coder: '/home/hyper/.openclaw/workspace-coder',
  researcher: '/home/hyper/.openclaw/workspace-researcher',
};

const FILE_CATEGORIES: Record<string, string> = {
  'IDENTITY.md': 'identity',
  'MEMORY.md': 'memory',
  'SOUL.md': 'soul',
  'USER.md': 'guide',
  'AGENTS.md': 'config',
  'HEARTBEAT.md': 'config',
  'TOOLS.md': 'config',
};

const DEFAULT_FILES = ['IDENTITY.md', 'MEMORY.md', 'SOUL.md', 'USER.md', 'AGENTS.md', 'HEARTBEAT.md', 'TOOLS.md'];

async function syncAgentDocuments(agentId: AgentId, files: string[]) {
  const workspace = AGENT_WORKSPACES[agentId];
  const results: Array<{ source_file: string; status: 'synced' | 'missing' | 'error' }> = [];

  for (const file of files) {
    const filePath = path.join(workspace, file);
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const category = FILE_CATEGORIES[file] || 'guide';

      const { error } = await supabase
        .from('agent_documents')
        .upsert({
          agent_id: agentId,
          title: file,
          content,
          category,
          source_file: filePath,
          metadata: { synced_at: new Date().toISOString() },
        }, { onConflict: 'agent_id,source_file' });

      if (error) {
        results.push({ source_file: file, status: 'error' });
      } else {
        results.push({ source_file: file, status: 'synced' });
      }
    } catch (err) {
      results.push({ source_file: file, status: 'missing' });
    }
  }

  return results;
}

// POST /api/agents/documents/sync
// Body: { agent_id?: AgentId, files?: string[] }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const agentId = body?.agent_id as AgentId | undefined;
    const files = Array.isArray(body?.files) && body.files.length > 0 ? body.files : DEFAULT_FILES;

    if (agentId) {
      const result = await syncAgentDocuments(agentId, files);
      return NextResponse.json({ success: true, agent_id: agentId, result }, { status: 200 });
    }

    const allResults: Record<AgentId, Array<{ source_file: string; status: 'synced' | 'missing' | 'error' }>> = {
      begubot: await syncAgentDocuments('begubot', files),
      coder: await syncAgentDocuments('coder', files),
      researcher: await syncAgentDocuments('researcher', files),
    };

    return NextResponse.json({ success: true, results: allResults }, { status: 200 });
  } catch (error) {
    console.error('[AgentDocs] Sync error:', error);
    return NextResponse.json({ error: 'Failed to sync documents' }, { status: 500 });
  }
}
