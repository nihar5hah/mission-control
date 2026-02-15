# Quick Start Guide

Get Mission Control running in 5 minutes.

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free)
- Git

## Step 1: Clone & Install

```bash
git clone <your-repo-url> mission-control
cd mission-control
npm install
```

## Step 2: Setup Supabase

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → API
4. Copy your credentials:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Service role secret → `SUPABASE_SERVICE_ROLE_KEY`

## Step 3: Create .env.local

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## Step 4: Setup Database

1. Go to your Supabase project → SQL Editor
2. Create new query
3. Copy all SQL from `src/lib/proactive/database.sql`
4. Run it

## Step 5: Run Dev Server

```bash
npm run dev
```

Visit http://localhost:3000

## What You Get

✅ Activity Log - Real-time action tracking
✅ Calendar - Task management
✅ Proactive Hub - Pattern detection & opportunities
✅ Documentation - File browser
✅ Search - Full-text search

## Optional: Add Integrations

### GitHub
1. Go to github.com/settings/tokens
2. Create new token (repo, gist, read:user scopes)
3. Add to `.env.local`:
```env
GITHUB_TOKEN=ghp_...
```

### Vercel
1. Go to vercel.com/account/tokens
2. Create new token
3. Add to `.env.local`:
```env
VERCEL_TOKEN=...
VERCEL_TEAM_ID=...
```

## Deployment

### Vercel (Recommended)

```bash
# Push to GitHub
git push origin main

# Connect to Vercel
# Select repository → Deploy

# Add environment variables in Vercel dashboard
```

### Docker

```bash
docker build -t mission-control .
docker run -p 3000:3000 --env-file .env.local mission-control
```

### Manual Server

```bash
npm run build
npm start
```

## Next Steps

1. **Explore Tabs** - Click through Activity, Calendar, Proactive, Documentation, Search
2. **Log Activities** - Use "Log Activity" button to add actions
3. **Create Tasks** - Add tasks to the calendar
4. **Analyze Patterns** - Click "Analyze Patterns" in Proactive tab
5. **Find Opportunities** - Discover automation & learning opportunities

## Troubleshooting

### Page won't load

1. Check browser console for errors (F12)
2. Verify `.env.local` has correct values
3. Check network tab for failed API calls
4. Ensure Supabase project is active

### No data showing

1. Manually log activities
2. Create some tasks
3. Click "Analyze Patterns" to start analysis
4. Wait a few seconds for real-time updates

### Database errors

1. Verify SQL schema was applied
2. Check Supabase SQL Editor for errors
3. Ensure service role key is correct
4. Check Supabase logs for issues

### API errors

1. Check browser console (F12 → Network)
2. Verify environment variables
3. Check Supabase dashboard for quota issues
4. Review error messages in Network tab

## Project Structure

```
mission-control/
├── src/
│   ├── app/              # Next.js app
│   ├── components/       # React components
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Utilities & integrations
│   └── types/           # TypeScript types
├── .env.example         # Environment template
├── README.md            # Full documentation
├── API.md              # API reference
└── PROACTIVE_INTELLIGENCE.md  # System guide
```

## Key Features Explained

### Activity Log
- Real-time tracking of all actions
- Filter by agent, action type, status
- Expand to see metadata

### Calendar
- Manage daily & one-time tasks
- Visual week view
- Quick status toggle (click task)

### Proactive Hub
- **Overview** - Stats & top recommendations
- **Actions** - All autonomous actions taken
- **Patterns** - Detected behavior patterns
- **Opportunities** - Value opportunities

### Search
- Full-text search across activities & documents
- Filter by tag & category

## Common Tasks

### Log an Activity
1. Click "Activity Log" tab
2. Click "Log Activity" button
3. Fill form & submit

### Create a Task
1. Click "Schedule" tab
2. Click "New Task" button
3. Set title, date, type
4. Save

### Find Opportunities
1. Click "Proactive" tab
2. Click "Find Opportunities" button
3. Review results
4. Click "Investigate" or "Implement"

### Analyze Patterns
1. Click "Proactive" tab
2. Click "Analyze Patterns" button
3. Wait for analysis
4. Review detected patterns

## Performance Tips

- Run pattern analysis during off-peak hours
- Limit activities history to recent 1000
- Enable caching for integrations
- Use pagination for large datasets

## Getting Help

1. Check `/README.md` for full documentation
2. Review `/API.md` for API reference
3. Read `/PROACTIVE_INTELLIGENCE.md` for system guide
4. Check browser console for errors
5. Review Supabase dashboard logs

## What's Next?

- [ ] Add more integrations (Calendar, Slack)
- [ ] Create custom reports
- [ ] Setup webhooks for notifications
- [ ] Build CLI tool
- [ ] Mobile app

---

**Built for my OpenClaw instance** - An AI-powered automation system for intelligently managing complex workflows.

Happy automating! 🚀
