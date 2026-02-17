import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  'https://qbtlslagwbgrnnuaasma.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFidGxzbGFnd2Jncm5udWFhc21hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwOTAzNzksImV4cCI6MjA4NjY2NjM3OX0.95mIKqkW4Q6wtx6vvJk_XdDVK8vobmX2v98f1KRITSk'
);

const AGENTS = {
  begubot: '/home/hyper/.openclaw/workspace',
  coder: '/home/hyper/.openclaw/workspace-coder',
  researcher: '/home/hyper/.openclaw/workspace-researcher'
};

const ROOT_FILES = [
  { name: 'IDENTITY.md', category: 'identity' },
  { name: 'MEMORY.md', category: 'memory' },
  { name: 'SOUL.md', category: 'soul' },
  { name: 'USER.md', category: 'guide' },
  { name: 'AGENTS.md', category: 'config' },
  { name: 'HEARTBEAT.md', category: 'config' },
  { name: 'TOOLS.md', category: 'config' }
];

function getLast7Days() {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().split('T')[0]); // YYYY-MM-DD
  }
  return days;
}

async function syncDocuments() {
  console.log('Syncing agent documents...\n');
  
  // Clear existing documents
  await supabase.from('agent_documents').delete().neq('id', 0);
  console.log('Cleared existing documents\n');
  
  const last7Days = getLast7Days();
  
  for (const [agentId, workspace] of Object.entries(AGENTS)) {
    console.log(`\n📝 ${agentId.toUpperCase()}`);
    
    // Sync root files
    for (const file of ROOT_FILES) {
      const filePath = path.join(workspace, file.name);
      
      try {
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf-8');
          const stats = fs.statSync(filePath);
          
          const { error } = await supabase
            .from('agent_documents')
            .insert({
              agent_id: agentId,
              title: file.name,
              content: content,
              category: file.category,
              source_file: filePath,
              tags: [file.category, agentId],
              updated_at: stats.mtime.toISOString()
            });
          
          if (error) {
            console.log(`  ❌ ${file.name}: ${error.message}`);
          } else {
            console.log(`  ✅ ${file.name} (${content.length} chars)`);
          }
        }
      } catch (err) {
        console.log(`  ⚠️ ${file.name}: ${err.message}`);
      }
    }
    
    // Sync memory/*.md files (last 7 days)
    const memoryDir = path.join(workspace, 'memory');
    if (fs.existsSync(memoryDir)) {
      for (const day of last7Days) {
        const memoryFile = path.join(memoryDir, `${day}.md`);
        
        try {
          if (fs.existsSync(memoryFile)) {
            const content = fs.readFileSync(memoryFile, 'utf-8');
            const stats = fs.statSync(memoryFile);
            
            const { error } = await supabase
              .from('agent_documents')
              .insert({
                agent_id: agentId,
                title: `memory/${day}.md`,
                content: content,
                category: 'memory',
                source_file: memoryFile,
                tags: ['daily', 'memory', day, agentId],
                updated_at: stats.mtime.toISOString()
              });
            
            if (error) {
              console.log(`  ❌ memory/${day}.md: ${error.message}`);
            } else {
              console.log(`  ✅ memory/${day}.md (${content.length} chars)`);
            }
          }
        } catch (err) {
          // File doesn't exist, skip silently
        }
      }
    }
  }
  
  console.log('\n✅ Sync complete!');
}

syncDocuments();
