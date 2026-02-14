'use client';

import { useState, useMemo } from 'react';
import { Search as SearchIcon, Loader, FileText, BookOpen, CheckSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface SearchResult {
  type: 'document' | 'memory' | 'task';
  id: string;
  title: string;
  content: string;
  date?: string;
  tags?: string[];
}

export default function SearchPanel() {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const mockResults: SearchResult[] = [
    {
      type: 'document',
      id: '1',
      title: 'API Integration Guide',
      content: 'Complete guide for integrating with OpenClaw API endpoints. Covers authentication, rate limiting, and best practices for real-time data synchronization.',
      tags: ['api', 'documentation', 'integration'],
    },
    {
      type: 'memory',
      id: '2',
      title: 'Daily Memory - Feb 14',
      content: 'Completed database migration with zero downtime. Implemented new activity tracking system. Fixed critical bug in search indexing.',
      date: '2026-02-14',
      tags: ['achievement', 'completed'],
    },
    {
      type: 'task',
      id: '3',
      title: 'API Rate Limiting Enhancement',
      content: 'Implement adaptive rate limiting based on user tier and usage patterns',
      tags: ['high-priority', 'backend'],
    },
    {
      type: 'document',
      id: '4',
      title: 'System Architecture',
      content: 'Overview of the Mission Control dashboard architecture, including real-time updates with Convex, component structure, and data flow.',
      tags: ['architecture', 'technical'],
    },
    {
      type: 'memory',
      id: '5',
      title: 'Decision Log - Feb 10',
      content: 'Decided to use Convex for real-time database instead of Firebase. Key advantages: better TypeScript support, simpler API, superior real-time capabilities.',
      date: '2026-02-10',
      tags: ['decision', 'architecture'],
    },
    {
      type: 'task',
      id: '6',
      title: 'Add Email Notifications',
      content: 'Implement email notifications for critical task completions and system alerts',
      tags: ['feature', 'notifications'],
    },
  ];

  const results = useMemo(() => {
    if (!query.trim()) return [];
    
    setSearching(true);
    setTimeout(() => setSearching(false), 300);

    return mockResults.filter((result) => {
      const searchLower = query.toLowerCase();
      return (
        result.title.toLowerCase().includes(searchLower) ||
        result.content.toLowerCase().includes(searchLower) ||
        result.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    });
  }, [query]);

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="w-5 h-5 text-blue-400" />;
      case 'memory':
        return <BookOpen className="w-5 h-5 text-purple-400" />;
      case 'task':
        return <CheckSquare className="w-5 h-5 text-emerald-400" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'document':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'memory':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'task':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          {searching ? (
            <Loader className="w-5 h-5 text-cyan-400 animate-spin" />
          ) : (
            <SearchIcon className="w-5 h-5 text-slate-500" />
          )}
        </div>
        <Input
          type="text"
          placeholder="Search memories, documents, tasks... (try 'API', 'database', 'integration')"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 bg-slate-900/50 border-slate-800 focus-visible:ring-cyan-500"
        />
      </div>

      {/* Results Summary */}
      {query.trim() && (
        <div className="text-sm text-slate-400">
          Found <span className="text-cyan-400 font-semibold">{results.length}</span> results for "<span className="text-cyan-400">{query}</span>"
        </div>
      )}

      {/* Results List */}
      <div className="space-y-4">
        {query.trim() === '' ? (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <SearchIcon className="w-12 h-12 text-slate-600 mb-3" />
              <p className="text-slate-400">Start typing to search</p>
              <p className="text-xs text-slate-500 mt-2">
                Search across memories, documents, and tasks
              </p>
            </CardContent>
          </Card>
        ) : results.length === 0 ? (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <SearchIcon className="w-12 h-12 text-slate-600 mb-3" />
              <p className="text-slate-400">No results found</p>
              <p className="text-xs text-slate-500 mt-2">
                Try different keywords or check your filters
              </p>
            </CardContent>
          </Card>
        ) : (
          results.map((result) => (
            <Card key={`${result.type}-${result.id}`} className="bg-slate-900/50 border-slate-800 hover:border-cyan-500/50 transition-colors cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex-shrink-0">{getResultIcon(result.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors">
                        {result.title}
                      </h3>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded border whitespace-nowrap ${getTypeColor(
                          result.type
                        )}`}
                      >
                        {getTypeLabel(result.type)}
                      </span>
                    </div>

                    <p className="text-sm text-slate-400 line-clamp-2 mb-3">
                      {result.content}
                    </p>

                    <div className="flex items-center justify-between">
                      {result.tags && result.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {result.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-1 rounded bg-slate-800/50 text-slate-300 cursor-pointer hover:bg-slate-800 transition-colors"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {result.date && (
                        <span className="text-xs text-slate-500 ml-auto">
                          {new Date(result.date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Search Tips */}
      {!query.trim() && (
        <Card className="bg-slate-900/30 border-slate-800">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">💡 Search Tips</h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>• Search by keywords: "database", "API", "integration"</li>
              <li>• Search by date: "Feb 14", "2026-02-14"</li>
              <li>• Search by tags: "#critical", "#completed", "#high-priority"</li>
              <li>• Combine searches: "API integration"</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
