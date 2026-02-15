'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Copy, 
  Check, 
  ExternalLink,
  RefreshCw,
  Clock,
  Hash
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface MarkdownViewerProps {
  content: string;
  fileName: string;
  loading?: boolean;
  onRefresh?: () => void;
}

// Simple markdown to HTML conversion (keeping it lightweight)
function parseMarkdown(md: string): string {
  if (!md) return '';
  
  let html = md
    // Escape HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-white mt-6 mb-3">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-white mt-6 mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-white mt-6 mb-4">$1</h1>')
    
    // Bold and Italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong class="font-bold text-white"><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-[#aaa]">$1</em>')
    .replace(/___(.*?)___/g, '<strong class="font-bold text-white"><em>$1</em></strong>')
    .replace(/__(.*?)__/g, '<strong class="font-semibold text-white">$1</strong>')
    .replace(/_(.*?)_/g, '<em class="text-[#aaa]">$1</em>')
    
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-[#262626] text-[#F59E0B] rounded text-sm font-mono">$1</code>')
    
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-[#5E6AD2] hover:text-[#7B8AED] underline underline-offset-2" target="_blank" rel="noopener noreferrer">$1</a>')
    
    // Blockquotes
    .replace(/^\&gt; (.*$)/gim, '<blockquote class="border-l-2 border-[#5E6AD2] pl-4 py-1 my-4 text-[#888] italic">$1</blockquote>')
    
    // Horizontal rules
    .replace(/^---$/gim, '<hr class="border-[#262626] my-6" />')
    
    // Unordered lists
    .replace(/^\- (.*$)/gim, '<li class="ml-4 text-[#888] before:content-[\"•\"] before:mr-2 before:text-[#5E6AD2]">$1</li>')
    .replace(/^\* (.*$)/gim, '<li class="ml-4 text-[#888] before:content-[\"•\"] before:mr-2 before:text-[#5E6AD2]">$1</li>')
    
    // Ordered lists
    .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 text-[#888] list-decimal">$1</li>')
    
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const languageClass = lang ? `language-${lang}` : '';
      return `<pre class="bg-[#0F0F0F] border border-[#262626] rounded-lg p-4 my-4 overflow-x-auto"><code class="text-sm font-mono text-[#888] ${languageClass}">${code.trim()}</code></pre>`;
    })
    
    // Paragraphs
    .replace(/\n\n/g, '</p><p class="text-[#888] leading-relaxed my-3">')
    
    // Line breaks
    .replace(/\n/g, '<br />');

  // Wrap in paragraph if not starting with a block element
  if (!html.startsWith('<')) {
    html = '<p class="text-[#888] leading-relaxed my-3">' + html + '</p>';
  }

  return html;
}

// Syntax highlighting for code blocks
function highlightCode(code: string, language: string): string {
  // Simple syntax highlighting
  const keywords = /\b(const|let|var|function|return|if|else|for|while|import|export|from|class|interface|type|async|await|try|catch|throw|new|this|static|public|private|extends|implements)\b/g;
  const strings = /(["'`])(?:(?!\1)[^\\]|\\.)*?\1/g;
  const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm;
  const numbers = /\b(\d+\.?\d*)\b/g;
  const functions = /\b([a-zA-Z_]\w*)\s*(?=\()/g;
  
  return code
    .replace(keywords, '<span class="text-[#C792EA]">$1</span>')
    .replace(strings, '<span class="text-[#C3E88D]">$&</span>')
    .replace(comments, '<span class="text-[#546E7A] italic">$1</span>')
    .replace(numbers, '<span class="text-[#F78C6C]">$1</span>')
    .replace(functions, '<span class="text-[#82AAFF]">$1</span>');
}

export function MarkdownViewer({ content, fileName, loading, onRefresh }: MarkdownViewerProps) {
  const [copied, setCopied] = useState(false);
  const [lastUpdated] = useState(new Date());
  
  // Process markdown content
  const processedContent = useMemo(() => {
    // Handle code blocks with highlighting
    let processed = content.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const highlighted = lang ? highlightCode(code, lang) : code;
      return `<pre class="bg-[#0F0F0F] border border-[#262626] rounded-lg p-4 my-4 overflow-x-auto"><code class="text-sm font-mono text-[#888]">${highlighted}</code></pre>`;
    });
    
    return parseMarkdown(processed);
  }, [content]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <RefreshCw className="w-6 h-6 text-[#5E6AD2]" />
        </motion.div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <FileText className="w-12 h-12 text-[#333] mb-3" />
        <p className="text-[#666] text-sm">Select a file to view its contents</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between pb-4 border-b border-[#262626] mb-4"
      >
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#5E6AD2]" />
          <h2 className="text-lg font-semibold text-white">{fileName}</h2>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Last updated */}
          <div className="flex items-center gap-1 text-xs text-[#666] mr-2">
            <Clock className="w-3.5 h-3.5" />
            <span>{lastUpdated.toLocaleTimeString()}</span>
          </div>
          
          {/* Copy button */}
          <motion.button
            onClick={handleCopy}
            className="p-2 rounded-lg hover:bg-[#262626] text-[#666] hover:text-white transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Copy content"
          >
            {copied ? <Check className="w-4 h-4 text-[#5EAD5E]" /> : <Copy className="w-4 h-4" />}
          </motion.button>
          
          {/* Refresh button */}
          {onRefresh && (
            <motion.button
              onClick={onRefresh}
              className="p-2 rounded-lg hover:bg-[#262626] text-[#666] hover:text-white transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="flex-1 overflow-y-auto"
      >
        <div 
          className="prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: processedContent }}
        />
      </motion.div>
    </div>
  );
}
