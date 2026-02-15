/**
 * Integration Layer - Unified connectors for external services
 * Part of Proactive Intelligence System
 */

import { supabase } from '../supabase';
import type {
  GitHubData,
  GitHubRepo,
  GitHubIssue,
  GitHubPR,
  VercelData,
  VercelDeployment,
  CalendarData,
  CalendarEvent,
  FileSystemData,
  FileChange,
  IntelligenceCache,
} from '@/types/proactive';

// =============================================
// CACHE MANAGEMENT
// =============================================
const CACHE_TTL = {
  github: 5 * 60 * 1000, // 5 minutes
  vercel: 2 * 60 * 1000, // 2 minutes
  calendar: 1 * 60 * 1000, // 1 minute
  filesystem: 30 * 1000, // 30 seconds
};

async function getCachedData(source: string, key: string): Promise<Record<string, unknown> | null> {
  const { data } = await supabase
    .from('intelligence_cache')
    .select('*')
    .eq('source', source)
    .eq('data_key', key)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (data) {
    return data.data as Record<string, unknown>;
  }
  return null;
}

async function setCachedData(source: string, key: string, data: Record<string, unknown>, ttlMs: number): Promise<void> {
  await supabase
    .from('intelligence_cache')
    .upsert({
      source,
      data_key: key,
      data,
      expires_at: new Date(Date.now() + ttlMs).toISOString(),
    }, {
      onConflict: 'source,data_key',
    });
}

// =============================================
// GITHUB INTEGRATION
// =============================================
export const github = {
  /**
   * Get comprehensive GitHub data with caching
   */
  async getData(forceRefresh = false): Promise<GitHubData> {
    const cacheKey = 'full_data';
    
    if (!forceRefresh) {
      const cached = await getCachedData('github', cacheKey);
      if (cached) {
        return cached as GitHubData;
      }
    }

    // Fetch from GitHub API
    const [repos, issues, prs] = await Promise.all([
      this.getRepos(),
      this.getRecentIssues(),
      this.getRecentPRs(),
    ]);

    const data: GitHubData = {
      repos,
      recent_issues: issues,
      recent_prs: prs,
      activity: this.aggregateActivity(repos, issues, prs),
    };

    await setCachedData('github', cacheKey, data as unknown as Record<string, unknown>, CACHE_TTL.github);
    return data;
  },

  /**
   * Get user's repositories
   */
  async getRepos(): Promise<GitHubRepo[]> {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    if (!GITHUB_TOKEN) {
      console.warn('GitHub token not configured');
      return [];
    }

    try {
      const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=30', {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const repos = await response.json();
      return repos.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        private: repo.private,
        description: repo.description,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        updated_at: repo.updated_at,
        html_url: repo.html_url,
      }));
    } catch (error) {
      console.error('Failed to fetch GitHub repos:', error);
      return [];
    }
  },

  /**
   * Get recent issues across all repos
   */
  async getRecentIssues(): Promise<GitHubIssue[]> {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    if (!GITHUB_TOKEN) return [];

    try {
      const response = await fetch('https://api.github.com/issues?state=all&per_page=20', {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) return [];

      const issues = await response.json();
      return issues.map((issue: any) => ({
        id: issue.id,
        number: issue.number,
        title: issue.title,
        state: issue.state,
        labels: issue.labels.map((l: any) => l.name),
        created_at: issue.created_at,
        updated_at: issue.updated_at,
        html_url: issue.html_url,
        repository: issue.repository_url?.split('/').slice(-2).join('/') || 'unknown',
      }));
    } catch (error) {
      console.error('Failed to fetch GitHub issues:', error);
      return [];
    }
  },

  /**
   * Get recent pull requests
   */
  async getRecentPRs(): Promise<GitHubPR[]> {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    if (!GITHUB_TOKEN) return [];

    try {
      const response = await fetch('https://api.github.com/pulls?state=all&per_page=20', {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) return [];

      const prs = await response.json();
      return prs.map((pr: any) => ({
        id: pr.id,
        number: pr.number,
        title: pr.title,
        state: pr.merged ? 'merged' : pr.state,
        created_at: pr.created_at,
        updated_at: pr.updated_at,
        html_url: pr.html_url,
        repository: pr.base?.repo?.full_name || 'unknown',
      }));
    } catch (error) {
      console.error('Failed to fetch GitHub PRs:', error);
      return [];
    }
  },

  /**
   * Aggregate activity from repos, issues, and PRs
   */
  aggregateActivity(repos: GitHubRepo[], issues: GitHubIssue[], prs: GitHubPR[]) {
    const activity: Array<{
      type: string;
      repo: string;
      description: string;
      timestamp: string;
    }> = [];

    repos.slice(0, 5).forEach(repo => {
      activity.push({
        type: 'update',
        repo: repo.full_name,
        description: `Updated ${repo.name}`,
        timestamp: repo.updated_at,
      });
    });

    return activity.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, 20);
  },

  /**
   * Analyze repositories for patterns
   */
  async analyzePatterns() {
    const data = await this.getData();
    const patterns: Array<{ type: string; data: unknown }> = [];

    // Language distribution
    const languages = data.repos.reduce((acc, repo) => {
      if (repo.language) {
        acc[repo.language] = (acc[repo.language] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    patterns.push({
      type: 'language_distribution',
      data: languages,
    });

    // Activity patterns
    const recentActivity = data.repos.filter(r => {
      const updated = new Date(r.updated_at);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return updated > weekAgo;
    });

    patterns.push({
      type: 'recent_activity_ratio',
      data: { active: recentActivity.length, total: data.repos.length },
    });

    // Open issues analysis
    const openIssues = data.recent_issues.filter(i => i.state === 'open');
    patterns.push({
      type: 'open_issues_count',
      data: { count: openIssues.length },
    });

    return patterns;
  },
};

// =============================================
// VERCEL INTEGRATION
// =============================================
export const vercel = {
  /**
   * Get comprehensive Vercel data with caching
   */
  async getData(forceRefresh = false): Promise<VercelData> {
    const cacheKey = 'full_data';
    
    if (!forceRefresh) {
      const cached = await getCachedData('vercel', cacheKey);
      if (cached) {
        return cached as VercelData;
      }
    }

    const [deployments, projects] = await Promise.all([
      this.getDeployments(),
      this.getProjects(),
    ]);

    const data: VercelData = {
      deployments,
      projects,
      logs: [], // Could add log fetching
    };

    await setCachedData('vercel', cacheKey, data as unknown as Record<string, unknown>, CACHE_TTL.vercel);
    return data;
  },

  /**
   * Get recent deployments
   */
  async getDeployments(): Promise<VercelDeployment[]> {
    const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
    const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;
    
    if (!VERCEL_TOKEN) {
      console.warn('Vercel token not configured');
      return [];
    }

    try {
      const teamParam = VERCEL_TEAM_ID ? `&teamId=${VERCEL_TEAM_ID}` : '';
      const response = await fetch(
        `https://api.vercel.com/v6/deployments?limit=20${teamParam}`,
        {
          headers: {
            Authorization: `Bearer ${VERCEL_TOKEN}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Vercel API error: ${response.status}`);
      }

      const data = await response.json();
      return data.deployments.map((d: any) => ({
        uid: d.uid,
        name: d.name,
        state: d.state,
        created: d.created,
        ready: d.ready,
        meta: d.meta || {},
        url: d.url,
      }));
    } catch (error) {
      console.error('Failed to fetch Vercel deployments:', error);
      return [];
    }
  },

  /**
   * Get Vercel projects
   */
  async getProjects(): Promise<VercelProject[]> {
    const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
    const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;
    
    if (!VERCEL_TOKEN) return [];

    try {
      const teamParam = VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : '';
      const response = await fetch(
        `https://api.vercel.com/v6/projects${teamParam}`,
        {
          headers: {
            Authorization: `Bearer ${VERCEL_TOKEN}`,
          },
        }
      );

      if (!response.ok) return [];

      const data = await response.json();
      return data.projects.map((p: any) => ({
        id: p.id,
        name: p.name,
        framework: p.framework,
        updated_at: p.updatedAt,
      }));
    } catch (error) {
      console.error('Failed to fetch Vercel projects:', error);
      return [];
    }
  },

  /**
   * Get deployment statistics
   */
  async getStats() {
    const data = await this.getData();
    
    const stateCounts = data.deployments.reduce((acc, d) => {
      acc[d.state] = (acc[d.state] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentDeployments = data.deployments.filter(d => {
      const created = new Date(d.created);
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return created > dayAgo;
    });

    return {
      total: data.deployments.length,
      states: stateCounts,
      last_24h: recentDeployments.length,
      success_rate: stateCounts.READY / data.deployments.length || 0,
    };
  },
};

// =============================================
// CALENDAR INTEGRATION
// =============================================
export const calendar = {
  /**
   * Get calendar data with caching
   */
  async getData(forceRefresh = false): Promise<CalendarData> {
    const cacheKey = 'full_data';
    
    if (!forceRefresh) {
      const cached = await getCachedData('calendar', cacheKey);
      if (cached) {
        return cached as CalendarData;
      }
    }

    const events = await this.getUpcomingEvents();
    const patterns = this.analyzePatterns(events);

    const data: CalendarData = {
      events,
      patterns,
    };

    await setCachedData('calendar', cacheKey, data as unknown as Record<string, unknown>, CACHE_TTL.calendar);
    return data;
  },

  /**
   * Get upcoming calendar events
   * Note: This is a placeholder - integrate with actual calendar API
   */
  async getUpcomingEvents(): Promise<CalendarEvent[]> {
    // For now, return events from the tasks table
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .gte('scheduled_for', new Date().toISOString())
      .order('scheduled_for')
      .limit(50);

    if (!tasks) return [];

    return tasks.map(task => ({
      id: String(task.id),
      title: task.title,
      start: task.scheduled_for,
      end: new Date(new Date(task.scheduled_for).getTime() + 60 * 60 * 1000).toISOString(),
      recurring: task.type === 'daily',
    }));
  },

  /**
   * Analyze calendar patterns
   */
  analyzePatterns(events: CalendarEvent[]): CalendarPattern {
    if (events.length === 0) {
      return {
        typical_event_duration: 60,
        most_common_event_types: [],
        busy_hours: [],
        free_hours: [],
      };
    }

    // Analyze event durations
    const durations = events.map(e => {
      const start = new Date(e.start).getTime();
      const end = new Date(e.end).getTime();
      return (end - start) / (60 * 1000);
    });
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

    // Analyze busy hours
    const hourCounts = new Array(24).fill(0);
    events.forEach(e => {
      const hour = new Date(e.start).getHours();
      hourCounts[hour]++;
    });

    const busyHours = hourCounts
      .map((count, hour) => ({ hour, count }))
      .filter(h => h.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(h => h.hour);

    const freeHours = hourCounts
      .map((count, hour) => ({ hour, count }))
      .filter(h => h.count === 0)
      .map(h => h.hour);

    return {
      typical_event_duration: Math.round(avgDuration),
      most_common_event_types: [],
      busy_hours: busyHours,
      free_hours: freeHours,
    };
  },

  /**
   * Find optimal time slots
   */
  findOptimalSlots(durationMinutes: number): string[] {
    const patterns = this.analyzePatterns([]);
    const slots: string[] = [];
    
    // Find hours that are typically free
    patterns.free_hours.forEach(hour => {
      const now = new Date();
      now.setHours(hour, 0, 0, 0);
      
      if (now > new Date()) {
        slots.push(now.toISOString());
      }
    });

    return slots.slice(0, 5);
  },
};

// =============================================
// FILESYSTEM INTEGRATION
// =============================================
export const filesystem = {
  /**
   * Get file system data with caching
   */
  async getData(forceRefresh = false): Promise<FileSystemData> {
    const cacheKey = 'full_data';
    
    if (!forceRefresh) {
      const cached = await getCachedData('filesystem', cacheKey);
      if (cached) {
        return cached as FileSystemData;
      }
    }

    const WORKSPACE = process.env.WORKSPACE_PATH || '/home/hyper/.openclaw/workspace';
    
    // This would use server-side file system access
    // For now, return structure based on what's available
    const data: FileSystemData = {
      recent_changes: [],
      structure: await this.getStructure(WORKSPACE),
      stats: await this.getStats(WORKSPACE),
    };

    await setCachedData('filesystem', cacheKey, data as unknown as Record<string, unknown>, CACHE_TTL.filesystem);
    return data;
  },

  /**
   * Get file structure (simplified)
   */
  async getStructure(rootPath: string): Promise<any> {
    // This would recursively scan the directory
    // For now, return a basic structure
    return {
      name: 'workspace',
      path: rootPath,
      type: 'directory',
      children: [],
    };
  },

  /**
   * Get file system statistics
   */
  async getStats(rootPath: string): Promise<FileSystemData['stats']> {
    return {
      total_files: 0,
      total_directories: 0,
      total_size: 0,
      file_types: {},
    };
  },

  /**
   * Monitor for changes (would be implemented with file watchers)
   */
  async getRecentChanges(): Promise<FileChange[]> {
    return [];
  },
};

// =============================================
// SUPABASE INTEGRATION
// =============================================
export const database = {
  /**
   * Query any table
   */
  async query<T>(table: string, filters?: Record<string, unknown>): Promise<T[]> {
    let query = supabase.from(table).select('*');
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    const { data, error } = await query;
    
    if (error) {
      console.error(`Error querying ${table}:`, error);
      return [];
    }
    
    return data as T[];
  },

  /**
   * Get recent activities
   */
  async getRecentActivities(limit = 50) {
    const { data } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    return data || [];
  },

  /**
   * Get task statistics
   */
  async getTaskStats() {
    const { data } = await supabase
      .from('tasks')
      .select('status, type');

    if (!data) return { pending: 0, completed: 0, daily: 0, oneTime: 0 };

    return {
      pending: data.filter(t => t.status === 'pending').length,
      completed: data.filter(t => t.status === 'completed').length,
      daily: data.filter(t => t.type === 'daily').length,
      oneTime: data.filter(t => t.type === 'one-time').length,
    };
  },

  /**
   * Get study statistics
   */
  async getStudyStats() {
    const { data } = await supabase
      .from('study_sessions')
      .select('duration_minutes, completed_at');

    if (!data) return { today: 0, week: 0, total: 0 };

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);

    const today = data
      .filter(s => new Date(s.completed_at) >= todayStart)
      .reduce((acc, s) => acc + s.duration_minutes, 0);

    const week = data
      .filter(s => new Date(s.completed_at) >= weekStart)
      .reduce((acc, s) => acc + s.duration_minutes, 0);

    const total = data.reduce((acc, s) => acc + s.duration_minutes, 0);

    return { today, week, total };
  },
};

// =============================================
// INTEGRATION MANAGER
// =============================================
export const integrations = {
  github,
  vercel,
  calendar,
  filesystem,
  database,

  /**
   * Get all integration data at once
   */
  async getAllData() {
    const [githubData, vercelData, calendarData, fileData, dbStats] = await Promise.all([
      this.github.getData().catch(() => null),
      this.vercel.getData().catch(() => null),
      this.calendar.getData().catch(() => null),
      this.filesystem.getData().catch(() => null),
      Promise.all([
        this.database.getRecentActivities(20),
        this.database.getTaskStats(),
        this.database.getStudyStats(),
      ]).then(([activities, taskStats, studyStats]) => ({
        activities,
        taskStats,
        studyStats,
      })),
    ]);

    return {
      github: githubData,
      vercel: vercelData,
      calendar: calendarData,
      filesystem: fileData,
      database: dbStats,
    };
  },

  /**
   * Force refresh all caches
   */
  async refreshAll() {
    await Promise.all([
      this.github.getData(true),
      this.vercel.getData(true),
      this.calendar.getData(true),
      this.filesystem.getData(true),
    ]);
  },
};

export default integrations;
