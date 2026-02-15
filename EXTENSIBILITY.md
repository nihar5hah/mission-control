# Mission Control - Extensibility Guide

Built by Begubot on OpenClaw

## Adding New Tabs

This guide explains how to add new features and tabs to the Mission Control Dashboard.

### Quick Overview

The dashboard uses a tab-based architecture. Each tab is a self-contained component that renders content based on the active tab state.

### Step 1: Add Tab to State

In `src/app/page.tsx`, update the `activeTab` state type:

```typescript
const [activeTab, setActiveTab] = useState<'activity' | 'calendar' | 'documentation' | 'search' | 'your-new-tab'>('activity');
```

### Step 2: Add Tab to Tab List

Add your new tab to the tabs array:

```typescript
const tabs = [
  { id: 'activity', label: 'Activity Log', icon: Activity, badge: activities.length },
  { id: 'calendar', label: 'Schedule', icon: Calendar, badge: tasks.length },
  { id: 'documentation', label: 'Documentation', icon: FileText },
  { id: 'search', label: 'Search', icon: Search },
  // Add your new tab here
  { id: 'your-new-tab', label: 'New Feature', icon: YourIcon },
];
```

### Step 3: Create Render Function

Create a new render function for your tab:

```typescript
const renderYourNewTab = () => (
  <motion.div
    key="your-new-tab"
    variants={tabVariants}
    initial="hidden"
    animate="show"
    exit="exit"
    transition={{ duration: 0.3 }}
  >
    <div className="mb-8">
      <h2 className="text-2xl font-semibold text-white mb-1">Your Feature</h2>
      <p className="text-sm text-[#888]">Description of your feature</p>
    </div>
    {/* Your component content here */}
  </motion.div>
);
```

### Step 4: Register Tab in AnimatePresence

Add your render function to the tab switching logic:

```typescript
<AnimatePresence mode="wait">
  {activeTab === 'activity' && renderActivityFeed()}
  {activeTab === 'calendar' && renderCalendar()}
  {activeTab === 'documentation' && renderDocumentation()}
  {activeTab === 'search' && renderSearch()}
  {activeTab === 'your-new-tab' && renderYourNewTab()}
</AnimatePresence>
```

## Creating Reusable Components

### Component Structure

Place components in `src/components/`:

```
src/components/
├── FileTree.tsx        # File browser component
├── MarkdownViewer.tsx  # Markdown renderer with syntax highlighting
├── AgentStatus.tsx     # Multi-agent status display
└── YourComponent.tsx  # Your new component
```

### Hooks for Data

Place data hooks in `src/hooks/`:

```
src/hooks/
├── useSupabase.ts       # Supabase data hooks
├── useWorkspaceFiles.ts # Workspace file operations
└── useYourData.ts      # Your new data hook
```

### API Routes

Place API routes in `src/app/api/`:

```
src/app/api/
├── activities/log/route.ts
├── files/route.ts
├── notifications/telegram/route.ts
└── your-api/route.ts
```

## Multi-Agent Support

The `AgentStatus` component is designed to support multiple agents. To add more agents:

1. Update the `Agent` interface in `AgentStatus.tsx`
2. Add your agent data source (API, database, etc.)
3. The component will automatically display agent status

```typescript
interface Agent {
  id: string;
  name: string;
  status: 'online' | 'busy' | 'offline';
  lastActivity: Date;
  currentTask?: string;
}
```

## Real-Time Updates

### Polling

For simple real-time updates, use `setInterval` in your hook:

```typescript
useEffect(() => {
  const interval = setInterval(() => {
    fetchData();
  }, 10000); // Refresh every 10 seconds

  return () => clearInterval(interval);
}, [fetchData]);
```

### WebSockets (Supabase)

For instant updates, use Supabase subscriptions:

```typescript
const channel = supabase
  .channel('your_channel')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'your_table' }, 
    (payload) => {
      // Handle changes
    }
  )
  .subscribe();
```

## Styling Guidelines

- Use the existing color scheme: `#5E6AD2` (primary), `#0F0F0F` (background), `#161616` (cards)
- Follow the Linear-style dark theme
- Use Framer Motion for animations
- Use Tailwind CSS for styling

## File Structure Overview

```
mission-control/
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── page.tsx       # Main dashboard
│   │   └── layout.tsx     # App layout
│   ├── components/        # Reusable UI components
│   ├── hooks/            # Data fetching hooks
│   └── types/            # TypeScript types
└── README.md
```

## Credits

Built by Begubot on OpenClaw
