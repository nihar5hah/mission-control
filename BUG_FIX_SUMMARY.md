# Mission Control Schedule Tab - Bug Fixes

## Summary of Fixes

This PR fixes three critical bugs in the Mission Control Schedule tab related to daily task completion tracking.

## Bugs Fixed

### 1. ✅ Daily Tasks Sync Completion Across All Days
**Problem:** When you marked a "daily" task as complete on Monday, it would show as complete on Tuesday, Wednesday, etc. The completion status was shared across all days because the same task object was displayed on every day.

**Root Cause:** The `getTasksForDay()` function returned the same task object for every day. The task's `status` field was shared across all dates, so updating it on one day affected all days.

**Solution:** Implemented date-specific completion tracking using a custom `useTaskCompletions()` hook that:
- Stores completion status per date using `localStorage` (with format: `${taskId}_${YYYY-MM-DD}`)
- For daily tasks, returns a modified task object with `status` overridden per date
- For one-time tasks, uses the existing database `status` field
- Handler `handleToggleTaskCompletion()` routes completion updates appropriately

**Files Modified:**
- `src/types/database.ts` - Added `TaskCompletion` interface
- `src/hooks/useTaskCompletions.ts` - New hook for managing date-specific completions
- `src/app/page.tsx` - Updated to use the new completion system

### 2. ✅ 8 Days Showing Instead of 7
**Problem:** The calendar view showed 8+ days including 2 Mondays, instead of exactly 7 days (today + next 6 days).

**Root Cause:** The `getAllTaskDays()` function added the current week (7 days) AND all task-specific dates that fell outside the week. This could result in more than 7 days being displayed.

**Solution:** Modified `getAllTaskDays()` to return exactly 7 days by only calling `getWeekDays()`, which generates today + next 6 days.

**Files Modified:**
- `src/app/page.tsx` - Fixed `getAllTaskDays()` function

### 3. ✅ Tasks Not Standalone
**Problem:** Each day's tasks were not independent instances - they were the same object references.

**Root Cause:** Related to Bug #1 - the same task object was displayed on multiple days.

**Solution:** Modified `getTasksForDay()` to:
- Map through tasks and create new objects for daily tasks with date-specific completion status
- This ensures each day has independent task instances

**Files Modified:**
- `src/app/page.tsx` - Updated `getTasksForDay()` to create independent task instances

## Technical Implementation

### New Hook: `useTaskCompletions`

```typescript
const { 
  isCompletedOnDate,      // Check if task is completed on a date
  toggleCompletion,       // Toggle completion for a task on a date
  getStatusOnDate,        // Get completion status for a task on a date
  setCompletion,          // Set specific completion status
  clearAllCompletions,    // Clear all stored completions
} = useTaskCompletions();
```

Storage: `localStorage` with key format `mission_control_task_completions`

### Updated Handler

```typescript
const handleToggleTaskCompletion = (task: Task, date: Date) => {
  // For daily tasks, use date-specific completion tracking
  if (task.type === 'daily' || task.day === 'Daily') {
    toggleDateCompletion(task.id, date);
  } else {
    // For one-time tasks, toggle the task status in the database
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    updateStatus(task.id, newStatus);
  }
};
```

### Updated Utility Functions

```typescript
// Shows exactly 7 days: today + next 6 days
const getAllTaskDays = () => {
  return getWeekDays();
};

// Returns tasks with date-specific completion status
const getTasksForDay = (date: Date) => {
  return tasks.map((task) => {
    // Check if task should be displayed on this date
    const shouldDisplay = task.type === 'daily' || task.day === 'Daily' || 
      (task.type === 'one-time' && 
       new Date(task.scheduled_for).toDateString() === date.toDateString());

    if (!shouldDisplay) return null;

    // For daily tasks, use date-specific completion status
    if (task.type === 'daily' || task.day === 'Daily') {
      const completionStatus = getStatusOnDate(task.id, date);
      return {
        ...task,
        status: completionStatus as 'pending' | 'completed',
      };
    }

    // For one-time tasks, use the task's own status
    return task;
  }).filter((t): t is typeof tasks[0] => t !== null);
};
```

## Migration Path (Future)

A migration file `MIGRATION_TASK_COMPLETIONS.sql` has been created for when DDL access becomes available. This will:
1. Create a `task_completions` table to store date-specific completion status in the database
2. Migrate data from localStorage to the database
3. Enable real-time synchronization across devices

Until then, completions are stored in `localStorage` and will persist locally on the same device.

## Testing Checklist

- [x] Calendar shows exactly 7 days (today + next 6 days)
- [x] Marking a daily task complete on Monday doesn't affect other days
- [x] Each day's task instances are independent
- [x] Creating new tasks works independently
- [x] One-time tasks still use database status field
- [x] Completion status persists on page reload (localStorage)
- [x] No UI errors or console warnings

## Files Changed

1. `src/types/database.ts` - Added TaskCompletion interface
2. `src/hooks/useTaskCompletions.ts` - New hook for completion tracking (93 lines)
3. `src/app/page.tsx` - Updated component logic (4 main changes)
4. `MIGRATION_TASK_COMPLETIONS.sql` - Future database migration

## Notes for Reviewers

- **localStorage Limitation**: Completions are device-specific. Consider enabling the migration when DDL access is available.
- **Backward Compatibility**: One-time tasks continue to use the database status field without changes.
- **Future Enhancement**: The migration file is ready to be applied to move completions to the database for cross-device sync.

## Verification Commands

```bash
# Build the project
npm run build

# Run the development server
npm run dev

# Test steps:
# 1. Navigate to the Schedule tab
# 2. Verify exactly 7 days are shown
# 3. Create a daily task
# 4. Mark it complete on Monday only
# 5. Verify it's pending on other days
# 6. Refresh the page - completion should persist
```
