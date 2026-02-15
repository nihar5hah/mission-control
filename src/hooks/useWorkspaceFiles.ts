'use client';

import { useState, useEffect, useCallback } from 'react';

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  isPriority?: boolean;
  children?: FileNode[];
  content?: string;
}

export function useWorkspaceFiles() {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch file tree
  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/files');
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }
      const data = await response.json();
      setFiles(data.files);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch files');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch specific file content
  const fetchFileContent = useCallback(async (path: string) => {
    try {
      setContentLoading(true);
      const response = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch file content');
      }
      const data = await response.json();
      setFileContent(data.content);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch file content');
      setFileContent('');
    } finally {
      setContentLoading(false);
    }
  }, []);

  // Select a file
  const selectFile = useCallback(async (file: FileNode) => {
    if (file.type === 'file') {
      setSelectedFile(file);
      await fetchFileContent(file.path);
    }
  }, [fetchFileContent]);

  // Initial fetch
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Polling for real-time updates (every 10 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchFiles();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchFiles]);

  return {
    files,
    selectedFile,
    fileContent,
    loading,
    contentLoading,
    error,
    selectFile,
    refresh: fetchFiles,
  };
}
