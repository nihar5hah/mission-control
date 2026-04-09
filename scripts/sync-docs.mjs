#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import os from 'os';

const supabase = createClient(
  'https://qbtlslagwbgrnnuaasma.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFidGxzbGFnd2Jncm5udWFhc21hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwOTAzNzksImV4cCI6MjA4NjY2NjM3OX0.95mIKqkW4Q6wtx6vvJk_XdDVK8vobmX2v98f1KRITSk'
);

// Agent ID mapping (internal id -> database id)
const AGENT_DB_IDS = {
  'main': 'begubot',
  'codex': 'coder',
  'slock': 'researcher',
  'extractor': 'extractor'  // Database uses 'extractor', not 'axiom'
};

// Default workspace mapping
const DEFAULT_WORKSPACES = {
  'begubot': '/home/hyper/.openclaw/workspace',
  'coder': '/home/hyper/.openclaw/workspace-coder',
  'researcher': '/home/hyper/.openclaw/workspace-researcher',
  'extractor': '/home/hyper/.openclaw/workspace-extractor'
};

// Expand ~ to home directory
function expandPath(p) {
  if (p.startsWith('~/')) {
    return path.join(os.homedir(), p.slice(2));
  }
  return p;
}

// Auto-discover agents from openclaw.json
function discoverAgents() {
  const configPath = '/home/hyper/.openclaw/openclaw.json';
  
  // Default to built-in workspace mapping if config doesn't have agents
  const agents = {};
  
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    
    if (config.agents && config.agents.list) {
      for (const agent of config.agents.list) {
        const internalId = agent.id;
        const dbId = AGENT_DB_IDS[internalId] || internalId;
        const rawWorkspace = agent.workspace || DEFAULT_WORKSPACES[dbId] || `/home/hyper/.openclaw/workspace-${internalId}`;
        const workspace = expandPath(rawWorkspace);
        
        if (fs.existsSync(workspace)) {
          agents[dbId] = workspace;
        }
      }
    } else {
      // Use default workspaces
      for (const [dbId, workspace] of Object.entries(DEFAULT_WORKSPACES)) {
        if (fs.existsSync(workspace)) {
          agents[dbId] = workspace;
        }
      }
    }
  } catch (e) {
    // Fallback to default workspaces
    for (const [dbId, workspace] of Object.entries(DEFAULT_WORKSPACES)) {
      if (fs.existsSync(workspace)) {
        agents[dbId] = workspace;
      }
    }
  }
  
  return agents;
}

// Determine category based on file path and name
function getFileCategory(filePath, fileName) {
  if (filePath.includes('/memory/')) return 'memory';
  if (filePath.includes('/tasks/')) return 'tasks';
  if (filePath.includes('/skills/')) return 'skills';
  
  const categoryMap = {
    'IDENTITY.md': 'identity',
    'MEMORY.md': 'memory',
    'SOUL.md': 'soul',
    'USER.md': 'guide',
    'AGENTS.md': 'config',
    'HEARTBEAT.md': 'config',
    'TOOLS.md': 'config',
    'TASK_MANIFEST.md': 'config',
    'SKILLS_STATUS.md': 'config',
    'WORKFLOW.md': 'workflow',
    'CONTENT_INTAKE.md': 'workflow',
    'SEND_AND_ARCHIVE.md': 'workflow'
  };
  
  return categoryMap[fileName] || 'documents';
}

// Get all .md files recursively from a directory
function getAllMdFiles(dir, baseDir = dir) {
  const files = [];
  
  if (!fs.existsSync(dir)) return files;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    // Skip hidden directories and node_modules
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    
    if (entry.isDirectory()) {
      files.push(...getAllMdFiles(fullPath, baseDir));
    } else if (entry.name.endsWith('.md')) {
      const relativePath = path.relative(baseDir, fullPath);
      files.push({
        fullPath,
        relativePath,
        fileName: entry.name
      });
    }
  }
  
  return files;
}

async function syncDocuments() {
  console.log('🔄 Syncing agent documents...\n');
  
  // Clear existing documents
  await supabase.from('agent_documents').delete().neq('id', 0);
  console.log('✅ Cleared existing documents\n');
  
  // Auto-discover agents
  const agents = discoverAgents();
  console.log(`📋 Found ${Object.keys(agents).length} agents: ${Object.keys(agents).join(', ')}\n`);
  
  let totalSynced = 0;
  let totalFailed = 0;
  
  for (const [agentId, workspace] of Object.entries(agents)) {
    console.log(`\n📝 ${agentId.toUpperCase()}`);
    
    // Get all .md files in workspace
    const files = getAllMdFiles(workspace);
    console.log(`   Found ${files.length} .md files`);
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(file.fullPath, 'utf-8');
        const category = getFileCategory(file.fullPath, file.fileName);
        
        const { error } = await supabase
          .from('agent_documents')
          .insert({
            agent_id: agentId,
            title: file.relativePath,
            content: content,
            category: category,
            source_file: file.fullPath,
            tags: [category, agentId, file.fileName.replace('.md', '')],
            updated_at: new Date().toISOString()
          });
        
        if (error) {
          console.log(`   ❌ ${file.relativePath}: ${error.message}`);
          totalFailed++;
        } else {
          totalSynced++;
          // Only log non-memory files or if verbose
          if (category !== 'memory' || content.length > 5000) {
            console.log(`   ✅ ${file.relativePath} (${content.length} chars)`);
          }
        }
      } catch (err) {
        console.log(`   ⚠️ ${file.relativePath}: ${err.message}`);
        totalFailed++;
      }
    }
  }
  
  console.log(`\n\n📊 SUMMARY`);
  console.log(`   Synced: ${totalSynced} files`);
  console.log(`   Failed: ${totalFailed} files`);
  console.log(`   Agents: ${Object.keys(agents).join(', ')}`);
  console.log('\n✅ Sync complete!');
  
  return { totalSynced, totalFailed, agentCount: Object.keys(agents).length };
}

syncDocuments().catch(console.error);
