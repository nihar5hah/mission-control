import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const WORKSPACE_PATH = '/home/hyper/.openclaw/workspace';

// File types to include in the documentation browser
const PRIORITY_FILES = [
  'MEMORY.md',
  'SOUL.md', 
  'USER.md',
  'IDENTITY.md',
  'TOOLS.md',
  'AGENTS.md',
];

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  isPriority?: boolean;
  children?: FileNode[];
  content?: string;
}

function getFilesRecursively(dirPath: string, basePath: string = dirPath): FileNode[] {
  const items: FileNode[] = [];
  
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      // Skip hidden files and certain directories
      if (entry.name.startsWith('.') || 
          entry.name === 'node_modules' || 
          entry.name === '.git' ||
          entry.name === 'convex-project') {
        continue;
      }
      
      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.relative(basePath, fullPath);
      
      if (entry.isDirectory()) {
        // Only include memory directory and top-level
        if (dirPath === basePath || entry.name === 'memory') {
          const children = getFilesRecursively(fullPath, basePath);
          // Only add directory if it has children
          if (children.length > 0) {
            items.push({
              name: entry.name,
              path: relativePath,
              type: 'directory',
              children,
            });
          }
        }
      } else {
        // Only include markdown and txt files
        if (entry.name.endsWith('.md') || entry.name.endsWith('.txt')) {
          const isPriority = PRIORITY_FILES.includes(entry.name) || 
                            !!entry.name.match(/^\d{4}-\d{2}-\d{2}\.md$/);
          
          items.push({
            name: entry.name,
            path: relativePath,
            type: 'file',
            isPriority,
          });
        }
      }
    }
  } catch (error) {
    console.error('Error reading directory:', error);
  }
  
  // Sort: directories first, then by priority, then alphabetically
  return items.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
    if (a.isPriority !== b.isPriority) return a.isPriority ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

function getFileContent(filePath: string): string | null {
  try {
    const fullPath = path.join(WORKSPACE_PATH, filePath);
    // Security: ensure path doesn't escape workspace
    if (!fullPath.startsWith(WORKSPACE_PATH)) {
      return null;
    }
    return fs.readFileSync(fullPath, 'utf-8');
  } catch (error) {
    console.error('Error reading file:', error);
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get('path');
  
  // If a specific file path is requested, return its content
  if (filePath) {
    const content = getFileContent(filePath);
    if (content === null) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    return NextResponse.json({ content, path: filePath });
  }
  
  // Otherwise, return the file tree
  const files = getFilesRecursively(WORKSPACE_PATH);
  return NextResponse.json({ files });
}
