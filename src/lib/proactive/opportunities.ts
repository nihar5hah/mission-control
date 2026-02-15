/**
 * Opportunity Finder
 * Scans for value opportunities: monetization, automation, collaboration, learning
 * Part of Proactive Intelligence System
 */

import { supabase } from '../supabase';
import { database, github } from './integrations';
import { patternEngine } from './patterns';
import type { Opportunity, OpportunityAnalysis } from '@/types/proactive';

// =============================================
// OPPORTUNITY STORAGE
// =============================================
const opportunityStorage = {
  /**
   * Create new opportunity
   */
  async create(opportunity: Omit<Opportunity, 'id' | 'created_at' | 'updated_at' | 'implemented_at'>): Promise<number> {
    const { data, error } = await supabase
      .from('opportunities')
      .insert({
        type: opportunity.type,
        title: opportunity.title,
        description: opportunity.description,
        potential_value: opportunity.potential_value,
        effort_estimate: opportunity.effort_estimate,
        status: opportunity.status,
        source_pattern_id: opportunity.source_pattern_id,
        metadata: opportunity.metadata,
        tags: opportunity.tags,
        priority_score: opportunity.priority_score,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to create opportunity:', error);
      throw error;
    }

    return data.id;
  },

  /**
   * Update opportunity
   */
  async update(id: number, updates: Partial<Opportunity>): Promise<void> {
    await supabase
      .from('opportunities')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
  },

  /**
   * Get opportunities by status
   */
  async getByStatus(status: string): Promise<Opportunity[]> {
    const { data } = await supabase
      .from('opportunities')
      .select('*')
      .eq('status', status)
      .order('priority_score', { ascending: false });

    return data || [];
  },

  /**
   * Get all opportunities
   */
  async getAll(): Promise<Opportunity[]> {
    const { data } = await supabase
      .from('opportunities')
      .select('*')
      .order('priority_score', { ascending: false });

    return data || [];
  },

  /**
   * Get recent opportunities
   */
  async getRecent(limit = 10): Promise<Opportunity[]> {
    const { data } = await supabase
      .from('opportunities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    return data || [];
  },

  /**
   * Check for duplicate
   */
  async findDuplicate(title: string): Promise<Opportunity | null> {
    const { data } = await supabase
      .from('opportunities')
      .select('*')
      .ilike('title', `%${title}%`)
      .single();

    return data;
  },
};

// =============================================
// MONETIZATION FINDER
// =============================================
const monetizationFinder = {
  /**
   * Find monetization opportunities
   */
  async find(): Promise<OpportunityAnalysis[]> {
    const opportunities: OpportunityAnalysis[] = [];
    const ghData = await github.getData().catch(() => null);

    // Analyze repos for monetization potential
    if (ghData?.repos) {
      for (const repo of ghData.repos) {
        // High-starred repos might be monetizable
        if (repo.stargazers_count > 10) {
          opportunities.push({
            type: 'monetization',
            title: `Monetize ${repo.name}`,
            description: `Repository has ${repo.stargazers_count} stars - consider creating a paid version, courses, or consulting`,
            potential_impact: Math.min(repo.stargazers_count / 100, 1),
            effort_required: 0.6,
            priority_score: Math.min(repo.stargazers_count / 50, 1),
            action_items: [
              'Research similar paid products',
              'Create a premium version',
              'Set up monetization (Patreon, courses, etc.)',
            ],
          });
        }

        // Popular languages might indicate marketable skills
        if (['TypeScript', 'Python', 'Rust', 'Go'].includes(repo.language || '')) {
          const hasOpportunity = opportunities.find(o => 
            o.title.includes('Market your') && o.description.includes(repo.language!)
          );
          
          if (!hasOpportunity) {
            opportunities.push({
              type: 'monetization',
              title: `Market ${repo.language} expertise`,
              description: `Your ${repo.language} skills could be monetized through consulting, freelancing, or teaching`,
              potential_impact: 0.7,
              effort_required: 0.4,
              priority_score: 0.65,
              action_items: [
                'Update LinkedIn with skills',
                'Create portfolio projects',
                'Offer freelance services',
              ],
            });
          }
        }
      }
    }

    // Check for side project potential
    if (ghData?.repos && ghData.repos.length > 3) {
      opportunities.push({
        type: 'monetization',
        title: 'Turn side project into product',
        description: 'Multiple active repositories suggest active development - consider packaging one as a product',
        potential_impact: 0.5,
        effort_required: 0.7,
        priority_score: 0.45,
        action_items: [
          'Identify most complete project',
          'Add documentation',
          'Create landing page',
        ],
      });
    }

    return opportunities;
  },
};

// =============================================
// AUTOMATION FINDER
// =============================================
const automationFinder = {
  /**
   * Find automation opportunities
   */
  async find(): Promise<OpportunityAnalysis[]> {
    const opportunities: OpportunityAnalysis[] = [];
    const workflowInsights = await patternEngine.getWorkflowInsights();

    // Workflow-based automation
    for (const task of workflowInsights.frequentTasks) {
      opportunities.push({
        type: 'automation',
        title: `Automate ${task} tasks`,
        description: `You frequently perform ${task} - this could be automated`,
        potential_impact: 0.6,
        effort_required: 0.5,
        priority_score: 0.55,
        action_items: [
          'Identify repetitive steps',
          'Research automation tools',
          'Create script or workflow',
        ],
      });
    }

    // Common automation opportunities
    const commonAutomations = [
      {
        title: 'Auto-categorize tasks',
        description: 'Use AI to automatically categorize and prioritize incoming tasks',
        potential_impact: 0.7,
        effort_required: 0.4,
      },
      {
        title: 'Schedule optimization',
        description: 'Automatically schedule tasks based on your productive hours',
        potential_impact: 0.6,
        effort_required: 0.3,
      },
      {
        title: 'Daily standup automation',
        description: 'Generate standup summaries from activity log automatically',
        potential_impact: 0.5,
        effort_required: 0.2,
      },
      {
        title: 'Git workflow automation',
        description: 'Auto-create PRs, run tests, and deploy on merge',
        potential_impact: 0.7,
        effort_required: 0.5,
      },
    ];

    for (const auto of commonAutomations) {
      const exists = opportunities.some(o => o.title === auto.title);
      if (!exists) {
        opportunities.push({
          type: 'automation',
          ...auto,
          priority_score: auto.potential_impact * 0.8,
          action_items: ['Research tools', 'Prototype solution', 'Implement and iterate'],
        });
      }
    }

    return opportunities;
  },
};

// =============================================
// COLLABORATION FINDER
// =============================================
const collaborationFinder = {
  /**
   * Find collaboration opportunities
   */
  async find(): Promise<OpportunityAnalysis[]> {
    const opportunities: OpportunityAnalysis[] = [];
    const ghData = await github.getData().catch(() => null);

    // Analyze GitHub for collaboration
    if (ghData) {
      // Open source opportunities
      const openSourceRepos = ghData.repos.filter(r => !r.private && r.stargazers_count > 0);
      
      if (openSourceRepos.length > 0) {
        opportunities.push({
          type: 'collaboration',
          title: 'Open source contribution',
          description: `${openSourceRepos.length} public repositories could benefit from community contributions`,
          potential_impact: 0.5,
          effort_required: 0.3,
          priority_score: 0.45,
          action_items: [
            'Find related projects',
            'Look for good first issues',
            'Submit PRs regularly',
          ],
        });
      }

      // Fork and collaborate
      opportunities.push({
        type: 'collaboration',
        title: 'Collaborate on popular projects',
        description: 'Find popular repos in your tech stack and contribute meaningfully',
        potential_impact: 0.6,
        effort_required: 0.4,
        priority_score: 0.5,
        action_items: [
          'Identify target projects',
          'Build relationships with maintainers',
          'Contribute consistently',
        ],
      });
    }

    // Generic collaboration opportunities
    opportunities.push({
      type: 'collaboration',
      title: 'Join developer community',
      description: 'Active participation in communities leads to opportunities',
      potential_impact: 0.4,
      effort_required: 0.2,
      priority_score: 0.35,
      action_items: [
        'Join Discord/Slack communities',
        'Participate in discussions',
        'Share knowledge',
      ],
    });

    return opportunities;
  },
};

// =============================================
// LEARNING FINDER
// =============================================
const learningFinder = {
  /**
   * Find learning opportunities
   */
  async find(): Promise<OpportunityAnalysis[]> {
    const opportunities: OpportunityAnalysis[] = [];
    const ghData = await github.getData().catch(() => null);

    // Skill gaps based on project languages
    const popularLanguages = ['Rust', 'Go', 'Swift', 'Kotlin'];
    const currentLanguages = ghData?.repos
      .map(r => r.language)
      .filter(Boolean) as string[] || [];

    for (const lang of popularLanguages) {
      if (!currentLanguages.includes(lang)) {
        opportunities.push({
          type: 'learning',
          title: `Learn ${lang}`,
          description: `${lang} is in high demand and complements your current skills`,
          potential_impact: 0.7,
          effort_required: 0.6,
          priority_score: 0.6,
          action_items: [
            'Start with basics',
            'Build a small project',
            'Add to portfolio',
          ],
        });
      }
    }

    // Soft skills
    opportunities.push({
      type: 'learning',
      title: 'Improve system design skills',
      description: 'System design knowledge helps with interviews and architecture decisions',
      potential_impact: 0.8,
      effort_required: 0.5,
      priority_score: 0.7,
      action_items: [
        'Study common patterns',
        'Practice designing systems',
        'Review architectures you admire',
      ],
    });

    // Productivity/tools
    opportunities.push({
      type: 'learning',
      title: 'Master your tools',
      description: 'Better tool mastery = significant time savings',
      potential_impact: 0.6,
      effort_required: 0.2,
      priority_score: 0.55,
      action_items: [
        'Learn keyboard shortcuts',
        'Explore advanced features',
        'Create custom workflows',
      ],
    });

    return opportunities;
  },
};

// =============================================
// MAIN OPPORTUNITY FINDER
// =============================================
export const opportunityFinder = {
  /**
   * Run full opportunity scan
   */
  async scan(): Promise<OpportunityAnalysis[]> {
    const [monetization, automation, collaboration, learning] = await Promise.all([
      monetizationFinder.find(),
      automationFinder.find(),
      collaborationFinder.find(),
      learningFinder.find(),
    ]);

    // Combine and sort by priority
    const allOpportunities = [
      ...monetization,
      ...automation,
      ...collaboration,
      ...learning,
    ].sort((a, b) => b.priority_score - a.priority_score);

    // Store new opportunities
    for (const opp of allOpportunities.slice(0, 10)) {
      try {
        const exists = await opportunityStorage.findDuplicate(opp.title);
        if (!exists) {
          await opportunityStorage.create({
            type: opp.type as any,
            title: opp.title,
            description: opp.description,
            potential_value: this.impactToValue(opp.potential_impact),
            effort_estimate: this.effortToEstimate(opp.effort_required),
            status: 'discovered',
            source_pattern_id: null,
            metadata: { analysis: opp },
            tags: [opp.type],
            priority_score: opp.priority_score,
          });
        }
      } catch (error) {
        console.error('Failed to store opportunity:', error);
      }
    }

    return allOpportunities;
  },

  /**
   * Get opportunities for dashboard
   */
  async getDashboard(): Promise<{
    discovered: number;
    validated: number;
    implemented: number;
    topOpportunities: OpportunityAnalysis[];
  }> {
    const all = await opportunityStorage.getAll();
    
    const discovered = all.filter(o => o.status === 'discovered').length;
    const validated = all.filter(o => o.status === 'validated').length;
    const implemented = all.filter(o => o.status === 'implemented').length;

    // Get top 5 by priority
    const topOpportunities: OpportunityAnalysis[] = all
      .slice(0, 5)
      .map(o => ({
        type: o.type,
        title: o.title,
        description: o.description,
        potential_impact: this.valueToImpact(o.potential_value),
        effort_required: this.estimateToEffort(o.effort_estimate),
        priority_score: o.priority_score,
        action_items: o.metadata.action_items as string[] || [],
      }));

    return { discovered, validated, implemented, topOpportunities };
  },

  /**
   * Update opportunity status
   */
  async updateStatus(id: number, status: string): Promise<void> {
    const updates: Partial<Opportunity> = { status: status as 'dismissed' | 'discovered' | 'investigating' | 'validated' | 'implemented' };
    
    if (status === 'implemented') {
      updates.implemented_at = new Date().toISOString();
    }
    
    await opportunityStorage.update(id, updates);
  },

  /**
   * Get recent opportunities
   */
  async getRecent(): Promise<Opportunity[]> {
    return opportunityStorage.getRecent(10);
  },

  // Helper conversions
  impactToValue(impact: number): 'low' | 'medium' | 'high' | 'transformative' {
    if (impact >= 0.8) return 'transformative';
    if (impact >= 0.6) return 'high';
    if (impact >= 0.4) return 'medium';
    return 'low';
  },

  valueToImpact(value: string): number {
    switch (value) {
      case 'transformative': return 0.9;
      case 'high': return 0.7;
      case 'medium': return 0.5;
      default: return 0.3;
    }
  },

  effortToEstimate(effort: number): 'low' | 'medium' | 'high' {
    if (effort >= 0.6) return 'high';
    if (effort >= 0.3) return 'medium';
    return 'low';
  },

  estimateToEffort(estimate: string): number {
    switch (estimate) {
      case 'high': return 0.7;
      case 'medium': return 0.5;
      default: return 0.2;
    }
  },
};

export default opportunityFinder;
