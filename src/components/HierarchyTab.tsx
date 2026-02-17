// =====================================================
// HIERARCHY TAB COMPONENT
// Visual org chart for The Begu Company
// =====================================================

'use client';

import { motion } from 'framer-motion';
import { Bot, Code, Microscope, Users, Building, ArrowDown, ChevronDown } from 'lucide-react';
import type { AgentId } from '@/types/agents';
import { AGENT_CONFIG } from '@/types/agents';

// Agent avatar component
function HierarchyAvatar({ agentId, color, name, role }: { agentId: AgentId; color: string; name: string; role: string }) {
  const Icon = agentId === 'begubot' ? Bot : agentId === 'coder' ? Code : Microscope;

  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Avatar */}
      <motion.div
        className="w-20 h-20 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-md bg-white border border-slate-200"
        style={{
          backgroundColor: `${color}08`,
          borderColor: `${color}40`
        }}
        whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
        transition={{ duration: 0.3 }}
      >
        <Icon className="w-10 h-10" style={{ color }} />

        {/* Glow effect */}
        <motion.div
          className="absolute inset-0"
          style={{ background: `radial-gradient(circle at center, ${color}15 0%, transparent 70%)` }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      {/* Name and role */}
      <div className="mt-3 text-center">
        <h3 className="font-semibold text-slate-900">{name}</h3>
        <p className="text-xs text-slate-500">{role}</p>
      </div>
    </motion.div>
  );
}

// Connection line component
function ConnectionLine({ color }: { color: string }) {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        className="w-0.5 h-8"
        style={{ backgroundColor: `${color}40` }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      />
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <ChevronDown className="w-4 h-4" style={{ color: `${color}60` }} />
      </motion.div>
    </div>
  );
}

// Main hierarchy component
export function HierarchyTab() {
  const begubot = AGENT_CONFIG.begubot;
  const coder = AGENT_CONFIG.coder;
  const researcher = AGENT_CONFIG.researcher;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-full flex flex-col"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Building className="w-6 h-6 text-teal-600" />
          <h2 className="text-2xl font-semibold text-slate-900">Company Hierarchy</h2>
        </div>
        <p className="text-sm text-slate-600">
          The Begu Company • Organizational structure
        </p>
      </div>

      {/* Org chart */}
      <div className="flex-1 flex flex-col items-center justify-center py-8">
        {/* CEO/Chief of Staff */}
        <div className="mb-2">
          <HierarchyAvatar
            agentId="begubot"
            color={begubot.color}
            name={begubot.name}
            role={begubot.role}
          />
        </div>

        {/* Connection lines */}
        <div className="flex items-start gap-32 my-4">
          <ConnectionLine color={coder.color} />
          <ConnectionLine color={begubot.color} />
          <ConnectionLine color={researcher.color} />
        </div>

        {/* Horizontal connector */}
        <motion.div
          className="relative w-64 h-0.5 mb-4"
          style={{ backgroundColor: '#CBD5E1' }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {/* Center vertical line */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 w-0.5 h-8"
            style={{ backgroundColor: '#CBD5E1', top: '-2rem' }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          />
        </motion.div>

        {/* Employees */}
        <div className="flex items-start gap-16">
          <HierarchyAvatar
            agentId="coder"
            color={coder.color}
            name={coder.name}
            role={coder.role}
          />
          <HierarchyAvatar
            agentId="researcher"
            color={researcher.color}
            name={researcher.name}
            role={researcher.role}
          />
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-3 gap-4 mt-8">
        <motion.div
          className="bg-white border border-slate-200 rounded-lg shadow-sm p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: begubot.color }} />
            <h4 className="font-semibold text-slate-900 text-sm">{begubot.name}</h4>
          </div>
          <p className="text-xs text-slate-600">{begubot.description}</p>
          <div className="mt-2 text-xs text-slate-500">
            Reports to: <span className="text-slate-600">N/A (Top Level)</span>
          </div>
        </motion.div>

        <motion.div
          className="bg-white border border-slate-200 rounded-lg shadow-sm p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: coder.color }} />
            <h4 className="font-semibold text-slate-900 text-sm">{coder.name}</h4>
          </div>
          <p className="text-xs text-slate-600">{coder.description}</p>
          <div className="mt-2 text-xs text-slate-500">
            Reports to: <span style={{ color: coder.color }}>{begubot.name}</span>
          </div>
        </motion.div>

        <motion.div
          className="bg-white border border-slate-200 rounded-lg shadow-sm p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: researcher.color }} />
            <h4 className="font-semibold text-slate-900 text-sm">{researcher.name}</h4>
          </div>
          <p className="text-xs text-slate-600">{researcher.description}</p>
          <div className="mt-2 text-xs text-slate-500">
            Reports to: <span style={{ color: researcher.color }}>{begubot.name}</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default HierarchyTab;
