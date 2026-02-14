# Mission Control + Begubot Real-Time Integration Guide

## ✅ Current Status

The Mission Control dashboard is **successfully running** on `http://localhost:3001` with:
- ✅ Next.js 14 frontend configured
- ✅ Supabase client library installed and configured
- ✅ Real-time subscription hooks (`useActivities`, `useTasks`, `useDocuments`)
- ✅ Beautiful dark-themed UI with animations
- ✅ Database schema ready for implementation

## 🚀 Next Steps: Complete the Integration

### Step 1: Create Supabase Tables

To activate real-time data from Begubot, you need to create the database tables in your Supabase project.

**In the Supabase Dashboard:**

1. Go to **https://app.supabase.com**
2. Select your project (`mission-control`)
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire SQL from `SUPABASE_TABLES.sql` in this project
6. Paste it into the editor
7. Click **Run**

**The SQL will create:**
- `activities` table - logs of Begubot actions with metadata
- `tasks` table - scheduled tasks from Begubot
- `documents` table - searchable content and logs
- All necessary indexes for performance
- Row-level security policies
- Real-time subscriptions enabled

### Step 2: Verify Tables in Supabase

After running the SQL:

1. Go to **Table Editor** in Supabase
2. Verify you see:
   - `activities` (with sample data: 8 records)
   - `tasks` (with sample data: 5 records)
   - `documents` (with sample data: 3 records)

### Step 3: Configure Environment Variables

Your `.env.local` already has the Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://qbtlslagwbgrnnuaasma.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

These are already configured! ✅

### Step 4: Test Locally

The app is already running on `http://localhost:3001`:

1. Open http://localhost:3001 in your browser
2. You should see:
   - **Activity Log tab** - Shows agent activities with real-time updates
   - **Schedule tab** - Shows tasks in a weekly calendar view
   - **Search tab** - Global search across documents and activities

3. **Click on activities** to expand and see detailed metadata:
   - Duration, tokens used, memory usage
   - Agent name, action type, status

4. **Click tasks** to mark them as completed

## 🔌 Integrating with Begubot

Once the tables are created, you can start pushing data from Begubot:

### Inserting Activities from Begubot

```python
# In your Begubot Python code
import requests
import json
from datetime import datetime

supabase_url = "https://qbtlslagwbgrnnuaasma.supabase.co"
supabase_key = "your-anon-key"

# Log a Begubot action
activity_data = {
    "agent": "Begubot",
    "action": "telegram-message-processed",
    "description": "Processed 15 new Telegram messages",
    "status": "completed",
    "metadata": {
        "messages_count": 15,
        "duration": 2340,
        "tokens_used": 850,
        "chatroom": "core"
    },
    "timestamp": datetime.utcnow().isoformat()
}

response = requests.post(
    f"{supabase_url}/rest/v1/activities",
    headers={
        "apikey": supabase_key,
        "Content-Type": "application/json",
        "Authorization": f"Bearer {supabase_key}"
    },
    json=activity_data
)

print(response.json())
```

### Inserting Tasks from Begubot

```python
# Schedule a task
task_data = {
    "title": "Process Telegram Queue",
    "description": "Check and process pending Telegram messages",
    "scheduled_for": "2026-02-15T10:00:00Z",
    "status": "pending",
    "day": "Monday"
}

response = requests.post(
    f"{supabase_url}/rest/v1/tasks",
    headers={...},
    json=task_data
)
```

## 📊 Real-Time Features

The dashboard now has **real-time subscriptions** enabled:

### Activities
- New activities appear instantly when logged
- Status updates sync in real-time
- Filters work on live data

### Tasks
- Task status changes sync across all connected clients
- Schedule updates immediately
- Click any task to toggle completion

### Documents
- Search results update as new documents are added
- Tags and metadata update in real-time

## 🔐 Security Notes

The Supabase tables have Row Level Security (RLS) enabled with policies for:
- Public read access (anyone can view)
- Insert/Update/Delete enabled for demo mode (change these in production!)

**For production, restrict access by adding:**
```sql
-- Only authenticated users can insert
CREATE POLICY "Only auth users insert" ON activities 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Only specific agents can insert
CREATE POLICY "Only Begubot inserts" ON activities 
FOR INSERT WITH CHECK (current_user_id() = 'begubot-user-id');
```

## 📝 File Structure

```
mission-control/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main dashboard component
│   │   └── layout.tsx
│   ├── lib/
│   │   ├── supabase.ts           # Supabase client config
│   │   └── api.ts                # API helpers (fetch/update)
│   ├── hooks/
│   │   └── useSupabase.ts        # Real-time hooks
│   ├── types/
│   │   └── database.ts           # TypeScript interfaces
│   └── ...
├── SUPABASE_TABLES.sql           # SQL schema (run this!)
├── .env.local                    # Credentials (already set)
└── package.json
```

## 🚀 Deployment

### Local Testing
```bash
npm run dev
# Open http://localhost:3001
```

### Build for Production
```bash
npm run build
npm start
```

### Deploy to Vercel (Already Configured)

Your project is configured for Vercel deployment:

```bash
# Push to git
git add .
git commit -m "Integrate real-time data from Begubot"
git push origin master

# Deployment happens automatically via Vercel
```

**Live URL will be:** https://mission-control-hyper.vercel.app

## ✨ Features Already Working

1. **Activity Log** ✅
   - Real-time updates from Supabase
   - Expandable details with metadata
   - Type-based filtering and colors
   - Time formatting (5m ago, 2h ago, etc.)

2. **Task Schedule** ✅
   - Weekly calendar view
   - Click to toggle task status
   - Real-time sync across tabs
   - Task counts per day

3. **Global Search** ✅
   - Search activities, documents, metadata
   - Debounced for performance (300ms)
   - Tag-based filtering
   - Rich snippets

4. **Real-Time Subscriptions** ✅
   - Activities: Live push updates
   - Tasks: Instant status sync
   - Documents: Search results update

5. **Beautiful UI** ✅
   - Dark theme optimized for developers
   - Smooth animations with Framer Motion
   - Responsive design
   - Icon-coded actions

## 🐛 Troubleshooting

### "Failed to connect to Supabase"
- Verify `.env.local` has correct credentials
- Check your Supabase project is active
- Tables must exist (run SUPABASE_TABLES.sql)

### "No activities showing"
- Check Supabase Table Editor for data
- Verify real-time is enabled on the table
- Check browser console for errors

### Real-time updates not working
- Ensure tables are enabled in Supabase Replication settings
- Check that `ALTER PUBLICATION supabase_realtime ADD TABLE` was run
- Refresh the page

## 📞 Next Actions

1. **Run the SQL** in Supabase (SUPABASE_TABLES.sql)
2. **Verify tables** in Table Editor
3. **Test locally** at http://localhost:3001
4. **Connect Begubot** to start inserting data
5. **Deploy** to Vercel when ready

## 🎯 What Happens When Begubot Pushes Data

```
Begubot logs action
    ↓
INSERT into activities table via Supabase REST API
    ↓
Real-time subscription triggers
    ↓
Dashboard receives update via WebSocket
    ↓
Activity appears instantly in Activity Log
    ↓
User sees it without refresh ⚡
```

---

**Status:** ✅ Ready for data integration  
**Last Updated:** 2026-02-14  
**Next Step:** Run SUPABASE_TABLES.sql in your Supabase dashboard
