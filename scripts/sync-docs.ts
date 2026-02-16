/**
 * Sync Script: Upload local workspace markdown files to Supabase
 * 
 * Smart sync - only updates files that have changed
 * 
 * Usage:
 *   npx tsx scripts/sync-docs.ts
 *   # or
 *   npm run sync-docs
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qbtlslagwbgrnnuaasma.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFidGxzbGFnd2Jncm5udWFhc21hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwOTAzNzksImV4cCI6MjA4NjY2NjM3OX0.95mIKqkW4Q6wtx6vvJk_XdDVK8vobmX2v98f1KRITSk';

// Workspace path - configurable via env or default
const WORKSPACE_PATH = process.env.WORKSPACE_PATH || '/home/hyper/.openclaw/workspace';

// Priority files to show at top
const PRIORITY_FILES = [
  'MEMORY.md',
  'SOUL.md',
  'USER.md',
  'IDENTITY.md',
  'TOOLS.md',
  'AGENTS.md',
];

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  content?: string;
  hash?: string;
}

interface SyncResult {
  success: boolean;
  total: number;
  created: number;
  updated: number;
  unchanged: number;
  deleted: number;
  errors: string[];
}

interface DbDocument {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[];
  metadata: {
    path: string;
    isDirectory?: boolean;
    hash?: string;
    children?: string[];
  };
  created_at: string;
  updated_at: string;
}

/**
 * Generate content hash for change detection
 */
function getContentHash(content: string): string {
  return crypto.createHash('md5').update(content).digest('hex');
}

/**
 * Recursively get all markdown files from workspace
 */
function getMarkdownFiles(dirPath: string, basePath: string = dirPath): FileNode[] {
  const items: FileNode[] = [];
  
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      // Skip hidden files and certain directories
      if (entry.name.startsWith('.') || 
          entry.name === 'node_modules' || 
          entry.name === '.git' ||
          entry.name === 'convex-project' ||
          entry.name === 'mission-control') {
        continue;
      }
      
      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.relative(basePath, fullPath);
      
      if (entry.isDirectory()) {
        // Only include memory directory at root and its subdirectories
        if (dirPath === basePath || dirPath.includes('/memory') || entry.name === 'memory') {
          const children = getMarkdownFiles(fullPath, basePath);
          if (children.length > 0) {
            items.push({
              name: entry.name,
              path: relativePath,
              type: 'directory',
            });
            items.push(...children);
          }
        }
      } else {
        // Include all markdown files
        if (entry.name.endsWith('.md')) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          items.push({
            name: entry.name,
            path: relativePath,
            type: 'file',
            content,
            hash: getContentHash(content),
          });
        }
      }
    }
  } catch (error) {
    console.error('Error reading directory:', dirPath, error);
  }
  
  return items;
}

/**
 * Build file tree structure
 */
function buildFileTree(files: FileNode[]): any[] {
  const root: any[] = [];
  const dirMap = new Map<string, any>();
  
  const dirs = new Set<string>();
  files.forEach(f => {
    const parts = f.path.split('/');
    if (parts.length > 1) {
      parts.slice(0, -1).forEach((_, i) => {
        const dirPath = parts.slice(0, i + 1).join('/');
        if (!dirs.has(dirPath)) {
          dirs.add(dirPath);
          dirMap.set(dirPath, {
            name: parts[i],
            path: dirPath,
            type: 'directory',
            children: [],
          });
        }
      });
    }
  });
  
  files.forEach(f => {
    const parts = f.path.split('/');
    const fileNode = {
      name: f.name,
      path: f.path,
      type: 'file' as const,
      content: f.content,
      hash: f.hash,
    };
    
    if (parts.length === 1) {
      root.push(fileNode);
    } else {
      const parentPath = parts.slice(0, -1).join('/');
      const parent = dirMap.get(parentPath);
      if (parent) {
        parent.children.push(fileNode);
      }
    }
  });
  
  dirMap.forEach(dir => {
    root.push(dir);
  });
  
  return root;
}

/**
 * Sort files: directories first, then priority files, then alphabetically
 */
function sortFiles(items: any[]): any[] {
  return items.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
    
    const aPriority = PRIORITY_FILES.includes(a.name) || !!a.name.match(/^\d{4}-\d{2}-\d{2}\.md$/);
    const bPriority = PRIORITY_FILES.includes(b.name) || !!b.name.match(/^\d{4}-\d{2}-\d{2}\.md$/);
    if (aPriority !== bPriority) return aPriority ? -1 : 1;
    
    return a.name.localeCompare(b.name);
  });
}

/**
 * Main sync function - Smart sync with change detection
 */
async function syncDocuments(): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    total: 0,
    created: 0,
    updated: 0,
    unchanged: 0,
    deleted: 0,
    errors: [],
  };
  
  console.log(`\n🔄 Smart syncing documents from: ${WORKSPACE_PATH}\n`);
  
  // Check workspace exists
  if (!fs.existsSync(WORKSPACE_PATH)) {
    result.success = false;
    result.errors.push(`Workspace path does not exist: ${WORKSPACE_PATH}`);
    console.error('❌ Error:', result.errors[0]);
    return result;
  }
  
  // Get all local markdown files
  const localFiles = getMarkdownFiles(WORKSPACE_PATH);
  result.total = localFiles.filter(f => f.type === 'file').length;
  console.log(`📁 Found ${result.total} markdown files\n`);
  
  if (localFiles.length === 0) {
    console.log('⚠️  No markdown files found to sync.');
    return result;
  }
  
  // Get existing documents from Supabase
  const { data: existingDocs, error: fetchError } = await supabase
    .from('documents')
    .select('*')
    .eq('category', 'workspace');
  
  if (fetchError) {
    result.errors.push(`Failed to fetch existing docs: ${fetchError.message}`);
    console.error('❌ Error fetching existing docs:', fetchError.message);
    // Continue anyway - we'll just do full sync
  }
  
  // Build map of existing docs by path
  const existingByPath = new Map<string, DbDocument>();
  (existingDocs || []).forEach(doc => {
    if (doc.metadata?.path) {
      existingByPath.set(doc.metadata.path, doc);
    }
  });
  
  console.log('📊 Syncing files:\n');
  
  // Track which paths we've synced (for deletion detection)
  const syncedPaths = new Set<string>();
  
  // Process each local file
  for (const file of localFiles) {
    if (file.type === 'directory') continue; // Skip directories for now
    
    syncedPaths.add(file.path);
    
    const existing = existingByPath.get(file.path);
    const isPriority = PRIORITY_FILES.includes(file.name) || 
                      !!file.name.match(/^\d{4}-\d{2}-\d{2}\.md$/);
    
    try {
      if (!existing) {
        // NEW FILE - doesn't exist in Supabase
        const { error } = await supabase.from('documents').insert({
          title: file.name,
          content: file.content || '',
          category: 'workspace',
          tags: ['workspace', 'synced', isPriority ? 'priority' : 'regular'],
          metadata: {
            path: file.path,
            isDirectory: false,
            hash: file.hash,
          },
        });
        
        if (error) {
          result.errors.push(`Failed to create ${file.path}: ${error.message}`);
          console.log(`  ❌ ${file.path}: ${error.message}`);
        } else {
          result.created++;
          console.log(`  ✨ NEW: ${file.path}`);
        }
      } else if (existing.metadata?.hash !== file.hash) {
        // CHANGED FILE - content hash differs
        const { error } = await supabase
          .from('documents')
          .update({
            content: file.content || '',
            tags: ['workspace', 'synced', isPriority ? 'priority' : 'regular'],
            metadata: {
              ...existing.metadata,
              hash: file.hash,
              updatedAt: new Date().toISOString(),
            },
          })
          .eq('id', existing.id);
        
        if (error) {
          result.errors.push(`Failed to update ${file.path}: ${error.message}`);
          console.log(`  ❌ ${file.path}: ${error.message}`);
        } else {
          result.updated++;
          console.log(`  🔄 UPDATED: ${file.path}`);
        }
      } else {
        // UNCHANGED FILE - same hash
        result.unchanged++;
        // Skip silently for cleaner output
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(`Failed to sync ${file.path}: ${msg}`);
      console.log(`  ❌ ${file.path}: ${msg}`);
    }
  }
  
  // DELETE files that no longer exist locally
  const pathsToDelete: string[] = [];
  existingByPath.forEach((doc, path) => {
    if (!syncedPaths.has(path) && !doc.metadata?.isDirectory) {
      pathsToDelete.push(path);
    }
  });
  
  if (pathsToDelete.length > 0) {
    console.log('\n🗑️  Removing deleted files:\n');
    for (const path of pathsToDelete) {
      const doc = existingByPath.get(path);
      if (doc) {
        const { error } = await supabase
          .from('documents')
          .delete()
          .eq('id', doc.id);
        
        if (error) {
          result.errors.push(`Failed to delete ${path}: ${error.message}`);
          console.log(`  ❌ ${path}: ${error.message}`);
        } else {
          result.deleted++;
          console.log(`  🗑️  DELETED: ${path}`);
        }
      }
    }
  }
  
  // Sync directory nodes
  const fileTree = buildFileTree(localFiles);
  const directories = fileTree.filter(f => f.type === 'directory');
  
  for (const dir of directories) {
    const childPaths = (dir.children || []).map((c: any) => c.path);
    
    const { error: dirError } = await supabase
      .from('documents')
      .upsert({
        title: dir.name,
        content: '',
        category: 'workspace',
        tags: ['workspace', 'directory'],
        metadata: {
          path: dir.path,
          isDirectory: true,
          children: childPaths,
        },
      }, {
        onConflict: 'title',
      });
    
    if (dirError) {
      // Silently ignore directory errors
    }
  }
  
  result.success = result.errors.length === 0;
  
  // Print summary
  console.log('\n' + '═'.repeat(50));
  console.log('📊 SYNC SUMMARY');
  console.log('═'.repeat(50));
  console.log(`  Total files:    ${result.total}`);
  console.log(`  ✨ Created:      ${result.created}`);
  console.log(`  🔄 Updated:      ${result.updated}`);
  console.log(`  ⏸️  Unchanged:    ${result.unchanged}`);
  console.log(`  🗑️  Deleted:      ${result.deleted}`);
  
  if (result.errors.length > 0) {
    console.log(`  ❌ Errors:       ${result.errors.length}`);
  }
  console.log('═'.repeat(50) + '\n');
  
  return result;
}

// Run if called directly
syncDocuments()
  .then(result => {
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  });

export { syncDocuments };
