import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Document types for workspace files
export interface WorkspaceDocument {
  id: number;
  name: string;
  path: string;
  content: string;
  isDirectory: boolean;
  children?: WorkspaceDocument[];
  created_at: string;
  updated_at: string;
}

// Priority files to show at top
const PRIORITY_FILES = [
  'MEMORY.md',
  'SOUL.md',
  'USER.md',
  'IDENTITY.md',
  'TOOLS.md',
  'AGENTS.md',
];

/**
 * Fetch all documents from Supabase
 */
export async function fetchDocuments(): Promise<WorkspaceDocument[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('category', 'workspace')
    .order('title', { ascending: true });

  if (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }

  // Transform data to our WorkspaceDocument format
  // The Supabase schema has: id, title, content, category, tags, metadata, created_at, updated_at
  // metadata contains: path, isDirectory
  return (data || []).map((doc: any) => ({
    id: doc.id,
    name: doc.title,
    path: doc.metadata?.path || doc.title,
    content: doc.content || '',
    isDirectory: doc.metadata?.isDirectory || false,
    children: doc.metadata?.children || undefined,
    created_at: doc.created_at,
    updated_at: doc.updated_at,
  }));
}

/**
 * Fetch a single document by path
 */
export async function fetchDocumentByPath(path: string): Promise<WorkspaceDocument | null> {
  // Since we can't query JSONB directly with anon key easily,
  // we'll fetch all and filter (not ideal but works for small datasets)
  const docs = await fetchDocuments();
  return docs.find(d => d.path === path) || null;
}

/**
 * Upsert a document (insert or update)
 */
export async function upsertDocument(doc: {
  name: string;
  path: string;
  content: string;
  isDirectory?: boolean;
  children?: string[];
}): Promise<void> {
  const { error } = await supabase.from('documents').upsert(
    {
      title: doc.name,
      content: doc.content,
      category: 'workspace',
      tags: ['workspace', 'synced'],
      metadata: {
        path: doc.path,
        isDirectory: doc.isDirectory || false,
        children: doc.children || [],
      },
    },
    { onConflict: 'title' }
  );

  if (error) {
    console.error('Error upserting document:', error);
    throw error;
  }
}

/**
 * Delete a document by path
 */
export async function deleteDocument(path: string): Promise<void> {
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('title', path.replace('.md', ''));

  if (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}

/**
 * Check if a path is a priority file
 */
export function isPriorityFile(path: string): boolean {
  const fileName = path.split('/').pop() || path;
  return PRIORITY_FILES.includes(fileName) || !!fileName.match(/^\d{4}-\d{2}-\d{2}\.md$/);
}

export { PRIORITY_FILES };
