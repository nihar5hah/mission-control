'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Coffee, Heart, DollarSign, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DonationEmbed() {
  return (
    <div className="apple-card p-5 relative overflow-hidden group">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-all duration-500" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" />
          <h3 className="text-sm font-semibold">Support the Project</h3>
        </div>

        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          If you find Mission Control useful, consider supporting the development. Every coffee helps keep the agents running.
        </p>

        <div className="space-y-2">
          <Button
            asChild
            className="w-full justify-between bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20 text-amber-500 hover:text-amber-400 transition-all"
          >
            <a href="https://buymeacoffee.com/yourprofile" target="_blank" rel="noopener noreferrer">
              <span className="flex items-center gap-2">
                <Coffee className="w-4 h-4" />
                Buy Me a Coffee
              </span>
              <ExternalLink className="w-3 h-3 opacity-50" />
            </a>
          </Button>

          <Button
            asChild
            className="w-full justify-between bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20 text-blue-500 hover:text-blue-400 transition-all"
          >
            <a href="https://patreon.com/yourprofile" target="_blank" rel="noopener noreferrer">
              <span className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Support on Patreon
              </span>
              <ExternalLink className="w-3 h-3 opacity-50" />
            </a>
          </Button>
        </div>

        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-center gap-2">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-5 h-5 rounded-full border border-black bg-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-400">
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
          <span className="text-[10px] text-slate-500">12 supporters this month</span>
        </div>
      </div>
    </div>
  );
}
