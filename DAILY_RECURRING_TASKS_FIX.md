# Mission Control Calendar Fix - Daily Recurring Tasks

## Problem
The calendar view was not showing daily recurring tasks properly. Tasks with `day = "Daily"` should appear on EVERY day of the week, but they were only showing on their specific scheduled_for date.

## Solution
Modified `/src/app/page.tsx` to implement proper daily recurring task logic:

### 1. Updated `getWeekDays()` function
- Changed from showing Sunday-Saturday week view to showing TODAY + next 6 days (7 days total)
- This ensures we always show the current week plus some future days
- Users can see daily tasks immediately starting from today

### 2. Updated `getAllTaskDays()` function
- Now prioritizes the 7-day week view (today + next 6 days)
- For tasks that are NOT "Daily", they only appear on their specific scheduled_for date
- For tasks that ARE "Daily" (day = "Daily"), they will appear on every day in the week view
- Map-based deduplication ensures no duplicate dates in the calendar

### 3. Updated `getTasksForDay()` function
- Added logic to check if `task.day === 'Daily'`
- If true, the task appears on every single day queried
- Otherwise, matches the task's scheduled_for date to the specific calendar day
- This is the KEY fix that makes daily tasks visible on all days

## Result
Now the calendar will:
✅ Show EVERY day from today through the next 6 days (full week view)
✅ Display all daily recurring tasks (Morning Brief, Daily Research Report, Night Shift Build, Eval System Run) on EVERY day
✅ Still show specific-date tasks only on their scheduled dates
✅ Properly handle mixed schedules (both daily and specific-date tasks)

## Database Structure
The tasks table has a `day` field that supports:
- `"Daily"` - Task repeats every day
- Day names (Monday, Tuesday, etc.) - Task appears on specific days
- Specific dates via `scheduled_for` - Primary schedule column

## Testing
Sample daily recurring tasks can be created with:
```sql
INSERT INTO tasks (title, scheduled_for, status, day) VALUES
('Morning Brief', NOW() + INTERVAL '1 hour', 'pending', 'Daily'),
('Daily Research Report', NOW() + INTERVAL '5 hours 30 minutes', 'pending', 'Daily'),
('Night Shift Build', NOW() + INTERVAL '20 hours 30 minutes', 'pending', 'Daily'),
('Eval System Run', NOW() + INTERVAL '8 hours', 'completed', 'Daily');
```

See `DAILY_RECURRING_FIX.sql` for the migration script.

## Files Modified
- `/src/app/page.tsx` - Calendar rendering logic (3 functions updated)

## Related Features
- Real-time updates: Tasks are subscription-based, so new daily tasks show immediately
- Task status: Can toggle daily tasks as complete and they persist
- Full calendar view: Shows all 7 upcoming days with all recurring tasks visible
