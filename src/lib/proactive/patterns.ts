/**
 * Pattern Recognition Engine
 * Identifies patterns in user behavior and work patterns
 * Part of Proactive Intelligence System
 */

import { supabase } from '../supabase';
import { database, calendar } from './integrations';
import type { Pattern, TimeAnalysis, WorkflowAnalysis, PatternAnalysis } from '@/types/proactive';

// =============================================
// TIME PATTERN ANALYSIS
// =============================================
export const timePatterns = {
  /**
   * Analyze when the user is most active
   */
  async analyze(): Promise<TimeAnalysis> {
    const activities = await database.getRecentActivities(200);
    
    if (activities.length === 0) {
      return {
        typical_start: 9,
        typical_end: 17,
        productive_hours: [9, 10, 11, 14, 15, 16],
        peak_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        average_session_length: 120,
      };
    }

    // Extract hours from activity timestamps
    const hourCounts = new Array(24).fill(0);
    const dayCounts: Record<string, number> = {};
    const durations: number[] = [];

    activities.forEach((activity: any) => {
      const timestamp = new Date(activity.created_at);
      const hour = timestamp.getHours();
      hourCounts[hour]++;

      const day = timestamp.toLocaleDateString('en-US', { weekday: 'long' });
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });

    // Find most productive hours (top 6 hours)
    const productiveHours = hourCounts
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
      .map(h => h.hour);

    // Find peak days
    const peakDays = Object.entries(dayCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([day]) => day);

    // Calculate typical start/end hours (when activity begins/ends)
    const activeHours = hourCounts
      .map((count, hour) => ({ hour, count }))
      .filter(h => h.count > 0);

    const typicalStart = activeHours.length > 0 ? activeHours[0].hour : 9;
    const typicalEnd = activeHours.length > 0 ? activeHours[activeHours.length - 1].hour : 17;

    // Estimate average session length
    const avgDuration = activities.length > 0 
      ? Math.round((activities.length * 5) / 60) // Rough estimate
      : 120;

    return {
      typical_start: typicalStart,
      typical_end: typicalEnd,
      productive_hours: productiveHours,
      peak_days: peakDays,
      average_session_length: avgDuration,
    };
  },

  /**
   * Detect time-based opportunities
   */
  detectOpportunities(analysis: TimeAnalysis): string[] {
    const opportunities: string[] = [];

    // Check for early morning potential
    if (analysis.typical_start >= 10) {
      opportunities.push('User starts late - could tackle deep work earlier');
    }

    // Check for late night work
    if (analysis.typical_end >= 22) {
      opportunities.push('User works late - consider sleep optimization');
    }

    // Check for mid-day slump
    const afternoonSlump = analysis.productive_hours.includes(14) || 
                           analysis.productive_hours.includes(15);
    if (afternoonSlump) {
      opportunities.push('Afternoon productivity detected - schedule breaks then');
    }

    // Check for weekend work
    if (analysis.peak_days.includes('Saturday') || analysis.peak_days.includes('Sunday')) {
      opportunities.push('Weekend work detected - balance may need attention');
    }

    return opportunities;
  },
};

// =============================================
// WORKFLOW PATTERN ANALYSIS
// =============================================
export const workflowPatterns = {
  /**
   * Analyze workflow patterns
   */
  async analyze(): Promise<WorkflowAnalysis> {
    const [activities, taskStats] = await Promise.all([
      database.getRecentActivities(100),
      database.getTaskStats(),
    ]);

    // Analyze action types
    const actionCounts: Record<string, number> = {};
    activities.forEach((a: any) => {
      const action = a.action || 'unknown';
      actionCounts[action] = (actionCounts[action] || 0) + 1;
    });

    const frequentOperations = Object.entries(actionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([action]) => action);

    // Detect bottlenecks
    const bottlenecks: string[] = [];
    
    if (taskStats.pending > 10) {
      bottlenecks.push('High pending task count - consider clearing');
    }

    if (taskStats.daily > 5) {
      bottlenecks.push('Many daily tasks - may be overwhelming');
    }

    // Identify automation candidates
    const automationCandidates = this.detectAutomationCandidates(activities);

    // Calculate efficiency score
    const completedRate = taskStats.completed / (taskStats.pending + taskStats.completed) || 0;
    const efficiencyScore = Math.min(completedRate * 1.5, 1);

    return {
      frequent_operations: frequentOperations,
      bottlenecks,
      automation_candidates: automationCandidates,
      efficiency_score: efficiencyScore,
    };
  },

  /**
   * Detect what tasks could be automated
   */
  detectAutomationCandidates(activities: any[]): string[] {
    const candidates: string[] = [];
    const actionCounts: Record<string, number> = {};

    activities.forEach((a: any) => {
      const action = a.action?.toLowerCase() || '';
      actionCounts[action] = (actionCounts[action] || 0) + 1;
    });

    // Look for repetitive actions
    Object.entries(actionCounts).forEach(([action, count]) => {
      if (count >= 5 && !['build', 'research'].includes(action)) {
        candidates.push(`Repeated ${action} actions - consider automation`);
      }
    });

    return candidates;
  },
};

// =============================================
// ATTENTION PATTERN ANALYSIS
// =============================================
export const attentionPatterns = {
  /**
   * Analyze attention and focus patterns
   */
  async analyze() {
    const [activities, taskStats] = await Promise.all([
      database.getRecentActivities(50),
      database.getTaskStats(),
    ]);

    // Calculate context switch frequency
    let switches = 0;
    for (let i = 1; i < activities.length; i++) {
      const prev = activities[i - 1]?.action;
      const curr = activities[i]?.action;
      if (prev && curr && prev !== curr) {
        switches++;
      }
    }
    const switchFrequency = activities.length > 1 
      ? switches / (activities.length - 1) 
      : 0;

    // Detect interruption patterns
    const interruptionPatterns: string[] = [];
    
    // Check for task switching
    if (switchFrequency > 0.5) {
      interruptionPatterns.push('High context switching detected');
    }

    // Check for pending task accumulation
    if (taskStats.pending > taskStats.completed) {
      interruptionPatterns.push('Task backlog may be causing distraction');
    }

    return {
      context_switch_frequency: Math.round(switchFrequency * 100) / 100,
      interruption_sources: interruptionPatterns,
      focus_score: Math.max(0, 1 - switchFrequency),
    };
  },
};

// =============================================
// PATTERN STORAGE AND RETRIEVAL
// =============================================
const patternStorage = {
  /**
   * Save detected pattern to database
   */
  async save(pattern: Omit<Pattern, 'id' | 'last_seen' | 'first_seen' | 'occurrence_count'>): Promise<number> {
    const { data, error } = await supabase
      .from('patterns')
      .insert({
        category: pattern.category,
        name: pattern.name,
        pattern_data: pattern.pattern_data,
        frequency: pattern.frequency,
        impact_score: pattern.impact_score,
        confidence: pattern.confidence,
        metadata: pattern.metadata,
        is_active: pattern.is_active,
        suggested_action: pattern.suggested_action,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to save pattern:', error);
      throw error;
    }

    return data.id;
  },

  /**
   * Update existing pattern
   */
  async update(id: number, updates: Partial<Pattern>): Promise<void> {
    await supabase
      .from('patterns')
      .update({
        ...updates,
        last_seen: new Date().toISOString(),
      })
      .eq('id', id);
  },

  /**
   * Get active patterns by category
   */
  async getByCategory(category: string): Promise<Pattern[]> {
    const { data } = await supabase
      .from('patterns')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('impact_score', { ascending: false });

    return data || [];
  },

  /**
   * Get all active patterns
   */
  async getAll(): Promise<Pattern[]> {
    const { data } = await supabase
      .from('patterns')
      .select('*')
      .eq('is_active', true)
      .order('impact_score', { ascending: false });

    return data || [];
  },

  /**
   * Check if similar pattern exists
   */
  async findSimilar(category: string, name: string): Promise<Pattern | null> {
    const { data } = await supabase
      .from('patterns')
      .select('*')
      .eq('category', category)
      .eq('name', name)
      .single();

    return data;
  },
};

// =============================================
// MAIN PATTERN ENGINE
// =============================================
export const patternEngine = {
  /**
   * Run full pattern analysis
   */
  async analyze(): Promise<PatternAnalysis[]> {
    const results: PatternAnalysis[] = [];

    // Time patterns
    const timeAnalysis = await timePatterns.analyze();
    results.push({
      type: 'time',
      data: timeAnalysis as unknown as Record<string, unknown>,
      confidence: 0.85,
      recommendations: timePatterns.detectOpportunities(timeAnalysis),
    });

    // Workflow patterns
    const workflowAnalysis = await workflowPatterns.analyze();
    results.push({
      type: 'workflow',
      data: workflowAnalysis as unknown as Record<string, unknown>,
      confidence: 0.75,
      recommendations: [
        ...workflowAnalysis.bottlenecks,
        ...workflowAnalysis.automation_candidates,
      ],
    });

    // Attention patterns
    const attentionAnalysis = await attentionPatterns.analyze();
    results.push({
      type: 'attention',
      data: attentionAnalysis as unknown as Record<string, unknown>,
      confidence: attentionAnalysis.focus_score,
      recommendations: attentionAnalysis.interruption_sources,
    });

    return results;
  },

  /**
   * Detect and store new patterns
   */
  async detectAndStore(): Promise<number[]> {
    const analyses = await this.analyze();
    const savedIds: number[] = [];

    for (const analysis of analyses) {
      try {
        const existing = await patternStorage.findSimilar(analysis.type, 'main');
        
        if (existing) {
          // Update existing pattern
          await patternStorage.update(existing.id, {
            pattern_data: analysis.data as any,
            confidence: analysis.confidence,
            last_seen: new Date().toISOString(),
            occurrence_count: existing.occurrence_count + 1,
          });
          savedIds.push(existing.id);
        } else {
          // Create new pattern
          const id = await patternStorage.save({
            category: analysis.type as any,
            name: 'main',
            pattern_data: analysis.data as any,
            frequency: 'daily',
            impact_score: analysis.confidence,
            confidence: analysis.confidence,
            metadata: {},
            is_active: true,
            suggested_action: analysis.recommendations[0] || null,
          });
          savedIds.push(id);
        }
      } catch (error) {
        console.error(`Failed to store pattern ${analysis.type}:`, error);
      }
    }

    return savedIds;
  },

  /**
   * Get patterns for dashboard display
   */
  async getDashboardPatterns(): Promise<Pattern[]> {
    const patterns = await patternStorage.getAll();
    
    return patterns.map(p => ({
      ...p,
      pattern_data: typeof p.pattern_data === 'string' 
        ? JSON.parse(p.pattern_data) 
        : p.pattern_data,
    }));
  },

  /**
   * Get time insights for display
   */
  async getTimeInsights(): Promise<{
    typicalHours: string;
    productiveHours: string;
    recommendation: string;
  }> {
    const analysis = await timePatterns.analyze();
    
    const typicalHours = `${analysis.typical_start}:00 - ${analysis.typical_end}:00`;
    const productiveHours = analysis.productive_hours
      .map(h => `${h}:00`)
      .join(', ');
    
    const opportunities = timePatterns.detectOpportunities(analysis);
    const recommendation = opportunities[0] || 'Keep up the good work!';

    return { typicalHours, productiveHours, recommendation };
  },

  /**
   * Get workflow insights for display
   */
  async getWorkflowInsights(): Promise<{
    frequentTasks: string[];
    bottlenecks: string[];
    efficiency: number;
    recommendations: string[];
  }> {
    const analysis = await workflowPatterns.analyze();
    
    return {
      frequentTasks: analysis.frequent_operations.slice(0, 5),
      bottlenecks: analysis.bottlenecks,
      efficiency: Math.round(analysis.efficiency_score * 100),
      recommendations: analysis.automation_candidates,
    };
  },
};

export default patternEngine;
