'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, FolderOpen, FileText, ChevronRight, Star } from 'lucide-react';
import type { FileNode } from '@/hooks/useWorkspaceFiles';

interface FileTreeProps {
  files: FileNode[];
  selectedFile: FileNode | null;
  onSelectFile: (file: FileNode) => void;
}

interface FileTreeItemProps {
  file: FileNode;
  level: number;
  selectedFile: FileNode | null;
  onSelectFile: (file: FileNode) => void;
  defaultExpanded?: boolean;
}

function FileTreeItem({ file, level, selectedFile, onSelectFile, defaultExpanded = false }: FileTreeItemProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const isSelected = selectedFile?.path === file.path;
  const isDirectory = file.type === 'directory';

  const handleClick = () => {
    if (isDirectory) {
      setExpanded(!expanded);
    } else {
      onSelectFile(file);
    }
  };

  // Icon based on type and state
  const FileIcon = isDirectory ? (expanded ? FolderOpen : Folder) : FileText;

  // Priority indicator for important files
  const showPriority = file.isPriority && !isDirectory;

  return (
    <div>
      <motion.button
        onClick={handleClick}
        className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded text-sm transition-all ${
          isSelected 
            ? 'bg-[#5E6AD2]/20 text-[#5E6AD2]' 
            : 'text-[#888] hover:bg-[#262626] hover:text-white'
        }`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        whileHover={{ x: 2 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Expand indicator for directories */}
        {isDirectory && (
          <motion.div
            animate={{ rotate: expanded ? 90 : 0 }}
            transition={{ duration: 0.15 }}
          >
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          </motion.div>
        )}
        
        {!isDirectory && <div className="w-3.5" />}

        <FileIcon className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-[#5E6AD2]' : ''}`} />
        
        <span className="truncate flex-1 text-left">{file.name}</span>
        
        {/* Priority star */}
        {showPriority && (
          <Star className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" />
        )}
      </motion.button>

      {/* Children */}
      <AnimatePresence>
        {isDirectory && expanded && file.children && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
          >
            {file.children.map((child) => (
              <FileTreeItem
                key={child.path}
                file={child}
                level={level + 1}
                selectedFile={selectedFile}
                onSelectFile={onSelectFile}
                defaultExpanded={level < 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FileTree({ files, selectedFile, onSelectFile }: FileTreeProps) {
  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-[#666]">
        No documentation files found
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {files.map((file) => (
        <FileTreeItem
          key={file.path}
          file={file}
          level={0}
          selectedFile={selectedFile}
          onSelectFile={onSelectFile}
          defaultExpanded={true}
        />
      ))}
    </div>
  );
}
