# 🚀 Mission Control - AI Agent Operations Dashboard

A cutting-edge, real-time dashboard for monitoring and managing AI agent activities, built with Next.js 14, Convex, TypeScript, and Tailwind CSS.

## ✨ Features

### 📊 Activity Feed
- **Real-time Activity Tracking**: Monitor all agent actions, task completions, and events
- **Status Indicators**: Color-coded status (running, completed, failed, pending)
- **Auto-refresh**: Automatic updates every 30 seconds (configurable)
- **Filtered Views**: Sort activities by status
- **Timestamps**: Precise tracking of when each activity occurred
- **Rich Metadata**: Additional context for each activity

### 📅 Calendar View
- **Weekly Layout**: Clear 7-day calendar display
- **Scheduled Tasks**: Visual task scheduling and management
- **Priority Levels**: Critical, High, Medium, Low priority indicators
- **Date Navigation**: Move between weeks with intuitive controls
- **Today Button**: Quick jump to current week
- **Task Summary**: Upcoming critical tasks at a glance
- **Visual Status**: Task progress indicators

### 🔍 Global Search
- **Instant Search**: Real-time search across all content
- **Multi-type Filtering**: Search memories, documents, and tasks
- **Tag-based Search**: Filter by custom tags
- **Result Preview**: See content snippets directly in results
- **Smart Suggestions**: Contextual search tips

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 14** | Modern React framework with App Router |
| **TypeScript** | Type-safe development |
| **Tailwind CSS v3** | Utility-first CSS framework |
| **Convex** | Real-time backend database |
| **Lucide React** | Beautiful, consistent icons |
| **PostCSS** | CSS transformations |

## 📁 Project Structure

```
mission-control/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main dashboard page
│   │   ├── layout.tsx            # Root layout wrapper
│   │   └── globals.css           # Global styles with dark theme
│   ├── components/
│   │   ├── ActivityFeed.tsx      # Real-time activity stream
│   │   ├── CalendarView.tsx      # Weekly calendar + tasks
│   │   └── SearchPanel.tsx       # Global search interface
│   └── types/
│       └── index.ts              # TypeScript type definitions
├── convex/
│   ├── schema.ts                 # Convex database schema
│   ├── functions.ts              # Convex backend functions
│   ├── _generated/
│   └── convex.json
├── public/                        # Static assets
├── .next/                         # Next.js build output
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── next.config.js
├── vercel.json                    # Vercel deployment config
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager
- Git (for version control)

### Installation

1. **Clone the Repository**
```bash
git clone <repository-url>
cd mission-control
```

2. **Install Dependencies**
```bash
npm install --legacy-peer-deps
```

3. **Set Up Environment Variables** (if using Convex)
```bash
cp .env.example .env.local
# Add your Convex deployment URL and API key
```

4. **Start Development Server**
```bash
npm run dev
```

The dashboard will be available at `http://localhost:3000`

### Development Commands

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint and fix code
npm run lint
```

## 🎨 UI/UX Features

### Dark Theme
- **Slate-900 Base**: Professional dark background
- **Gradient Accents**: Cyan and blue highlights for AI/tech aesthetic
- **Glass Morphism**: Modern frosted glass effect on cards
- **High Contrast**: Ensures readability and accessibility

### Animations
- **Fade-in Transitions**: Smooth component appearance
- **Slide-in Effects**: Directional entrance animations
- **Pulse Indicators**: Live status animations
- **Hover Effects**: Interactive visual feedback

### Responsive Design
- **Mobile-First**: Works on all screen sizes
- **Grid Layout**: Flexible, responsive grid system
- **Flexible Components**: Adapt to different viewport widths

## 📊 Dashboard Components

### Header
- App title and status indicator
- System status (Online/Offline)
- Real-time stats: Total Activities, Active Now, Completed Today

### Navigation Tabs
- **Activity Feed Tab**: Stream of real-time activities
- **Calendar Tab**: Weekly view with scheduled tasks
- **Search Tab**: Global search across all data

### Activity Feed
- **Mock Data**: Sample activities for demonstration
- **Status Filtering**: Filter by completion status
- **Auto-refresh Toggle**: Enable/disable automatic updates
- **Timestamp Display**: Shows relative time (e.g., "5m ago")

### Calendar View
- **7-Day Week**: Sunday through Saturday
- **Task Cards**: Color-coded by priority
- **Time Slots**: Tasks sorted by scheduled time
- **Navigation Controls**: Previous/Next week, Today button

### Search Panel
- **Search Input**: Type to instantly filter
- **Result Types**: Documents, Memories, Tasks
- **Tag Filtering**: Search and filter by tags
- **Search Tips**: Helpful hints for power users

## 🔌 Convex Integration

The project is configured to integrate with Convex for:

- **Real-time Database**: Live data synchronization
- **Authentication**: Secure user management
- **API Functions**: Serverless backend functions
- **Data Queries**: Efficient data fetching

### Database Schema

```typescript
// Activities - Real-time action logs
- type, title, description, status, timestamp, metadata

// Tasks - Scheduled work items  
- title, status, priority, scheduledDate, tags

// Documents - Searchable content
- title, content, path, type, tags

// Memories - Daily memory logs
- date, content, tags
```

## 🚢 Deployment

### Deploy to Vercel

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Connect to Vercel**
   - Visit https://vercel.com/new
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**
   - Add `CONVEX_DEPLOYMENT` and `CONVEX_URL` in Vercel dashboard
   - Add any other required env vars

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically

### Production Build

```bash
# Build for production
npm run build

# Test production build locally
npm start
```

The build includes:
- Code splitting and optimization
- CSS minification
- JavaScript bundling
- Image optimization
- Static HTML generation

## 📈 Performance

- **Static Generation**: Pages pre-rendered at build time
- **Code Splitting**: Each route loads only needed code
- **Image Optimization**: Automatic image compression
- **Caching**: Smart browser and CDN caching
- **First Load JS**: ~94.7 kB (optimized)

## 🔐 Security

- **TypeScript**: Type safety prevents runtime errors
- **CSP Headers**: Content Security Policy configured
- **XSS Protection**: React's built-in XSS prevention
- **CORS**: Properly configured cross-origin requests
- **Input Validation**: Server-side validation ready

## 🎯 Future Enhancements

- [ ] WebSocket support for true real-time updates
- [ ] User authentication and multi-user support
- [ ] Task creation and editing UI
- [ ] Activity log export (CSV, PDF)
- [ ] Custom notifications (email, Slack, Discord)
- [ ] Mobile responsive design improvements
- [ ] AI-powered search suggestions
- [ ] Data visualization (charts, graphs)
- [ ] Custom theme support
- [ ] Dark/Light mode toggle
- [ ] Integrations (GitHub, Jira, Slack)
- [ ] Advanced analytics and reports

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙌 Credits

Built with ❤️ for AI agent operations and monitoring.

### Technologies Used
- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Convex](https://www.convex.dev/)
- [Lucide Icons](https://lucide.dev/)

## 📧 Support

For questions or issues:
- Create an issue on GitHub
- Check documentation at the project wiki
- Review the code comments for implementation details

---

**Live Dashboard**: [Deployed on Vercel](#) (Update with your deployment URL)

Built for next-generation AI operations management.
