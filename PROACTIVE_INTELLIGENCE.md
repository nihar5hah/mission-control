# Proactive Intelligence System - Documentation

## Overview

The Proactive Intelligence System is an autonomous component of Mission Control that analyzes your workflows, detects patterns, identifies opportunities, and takes smart actions without requiring explicit instructions.

This system turns Begubot from a **reactive assistant** (waiting for commands) into a **proactive agent** (anticipating needs).

## Core Components

### 1. Integration Layer (`src/lib/proactive/integrations.ts`)

Unified connectors for external services that feed data into the system.

**Supported Integrations:**

- **GitHub** - Repositories, issues, PRs, commit history
- **Vercel** - Deployments, projects, build logs
- **Calendar** - Events, availability, scheduling patterns
- **Filesystem** - Workspace changes, file modifications
- **Supabase** - Activities, tasks, study sessions

**Usage:**

```typescript
import { integrations } from '@/lib/proactive/integrations';

// Get all data at once
const allData = await integrations.getAllData();

// Or use individual integrations
const githubData = await integrations.github.getData();
const patterns = await integrations.github.analyzePatterns();

// Force refresh caches
await integrations.refreshAll();
```

### 2. Pattern Recognition Engine

Automatically detects patterns in your behavior:

**Pattern Types:**

- **Time Patterns** - When you work, peak productivity hours, typical schedule
- **Workflow Patterns** - Frequent tasks, task completion rates, bottlenecks
- **Attention Patterns** - Focus areas, context switching frequency, success rates
- **Opportunity Patterns** - Automation candidates, skill gaps, collaboration needs

**How It Works:**

1. Collects data from integrations
2. Analyzes historical activity (activities, tasks, commits)
3. Identifies recurring behaviors
4. Calculates confidence scores and impact ratings
5. Stores patterns in database with suggestions

**API Endpoint:**

```bash
POST /api/proactive/patterns
```

**Example Response:**

```json
{
  "success": true,
  "patterns": [
    {
      "id": 1,
      "category": "time",
      "name": "activity_time_distribution",
      "pattern_data": {
        "typical_start_hour": 9,
        "typical_end_hour": 18,
        "most_productive_hours": [10, 11, 14, 15],
        "peak_activity_days": ["Mon", "Wed", "Fri"]
      },
      "frequency": "daily",
      "confidence": 0.92,
      "impact_score": 0.7,
      "suggested_action": "Most productive between 10:00-11:00. Schedule important tasks during peak hours."
    }
  ]
}
```

### 3. Opportunity Finder

Scans for actionable opportunities based on patterns:

**Opportunity Types:**

- **Monetization** - Ways to earn from skills/projects (consultancy, premium tiers, sponsorships)
- **Automation** - Tasks that should be automated (repetitive actions, workflows)
- **Collaboration** - People/projects to connect with
- **Learning** - Topics worth investing time in based on work patterns
- **Efficiency** - Process improvements and bottleneck fixes

**How It Works:**

1. Analyzes detected patterns
2. Checks for repetitive tasks and inefficiencies
3. Identifies trending technologies in your work
4. Suggests connections and collaborations
5. Rates opportunities by value vs. effort

**API Endpoint:**

```bash
POST /api/proactive/opportunities
```

**Example Response:**

```json
{
  "success": true,
  "total_found": 3,
  "opportunities": [
    {
      "id": 1,
      "type": "automation",
      "title": "Automate repetitive 'fix' tasks",
      "description": "You perform 'fix' tasks 15 times recently. Consider creating templates or scripts.",
      "potential_value": "high",
      "effort_estimate": "medium",
      "priority_score": 0.8,
      "status": "discovered",
      "tags": ["automation", "efficiency"]
    }
  ]
}
```

### 4. Decision Engine

Makes autonomous decisions based on context:

**Decision Types:**

- **Categorize** - Classify items (task type, urgency, category)
- **Route** - Determine best time/context to handle (morning focus, deep work block)
- **Generate** - Create sub-tasks, reminders, follow-ups
- **Predict** - Forecast future needs based on patterns
- **Recommend** - Suggest actions based on all available data

**How It Works:**

1. Receives request with context
2. Analyzes patterns, opportunities, recent activity
3. Applies decision logic based on type
4. Returns decision with reasoning and confidence score
5. Logs decision for future learning

**API Endpoint:**

```bash
POST /api/proactive/decide
```

**Example Request:**

```json
{
  "type": "recommend",
  "data": {
    "current_time": "2025-02-15T14:30:00Z",
    "recent_actions": 5,
    "pending_tasks": 3
  }
}
```

**Example Response:**

```json
{
  "decision": "Focus on: Automate repetitive 'fix' tasks",
  "reasoning": "Based on your patterns, this has high value and medium effort",
  "confidence": 0.78,
  "suggested_actions": [
    "Implement: Automate repetitive 'fix' tasks",
    "Based on your workflow patterns",
    "Set deadline for automation script"
  ]
}
```

### 5. Proactive Actions

Autonomous actions taken by Begubot:

**Action Types:**

- `notification` - Alert user about important events
- `task_create` - Automatically create tasks
- `reminder` - Set reminders for patterns
- `suggestion` - Surface recommendations
- `auto_fix` - Fix common issues automatically
- `sync` - Synchronize data across systems
- `analysis` - Perform deep analysis
- `prediction` - Provide predictions

**Action Categories:**

- `time_management` - Schedule optimization, time blocking
- `automation` - Task automation, workflow optimization
- `monetization` - Revenue opportunities
- `learning` - Skill development suggestions
- `collaboration` - Partnership opportunities
- `workflow` - Process improvements
- `security` - Security recommendations

**API Endpoint:**

```bash
POST /api/proactive/actions
```

**Example Request:**

```json
{
  "type": "task_create",
  "category": "automation",
  "description": "Create automation script for repetitive fix tasks",
  "impact": "high",
  "status": "pending",
  "confidence_score": 0.78,
  "source": "opportunity_finder"
}
```

## Database Schema

### `proactive_actions`
Tracks all autonomous actions taken:

```sql
CREATE TABLE proactive_actions (
  id BIGSERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,           -- notification, task_create, etc.
  category VARCHAR(50) NOT NULL,      -- time_management, automation, etc.
  description TEXT NOT NULL,
  impact VARCHAR(20),                 -- low, medium, high, critical
  status VARCHAR(20),                 -- pending, running, completed, failed
  metadata JSONB,                     -- Additional context
  created_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,           -- When action completed
  source VARCHAR(100),                -- What triggered it
  confidence_score DECIMAL(3,2)       -- 0.00-1.00
);
```

### `patterns`
Stores detected behavioral patterns:

```sql
CREATE TABLE patterns (
  id BIGSERIAL PRIMARY KEY,
  category VARCHAR(50) NOT NULL,      -- time, workflow, attention, opportunity
  name VARCHAR(100) NOT NULL,
  pattern_data JSONB NOT NULL,        -- The actual pattern structure
  frequency VARCHAR(20),              -- daily, weekly, monthly, rare, constant
  last_seen TIMESTAMPTZ,
  first_seen TIMESTAMPTZ,
  impact_score DECIMAL(3,2),          -- How much it affects productivity
  confidence DECIMAL(3,2),            -- How sure we are about this pattern
  occurrence_count INT,               -- How many times seen
  suggested_action TEXT,              -- What to do about this pattern
  is_active BOOLEAN
);
```

### `opportunities`
Identified opportunities for value creation:

```sql
CREATE TABLE opportunities (
  id BIGSERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,          -- monetization, automation, etc.
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  potential_value VARCHAR(50),        -- low, medium, high, transformative
  effort_estimate VARCHAR(20),        -- low, medium, high
  status VARCHAR(20),                 -- discovered, investigating, validated, implemented
  source_pattern_id BIGINT,           -- Reference to pattern that found this
  metadata JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  implemented_at TIMESTAMPTZ,
  tags TEXT[],                        -- #tags for filtering
  priority_score DECIMAL(3,2)         -- 0.00-1.00
);
```

### `decisions`
Logs autonomous decisions made:

```sql
CREATE TABLE decisions (
  id BIGSERIAL PRIMARY KEY,
  context JSONB NOT NULL,             -- The data that led to decision
  decision VARCHAR(100) NOT NULL,     -- What was decided
  reasoning TEXT NOT NULL,            -- Why this decision
  outcome TEXT,                       -- What happened after
  confidence_score DECIMAL(3,2),
  status VARCHAR(20),                 -- pending, approved, rejected, executed
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  related_action_id BIGINT            -- Link to action if created
);
```

## Usage Examples

### 1. Analyze Patterns on Demand

```typescript
import { useProactive } from '@/hooks/useProactive';

function MyComponent() {
  const { analyzePatterns, refresh } = useProactive();

  const handleAnalyze = async () => {
    await analyzePatterns();
    await refresh();
  };

  return (
    <button onClick={handleAnalyze}>Analyze Patterns</button>
  );
}
```

### 2. Find Opportunities

```typescript
const { findOpportunities, opportunities } = useProactive();

// Trigger finding
await findOpportunities();

// Use opportunities
opportunities.forEach(opp => {
  console.log(`${opp.title}: ${opp.description}`);
});
```

### 3. Create Autonomous Action

```typescript
const { createAction } = useProactive();

await createAction({
  type: 'task_create',
  category: 'automation',
  description: 'Create automation script',
  impact: 'high',
  status: 'pending',
  confidence_score: 0.78,
  source: 'opportunity_finder'
});
```

### 4. Get Smart Recommendations

```typescript
const response = await fetch('/api/proactive/decide', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'recommend',
    data: { /* context */ }
  })
});

const { decision, reasoning, suggested_actions } = await response.json();
```

## Real-Time Updates

The Proactive Hub uses Supabase Realtime for instant updates:

```typescript
// Automatic real-time subscription in useProactive hook
const channel = supabase
  .channel('proactive_realtime')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'proactive_actions'
  }, (payload) => {
    // Handle new actions
  })
  .subscribe();
```

## Performance Considerations

### Caching

- External data (GitHub, Vercel) cached for 2-5 minutes
- Pattern analysis results cached
- Opportunity finding results cached for 1 hour

### Rate Limiting

- GitHub API: 60 requests/hour (without token) or 5000/hour (with token)
- Vercel API: 100 requests/minute
- Supabase: Depends on plan

### Optimization Strategies

1. **Batch Operations** - Analyze multiple data sources at once
2. **Lazy Loading** - Only fetch data when needed
3. **Background Jobs** - Run analysis in background
4. **Incremental Updates** - Update patterns incrementally, not full recompute

## Customization

### Adding New Pattern Types

1. Update `pattern.sql` with new category
2. Create analysis function in pattern recognition engine
3. Add UI components for display in ProactiveHub

### Adding New Integrations

1. Create connector in `integrations.ts`
2. Implement required methods
3. Add API endpoint in `/api/proactive/`
4. Update types in `proactive.ts`

### Tuning Decision Rules

Edit the decision engines in `/api/proactive/decide/route.ts`:

```typescript
// Example: Customize categorization logic
async function categorizeItem(data: Record<string, unknown>) {
  // Your custom logic here
  return {
    decision: category,
    reasoning: why,
    confidence: confidence_score,
    suggested_actions: []
  };
}
```

## Monitoring

### Check Proactive Activity

```typescript
// View recent actions
const actions = await fetch('/api/proactive/actions?limit=50');

// View detected patterns
const patterns = await fetch('/api/proactive/patterns');

// View found opportunities
const opportunities = await fetch('/api/proactive/opportunities');
```

### Debug Information

Enable debug logging:

```env
DEBUG=true
LOG_LEVEL=debug
```

Monitor logs:
- Browser console for frontend
- Supabase dashboard for database
- Vercel logs for API errors

## Best Practices

1. **Regular Pattern Analysis** - Run `analyzePatterns()` daily or weekly
2. **Review Opportunities** - Check found opportunities regularly
3. **Tune Confidence Thresholds** - Adjust thresholds based on your experience
4. **Provide Feedback** - Dismiss/implement opportunities to train the system
5. **Monitor Performance** - Check caching and query performance

## Troubleshooting

### Patterns Not Detected

1. Check that activities table has sufficient data
2. Verify integrations are properly configured
3. Run manual pattern analysis
4. Check Supabase logs for errors

### No Opportunities Found

1. Ensure patterns are detected first
2. Check opportunity finding criteria
3. Verify data feeds are active
4. Check confidence thresholds

### Slow Performance

1. Check database indexes
2. Review cache settings
3. Monitor API rate limits
4. Consider running analysis off-peak

## Future Enhancements

- [ ] Machine learning model for predictions
- [ ] Natural language processing for insights
- [ ] Collaborative filtering for recommendations
- [ ] Workflow automation builder
- [ ] Advanced analytics dashboard
- [ ] Multi-user pattern analysis
- [ ] Custom decision rules UI
- [ ] Integration with more services

## Support

For issues or questions:
1. Check the logs (Supabase, Vercel, browser console)
2. Review API responses for error details
3. Check environment variables configuration
4. Review integration credentials

---

**Built for my OpenClaw instance** - An AI-powered automation system for intelligently managing complex workflows.
