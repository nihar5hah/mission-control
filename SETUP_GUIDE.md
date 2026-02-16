# Mission Control - The Begu Company

## Setup Guide

### 1. Apply SQL Schema to Supabase

The app works with fallback data, but for full functionality, apply the agent schema:

1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/qbtlslagwbgrnnuaasma/sql)
2. Copy the contents of `AGENT_SCHEMA.sql`
3. Paste and run the SQL

This creates:
- `agents` - Agent definitions (Begubot, Coder, Researcher)
- `agent_activities` - Real-time activity tracking
- `agent_sessions` - Active session management
- `agent_stats` - Aggregated statistics
- `agent_schedules` - Per-agent scheduling
- `agent_documents` - Per-agent documentation

### 2. Verify Deployment

Visit: https://mission-control-one-gold.vercel.app

You should see:
- Left sidebar with 3 agents
- Dashboard with real-time stats
- Hierarchy tab with org chart
- All tabs working

## Features Built (Night 1 - Feb 16)

### ✅ Core Architecture
- New page structure with sidebar layout
- Modular components for agents
- Real-time data hooks

### ✅ Supabase Schema
- `AGENT_SCHEMA.sql` - Complete database schema
- Tables for agents, activities, sessions, stats, schedules, documents
- Row-level security policies
- Sample data included

### ✅ Three Agents View (Left Sidebar)
- **Begubot** (Chief of Staff) - Purple theme
- **Coder** (Employee) - Green theme  
- **Researcher** (Employee) - Amber theme
- Live status indicators
- Current activity display
- Expandable for details
- Stats (tokens, tasks, active time)

### ✅ Real-time Sync Infrastructure
- `useAgentState` - Combined agent data hook
- `useAgentActivities` - Activity feed with subscriptions
- `useAgentSessions` - Session tracking
- `useAgentStats` - Statistics
- `useAgentSchedules` - Scheduling
- `useAgentDocuments` - Documentation

### ✅ Dashboard Tab
- Overview stats for all agents
- Agent status cards
- Real-time updates

### ✅ Hierarchy Tab
- Visual org chart
- Chief of Staff at top
- Employees below
- Info cards for each agent

## Tomorrow Night (Feb 17)

- [ ] Visual Office Scene (Playground)
  - Graphic office environment
  - 3 animated characters
  - Framer Motion animations
  - Talking, meetings, water cooler

- [ ] Polish & Deploy
  - Per-agent documentation sync
  - Per-agent schedules
  - Final testing
  - Performance optimization

## File Structure

```
mission-control/
├── AGENT_SCHEMA.sql          # Supabase schema
├── src/
│   ├── app/
│   │   └── page.tsx          # Main dashboard
│   ├── components/
│   │   ├── AgentsSidebar.tsx # 3-agent sidebar
│   │   └── HierarchyTab.tsx  # Org chart
│   ├── hooks/
│   │   └── useAgents.ts      # Real-time hooks
│   ├── lib/
│   │   └── agents-api.ts     # API layer
│   └── types/
│       └── agents.ts         # TypeScript types
```

## API Reference

### Hooks

```tsx
// Combined agent state
const { agentStates, loading, refresh } = useAgentState();

// Individual hooks
const { activities } = useAgentActivities(agentId, limit);
const { sessions } = useAgentSessions();
const { stats } = useAgentStats();
const { schedules } = useAgentSchedules(agentId);
const { documents } = useAgentDocuments(agentId);
```

### Types

```tsx
type AgentId = 'begubot' | 'coder' | 'researcher';

interface Agent {
  id: AgentId;
  name: string;
  role: 'Chief of Staff' | 'Employee';
  color: string;
  reports_to?: AgentId;
}

interface AgentState {
  agent: Agent;
  session?: AgentSession;
  stats?: AgentStats;
  latestActivity?: AgentActivity;
  isOnline: boolean;
}
```

## Environment Variables

Required in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://qbtlslagwbgrnnuaasma.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_KEY=<service-key>  # Optional, for admin operations
```

## Troubleshooting

### Agents not showing?
- Check browser console for errors
- Fallback data is used if tables don't exist
- Apply `AGENT_SCHEMA.sql` in Supabase

### Real-time not working?
- Ensure Supabase realtime is enabled
- Check browser network tab for WebSocket connections
- Tables need RLS policies (included in schema)

### Build errors?
- Run `npm install` to ensure dependencies
- Check TypeScript errors with `npm run build`
