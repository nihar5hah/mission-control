# Schedule Feature Rebuild Report

## Why the old version failed
1. **Global task status was reused for daily tasks**
   - Daily tasks were treated as a single global status in the `tasks` table.
   - Completing a task on one day updated the shared status, leaking completion into other days.

2. **No real-time completion sync**
   - Mission Control loaded task completion once and never subscribed to updates.
   - When OpenClaw executed tasks in the background, the UI became stale until refresh.

3. **Week view not aligned to Mon–Sun**
   - The calendar used a rolling “today + 6” view, which drifted from the weekly layout requirement.

4. **Limited status fidelity**
   - Daily task completions only supported `pending` / `completed`.
   - Running/failed states could not be represented per-day.

## What the new implementation does
1. **Per-day completion tracking**
   - Daily tasks use `task_completions` keyed by `{task_id, completion_date}`.
   - Each day has its own record, so Monday completion does not affect Tuesday.

2. **Real-time sync via Supabase**
   - Mission Control subscribes to `task_completions` updates.
   - Any completion change from OpenClaw is reflected instantly.

3. **True weekly view (Mon–Sun)**
   - The Schedule tab now renders the current week, starting Monday and ending Sunday.
   - The existing UI layout remains unchanged.

4. **Status fidelity (pending / running / completed / failed)**
   - Daily task status is normalized from `task_completions`.
   - One-time tasks use their stored task status.
   - UI styling now reflects running and failed states without changing layout.

## Key code changes
- **`useTaskCompletions`**
  - Added real-time subscription to `task_completions`.
  - Expanded status handling to include `in_progress` and `failed`.
- **`page.tsx`**
  - Week view now anchors to Monday.
  - Daily tasks use per-date status (normalized).
  - Status styling supports running and failed.
- **SQL migrations**
  - `MIGRATION_TASK_STATUS_FAILED.sql` extends status constraints to include `failed`.

## How this satisfies the requirements
- ✅ **Tasks per day**: Daily tasks render on every date, one-time tasks appear on their scheduled date.
- ✅ **Per-day completion**: `task_completions` stores each day’s execution state.
- ✅ **Automatic control**: OpenClaw updates Supabase; UI reflects instantly.
- ✅ **Perfect sync**: Refresh or restart uses Supabase as the source of truth.
- ✅ **Daily reset**: No completion bleed between dates.
- ✅ **Two-way control**: Mission Control creates/updates tasks; OpenClaw updates completion status.
- ✅ **UI preserved**: No layout changes; only data logic updated.
- ✅ **Robust + debuggable**: Clear DB records per day, real-time subscriptions, and explicit status states.
