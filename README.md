# Mission Control

A real-time AI automation dashboard built for OpenClaw to monitor agent activities, manage workflows, and showcase autonomous AI operations.

## Overview

This project demonstrates modern AI-powered automation capabilities, built to integrate with OpenClaw (an AI assistant framework). It showcases real-time data synchronization, autonomous agent workflows, and intelligent task management.

**Key Capabilities:**
- Real-time activity monitoring for AI agents
- Calendar-based task scheduling and visualization
- Global search across documents and memories
- Documentation browser with live file syncing
- Proactive intelligence hub for autonomous operations

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Real-time subscriptions)
- **Animations**: Framer Motion
- **UI Components**: shadcn/ui, Linear-inspired dark theme
- **Deployment**: Vercel
- **AI Integration**: OpenClaw autonomous agent system

## Features

### 📊 Activity Feed
- Real-time tracking of AI agent actions and events
- Status indicators (running, completed, failed, pending)
- Auto-refresh with configurable intervals
- Activity filtering by status and type

### 📅 Calendar View
- Weekly calendar with task visualization
- Priority-based color coding
- Navigation between weeks
- Task summary and upcoming deadlines

### 🔍 Global Search
- Instant search across all content types
- Filter by documents, memories, and tasks
- Tag-based organization
- Real-time results

### 📚 Documentation Tab
- Browse workspace markdown files in real-time
- Auto-syncs from local filesystem to cloud
- Syntax highlighting for code blocks
- File tree navigation with priority sorting

### 🧠 Proactive Intelligence Hub
- Pattern recognition from workflow data
- Autonomous decision-making engine
- Opportunity detection (automation, monetization)
- Smart recommendations based on activity patterns

## Architecture

```
Mission Control Dashboard
│
├── Frontend (Next.js)
│   ├── Activity Feed
│   ├── Calendar View
│   ├── Global Search
│   ├── Documentation Browser
│   └── Proactive Intelligence Hub
│
├── Backend (Supabase)
│   ├── Real-time subscriptions
│   ├── PostgreSQL database
│   └── REST API endpoints
│
└── Integration Layer
    ├── OpenClaw agent system
    ├── GitHub API
    ├── Vercel deployments
    └── Local filesystem sync
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free tier works)
- OpenClaw setup (optional, for full integration)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/nihar5hah/mission-control.git
cd mission-control
```

2. **Install dependencies**
```bash
npm install --legacy-peer-deps
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Run development server**
```bash
npm run dev
```

Visit `http://localhost:3000`

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run sync-docs    # Sync workspace files to Supabase
```

## Deployment

### Deploy to Vercel

1. Push to GitHub
2. Import repository on [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

**Live Demo**: [mission-control-one-gold.vercel.app](https://mission-control-one-gold.vercel.app)

## Database Schema

### Activities
```sql
- id (uuid, primary key)
- type (text)
- title (text)
- description (text)
- status (text)
- timestamp (timestamptz)
- metadata (jsonb)
```

### Documents
```sql
- id (uuid, primary key)
- title (text)
- content (text)
- category (text)
- tags (text[])
- metadata (jsonb)
- created_at (timestamptz)
- updated_at (timestamptz)
```

### Study Tracking
```sql
- study_subjects (id, name, total_lectures, description)
- study_sessions (id, subject_id, lecture_number, duration_minutes, notes)
```

## Customization

### Adding New Tabs
1. Create component in `src/components/`
2. Add tab type to `page.tsx`
3. Create hook in `src/hooks/`
4. Add API route in `src/app/api/`

### Theming
- Colors: Edit `tailwind.config.js`
- Components: Modify `src/app/globals.css`
- Dark mode: Built-in Linear-inspired dark theme

### Real-time Updates
All data uses Supabase real-time subscriptions for live updates without polling.

## Skills Demonstrated

This project showcases:
- **Full-stack Development**: Next.js + Supabase architecture
- **Real-time Systems**: WebSocket subscriptions for live data
- **AI Integration**: OpenClaw autonomous agent workflows
- **Modern UI/UX**: Framer Motion, glassmorphism, responsive design
- **DevOps**: Vercel deployment, environment management
- **TypeScript**: Type-safe development throughout
- **API Design**: REST endpoints with proper error handling
- **Database Design**: PostgreSQL schema with relationships

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - feel free to use this for personal or commercial projects.

## Author

Built for my OpenClaw AI automation system to demonstrate autonomous agent workflows and real-time monitoring capabilities.

**Connect with me:**
- GitHub: [@nihar5hah](https://github.com/nihar5hah)

---

**Note**: This project is built for my OpenClaw instance. OpenClaw is an AI-powered automation framework that enables autonomous agent workflows, proactive task management, and intelligent decision-making systems.
