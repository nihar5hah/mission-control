/**
 * Dashboard API Route
 * Aggregates all proactive intelligence for dashboard display
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/proactive/dashboard - Get dashboard summary
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const refresh = searchParams.get('refresh') === 'true';

    // Get actions from last 24 hours
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const [actionsResult, patternsResult, opportunitiesResult, decisionsResult] = await Promise.all([
      // Recent actions
      supabase
        .from('proactive_actions')
        .select('*')
        .gte('created_at', dayAgo)
        .order('created_at', { ascending: false })
        .limit(20),
      
      // Active patterns
      supabase
        .from('patterns')
        .select('*')
        .eq('is_active', true)
        .order('impact_score', { ascending: false })
        .limit(10),
      
      // Top opportunities
      supabase
        .from('opportunities')
        .select('*')
        .neq('status', 'dismissed')
        .order('priority_score', { ascending: false })
        .limit(10),
      
      // Recent decisions
      supabase
        .from('decisions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

    // Calculate stats
    const actions = actionsResult.data || [];
    const completedActions = actions.filter(a => a.status === 'completed').length;
    const totalActionsToday = actions.length;

    const opportunities = opportunitiesResult.data || [];
    const discovered = opportunities.filter(o => o.status === 'discovered').length;
    const implemented = opportunities.filter(o => o.status === 'implemented').length;

    const patterns = patternsResult.data || [];
    const avgConfidence = patterns.length > 0
      ? patterns.reduce((sum, p) => sum + (p.confidence || 0), 0) / patterns.length
      : 0;

    // Get recommendations and predictions from decision engine
    let suggestions: Array<{
      decision: string;
      reasoning: string;
      confidence: number;
      suggested_actions: string[];
    }> = [];
    let predictions: Array<{
      type: string;
      description: string;
      likelihood: number;
      timeframe: string;
      action_items: string[];
    }> = [];

    try {
      const { decisionEngine } = await import('@/lib/proactive/decisions');
      suggestions = await decisionEngine.getRecommendations();
      predictions = await decisionEngine.getPredictions();
    } catch (e) {
      console.error('Failed to get recommendations:', e);
    }

    // If refresh requested, trigger new analysis
    if (refresh) {
      try {
        const { patternEngine } = await import('@/lib/proactive/patterns');
        await patternEngine.detectAndStore();
      } catch (e) {
        console.error('Failed to refresh patterns:', e);
      }

      try {
        const { opportunityFinder } = await import('@/lib/proactive/opportunities');
        await opportunityFinder.scan();
      } catch (e) {
        console.error('Failed to refresh opportunities:', e);
      }
    }

    return NextResponse.json({
      // Stats
      stats: {
        total_actions_today: totalActionsToday,
        completed_actions_today: completedActions,
        opportunities_found: discovered,
        opportunities_implemented: implemented,
        patterns_detected: patterns.length,
        avg_confidence_score: Math.round(avgConfidence * 100) / 100,
      },
      
      // Recent actions
      actions_last_24h: actions,
      
      // Patterns
      patterns: patterns.map(p => ({
        ...p,
        pattern_data: typeof p.pattern_data === 'string' 
          ? JSON.parse(p.pattern_data) 
          : p.pattern_data,
      })),
      
      // Opportunities
      opportunities: opportunities.map(o => ({
        ...o,
        metadata: typeof o.metadata === 'string' 
          ? JSON.parse(o.metadata) 
          : o.metadata,
      })),
      
      // AI-generated insights
      suggestions,
      predictions,
      
      // Timestamps
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to get dashboard data:', error);
    return NextResponse.json({ error: 'Failed to get dashboard data' }, { status: 500 });
  }
}

// POST /api/proactive/dashboard - Trigger proactive actions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'analyze': {
        const { patternEngine } = await import('@/lib/proactive/patterns');
        const patternIds = await patternEngine.detectAndStore();
        
        return NextResponse.json({ 
          success: true, 
          message: `Analyzed ${patternIds.length} patterns`,
        });
      }

      case 'scan': {
        const { opportunityFinder } = await import('@/lib/proactive/opportunities');
        const opportunities = await opportunityFinder.scan();
        
        return NextResponse.json({ 
          success: true, 
          message: `Found ${opportunities.length} opportunities`,
        });
      }

      case 'recommend': {
        const { decisionEngine } = await import('@/lib/proactive/decisions');
        const recommendations = await decisionEngine.getRecommendations();
        
        return NextResponse.json({ recommendations });
      }

      case 'predict': {
        const { decisionEngine } = await import('@/lib/proactive/decisions');
        const predictions = await decisionEngine.getPredictions();
        
        return NextResponse.json({ predictions });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Failed to execute dashboard action:', error);
    return NextResponse.json({ error: 'Failed to execute action' }, { status: 500 });
  }
}
