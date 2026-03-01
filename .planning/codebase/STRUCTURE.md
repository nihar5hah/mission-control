# Codebase Structure

**Analysis Date:** 2026-03-02

## Directory Layout

```
mission-control/
├── src/
│   ├── app/                 # Next.js App Router pages and API routes
│   │   ├── api/            # API Route Handlers
│   │   ├── layout.tsx      # Root layout with AuthProvider
│   │   ├── page.tsx        # Main dashboard page
│   │   └── globals.css     # Global styles and CSS variables
│   ├── components/         # React UI components
│   │   └── ui/             # Reusable UI primitives (shadcn/ui)
│   ├── hooks/              # Custom React hooks for data fetching
│   │   └── __tests__/      # Test files
│   ├── lib/                # Business logic and integrations
│   │   └── proactive/      # AI/ML decision modules
│   └── types/              # TypeScript type definitions
├── supabase/               # Supabase configuration
├── scripts/                # Build/utility scripts
├── public/                 # Static assets
├── package.json            # Dependencies
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## Directory Purposes

### src/app/
- Purpose: Next.js App Router structure
- Contains: Pages (page.tsx), layouts (layout.tsx), API routes, global styles
- Key files: 
  - `page.tsx` - Main Mission Control dashboard (2000+ lines)
  - `layout.tsx` - Root layout with AuthProvider and dark theme
  - `globals.css` - CSS variables, dark mode styles, animations

### src/components/
- Purpose: React UI components
- Contains: Feature components, UI primitives
- Key files:
  - `AuthGate.tsx` - Authentication wrapper
  - `AgentsSidebar.tsx` - Agent list sidebar
  - `TasksBoard.tsx` - Kanban-style task board
  - `ProactiveHub.tsx` - AI suggestions panel
  - `QuickActions.tsx` - Action buttons
  - `DailyReview.tsx` - Daily review component
  - `AgentHealthCard.tsx` / `GatewayHealthCard.tsx` - Health monitoring
  - `OvernightSummary.tsx` - Summary of overnight activities
  - `ui/` - Reusable UI components (button, dialog, command, sonner)

### src/hooks/
- Purpose: Custom React hooks for data fetching and state management
- Contains: Data fetching hooks, real-time subscriptions
- Key files:
  - `useSupabase.ts` - Activities, Tasks, Documents hooks
  - `useAgents.ts` - Agent state, schedules, documents
  - `useTaskCompletions.ts` - Daily task completion tracking
  - `useProactive.ts` / `useProactiveDashboard.ts` - AI suggestions
  - `useWorkspaceFiles.ts` - File tree management
  - `useTasksBoard.ts` - Task board operations

### src/lib/
- Purpose: Business logic, API clients, utilities
- Contains: Data operations, integrations, helpers
- Key files:
  - `supabase.ts` - Supabase client and database helpers
  - `api.ts` - CRUD operations for activities, tasks, documents
  - `agents-api.ts` - Agent-specific API operations
  - `auth-context.tsx` - Authentication React context
  - `notifications.ts` - Telegram notification sending
  - `activity-logger.ts` - Activity logging utilities
  - `proactive/` - AI decision-making module:
    - `decisions.ts` - Decision engine
    - `opportunities.ts` - Opportunity detection
    - `patterns.ts` - Pattern recognition
    - `integrations.ts` - External integrations

### src/types/
- Purpose: TypeScript type definitions
- Contains: Interface definitions for domain entities
- Key files:
  - `database.ts` - Activity, Task, Document, StudySession types
  - `agents.ts` - Agent, AgentActivity, AgentSession, AgentStats
  - `proactive.ts` - Proactive decision types
  - `tasks-board.ts` - Task board types

### src/app/api/
- Purpose: HTTP API route handlers
- Contains: Route handlers organized by feature
- Key routes:
  - `activities/log/route.ts` - Activity logging
  - `agents/*/route.ts` - Agent operations
  - `tasks-board/*/route.ts` - Task board operations
  - `proactive/*/route.ts` - AI operations
  - `quick-actions/*/route.ts` - Dashboard actions

## Key File Locations

### Entry Points
- `src/app/page.tsx` - Main dashboard page (2000+ lines)
- `src/app/layout.tsx` - Root layout

### Configuration
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript config
- `tailwind.config.js` - Tailwind CSS config
- `next.config.js` - Next.js config

### Core Logic
- `src/lib/supabase.ts` - Database client
- `src/lib/api.ts` - Data operations
- `src/hooks/useSupabase.ts` - Data fetching hooks

### Authentication
- `src/lib/auth-context.tsx` - Auth state
- `src/components/AuthGate.tsx` - Auth protection

## Naming Conventions

### Files
- **Components:** PascalCase (e.g., `AgentHealthCard.tsx`, `TasksBoard.tsx`)
- **Hooks:** camelCase with `use` prefix (e.g., `useSupabase.ts`, `useAgents.ts`)
- **Utilities/Lib:** camelCase (e.g., `supabase.ts`, `api.ts`)
- **Types:** PascalCase (e.g., `database.ts`, `agents.ts`)
- **API Routes:** kebab-case directories with `route.ts` file (e.g., `activities/log/route.ts`)

### Directories
- **src/app/api/:** kebab-case (e.g., `quick-actions/`, `tasks-board/`)
- **src/components/ui/:** kebab-case (e.g., `button.tsx`, `dialog.tsx`)
- **Other src directories:** camelCase (e.g., `lib/`, `hooks/`, `types/`)

### Types/Interfaces
- PascalCase (e.g., `Activity`, `Task`, `Agent`, `AgentStats`)
- Insert types: `<EntityName>Insert` (e.g., `ActivityInsert`, `TaskInsert`)

## Where to Add New Code

### New Feature/Component
- Implementation: `src/components/`
- Tests: `src/hooks/__tests__/` (if testing hooks) or co-located

### New API Endpoint
- Implementation: `src/app/api/<feature>/route.ts`
- Follow RESTful patterns: `GET`, `POST`, `PUT`, `DELETE` in route.ts

### New Data Hook
- Implementation: `src/hooks/<feature>.ts`
- Follow pattern: `use<Entity>()` returning `{ data, loading, error, ...mutations }`

### New Library/Utility
- Implementation: `src/lib/<feature>.ts`
- If module: create `src/lib/<feature>/` directory with `index.ts`

### New Type Definition
- Implementation: `src/types/<domain>.ts`
- Or add to existing file (e.g., `database.ts` for entity types)

### New Proactive/AI Feature
- Implementation: `src/lib/proactive/<feature>.ts`
- Exports registered in `src/lib/proactive/index.ts`

## Special Directories

### src/lib/proactive/
- Purpose: AI decision-making and opportunity detection
- Contains: Decision engine, pattern recognition, integrations
- Generated: No (hand-written business logic)
- Committed: Yes

### src/components/ui/
- Purpose: Reusable UI primitives (shadcn/ui components)
- Contains: button, dialog, command, sonner
- Generated: Partially (base components from shadcn)
- Committed: Yes

### src/hooks/__tests__/
- Purpose: Test files for hooks
- Contains: Unit and integration tests
- Generated: No
- Committed: Yes

### supabase/
- Purpose: Supabase database configuration
- Contains: Schema migrations, seed data
- Generated: Yes (via Supabase CLI)
- Committed: Yes (version controlled)

### public/
- Purpose: Static assets
- Contains: Favicon, images
- Generated: No
- Committed: Yes

---

*Structure analysis: 2026-03-02*
