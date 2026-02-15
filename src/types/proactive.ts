// Proactive Intelligence System - Type Definitions

// =============================================
// PROACTIVE ACTIONS
// =============================================
export interface ProactiveAction {
  id: number;
  type: 'notification' | 'task_create' | 'reminder' | 'suggestion' | 'auto_fix' | 'sync' | 'analysis' | 'prediction';
  category: 'time_management' | 'automation' | 'monetization' | 'learning' | 'collaboration' | 'workflow' | 'security';
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'dismissed';
  metadata: Record<string, unknown>;
  created_at: string;
  completed_at: string | null;
  source: string | null;
  confidence_score: number | null;
}

export type ProactiveActionInsert = Omit<ProactiveAction, 'id' | 'created_at' | 'completed_at'>;
export type ProactiveActionUpdate = Partial<ProactiveActionInsert>;

// =============================================
// PATTERNS
// =============================================
export interface Pattern {
  id: number;
  category: 'time' | 'workflow' | 'attention' | 'opportunity' | 'learning' | 'collaboration';
  name: string;
  pattern_data: {
    // Time patterns
    typical_start_hour?: number;
    typical_end_hour?: number;
    most_productive_hours?: number[];
    peak_activity_days?: string[];
    // Workflow patterns
    frequent_tasks?: string[];
    avg_task_duration?: number;
    // Attention patterns
    context_switch_frequency?: number;
    interruption_sources?: string[];
    // Opportunity patterns
    automation_candidates?: string[];
    skill_gaps?: string[];
    [key: string]: unknown;
  };
  frequency: 'constant' | 'daily' | 'weekly' | 'monthly' | 'rare' | 'unknown';
  last_seen: string;
  first_seen: string;
  impact_score: number;
  confidence: number;
  occurrence_count: number;
  metadata: Record<string, unknown>;
  is_active: boolean;
  suggested_action: string | null;
}

export type PatternInsert = Omit<Pattern, 'id' | 'last_seen' | 'first_seen' | 'occurrence_count'>;
export type PatternUpdate = Partial<PatternInsert>;

// =============================================
// OPPORTUNITIES
// =============================================
export interface Opportunity {
  id: number;
  type: 'monetization' | 'automation' | 'collaboration' | 'learning' | 'efficiency' | 'security';
  title: string;
  description: string;
  potential_value: 'low' | 'medium' | 'high' | 'transformative';
  effort_estimate: 'low' | 'medium' | 'high';
  status: 'discovered' | 'investigating' | 'validated' | 'implemented' | 'dismissed';
  source_pattern_id: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  implemented_at: string | null;
  tags: string[];
  priority_score: number;
}

export type OpportunityInsert = Omit<Opportunity, 'id' | 'created_at' | 'updated_at' | 'implemented_at'>;
export type OpportunityUpdate = Partial<OpportunityInsert>;

// =============================================
// DECISIONS
// =============================================
export interface Decision {
  id: number;
  context: Record<string, unknown>;
  decision: string;
  reasoning: string;
  outcome: string | null;
  confidence_score: number;
  status: 'pending' | 'approved' | 'rejected' | 'executed';
  executed_at: string | null;
  created_at: string;
  related_action_id: number | null;
  metadata: Record<string, unknown>;
}

export type DecisionInsert = Omit<Decision, 'id' | 'created_at' | 'executed_at'>;
export type DecisionUpdate = Partial<DecisionInsert>;

// =============================================
// INTELLIGENCE CACHE
// =============================================
export interface IntelligenceCache {
  id: number;
  source: 'github' | 'vercel' | 'calendar' | 'filesystem' | 'web' | 'supabase';
  data_key: string;
  data: Record<string, unknown>;
  expires_at: string;
  created_at: string;
}

// =============================================
// INTEGRATION DATA TYPES
// =============================================
export interface GitHubData {
  repos: GitHubRepo[];
  recent_issues: GitHubIssue[];
  recent_prs: GitHubPR[];
  activity: GitHubActivity[];
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  html_url: string;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  labels: string[];
  created_at: string;
  updated_at: string;
  html_url: string;
  repository: string;
}

export interface GitHubPR {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed' | 'merged';
  created_at: string;
  updated_at: string;
  html_url: string;
  repository: string;
}

export interface GitHubActivity {
  type: 'push' | 'pr' | 'issue' | 'comment' | 'fork' | 'star';
  repo: string;
  description: string;
  timestamp: string;
}

export interface VercelData {
  deployments: VercelDeployment[];
  projects: VercelProject[];
  logs: VercelLog[];
}

export interface VercelDeployment {
  uid: string;
  name: string;
  state: 'READY' | 'ERROR' | 'BUILDING' | 'QUEUED' | 'CANCELED';
  created: number;
  ready: number | null;
  meta: Record<string, string>;
  url: string;
}

export interface VercelProject {
  id: string;
  name: string;
  framework: string | null;
  updated_at: string;
}

export interface VercelLog {
  id: string;
  message: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  timestamp: string;
}

export interface CalendarData {
  events: CalendarEvent[];
  patterns: CalendarPattern;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  location?: string;
  attendees?: string[];
  recurring: boolean;
}

export interface CalendarPattern {
  typical_event_duration: number;
  most_common_event_types: string[];
  busy_hours: number[];
  free_hours: number[];
}

export interface FileSystemData {
  recent_changes: FileChange[];
  structure: FileTreeNode;
  stats: FileSystemStats;
}

export interface FileChange {
  path: string;
  type: 'create' | 'modify' | 'delete' | 'rename';
  timestamp: string;
  size?: number;
}

export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileTreeNode[];
  modified?: string;
}

export interface FileSystemStats {
  total_files: number;
  total_directories: number;
  total_size: number;
  file_types: Record<string, number>;
}

// =============================================
// DECISION ENGINE TYPES
// =============================================
export interface DecisionRequest {
  type: 'categorize' | 'route' | 'generate' | 'recommend' | 'predict';
  data: Record<string, unknown>;
  context?: Record<string, unknown>;
}

export interface DecisionResult {
  decision: string;
  reasoning: string;
  confidence: number;
  metadata: Record<string, unknown>;
  suggested_actions?: string[];
}

// =============================================
// PATTERN ANALYSIS TYPES
// =============================================
export interface PatternAnalysis {
  type: string;
  data: Record<string, unknown>;
  confidence: number;
  recommendations: string[];
}

export interface TimeAnalysis {
  typical_start: number;
  typical_end: number;
  productive_hours: number[];
  peak_days: string[];
  average_session_length: number;
}

export interface WorkflowAnalysis {
  frequent_operations: string[];
  bottlenecks: string[];
  automation_candidates: string[];
  efficiency_score: number;
}

// =============================================
// OPPORTUNITY ANALYSIS TYPES
// =============================================
export interface OpportunityAnalysis {
  type: string;
  title: string;
  description: string;
  potential_impact: number; // 0-1
  effort_required: number; // 0-1
  priority_score: number; // 0-1
  action_items: string[];
}

// =============================================
// DASHBOARD TYPES
// =============================================
export interface DashboardSummary {
  actions_last_24h: ProactiveAction[];
  opportunities: Opportunity[];
  patterns: Pattern[];
  suggestions: DecisionResult[];
  predictions: Prediction[];
  stats: DashboardStats;
}

export interface Prediction {
  id: string;
  type: string;
  description: string;
  likelihood: number; // 0-1
  timeframe: string;
  action_items: string[];
}

export interface DashboardStats {
  total_actions_today: number;
  completed_actions_today: number;
  opportunities_found: number;
  opportunities_implemented: number;
  patterns_detected: number;
  avg_confidence_score: number;
}
