/**
 * Proactive Intelligence System
 * Central export for all proactive modules
 */

// Core Engines
export { patternEngine, timePatterns, workflowPatterns, attentionPatterns } from './patterns';
export { decisionEngine, categorizeEngine, routeEngine, generateEngine, recommendEngine, predictEngine } from './decisions';
export { opportunityFinder } from './opportunities';
export { integrations, github, vercel, calendar, filesystem, database } from './integrations';

// Types
export type {
  ProactiveAction,
  Pattern,
  Opportunity,
  Decision,
  DecisionRequest,
  DecisionResult,
  PatternAnalysis,
  TimeAnalysis,
  WorkflowAnalysis,
  OpportunityAnalysis,
  DashboardSummary,
  DashboardStats,
  Prediction,
} from '@/types/proactive';
