# Coding Conventions

**Analysis Date:** 2026-03-02

## Naming Patterns

**Files:**
- Hooks: `useCamelCase.ts` - e.g., `useTaskCompletions.ts`, `useSupabase.ts`
- Utilities: `kebab-case.ts` - e.g., `auth.ts`, `api.ts`, `utils.ts`
- Components: `PascalCase.tsx` - e.g., `QuickActions.tsx`, `AgentAvatar.tsx`
- Types: `kebab-case.ts` - e.g., `database.ts`, `agents.ts`
- API Routes: `kebab-case.ts` - e.g., `tasks-board/route.ts`
- Tests: `kebab-case.test.ts` or `kebab-case.integration.test.ts`

**Functions:**
- Hooks: `use` prefix for custom hooks - `useTaskCompletions()`, `useSupabase()`
- React Components: PascalCase - `export function QuickActions()`
- API Helpers: camelCase - `taskCompletionsApi.getCompletion()`
- Utility Functions: camelCase - `cn()`, `normalizeStatus()`

**Variables:**
- camelCase - `const completions`, `const key`
- Boolean: `isCompletedOnDate`, `isViewer` (use `is` prefix)
- Arrays: Plural nouns - `const tasks`, `const actions`
- Interfaces: PascalCase - `TaskCompletionRecord`, `Activity`

**Types:**
- Type aliases: PascalCase - `TaskStatus`, `TaskCompletionStatus`
- Enum-like unions: Lowercase - `'pending' | 'in_progress' | 'completed' | 'failed'`
- Interfaces: PascalCase - `Activity`, `Task`, `Document`

## Code Style

**Formatting:**
- Tool: Prettier (via Next.js default)
- Config: Not explicitly configured - uses Next.js defaults

**Linting:**
- Tool: ESLint with `eslint-config-next`
- Strict TypeScript enabled in `tsconfig.json`:
  - `strict: true`
  - `noImplicitAny: true`
  - `strictNullChecks: true`
  - `noImplicitReturns: true`

**Styling:**
- Tailwind CSS via `tailwind.config.js`
- shadcn/ui components with "new-york" style
- CSS variables for theming in `src/app/globals.css`

## Import Organization

**Order (within files):**
1. External React/Next imports - `'react'`, `'next/server'`
2. Third-party library imports - `'@supabase/supabase-js'`, `'framer-motion'`
3. Path alias imports (using `@/`) - `@/lib/supabase`, `@/components/ui/dialog`
4. Relative imports - `../`, `./`

**Path Aliases:**
- `@/*` maps to `./src/*` (configured in `tsconfig.json`)
- Common aliases used:
  - `@/lib/*` - Library utilities and API clients
  - `@/components/*` - React components
  - `@/components/ui/*` - shadcn/ui primitive components
  - `@/hooks/*` - Custom React hooks
  - `@/types/*` - TypeScript type definitions
  - `@/app/*` - Next.js app router pages and routes

**Example (from `src/hooks/useTaskCompletions.ts`):**
```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, taskCompletionsApi } from '@/lib/supabase';
import type { TaskCompletionStatus } from '@/types/database';
```

## Error Handling

**Patterns:**
- Try-catch blocks for async operations
- Console.error with descriptive messages: `console.error('Failed to load task completion:', err)`
- Error state in React hooks: `useState<string | null>(null)`
- Error messages propagated to UI via return values
- Error reversion in optimistic updates (see `src/hooks/useTaskCompletions.ts`)

**Example (from `src/hooks/useTaskCompletions.ts`):**
```typescript
try {
  await taskCompletionsApi.setCompletion(taskId, date, newStatus);
} catch (err) {
  console.error('Failed to toggle task completion:', err);
  // Revert on error
  setCompletions(prev => ({
    ...prev,
    [key]: currentStatus || 'pending',
  }));
  setError(err instanceof Error ? err.message : 'Failed to toggle completion');
}
```

**API Routes:**
- Return `NextResponse.json({ error: 'message' }, { status: 500 })` for errors
- Return `NextResponse.json(data, { status: 201 })` for created resources

## Logging

**Framework:** `console` (primarily `console.error` and `console.log`)

**Patterns:**
- Prefix logs with component/feature name: `console.log('[TasksBoard] Notified agent...')`
- Error logging includes error object: `console.error('[TasksBoard] POST error', error)`
- Silent failures for non-critical operations: `console.log('...')` without crashing

## Comments

**When to Comment:**
- JSDoc for exported functions and hooks
- Describe complex logic and key requirements
- Explain "why" for non-obvious implementation choices

**J (from `src/lib/supSDoc Usageabase.ts`):**
```typescript
/**
 * Get completion status for a task on a specific date
 */
async getCompletion(taskId: number, date: Date): Promise<'pending' | 'in_progress' | 'completed' | 'failed'> {


**Size:** No strict limit```

## Function Design, but functions tend to be focused and single-purpose

**Parameters:**
- Type annotations required (strict TypeScript)
- Use interfaces for complex objects
- Use union types for enums: `status: 'pending' | 'in_progress' | 'completed' | 'failed'`

**Return Values:**
- Explicit return types required
- Async functions return `Promise<T>`
- Hooks return object with named properties

## Module Design

**Exports:**
- Named exports for utilities and APIs: `export const taskCompletionsApi = { ... }`
- Named exports for hooks: `export function useTaskCompletions() { ... }`
- Named exports for components: `export function QuickActions() { ... }`

**Barrel Files:**
- Used for type groupings: `src/types/database.ts`, `src/types/agents.ts`
- Not extensively used for re-exports

## Component Patterns

**React Components:**
- Use `'use client'` directive for client-side components
- Functional components with TypeScript
- Props interface defined inline or in separate types file
- Use shadcn/ui primitives for common UI elements

**Example (from `src/components/QuickActions.tsx`):**
```typescript
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export function QuickActions() {
  const { isViewer } = useAuth();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const runAction = async (actionId: string) => {
    // ...
  };

  return (
    <motion.div>
      {/* JSX */}
    </motion.div>
  );
}
```

---

*Convention analysis: 2026-03-02*
