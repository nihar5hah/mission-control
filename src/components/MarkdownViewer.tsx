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
    .replace(/^### (.*$)/gim, '<h3 style="color: var(--foreground)" class="text-lg font-semibold mt-6 mb-3">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="color: var(--foreground)" class="text-xl font-semibold mt-6 mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 style="color: var(--foreground)" class="text-2xl font-bold mt-6 mb-4">$1</h1>')

    // Bold and Italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong style="color: var(--foreground)" class="font-bold"><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--foreground)" class="font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em style="color: var(--subtle)" class="italic">$1</em>')
    .replace(/___(.*?)___/g, '<strong style="color: var(--foreground)" class="font-bold"><em>$1</em></strong>')
    .replace(/__(.*?)__/g, '<strong style="color: var(--foreground)" class="font-semibold">$1</strong>')
    .replace(/_(.*?)_/g, '<em style="color: var(--subtle)" class="italic">$1</em>')

    // Inline code
    .replace(/`([^`]+)`/g, '<code style="background-color: var(--muted-bg); color: #F59E0B" class="px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')

    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #5E6AD2" class="hover:opacity-80 underline underline-offset-2" target="_blank" rel="noopener noreferrer">$1</a>')

    // Blockquotes
    .replace(/^\&gt; (.*$)/gim, '<blockquote style="border-color: #5E6AD2; color: var(--subtle)" class="border-l-2 pl-4 py-1 my-4 italic">$1</blockquote>')

    // Horizontal rules
    .replace(/^---$/gim, '<hr style="border-color: var(--border)" class="my-6" />')

    // Unordered lists
    .replace(/^\- (.*$)/gim, '<li style="color: var(--subtle)" class="ml-4 before:content-[\"•\"] before:mr-2 before:text-[#5E6AD2]">$1</li>')
    .replace(/^\* (.*$)/gim, '<li style="color: var(--subtle)" class="ml-4 before:content-[\"•\"] before:mr-2 before:text-[#5E6AD2]">$1</li>')

    // Ordered lists
    .replace(/^\d+\. (.*$)/gim, '<li style="color: var(--subtle)" class="ml-4 list-decimal">$1</li>')

    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const languageClass = lang ? `language-${lang}` : '';
      return `<pre style="background-color: var(--muted-bg); border-color: var(--border); color: var(--subtle)" class="border rounded-lg p-4 my-4 overflow-x-auto"><code class="text-sm font-mono ${languageClass}">${code.trim()}</code></pre>`;
    })

    // Paragraphs
    .replace(/\n\n/g, '</p><p style="color: var(--subtle)" class="leading-relaxed my-3">')

    // Line breaks
    .replace(/\n/g, '<br />');

  // Wrap in paragraph if not starting with a block element
  if (!html.startsWith('<')) {
    html = '<p style="color: var(--subtle)" class="leading-relaxed my-3">' + html + '</p>';
  }

  return html;
}

// Syntax highlighting for code blocks
function highlightCode(code: string, language: string): string {
  // Simple syntax highlighting with theme-aware colors
  const keywords = /\b(const|let|var|function|return|if|else|for|while|import|export|from|class|interface|type|async|await|try|catch|throw|new|this|static|public|private|extends|implements)\b/g;
  const strings = /(["'`])(?:(?!\1)[^\\]|\\.)*?\1/g;
  const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm;
  const numbers = /\b(\d+\.?\d*)\b/g;
  const functions = /\b([a-zA-Z_]\w*)\s*(?=\()/g;

  return code
    .replace(keywords, '<span style="color: #C792EA">$1</span>')
    .replace(strings, '<span style="color: #C3E88D">$&</span>')
    .replace(comments, '<span style="color: #546E7A; font-style: italic;">$1</span>')
    .replace(numbers, '<span style="color: #F78C6C">$1</span>')
    .replace(functions, '<span style="color: #82AAFF">$1</span>');
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
          <RefreshCw className="w-6 h-6" style={{ color: '#5E6AD2' }} />
        </motion.div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <FileText className="w-12 h-12 mb-3 transition-colors duration-300" style={{ color: 'var(--subtle)' }} />
        <p className="text-sm transition-colors duration-300" style={{ color: 'var(--subtle)' }}>Select a file to view its contents</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between pb-4 mb-4 transition-colors duration-300"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5" style={{ color: '#5E6AD2' }} />
          <h2 className="text-lg font-semibold transition-colors duration-300" style={{ color: 'var(--foreground)' }}>{fileName}</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Last updated */}
          <div className="flex items-center gap-1 text-xs mr-2 transition-colors duration-300" style={{ color: 'var(--subtle)' }}>
            <Clock className="w-3.5 h-3.5" />
            <span>{lastUpdated.toLocaleTimeString()}</span>
          </div>

          {/* Copy button */}
          <motion.button
            onClick={handleCopy}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--subtle)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--foreground)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--subtle)';
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Copy content"
          >
            {copied ? <Check className="w-4 h-4" style={{ color: '#5EAD5E' }} /> : <Copy className="w-4 h-4" />}
          </motion.button>

          {/* Refresh button */}
          {onRefresh && (
            <motion.button
              onClick={onRefresh}
              className="p-2 rounded-lg transition-colors"
              style={{ color: 'var(--subtle)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--foreground)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--subtle)';
              }}
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
