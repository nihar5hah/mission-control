/**
 * Decision Engine
 * Autonomous decision-making for categorization, routing, and recommendations
 * Part of Proactive Intelligence System
 */

import { supabase } from '../supabase';
import { patternEngine, timePatterns } from './patterns';
import type { Decision, DecisionRequest, DecisionResult, Pattern } from '@/types/proactive';

// =============================================
// DECISION STORAGE
// =============================================
const decisionStorage = {
  /**
   * Log a decision
   */
  async log(decision: Omit<Decision, 'id' | 'created_at' | 'executed_at'>): Promise<number> {
    const { data, error } = await supabase
      .from('decisions')
      .insert({
        context: decision.context,
        decision: decision.decision,
        reasoning: decision.reasoning,
        outcome: decision.outcome,
        confidence_score: decision.confidence_score,
        status: decision.status,
        related_action_id: decision.related_action_id,
        metadata: decision.metadata,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to log decision:', error);
      throw error;
    }

    return data.id;
  },

  /**
   * Update decision status
   */
  async updateStatus(id: number, status: string, outcome?: string): Promise<void> {
    await supabase
      .from('decisions')
      .update({
        status,
        outcome,
        executed_at: status === 'executed' ? new Date().toISOString() : null,
      })
      .eq('id', id);
  },

  /**
   * Get recent decisions
   */
  async getRecent(limit = 20): Promise<Decision[]> {
    const { data } = await supabase
      .from('decisions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    return data || [];
  },
};

// =============================================
// CATEGORIZATION ENGINE
// =============================================
const categorizeEngine = {
  /**
   * Auto-categorize items (tasks, activities, etc.)
   */
  categorize(item: { title?: string; description?: string; type?: string }): {
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: string;
    tags: string[];
  } {
    const text = `${item.title || ''} ${item.description || ''} ${item.type || ''}`.toLowerCase();
    
    // Priority detection
    let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
    const urgentKeywords = ['urgent', 'asap', 'emergency', 'critical', 'deadline now', 'important!'];
    const highPriorityKeywords = ['important', 'deadline', 'due soon', 'priority'];
    
    if (urgentKeywords.some(k => text.includes(k))) {
      priority = 'urgent';
    } else if (highPriorityKeywords.some(k => text.includes(k))) {
      priority = 'high';
    }

    // Category detection
    let category = 'general';
    const categories: Record<string, string[]> = {
      development: ['code', 'build', 'fix', 'bug', 'feature', 'deploy', 'refactor', 'pr', 'commit'],
      study: ['study', 'learn', 'read', ' lecture', 'exam', 'review', 'notes', 'homework'],
      meeting: ['meeting', 'call', 'sync', 'discussion', 'standup', '1:1'],
      admin: ['email', 'schedule', 'organize', 'planning', 'review', 'report'],
      creative: ['design', 'write', 'content', 'draft', 'blog', 'video'],
      health: ['exercise', 'workout', 'meditate', 'break', 'sleep', 'food'],
    };

    for (const [cat, keywords] of Object.entries(categories)) {
      if (keywords.some(k => text.includes(k))) {
        category = cat;
        break;
      }
    }

    // Tag extraction
    const tags: string[] = [];
    const tagPatterns = [
      { pattern: /#(\w+)/g, extract: (m: string) => m.slice(1) },
      { pattern: /@(\w+)/g, extract: (m: string) => m.slice(1) },
    ];

    // Auto-tags based on content
    if (text.includes('repeat') || text.includes('recurring')) tags.push('recurring');
    if (text.includes('waiting')) tags.push('waiting');
    if (text.includes('blocked')) tags.push('blocked');
    if (text.includes('quick') || text.includes('5 min')) tags.push('quick');
    if (text.includes('deep work') || text.includes('focus')) tags.push('focus');

    return { priority, category, tags };
  },

  /**
   * Batch categorize items
   */
  batchCategorize(items: Array<{ title?: string; description?: string; type?: string }>): Array<{
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: string;
    tags: string[];
  }> {
    return items.map(item => this.categorize(item));
  },
};

// =============================================
// ROUTING ENGINE
// =============================================
const routeEngine = {
  /**
   * Determine best time/context to handle a task
   */
  async determineRoute(task: { title?: string; description?: string; priority?: string }): Promise<{
    bestTime: string;
    bestContext: string;
    suggestedDuration: number;
    reasoning: string;
  }> {
    const timeAnalysis = await timePatterns.analyze();
    const text = `${task.title || ''} ${task.description || ''}`.toLowerCase();

    // Quick tasks (< 15 min)
    if (text.includes('quick') || text.includes('5 min') || text.includes('small')) {
      return {
        bestTime: 'now',
        bestContext: 'between other tasks',
        suggestedDuration: 5,
        reasoning: 'Quick task can be done immediately between bigger tasks',
      };
    }

    // Deep work tasks
    if (text.includes('deep') || text.includes('focus') || text.includes('complex') || text.includes('important')) {
      const bestHour = timeAnalysis.productive_hours[0] || 9;
      return {
        bestTime: `today at ${bestHour}:00`,
        bestContext: 'dedicated focus time',
        suggestedDuration: 90,
        reasoning: `Your most productive hours are ${timeAnalysis.productive_hours.join(', ')}`,
      };
    }

    // Admin/light tasks
    if (text.includes('email') || text.includes('admin') || text.includes('schedule')) {
      return {
        bestTime: 'morning',
        bestContext: 'start of day routine',
        suggestedDuration: 30,
        reasoning: 'Light administrative tasks best done at day start',
      };
    }

    // Default routing
    return {
      bestTime: 'when convenient',
      bestContext: 'available time',
      suggestedDuration: 30,
      reasoning: 'Standard task - schedule based on availability',
    };
  },
};

// =============================================
// GENERATION ENGINE
// =============================================
const generateEngine = {
  /**
   * Generate sub-tasks from a main task
   */
  generateSubtasks(mainTask: string): Array<{ title: string; type: string }> {
    const subtasks: Array<{ title: string; type: string }> = [];
    const taskLower = mainTask.toLowerCase();

    // Project-like tasks
    if (taskLower.includes('project') || taskLower.includes('build')) {
      subtasks.push(
        { title: 'Research requirements', type: 'research' },
        { title: 'Create initial structure', type: 'build' },
        { title: 'Implement core features', type: 'build' },
        { title: 'Test and verify', type: 'test' },
        { title: 'Document changes', type: 'docs' }
      );
    }

    // Study tasks
    else if (taskLower.includes('study') || taskLower.includes('learn')) {
      subtasks.push(
        { title: 'Review previous material', type: 'review' },
        { title: 'Watch/read new content', type: 'learning' },
        { title: 'Take notes', type: 'notes' },
        { title: 'Practice exercises', type: 'practice' }
      );
    }

    // Bug fix
    else if (taskLower.includes('bug') || taskLower.includes('fix')) {
      subtasks.push(
        { title: 'Reproduce the issue', type: 'research' },
        { title: 'Identify root cause', type: 'analysis' },
        { title: 'Implement fix', type: 'fix' },
        { title: 'Verify fix works', type: 'test' }
      );
    }

    // Generic
    else {
      subtasks.push(
        { title: 'Break down task', type: 'planning' },
        { title: 'Execute main work', type: 'work' },
        { title: 'Review and finalize', type: 'review' }
      );
    }

    return subtasks;
  },

  /**
   * Generate follow-up tasks
   */
  generateFollowups(completedTask: string): string[] {
    const followups: string[] = [];
    const taskLower = completedTask.toLowerCase();

    // Code-related
    if (taskLower.includes('code') || taskLower.includes('build')) {
      followups.push('Write tests for new code');
      followups.push('Update documentation');
    }

    // Meeting-related
    if (taskLower.includes('meeting') || taskLower.includes('call')) {
      followups.push('Send meeting notes');
      followups.push('Follow up on action items');
    }

    // Study-related
    if (taskLower.includes('study') || taskLower.includes('learn')) {
      followups.push('Review notes within 24 hours');
      followups.push('Practice with exercises');
    }

    return followups;
  },

  /**
   * Generate reminders
   */
  generateReminders(task: { title: string; scheduled_for?: string }): Array<{
    type: string;
    timing: string;
    message: string;
  }> {
    const reminders = [];

    // Pre-task reminder
    reminders.push({
      type: 'reminder',
      timing: 'before',
      message: `Upcoming: ${task.title}`,
    });

    // Follow-up reminder
    reminders.push({
      type: 'followup',
      timing: 'after',
      message: `Follow up on: ${task.title}`,
    });

    return reminders;
  },
};

// =============================================
// RECOMMENDATION ENGINE
// =============================================
const recommendEngine = {
  /**
   * Generate smart recommendations
   */
  async generate(): Promise<DecisionResult[]> {
    const recommendations: DecisionResult[] = [];

    // Get pattern data
    const timeInsights = await patternEngine.getTimeInsights();
    const workflowInsights = await patternEngine.getWorkflowInsights();

    // Time-based recommendations
    if (timeInsights.recommendation) {
      recommendations.push({
        decision: 'time_optimization',
        reasoning: timeInsights.recommendation,
        confidence: 0.75,
        metadata: { type: 'time' },
        suggested_actions: ['Consider adjusting schedule', 'Block productive hours'],
      });
    }

    // Workflow recommendations
    if (workflowInsights.bottlenecks.length > 0) {
      recommendations.push({
        decision: 'workflow_improvement',
        reasoning: workflowInsights.bottlenecks[0],
        confidence: 0.7,
        metadata: { type: 'workflow', bottlenecks: workflowInsights.bottlenecks },
        suggested_actions: workflowInsights.recommendations,
      });
    }

    // Efficiency recommendations
    if (workflowInsights.efficiency < 70) {
      recommendations.push({
        decision: 'efficiency_boost',
        reasoning: `Current efficiency score is ${workflowInsights.efficiency}%`,
        confidence: 0.65,
        metadata: { efficiency: workflowInsights.efficiency },
        suggested_actions: [
          'Clear pending tasks',
          'Focus on completing current work before starting new',
          'Use time-blocking',
        ],
      });
    }

    // Always include some positive reinforcement
    if (recommendations.length === 0) {
      recommendations.push({
        decision: 'keep_up_good_work',
        reasoning: 'Your patterns look healthy!',
        confidence: 0.9,
        metadata: {},
        suggested_actions: [],
      });
    }

    return recommendations;
  },
};

// =============================================
// PREDICTION ENGINE
// =============================================
const predictEngine = {
  /**
   * Predict what needs attention
   */
  async predict(): Promise<Array<{
    type: string;
    description: string;
    likelihood: number;
    timeframe: string;
    action_items: string[];
  }>> {
    const predictions: Array<{
      type: string;
      description: string;
      likelihood: number;
      timeframe: string;
      action_items: string[];
    }> = [];

    // Predict task backlog
    const { data: tasks } = await supabase
      .from('tasks')
      .select('status, scheduled_for')
      .eq('status', 'pending');

    if (tasks && tasks.length > 5) {
      predictions.push({
        type: 'task_overload',
        description: `You have ${tasks.length} pending tasks - may become overwhelming`,
        likelihood: 0.8,
        timeframe: 'this week',
        action_items: ['Review and prioritize tasks', 'Delegate or defer low-priority items'],
      });
    }

    // Predict study session need
    const { data: recentSessions } = await supabase
      .from('study_sessions')
      .select('completed_at')
      .order('completed_at', { ascending: false })
      .limit(1);

    if (recentSessions && recentSessions.length > 0) {
      const lastSession = new Date(recentSessions[0].completed_at);
      const daysSince = Math.floor((Date.now() - lastSession.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSince > 2) {
        predictions.push({
          type: 'study_gap',
          description: `No study session in ${daysSince} days - streak at risk`,
          likelihood: 0.7,
          timeframe: 'today or tomorrow',
          action_items: ['Schedule a study session', 'Review material briefly'],
        });
      }
    }

    // Predict maintenance need
    predictions.push({
      type: 'cleanup_recommended',
      description: 'Regular cleanup helps maintain productivity',
      likelihood: 0.5,
      timeframe: 'this week',
      action_items: ['Review completed tasks', 'Clear old files', 'Update documentation'],
    });

    return predictions;
  },
};

// =============================================
// MAIN DECISION ENGINE
// =============================================
export const decisionEngine = {
  /**
   * Process a decision request
   */
  async process(request: DecisionRequest): Promise<DecisionResult> {
    let result: DecisionResult;

    switch (request.type) {
      case 'categorize':
        result = {
          decision: 'categorize',
          reasoning: '',
          confidence: 0.85,
          metadata: categorizeEngine.categorize(request.data as any),
          suggested_actions: [],
        };
        result.reasoning = `Categorized as ${result.metadata.category} with ${result.metadata.priority} priority`;
        break;

      case 'route':
        const route = await routeEngine.determineRoute(request.data as any);
        result = {
          decision: 'route',
          reasoning: route.reasoning,
          confidence: 0.7,
          metadata: route,
          suggested_actions: [`Schedule for ${route.bestTime}`],
        };
        break;

      case 'generate':
        const subTasks = generateEngine.generateSubtasks(request.data.title as string);
        const followups = generateEngine.generateFollowups(request.data.title as string);
        result = {
          decision: 'generate',
          reasoning: `Generated ${subTasks.length} subtasks and ${followups.length} follow-ups`,
          confidence: 0.75,
          metadata: { subtasks, followups },
          suggested_actions: subTasks.map(s => s.title),
        };
        break;

      case 'recommend':
        const recommendations = await recommendEngine.generate();
        result = recommendations[0] || {
          decision: 'none',
          reasoning: 'No recommendations at this time',
          confidence: 0,
          metadata: {},
          suggested_actions: [],
        };
        break;

      case 'predict':
        const predictions = await predictEngine.predict();
        result = {
          decision: 'predict',
          reasoning: `Found ${predictions.length} predictions`,
          confidence: 0.65,
          metadata: { predictions },
          suggested_actions: predictions.flatMap(p => p.action_items),
        };
        break;

      default:
        result = {
          decision: 'unknown',
          reasoning: 'Unknown decision type',
          confidence: 0,
          metadata: {},
          suggested_actions: [],
        };
    }

    // Log the decision
    await decisionStorage.log({
      context: request.context || request.data,
      decision: result.decision,
      reasoning: result.reasoning,
      outcome: null,
      confidence_score: result.confidence,
      status: 'pending',
      related_action_id: null,
      metadata: result.metadata,
    });

    return result;
  },

  /**
   * Get recent decisions for dashboard
   */
  async getRecentDecisions(): Promise<Decision[]> {
    return decisionStorage.getRecent(10);
  },

  /**
   * Execute a decision (mark as approved/rejected)
   */
  async execute(decisionId: number, approved: boolean, outcome?: string): Promise<void> {
    await decisionStorage.updateStatus(
      decisionId, 
      approved ? 'executed' : 'rejected',
      outcome
    );
  },

  /**
   * Quick categorize helper
   */
  categorize: categorizeEngine.categorize,

  /**
   * Quick route helper
   */
  route: routeEngine.determineRoute,

  /**
   * Quick generate helper
   */
  generate: {
    subtasks: generateEngine.generateSubtasks,
    followups: generateEngine.generateFollowups,
    reminders: generateEngine.generateReminders,
  },

  /**
   * Get all recommendations
   */
  getRecommendations: recommendEngine.generate,

  /**
   * Get all predictions
   */
  getPredictions: predictEngine.predict,
};

export default decisionEngine;
