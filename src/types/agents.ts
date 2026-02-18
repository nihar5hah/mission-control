// =====================================================
// THE BEGU COMPANY - AGENT TYPES
// Mission Control Revamp
// =====================================================

// Agent IDs
export type AgentId = 'begubot' | 'coder' | 'researcher';

// Agent roles
export type AgentRole = 'Chief of Staff' | 'Employee';

// Agent status
export type AgentStatus = 'active' | 'idle' | 'offline';

// Activity status
export type ActivityStatus = 'running' | 'completed' | 'failed' | 'pending' | 'idle';

// Schedule status
export type ScheduleStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

// Agent action types
export type AgentAction = 
  | 'building'
  | 'researching'
  | 'syncing'
  | 'fixing'
  | 'deploying'
  | 'testing'
  | 'coordinating'
  | 'meeting'
  | 'documenting'
  | 'idle'
  | 'water_cooler';

// Agent definition
export interface Agent {
  id: AgentId;
  name: string;
  role: AgentRole;
  avatar_url?: string;
  color: string;
  reports_to?: AgentId;
  created_at: string;
  updated_at: string;
}

// Agent activity
export interface AgentActivity {
  id: number;
  agent_id: AgentId;
  action: AgentAction | string;
  description: string;
  status: ActivityStatus;
  metadata?: Record<string, unknown>;
  timestamp: string;
  created_at: string;
}

// Agent session
export interface AgentSession {
  id: number;
  agent_id: AgentId;
  session_key: string;
  status: AgentStatus;
  current_action?: string;
  started_at: string;
  last_active: string;
  ended_at?: string;
  metadata?: Record<string, unknown>;
}

// Agent stats
export interface AgentStats {
  id: number;
  agent_id: AgentId;
  total_tokens_used: number;
  total_tasks_completed: number;
  total_tasks_failed: number;
  total_uptime_seconds: number;
  last_reset: string;
  updated_at: string;
  daily_tokens_used: number;
  daily_tasks_completed: number;
  daily_active_seconds: number;
  daily_date: string;
}

// Agent schedule
export interface AgentSchedule {
  id: number;
  agent_id: AgentId;
  title: string;
  description?: string;
  scheduled_for: string;
  duration_minutes: number;
  status: ScheduleStatus;
  recurrence?: 'daily' | 'weekly' | 'monthly';
  recurrence_config?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Agent document
export interface AgentDocument {
  id: number;
  agent_id: AgentId;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  source_file?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Insert types
export type AgentActivityInsert = Omit<AgentActivity, 'id' | 'created_at'>;
export type AgentSessionInsert = Omit<AgentSession, 'id'>;
export type AgentStatsInsert = Omit<AgentStats, 'id'>;
export type AgentScheduleInsert = Omit<AgentSchedule, 'id' | 'created_at' | 'updated_at'>;
export type AgentDocumentInsert = Omit<AgentDocument, 'id' | 'created_at' | 'updated_at'>;

// Combined agent state for UI
export interface AgentState {
  agent: Agent;
  session?: AgentSession;
  stats?: AgentStats;
  latestActivity?: AgentActivity;
  isOnline: boolean;
}

// Action type configuration for UI
export interface AgentActionConfig {
  label: string;
  icon: string; // Icon name
  color: string;
  bg: string;
  border: string;
}

// Agent action configurations
export const AGENT_ACTION_CONFIG: Record<string, AgentActionConfig> = {
  building: {
    label: 'Building',
    icon: 'Hammer',
    color: 'text-[#FF9F0A]',
    bg: 'bg-[#FF9F0A]/10',
    border: 'border-[#FF9F0A]/30',
  },
  researching: {
    label: 'Researching',
    icon: 'Microscope',
    color: 'text-[#8B5CF6]',
    bg: 'bg-[#8B5CF6]/10',
    border: 'border-[#8B5CF6]/30',
  },
  syncing: {
    label: 'Syncing',
    icon: 'RefreshCw',
    color: 'text-[#06B6D4]',
    bg: 'bg-[#06B6D4]/10',
    border: 'border-[#06B6D4]/30',
  },
  fixing: {
    label: 'Fixing Bug',
    icon: 'Wrench',
    color: 'text-[#EF4444]',
    bg: 'bg-[#EF4444]/10',
    border: 'border-[#EF4444]/30',
  },
  deploying: {
    label: 'Deploying',
    icon: 'Rocket',
    color: 'text-[#30D158]',
    bg: 'bg-[#30D158]/10',
    border: 'border-[#30D158]/30',
  },
  testing: {
    label: 'Testing',
    icon: 'TestTube',
    color: 'text-[#3B82F6]',
    bg: 'bg-[#3B82F6]/10',
    border: 'border-[#3B82F6]/30',
  },
  coordinating: {
    label: 'Coordinating',
    icon: 'Users',
    color: 'text-[#8B5CF6]',
    bg: 'bg-[#8B5CF6]/10',
    border: 'border-[#8B5CF6]/30',
  },
  meeting: {
    label: 'In Meeting',
    icon: 'Calendar',
    color: 'text-[#EC4899]',
    bg: 'bg-[#EC4899]/10',
    border: 'border-[#EC4899]/30',
  },
  documenting: {
    label: 'Documenting',
    icon: 'FileText',
    color: 'text-[#6366F1]',
    bg: 'bg-[#6366F1]/10',
    border: 'border-[#6366F1]/30',
  },
  idle: {
    label: 'Idle',
    icon: 'Clock',
    color: 'text-[#888]',
    bg: 'bg-[#888]/10',
    border: 'border-[#888]/30',
  },
  water_cooler: {
    label: 'Water Cooler',
    icon: 'Coffee',
    color: 'text-[#14B8A6]',
    bg: 'bg-[#14B8A6]/10',
    border: 'border-[#14B8A6]/30',
  },
};

// Agent configurations
export const AGENT_CONFIG: Record<AgentId, {
  name: string;
  role: string;
  color: string;
  emoji: string;
  description: string;
}> = {
  begubot: {
    name: 'Begubot',
    role: 'Chief of Staff',
    color: '#8B5CF6',
    emoji: '🎩',
    description: 'Coordinates operations and manages the team',
  },
  coder: {
    name: 'Coder',
    role: 'Employee',
    color: 'var(--color-green)',
    emoji: '💻',
    description: 'Builds and maintains code infrastructure',
  },
  researcher: {
    name: 'Researcher',
    role: 'Employee',
    color: 'var(--color-orange)',
    emoji: '🔬',
    description: 'Conducts research and analysis',
  },
};
