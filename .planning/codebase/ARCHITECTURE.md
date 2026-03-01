# Architecture

**Analysis Date:** 2026-03-02

## Pattern Overview

**Overall:** Next.js 14 App Router with Client-Side React Components

**Key Characteristics:**
- Single-page dashboard application using Next.js App Router
- Client-side data fetching with React hooks and real-time subscriptions
- Supabase as backend-as-a-service for database and real-time features
- Component-based UI with tabbed navigation
- Server-side API routes for external integrations and data mutations

## Layers

### UI Layer (Components)
- Purpose: Render the dashboard interface and handle user interactions
- Location: `src/components/`
- Contains: React components (TSX files), UI primitives in `src/components/ui/`
- Depends on: Hooks layer for data, Types layer for type definitions
- Used by: Page components (`src/app/page.tsx`)

**Key Components:**
- `AuthGate.tsx` - Authentication wrapper
- `AgentsSidebar.tsx` - Agent navigation sidebar
- `TasksBoard.tsx` - Task management board
- `ProactiveHub.tsx` - AI proactive suggestions
- `QuickActions.tsx` - Quick action buttons

### Data Hooks Layer
- Purpose: Encapsulate data fetching, caching, and real-time subscriptions
- Location: `src/hooks/`
- Contains: Custom React hooks for different data domains
- Depends on: API library (`src/lib/api.ts`), Supabase client
- Used by: UI components

**Key Hooks:**
- `useSupabase.ts` - Activities, Tasks, Documents hooks with real-time
- `useAgents.ts` - Agent state, schedules, documents, activities
- `useTaskCompletions.ts` - Daily task completion tracking
- `useProactive.ts` / `useProactiveDashboard.ts` - AI suggestions

### API/Service Layer (Lib)
- Purpose: Provide typed interfaces to data operations and external services
- Location: `src/lib/`
- Contains: API clients, database helpers, utilities, integrations
- Depends on: Supabase client, Types layer
- Used by: Hooks layer, API routes

**Key Libraries:**
- `supabase.ts` - Supabase client and database query helpers
- `api.ts` - Activities, Tasks, Documents CRUD operations
- `agents-api.ts` - Agent-specific API operations
- `notifications.ts` - Telegram notifications
- `proactive/` - AI decision-making and opportunity detection

### Types Layer
- Purpose: Define TypeScript interfaces and types for the domain
- Location: `src/types/`
- Contains: Type definitions for database entities, agents, tasks
- Depends on: None (pure type definitions)
- Used by: All layers

**Key Type Files:**
- `database.ts` - Activity, Task, Document, StudySession types
- `agents.ts` - Agent definitions, stats, sessions
- `proactive.ts` - Proactive decision types

### API Routes Layer
- Purpose: Handle HTTP requests from external clients and internal components
- Location: `src/app/api/`
- Contains: Next.js Route Handlers (route.ts files)
- Depends on: Supabase client, API library
- Used by: External clients, internal fetch calls

**API Route Groups:**
- `activities/` - Activity logging and retrieval
- `agents/` - Agent health, stats, documents sync
- `tasks-board/` - Task claiming and management
- `proactive/` - AI decision and pattern endpoints
- `quick-actions/` - Dashboard action handlers

## Data Flow

### Primary Data Flow (Read)

1. **Component requests data:**
   ```typescript
   const { activities, loading } = useAgentActivities(agentId, 50);
   ```

2. **Hook fetches via API library:**
   ```typescript
   // In useAgents.ts
   const data = await activitiesApi.getAll(limit);
   ```

3. **API library queries Supabase:**
   ```typescript
   // In api.ts
   const { data, error } = await db.activities().select('*')...
   ```

4. **Real-time subscription updates state:**
   ```typescript
   supabase.channel('activities_channel')
     .on('postgres_changes', { table: 'activities' }, callback)
     .subscribe();
   ```

### Secondary Data Flow (Write)

1. **Component calls hook mutation:**
   ```typescript
   await createTask({ title, status: 'pending', ... });
   ```

2. **Hook calls API library:**
   ```typescript
   // In useSupabase.ts
   const newTask = await tasksApi.create(task);
   ```

3. **Optional: API route handles complex logic:**
   ```typescript
   // For external agents logging activities
   POST /api/activities/log → supabase.from('activities').insert()
   ```

### Real-time Data Flow

```
Supabase Database
       ↓ (postgres_changes)
  Supabase Channel
       ↓ (event payload)
  useEffect callback
       ↓ (state update)
  React re-render
```

## Key Abstractions

### Supabase Client Abstraction
- Purpose: Centralized database client with typed table references
- Examples: `src/lib/supabase.ts`
- Pattern: Factory functions returning typed query builders

```typescript
export const db = {
  activities: () => supabase.from('activities'),
  tasks: () => supabase.from('tasks'),
};
```

### API Client Pattern
- Purpose: Typed CRUD operations with error handling
- Examples: `src/lib/api.ts`, `src/lib/agents-api.ts`
- Pattern: Module exports with async methods

### Hook Abstraction
- Purpose: Combine data fetching with real-time subscriptions
- Examples: `src/hooks/useSupabase.ts`
- Pattern: Custom hooks returning state + mutation functions

### Context for Auth
- Purpose: Global authentication state
- Examples: `src/lib/auth-context.tsx`
- Pattern: React Context with provider

## Entry Points

### Main Application Entry
- Location: `src/app/page.tsx`
- Triggers: User navigates to root URL
- Responsibilities: Render main dashboard with tabbed interface, manage tab state

### Root Layout
- Location: `src/app/layout.tsx`
- Triggers: Any page load
- Responsibilities: Setup AuthProvider, dark theme, global CSS

### API Routes
- Location: `src/app/api/*/route.ts`
- Triggers: HTTP requests to `/api/*` paths
- Responsibilities: Validate requests, mutate/retrieve data, return JSON responses

### Real-time Subscriptions
- Location: Initialized in hooks (`useSupabase.ts`, `useAgents.ts`)
- Triggers: Component mount
- Responsibilities: Subscribe to Supabase changes, update React state

## Error Handling

**Strategy:** Try-catch blocks with error state in hooks

**Patterns:**
- Hooks capture errors and expose via `error` state
- API routes return JSON errors with appropriate HTTP status codes
- Components display loading states during fetches

```typescript
// In hooks
const [error, setError] = useState<string | null>(null);
try {
  const data = await activitiesApi.getAll();
  setActivities(data);
} catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to fetch');
}
```

```typescript
// In API routes
if (error) {
  return NextResponse.json(
    { error: 'Failed to log activity', details: error.message },
    { status: 500 }
  );
}
```

## Cross-Cutting Concerns

**Authentication:** 
- Implemented via `AuthProvider` context (`src/lib/auth-context.tsx`)
- `AuthGate` component protects routes (`src/components/AuthGate.tsx`)
- Admin/viewer role distinction

**Real-time Updates:**
- Supabase channels for INSERT/UPDATE/DELETE events
- Automatic state synchronization in hooks

**Notifications:**
- Telegram notifications via `sendTaskNotification` in `src/lib/notifications.ts`
- Triggered on task create, update, complete, delete

**Theme:**
- Dark mode by default (className="dark" in layout)
- CSS custom properties in `src/app/globals.css`

---

*Architecture analysis: 2026-03-02*
