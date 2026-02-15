/**
 * Sync Script: Upload local workspace markdown files to Supabase
 * 
 * Usage:
 *   npx tsx scripts/sync-docs.ts
 *   # or
 *   npm run sync-docs
 * 
 * This script reads all .md files from the workspace and uploads them
 * to Supabase for the documentation tab to display on the deployed app.
 */

import fs from 'fs';
import path from 'path';
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
}

interface SyncResult {
  success: boolean;
  synced: number;
  errors: string[];
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
        // Also include any top-level directories
        if (dirPath === basePath || dirPath.includes('/memory') || entry.name === 'memory') {
          const children = getMarkdownFiles(fullPath, basePath);
          if (children.length > 0) {
            // Add the directory itself
            items.push({
              name: entry.name,
              path: relativePath,
              type: 'directory',
            });
            // Also add the children files to the flat list
            items.push(...children);
          }
        }
      } else {
        // Include all markdown files at any level
        if (entry.name.endsWith('.md')) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          items.push({
            name: entry.name,
            path: relativePath,
            type: 'file',
            content,
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
 * Convert flat file list to tree structure
 */
function buildFileTree(files: FileNode[]): any[] {
  const root: any[] = [];
  const dirMap = new Map<string, any>();
  
  // First pass: create directory nodes
  const dirs = new Set<string>();
  files.forEach(f => {
    const parts = f.path.split('/');
    if (parts.length > 1) {
      parts.slice(0, -1).forEach((part, i) => {
        const dirPath = parts.slice(0, i + 1).join('/');
        if (!dirs.has(dirPath)) {
          dirs.add(dirPath);
          dirMap.set(dirPath, {
            name: part,
            path: dirPath,
            type: 'directory',
            children: [],
          });
        }
      });
    }
  });
  
  // Second pass: add files to their parent directories
  files.forEach(f => {
    const parts = f.path.split('/');
    const fileNode = {
      name: f.name,
      path: f.path,
      type: 'file' as const,
      content: f.content,
    };
    
    if (parts.length === 1) {
      // Root level file
      root.push(fileNode);
    } else {
      // File in subdirectory
      const parentPath = parts.slice(0, -1).join('/');
      const parent = dirMap.get(parentPath);
      if (parent) {
        parent.children.push(fileNode);
      }
    }
  });
  
  // Add directories to root
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
    // Directories first
    if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
    
    // Priority files next
    const aPriority = PRIORITY_FILES.includes(a.name) || !!a.name.match(/^\d{4}-\d{2}-\d{2}\.md$/);
    const bPriority = PRIORITY_FILES.includes(b.name) || !!b.name.match(/^\d{4}-\d{2}-\d{2}\.md$/);
    if (aPriority !== bPriority) return aPriority ? -1 : 1;
    
    // Alphabetical
    return a.name.localeCompare(b.name);
  });
}

/**
 * Main sync function
 */
async function syncDocuments(): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    synced: 0,
    errors: [],
  };
  
  console.log(`\n🔄 Syncing documents from: ${WORKSPACE_PATH}\n`);
  
  // Check if workspace exists
  if (!fs.existsSync(WORKSPACE_PATH)) {
    result.success = false;
    result.errors.push(`Workspace path does not exist: ${WORKSPACE_PATH}`);
    console.error('❌ Error:', result.errors[0]);
    return result;
  }
  
  // Get all markdown files
  const files = getMarkdownFiles(WORKSPACE_PATH);
  console.log(`📁 Found ${files.length} markdown files\n`);
  
  if (files.length === 0) {
    console.log('⚠️  No markdown files found to sync.');
    return result;
  }
  
  // Build file tree structure
  const fileTree = buildFileTree(files);
  const sortedTree = sortFiles(fileTree);
  
  // Upload each file to Supabase
  for (const file of files) {
    try {
      const isPriority = PRIORITY_FILES.includes(file.name) || 
                        !!file.name.match(/^\d{4}-\d{2}-\d{2}\.md$/);
      const isDir = file.type === 'directory';
      
      // First try to delete any existing record with this title
      await supabase
        .from('documents')
        .delete()
        .eq('title', file.name);
      
      // Then insert the new record
      const { error } = await supabase.from('documents').insert(
        {
          title: file.name,
          content: isDir ? '' : (file.content || ''),
          category: 'workspace',
          tags: ['workspace', 'synced', isPriority ? 'priority' : 'regular'],
          metadata: {
            path: file.path,
            isDirectory: isDir,
          },
        }
      );
      
      if (error) {
        result.errors.push(`Failed to sync ${file.path}: ${error.message}`);
        console.log(`❌ ${file.path}: ${error.message}`);
      } else {
        result.synced++;
        console.log(`✅ ${file.path}`);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(`Failed to sync ${file.path}: ${msg}`);
      console.log(`❌ ${file.path}: ${msg}`);
    }
  }
  
  // Also sync directory nodes (memory folder, etc.)
  const directories = fileTree.filter(f => f.type === 'directory');
  for (const dir of directories) {
    try {
      const childPaths = (dir.children || []).map((c: any) => c.path);
      
      // Delete existing and insert new
      await supabase
        .from('documents')
        .delete()
        .eq('title', dir.name);
      
      const { error } = await supabase.from('documents').insert(
        {
          title: dir.name,
          content: '',
          category: 'workspace',
          tags: ['workspace', 'directory'],
          metadata: {
            path: dir.path,
            isDirectory: true,
            children: childPaths,
          },
        }
      );
      
      if (!error) {
        result.synced++;
        console.log(`📁 ${dir.path}/`);
      }
    } catch (error) {
      // Ignore directory errors
    }
  }
  
  result.success = result.errors.length === 0;
  
  console.log(`\n📊 Sync complete: ${result.synced} items synced`);
  if (result.errors.length > 0) {
    console.log(`❌ ${result.errors.length} errors`);
  }
  
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
