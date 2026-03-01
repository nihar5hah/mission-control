# Codebase Concerns

**Analysis Date:** 2026-03-02

## Tech Debt

### Large Component Files
- **Issue:** Components exceeding 400 lines lack proper code splitting
- **Files:** 
  - `src/components/ProactiveHub.tsx` - 1018 lines
  - `src/components/AuthGate.tsx` - 419 lines  
  - `src/components/WorkSessionTimer.tsx` - 403 lines
  - `src/components/OvernightSummary.tsx` - 318 lines
  - `src/components/AgentDetailsModal.tsx` - 278 lines
- **Impact:** Difficult to maintain, test, and understand. Risk of introducing bugs during modifications.
- **Fix approach:** Break into smaller sub-components using composition patterns

### Stub/Placeholder Implementations
- **Issue:** Several integrations have incomplete implementations that silently return empty data
- **Files:** `src/lib/proactive/integrations.ts`
  - Line 444-462: Calendar integration fetches from tasks table instead of actual calendar API
  - Line 567-575: Filesystem `getStructure()` returns empty structure
  - Line 581-588: Filesystem `getStats()` returns zeros
  - Line 593-595: Filesystem `getRecentChanges()` returns empty array
- **Impact:** Features appear to work but return no meaningful data
- **Fix approach:** Implement actual API integrations or remove dead code paths

### Extensive Use of `any` Type
- **Issue:** Type safety compromised throughout integrations layer
- **Files:** `src/lib/proactive/integrations.ts`
  - Line 120, 156, 161, 191, 335, 373: Multiple `any` type annotations
  - Line 39, 75-76, 90, 93, 288, 424, 546: Unsafe type casting with `as unknown as`
- **Impact:** Runtime errors may occur without compile-time warnings
- **Fix approach:** Define proper TypeScript interfaces for all API responses

### Silent Error Handling
- **Issue:** Many functions return empty arrays/null without logging errors
- **Files:** `src/lib/proactive/integrations.ts` lines 102-169, 310-382
- **Impact:** Failures are invisible to users and difficult to debug
- **Fix approach:** Add proper error logging and consider user-facing error states

---

## Security Considerations

### SQL Injection Vulnerability
- **Risk:** User-provided search queries directly interpolated into SQL
- **Files:** 
  - `src/lib/api.ts` line 262: `.or(`title.ilike.%${query}%,content.ilike.%${query}%`)`
  - `src/lib/agents-api.ts` line 478: Same pattern
- **Current mitigation:** None
- **Recommendations:** Use Supabase's built-in parameterized queries or sanitize input

### Weak Timing Attack Mitigation
- **Risk:** Password comparison vulnerable to timing attacks
- **Files:** `src/app/api/auth/verify/route.ts` line 26
- **Current mitigation:** Length check before comparison, but string comparison uses `!==`
- **Recommendations:** Use constant-time comparison function (e.g., `crypto.timingSafeEqual`)

### Service Role Key Exposure
- **Risk:** SUPABASE_SERVICE_ROLE_KEY used in API routes accessible from client
- **Files:**
  - `src/app/api/tasks-board/[id]/claim/route.ts`
  - `src/app/api/tasks-board/[id]/route.ts`
  - `src/app/api/tasks-board/route.ts`
  - `src/app/api/work-sessions/route.ts`
- **Current mitigation:** None - service role key has full database access
- **Recommendations:** Use Row Level Security (RLS) policies instead, or restrict to server-only routes

### Hardcoded Credentials in Scripts
- **Risk:** API keys embedded in source code
- **Files:** `scripts/sync-docs.ts` line 19 - hardcoded Supabase keys
- **Current mitigation:** None
- **Recommendations:** Move all secrets to environment variables, never commit to source

### Missing Authentication on Some Routes
- **Risk:** Several API routes lack authentication checks
- **Files:** 
  - `src/app/api/health/route.ts`
  - `src/app/api/gateway/health/route.ts`
  - `src/app/api/polymarket/opportunities/route.ts`
- **Current mitigation:** None visible
- **Recommendations:** Add auth middleware to all API routes

---

## Known Bugs

### Tasks Board - Status Filter Not Working
- **Symptoms:** Filtering by status returns incorrect results
- **Files:** `src/app/api/tasks-board/claimable/route.ts` line 44
- **Trigger:** Comment mentions "assigned_to column doesn't exist yet"
- **Workaround:** None - awaiting database migration

### Document Search May Fail Silently
- **Symptoms:** Search returns empty results without error message
- **Files:** `src/lib/api.ts` line 258-267
- **Trigger:** SQL error is thrown but caught internally, returns empty array
- **Workaround:** Check server logs for error details

---

## Performance Bottlenecks

### No Rate Limiting
- **Problem:** API routes have no rate limiting despite RATE_LIMIT env var being defined
- **Files:** All API routes in `src/app/api/`
- **Cause:** Rate limiting not implemented in code
- **Improvement path:** Implement rate limiting middleware (e.g., using `upstash/ratelimit`)

### Large Component Re-renders
- **Problem:** ProactiveHub.tsx causes excessive re-renders due to monolithic state
- **Files:** `src/components/ProactiveHub.tsx`
- **Cause:** Single large component managing many unrelated states
- **Improvement path:** Split into smaller components with各自的状态管理

### Cache Stampede Risk
- **Problem:** Multiple concurrent requests can bypass cache and hit external APIs
- **Files:** `src/lib/proactive/integrations.ts` lines 34-60
- **Cause:** No cache locking or request deduplication
- **Improvement path:** Implement request coalescing using Promise caching

---

## Fragile Areas

### Integration Layer (`src/lib/proactive/integrations.ts`)
- **Files:** 736 lines, multiple external API integrations
- **Why fragile:** Multiple failure points (GitHub, Vercel, filesystem, calendar), complex caching logic, no circuit breakers
- **Safe modification:** Add comprehensive error boundaries and logging before changes
- **Test coverage:** None visible

### Tasks Board API Routes
- **Files:** `src/app/api/tasks-board/*`
- **Why fragile:** Complex state transitions (claim, update, delete), no optimistic locking
- **Safe modification:** Add transaction support and conflict resolution
- **Test coverage:** No tests visible

### ProactiveHub Component
- **Files:** `src/components/ProactiveHub.tsx` (1018 lines)
- **Why fragile:** Handles 6+ different data sources, complex animation states, many UI branches
- **Safe modification:** Extract sub-components for each data source and feature
- **Test coverage:** No tests visible

---

## Scaling Limits

### Database Queries
- **Current capacity:** No pagination on some queries (e.g., line 630 in integrations.ts fetches all activities)
- **Limit:** Will degrade with large activity tables
- **Scaling path:** Add pagination to all list queries

### Client-Side State
- **Current capacity:** No virtualization for lists
- **Limit:** Performance degrades with 100+ items
- **Scaling path:** Implement virtual scrolling for task lists and activity logs

---

## Dependencies at Risk

### Next.js Version
- **Risk:** Using Next.js 14.0.0 (older version)
- **Impact:** Missing security patches, performance improvements in newer versions
- **Migration plan:** Upgrade to Next.js 14.2+ or 15.x following migration guide

### TypeScript Version
- **Risk:** Using TypeScript 5.3 (older)
- **Impact:** Missing type system improvements
- **Migration plan:** Upgrade to TypeScript 5.5+

### Radix UI Packages
- **Risk:** Using specific versions that may have compatibility issues
- **Impact:** Potential runtime issues with React 18.x
- **Migration plan:** Update to latest compatible versions

---

## Test Coverage Gaps

### No Unit Tests for Core Logic
- **What's not tested:** 
  - All API routes (`src/app/api/*/route.ts`)
  - All lib functions (`src/lib/*.ts`)  
  - Most components (`src/components/*.tsx`)
- **Files:** Only 2 test files exist:
  - `src/hooks/__tests__/useTaskCompletions.test.ts`
  - `src/hooks/__tests__/useTaskCompletions.integration.test.ts`
- **Risk:** Bugs in critical paths go undetected until production
- **Priority:** HIGH - Add tests for API routes and lib functions first

### No Integration Tests
- **What's not tested:** Full user workflows, database transactions, external API mocking
- **Risk:** Integration issues between components and API routes
- **Priority:** MEDIUM - Add integration tests for key user flows

### No E2E Tests
- **What's not tested:** Full browser interactions, critical user journeys
- **Risk:** UI bugs and user-facing issues
- **Priority:** LOW - Consider adding Playwright tests for critical paths

---

## Missing Critical Features

### Logging and Observability
- **Problem:** No centralized logging, no error tracking (Sentry optional but not configured)
- **Blocks:** Ability to diagnose production issues
- **Priority:** HIGH

### Input Validation
- **Problem:** Minimal validation on API inputs
- **Blocks:** Security and data integrity
- **Priority:** HIGH

### Error Boundaries
- **Problem:** No React error boundaries to gracefully handle component failures
- **Blocks:** Single component errors crash entire page
- **Priority:** MEDIUM

---

*Concerns audit: 2026-03-02*
