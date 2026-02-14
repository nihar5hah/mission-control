# Mission Control Dashboard Enhancement Plan

## Overview
Add interactive features to Mission Control dashboard for managing activities and tasks with real-time updates.

## Changes Required

### 1. Update API Layer (src/lib/api.ts)

Add these functions to each API module:

#### Activities API
- `deleteActivity(id: number)` - Delete an activity
- `updateActivity(id: number, data: Partial<Activity>)` - Update activity fields

#### Tasks API
- `deleteTask(id: number)` - Delete a task
- `createTask(task: TaskInsert)` - Create a new task (already exists, enhance it)
- `updateTask(id: number, data: Partial<Task>)` - Update task fields (general update beyond just status)

### 2. Update Hooks (src/hooks/useSupabase.ts)

Add these to existing hooks:

#### useActivities
- Add `deleteActivity` function
- Add `updateActivity` function
- Subscribe to DELETE events

#### useTasks
- Add `deleteTask` function
- Add `createTask` function
- Add `updateTask` function
- Handle DELETE events in subscription

#### useDocuments
- Keep as is (read-only)

### 3. Update UI (src/app/page.tsx)

#### Activity Feed Enhancements
- Add delete button to each activity
- Add dropdown menu for status update (running/completed/failed)
- Show loading/error states for delete and update operations

#### Calendar/Tasks Enhancements
- Keep existing task completion toggle
- Add delete button to each task
- Add "New Task" button in calendar section
- Add modal/form for creating new tasks

#### Real-time Sync
- Existing subscriptions already handle updates
- Verify DELETE events are handled correctly

### 4. UI Components to Add
- Delete confirmation dialog
- Task creation modal/form
- Activity status update dropdown menu
- Loading states for async operations

## Implementation Strategy
1. Update src/lib/api.ts with new API functions
2. Update src/hooks/useSupabase.ts with new hook functions
3. Update src/app/page.tsx with UI components and interactions
4. Test real-time updates
5. Commit and deploy
