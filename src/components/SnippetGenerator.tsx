'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Copy, Check, Hammer, Database, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const SNIPPETS = [
  {
    id: 'react-component',
    name: 'React TS Component',
    icon: Code,
    template: (name: string) => `'use client';

import React from 'react';

interface ${name}Props {
  children?: React.ReactNode;
}

export function ${name}({ children }: ${name}Props) {
  return (
    <div className="p-4 rounded-xl border border-white/10 bg-white/5">
      {children}
    </div>
  );
}`,
  },
  {
    id: 'supabase-query',
    name: 'Supabase Query',
    icon: Database,
    template: (table: string) => `const { data, error } = await supabase
  .from('${table}')
  .select('*')
  .order('created_at', { ascending: false });

if (error) {
  console.error('Error fetching ${table}:', error);
  return [];
}

return data;`,
  },
  {
    id: 'api-route',
    name: 'Next.js API Route',
    icon: FileJson,
    template: (resource: string) => `import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('${resource}')
    .select('*');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}`,
  },
];

export function SnippetGenerator() {
  const [selectedSnippet, setSelectedSnippet] = useState(SNIPPETS[0]);
  const [inputVal, setInputVal] = useState('MyComponent');
  const [copied, setCopied] = useState(false);

  const code = selectedSnippet.template(inputVal);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Snippet copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="apple-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Hammer className="w-5 h-5 text-amber-500" />
        <h3 className="text-sm font-semibold">Snippet Generator</h3>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {SNIPPETS.map((snippet) => {
          const Icon = snippet.icon;
          return (
            <button
              key={snippet.id}
              onClick={() => setSelectedSnippet(snippet)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                selectedSnippet.id === snippet.id
                  ? 'border-amber-500/50 bg-amber-500/10'
                  : 'border-white/5 bg-white/5 hover:bg-white/10'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${selectedSnippet.id === snippet.id ? 'text-amber-500' : 'text-slate-400'}`} />
              <span className="text-[10px] font-medium text-center">{snippet.name}</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-[10px] font-medium text-slate-400 mb-1 block uppercase tracking-wider">
            {selectedSnippet.id === 'react-component' ? 'Component Name' : 'Table / Resource Name'}
          </label>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50"
          />
        </div>

        <div className="relative group">
          <pre className="p-4 rounded-xl bg-black/40 border border-white/5 text-[11px] overflow-x-auto max-h-[200px] font-mono text-amber-200/80">
            <code>{code}</code>
          </pre>
          <Button
            onClick={handleCopy}
            className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center p-0"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
