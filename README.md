# 🚀 Mission Control

A futuristic AI Agent Operations Dashboard built with Next.js, Convex, and Tailwind CSS.

## Features

### 📊 Activity Feed
- Real-time monitoring of all agent activities
- Status indicators (running, completed, failed, pending)
- Auto-refresh capability
- Historical view with timestamps
- Filter by status

### 📅 Calendar View
- Weekly calendar layout
- Scheduled tasks and events
- Priority indicators
- Date navigation
- Upcoming critical tasks summary

### 🔍 Global Search
- Instant search across all content
- Search memories, documents, and tasks
- Tag-based filtering
- Relevant results with preview

## Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Database**: Convex (Real-time database)
- **Styling**: Tailwind CSS (Dark theme)
- **Icons**: Lucide React
- **Language**: TypeScript

## Project Structure

```
mission-control/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main dashboard
│   │   ├── layout.tsx        # Root layout
│   │   └── globals.css       # Global styles
│   └── components/
│       ├── ActivityFeed.tsx  # Activity feed component
│       ├── CalendarView.tsx  # Calendar view component
│       └── SearchPanel.tsx   # Search panel component
├── convex/
│   ├── schema.ts             # Database schema
│   └── functions.ts          # Convex functions
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
└── next.config.js
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up Convex (optional for local development):
```bash
npm install -g convex
convex dev
```

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Build

Build for production:
```bash
npm run build
npm start
```

## UI Features

- **Dark Theme**: Slate-based color scheme optimized for AI/tech aesthetic
- **Glass Morphism**: Modern card design with blur effects
- **Animations**: Smooth fade-in and slide-in transitions
- **Responsive Design**: Works on all screen sizes
- **Real-time Updates**: Convex integration for live data

## Deployment

### Vercel Deployment

1. Push to GitHub
2. Connect repository to Vercel
3. Deploy with one click

The project is optimized for Vercel deployment with serverless functions and edge caching.

## Architecture

### Activity Feed
- Displays real-time activities in chronological order
- Mock data simulates various activity types
- Auto-refresh polls for new activities every 30s
- Status-based filtering (all, running, completed, failed)

### Calendar View
- Shows upcoming tasks for the week
- Priority-based color coding
- Task scheduling and management
- Critical tasks summary panel

### Search
- Full-text search across all content
- Filters: documents, memories, tasks
- Tag-based search support
- Result preview with metadata

## Future Enhancements

- [ ] WebSocket support for real-time updates
- [ ] User authentication
- [ ] Task creation/editing
- [ ] Activity log export
- [ ] Custom notifications
- [ ] Mobile app support
- [ ] AI-powered search suggestions
- [ ] Data visualization (charts, graphs)
- [ ] Integration with external APIs
- [ ] Multi-user collaboration

## License

MIT

## Contact

Built with 💙 for AI agent operations.
