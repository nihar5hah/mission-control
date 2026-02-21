// =====================================================
// AGENT AVATAR COMPONENT - SHARED
// Reusable avatar component for displaying agent icons
// Used by AgentsSidebar and AgentDetailsModal
// =====================================================

'use client';

import { motion } from 'framer-motion';
import {
  Bot,
  Code,
  Microscope,
  Moon,
} from 'lucide-react';
import type { AgentId } from '@/types/agents';

// Helper to get agent icon component
export function getAgentIcon(agentId: AgentId) {
  if (agentId === 'begubot') return Bot;
  if (agentId === 'coder') return Code;
  if (agentId === 'researcher') return Microscope;
  if (agentId === 'extractor') return Moon;
  return Bot; // default
}

interface AgentAvatarProps {
  agentId: AgentId;
  color: string;
  size?: 'sm' | 'lg';
  glow?: boolean;
}

// Agent avatar component
export function AgentAvatar({ agentId, color, size = 'sm', glow = false }: AgentAvatarProps) {
  const Icon = getAgentIcon(agentId);
  const sizeClass = size === 'lg' ? 'w-20 h-20' : 'w-10 h-10';
  const iconSize = size === 'lg' ? 'w-10 h-10' : 'w-5 h-5';

  if (size === 'lg') {
    // Modal version with optional glow
    return (
      <div
        className={`relative ${sizeClass} rounded-lg overflow-hidden flex items-center justify-center`}
        style={{
          background: `${color}20`,
          border: `1px solid ${color}`,
          ...(glow && { boxShadow: `0 0 20px ${color}40` }),
        }}
      >
        <Icon className={iconSize} style={{ color }} />
      </div>
    );
  }

  // Sidebar version with hover animation
  return (
    <motion.div
      className={`${sizeClass} rounded-lg flex items-center justify-center relative overflow-hidden flex-shrink-0`}
      style={{ backgroundColor: `${color}18`, border: `1px solid ${color}28` }}
      whileHover={{ scale: 1.05 }}
    >
      <Icon className={iconSize} style={{ color }} />
    </motion.div>
  );
}

export default AgentAvatar;
