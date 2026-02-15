# Mission Control

A real-time operations dashboard built for my OpenClaw AI automation system. Showcases activity feeds, calendar integration, proactive intelligence, and autonomous agent workflows.

Built with **Next.js**, **Supabase**, and **OpenClaw** to demonstrate AI-powered automation capabilities.

## Features

### 🎯 Core Dashboards

- **Activity Log** - Real-time tracking of all agent activities, deployments, builds, and system events
- **Calendar/Schedule** - Task management with recurring tasks, deadlines, and time-blocking
- **Proactive Intelligence** - AI-powered pattern detection, opportunity finding, and autonomous recommendations
- **Documentation Browser** - Workspace file explorer with markdown preview
- **Global Search** - Full-text search across all activities, documents, and data

### 🤖 Proactive Intelligence System

The Proactive Intelligence Hub analyzes your workflow patterns to provide:

- **Detected Patterns** - Time patterns, workflow habits, attention patterns
- **Autonomous Actions** - Tasks created, reminders set, and suggestions made by Begubot
- **Opportunities Found** - Monetization, automation, collaboration, and learning opportunities
- **Smart Recommendations** - Prioritized suggestions based on impact and effort

### 📊 Real-Time Features

- Live activity streaming from OpenClaw agents
- Real-time notifications and pattern detection
- Automatic task status updates
- Instant pattern analysis and opportunity discovery

## Tech Stack

- **Frontend**: Next.js 14+, React, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL, Realtime)
- **Integrations**: GitHub API, Vercel API, Calendar events
- **Hosting**: Vercel, Supabase

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- OpenClaw instance (for full integration)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd mission-control
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env.local
```

4. Fill in your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional integrations
GITHUB_TOKEN=your_github_token
VERCEL_TOKEN=your_vercel_token
VERCEL_TEAM_ID=your_vercel_team_id
```

5. Set up the Supabase database:
```bash
# Run the SQL in src/lib/proactive/database.sql
# in your Supabase SQL Editor
```

6. Start the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

### Docker Deployment

```bash
docker build -t mission-control .
docker run -p 3000:3000 --env-file .env.local mission-control
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main dashboard
│   ├── layout.tsx            # Root layout
│   └── api/
│       ├── activities/       # Activity API endpoints
│       ├── tasks/           # Task API endpoints
│       ├── study/           # Study tracker API
│       └── proactive/       # Proactive intelligence API
│
├── components/
│   ├── ProactiveHub.tsx     # Proactive Intelligence UI
│   ├── StudyTracker.tsx     # Study tracking interface
│   ├── FileTree.tsx         # File browser
│   ├── MarkdownViewer.tsx   # Markdown preview
│   └── AgentStatus.tsx      # Agent status display
│
├── hooks/
│   ├── useSupabase.ts       # Data fetching hooks
│   ├── useProactive.ts      # Proactive intelligence hook
│   └── useWorkspaceFiles.ts # Workspace file management
│
├── lib/
│   ├── supabase.ts          # Supabase client
│   ├── api.ts               # API helpers
│   ├── proactive/           # Proactive system modules
│   │   ├── integrations.ts  # External service integrations
│   │   ├── patterns.ts      # Pattern recognition engine
│   │   ├── opportunities.ts # Opportunity finder
│   │   └── database.sql     # Database schema
│   └── ...
│
└── types/
    ├── database.ts          # Database types
    └── proactive.ts         # Proactive system types
```

## API Endpoints

### Activities
- `GET /api/activities` - Fetch activities
- `POST /api/activities/log` - Log new activity

### Tasks
- `GET /api/tasks` - Fetch tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task

### Proactive Intelligence
- `GET /api/proactive/actions` - Fetch proactive actions
- `POST /api/proactive/actions` - Create action
- `GET /api/proactive/patterns` - Fetch detected patterns
- `POST /api/proactive/patterns` - Analyze and detect patterns
- `GET /api/proactive/opportunities` - Fetch opportunities
- `POST /api/proactive/opportunities` - Find new opportunities
- `POST /api/proactive/decide` - Make autonomous decisions

## Database Schema

### Core Tables
- `activities` - Agent activity logs
- `tasks` - Task management
- `documents` - Workspace documentation

### Proactive Intelligence Tables
- `proactive_actions` - Autonomous actions taken
- `patterns` - Detected behavior patterns
- `opportunities` - Discovered opportunities
- `decisions` - Autonomous decision logs
- `intelligence_cache` - Cached external data

See `src/lib/proactive/database.sql` for full schema.

## Configuration

### Customizing the Theme

The dashboard uses a Linear-style dark theme. Customize colors in:
- Global styles: `src/app/layout.tsx`
- Component colors: Use Tailwind's `bg-[#HEX]` classes

### Adding New Integrations

1. Create a new integration in `src/lib/proactive/integrations.ts`
2. Implement the required interface
3. Add API endpoints in `src/app/api/proactive/`
4. Update the ProactiveHub component to display the data

### Environment-Specific Configuration

Create environment-specific `.env` files:
- `.env.local` - Development
- `.env.production.local` - Production
- `.env.test.local` - Testing

## Performance Optimization

- Real-time data streaming reduces polling
- Activity data is paginated and cached
- Pattern analysis runs asynchronously
- Frontend animations use GPU acceleration

## Monitoring & Debugging

### Enable Debug Logs

```env
DEBUG=true
LOG_LEVEL=debug
```

### Check Realtime Subscriptions

The dashboard uses Supabase Realtime for live updates. Monitor connections:
- Check browser console for connection issues
- Verify Supabase project has Realtime enabled
- Check firewall/network for WebSocket connections

## Contributing

This is a personal automation system, but if you'd like to contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is built for personal use but licensed under MIT for reference and educational purposes.

## Roadmap

- [ ] Mobile app with React Native
- [ ] Advanced analytics dashboard
- [ ] Multi-user collaboration
- [ ] Custom workflow builder
- [ ] Voice command integration
- [ ] Predictive recommendations
- [ ] Slack/Discord integration
- [ ] Custom alert system

## Credits

**This project is built for my OpenClaw instance** - a sophisticated AI-powered automation system that demonstrates advanced capabilities in:
- Real-time agent coordination
- Autonomous decision-making
- Multi-source data integration
- Pattern recognition and opportunity discovery
- Workflow orchestration across GitHub, Vercel, and Calendar APIs

Built with modern technologies to showcase scalable, production-ready architecture for AI-powered automation.

## Support

For issues, questions, or suggestions:
- Check existing GitHub issues
- Review the documentation
- Examine API logs in Supabase dashboard

---

**Last Updated**: February 2025
**Status**: Active Development
