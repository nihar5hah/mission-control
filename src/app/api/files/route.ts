import { NextResponse } from 'next/server';
import { fetchDocuments, fetchDocumentByPath } from '@/lib/documents';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get('path');
  
  // If a specific file path is requested, return its content
  if (filePath) {
    try {
      const doc = await fetchDocumentByPath(filePath);
      if (!doc) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }
      return NextResponse.json({ content: doc.content, path: doc.path });
    } catch (error) {
      console.error('Error fetching file:', error);
      return NextResponse.json({ error: 'Failed to fetch file' }, { status: 500 });
    }
  }
  
  // Otherwise, return the file tree from Supabase
  try {
    const docs = await fetchDocuments();
    
    // Transform to the format expected by the frontend
    const files = transformToFileTree(docs);
    
    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ files: [], error: 'Failed to fetch documents' }, { status: 500 });
  }
}

/**
 * Transform flat document list to tree structure
 */
function transformToFileTree(docs: any[]): any[] {
  const PRIORITY_FILES = [
    'MEMORY.md',
    'SOUL.md',
    'USER.md',
    'IDENTITY.md',
    'TOOLS.md',
    'AGENTS.md',
  ];
  
  // Separate directories and files
  const directories = docs.filter(d => d.isDirectory);
  const files = docs.filter(d => !d.isDirectory);
  
  // Build tree
  const root: any[] = [];
  const dirMap = new Map<string, any>();
  
  // Create directory nodes
  directories.forEach(dir => {
    dirMap.set(dir.path, {
      name: dir.name,
      path: dir.path,
      type: 'directory',
      children: [],
    });
  });
  
  // Add files to root or directories
  files.forEach(file => {
    const parts = file.path.split('/');
    const fileNode = {
      name: file.name,
      path: file.path,
      type: 'file' as const,
      isPriority: PRIORITY_FILES.includes(file.name) || !!file.name.match(/^\d{4}-\d{2}-\d{2}\.md$/),
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
      } else {
        root.push(fileNode);
      }
    }
  });
  
  // Add directories to root
  dirMap.forEach(dir => {
    root.push(dir);
  });
  
  // Sort: directories first, then priority files, then alphabetically
  return root.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
    if (a.isPriority !== b.isPriority) return a.isPriority ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}
