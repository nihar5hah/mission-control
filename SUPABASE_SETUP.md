# Supabase Integration Setup Guide

## Step 1: Create Database Tables

1. Go to your Supabase project dashboard at https://app.supabase.com
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the SQL from `DATABASE_SCHEMA.sql` and paste it into the editor
5. Click **Run** to execute

## Step 2: Verify Tables Created

In the Supabase dashboard:
1. Go to **Table Editor**
2. You should see three new tables:
   - `activities`
   - `tasks`
   - `documents`

## Step 3: Test the Connection

Your environment variables are already set in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

To test the connection:
```bash
npm run dev
```

The app should now load with real-time subscriptions to Supabase.

## Step 4: Add Initial Data (Optional)

You can add sample data through the Supabase Table Editor or via SQL:

```sql
-- Insert sample activities
INSERT INTO activities (agent, action, description, status, timestamp) VALUES
('Main Agent', 'Build', 'Updated Mission Control dashboard UI', 'completed', NOW() - INTERVAL '5 minutes'),
('Main Agent', 'Research', 'Daily research report on AI architecture', 'completed', NOW() - INTERVAL '30 minutes'),
('Subagent', 'Review', 'Code review and validation completed', 'completed', NOW() - INTERVAL '1 hour'),
('Main Agent', 'Brief', 'Morning briefing delivered to team', 'completed', NOW() - INTERVAL '2 hours'),
('System', 'Sync', 'Data synchronization across nodes', 'running', NOW() - INTERVAL '15 minutes');

-- Insert sample tasks
INSERT INTO tasks (title, scheduled_for, status, day) VALUES
('Morning Brief', NOW() + INTERVAL '1 day', 'pending', 'Monday'),
('Research Report', NOW() + INTERVAL '3 days', 'pending', 'Wednesday'),
('Code Review', NOW() + INTERVAL '5 days', 'pending', 'Friday'),
('Team Standup', NOW() + INTERVAL '7 days', 'pending', 'Sunday');

-- Insert sample documents
INSERT INTO documents (title, content, category, tags) VALUES
('API Documentation', 'Complete API reference with examples...', 'documentation', ARRAY['api', 'reference']),
('Deployment Guide', 'Step-by-step guide for deploying to production...', 'guide', ARRAY['deployment', 'production']),
('Architecture Overview', 'High-level system architecture and design patterns...', 'documentation', ARRAY['architecture', 'design']);
```

## Real-time Subscriptions

The app automatically subscribes to real-time changes for:
- **Activities**: New activities appear instantly as they're added
- **Tasks**: Task updates sync across all connected clients
- **Documents**: Search results update as documents are added/modified

## Troubleshooting

### Connection Error
If you see "Failed to connect to Supabase":
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
- Check that your Supabase project is active
- Ensure Row Level Security (RLS) policies are enabled

### Tables Not Found
- Check that SQL executed successfully in Supabase
- Go to Table Editor to verify tables exist
- Refresh the page

### Real-time Not Working
- Enable real-time for each table in Supabase:
  1. Go to **Table Editor**
  2. Select each table
  3. Click **Replication** and enable it

## File Structure

```
src/
├── app/
│   ├── page.tsx           # Main dashboard (refactored)
│   └── api/
│       └── ...            # Optional API routes
├── lib/
│   ├── supabase.ts        # Supabase client
│   └── api.ts             # API helper functions
├── types/
│   └── database.ts        # Database types
├── hooks/
│   └── useSupabase.ts     # Custom hooks (useActivities, useTasks, useDocuments)
└── ...
```

## Next Steps

1. Add more documents via Supabase Table Editor
2. Implement file upload to Supabase Storage
3. Add authentication with Supabase Auth
4. Set up proper RLS policies for security
5. Create API routes for complex operations
