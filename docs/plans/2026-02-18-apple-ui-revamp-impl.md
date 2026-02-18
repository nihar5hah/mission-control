# Apple UI Revamp — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Revamp Mission Control's UI to look like it was made by Apple — pure black base, frosted glass cards, Apple Purple (#BF5AF2) accent, SF Pro typography, and Apple system status colors.

**Architecture:** Pure CSS/styling overhaul with no functional changes. Modify globals.css for the design system foundation, then update each component to use the new tokens. Dark mode is forced by default via `className="dark"` on `<html>`. All existing functionality (hooks, data, logic) is untouched.

**Tech Stack:** Next.js 14, Tailwind CSS, Framer Motion, CSS custom properties (all existing)

**Design doc:** `docs/plans/2026-02-18-apple-ui-revamp-design.md`

---

## Visual Checklist (verify after each task)

Run `npm run dev` and open `http://localhost:3000` to verify changes. The app is dark by default — no flash on load.

---

### Task 1: Color System — globals.css

**Files:**
- Modify: `src/app/globals.css` (full replacement)

**What this does:** Replaces the current teal/slate palette with Apple system dark colors. Pure black base, `#1c1c1e` cards, `#BF5AF2` purple accent, Apple system status colors. Updates typography to SF Pro stack. Adds Apple-style thin scrollbars.

**Step 1: Replace globals.css entirely**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Apple system dark (default) */
    --bg-base: #000000;
    --bg-card: #1c1c1e;
    --bg-elevated: #2c2c2e;
    --bg-overlay: #3a3a3c;
    --bg-input: rgba(255,255,255,0.08);
    --border: rgba(255,255,255,0.08);
    --border-hover: rgba(255,255,255,0.14);
    --border-focus: rgba(191,90,242,0.5);

    /* Text */
    --text-primary: #ffffff;
    --text-secondary: #aeaeb2;
    --text-tertiary: #636366;

    /* Accent — Apple Purple */
    --accent: #BF5AF2;
    --accent-hover: #D87EF5;
    --accent-muted: rgba(191,90,242,0.15);
    --accent-glow: rgba(191,90,242,0.3);

    /* Apple system status colors */
    --color-green: #30D158;
    --color-green-muted: rgba(48,209,88,0.15);
    --color-red: #FF453A;
    --color-red-muted: rgba(255,69,58,0.15);
    --color-orange: #FF9F0A;
    --color-orange-muted: rgba(255,159,10,0.15);
    --color-blue: #0A84FF;
    --color-blue-muted: rgba(10,132,255,0.15);
    --color-yellow: #FFD60A;
    --color-yellow-muted: rgba(255,214,10,0.15);
    --color-purple: #BF5AF2;
    --color-purple-muted: rgba(191,90,242,0.15);
    --color-teal: #5AC8FA;
    --color-teal-muted: rgba(90,200,250,0.15);

    /* Shadows */
    --shadow-sm: 0 2px 8px rgba(0,0,0,0.4);
    --shadow-md: 0 4px 16px rgba(0,0,0,0.5);
    --shadow-lg: 0 8px 32px rgba(0,0,0,0.6);
    --shadow-xl: 0 16px 48px rgba(0,0,0,0.8);

    /* Gradients */
    --gradient-primary: linear-gradient(135deg, #BF5AF2 0%, #9B42D4 100%);

    /* Legacy aliases (keep these so nothing breaks) */
    --background: var(--bg-card);
    --foreground: var(--text-primary);
    --border-old: var(--border);
    --input: var(--bg-input);
    --muted-bg: var(--bg-elevated);
    --subtle: var(--text-tertiary);
    --primary: var(--accent);
    --primary-light: var(--accent-hover);
    --primary-dark: #9B42D4;
    --success: var(--color-green);
    --success-light: var(--color-green);
    --danger: var(--color-red);
    --danger-light: var(--color-red);
    --warning: var(--color-orange);
    --info: var(--color-blue);
    --running: var(--color-blue);
  }

  /* Light theme */
  html.light {
    --bg-base: #f2f2f7;
    --bg-card: #ffffff;
    --bg-elevated: #f2f2f7;
    --bg-overlay: #e5e5ea;
    --bg-input: rgba(0,0,0,0.06);
    --border: rgba(0,0,0,0.1);
    --border-hover: rgba(0,0,0,0.18);

    --text-primary: #000000;
    --text-secondary: #3c3c43;
    --text-tertiary: #8e8e93;

    --shadow-sm: 0 1px 4px rgba(0,0,0,0.08);
    --shadow-md: 0 4px 12px rgba(0,0,0,0.1);
    --shadow-lg: 0 8px 24px rgba(0,0,0,0.12);
    --shadow-xl: 0 16px 40px rgba(0,0,0,0.15);

    /* Legacy aliases for light */
    --background: var(--bg-card);
    --foreground: var(--text-primary);
    --border-old: var(--border);
    --input: var(--bg-input);
    --muted-bg: var(--bg-elevated);
    --subtle: var(--text-tertiary);
  }

  /* Dark alias (explicit dark class) */
  html.dark {
    /* Already set in :root — nothing needed */
    color-scheme: dark;
  }
}

/* ========== TYPOGRAPHY ========== */
html {
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-feature-settings: 'kern' 1, 'liga' 1, 'calt' 1;
}

body {
  background-color: var(--bg-base);
  color: var(--text-primary);
  font-family: -apple-system, 'SF Pro Text', 'SF Pro Display', BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
  font-weight: 400;
  font-size: 15px;
  line-height: 1.47;
  letter-spacing: -0.01em;
  transition: background-color 0.2s ease, color 0.2s ease;
}

h1, h2, h3, h4, h5, h6 {
  font-family: -apple-system, 'SF Pro Display', BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
  font-weight: 700;
  letter-spacing: -0.022em;
  line-height: 1.15;
  color: var(--text-primary);
}

/* ========== BACKGROUND ========== */
html.dark body {
  background-color: #000000;
  background-image:
    radial-gradient(ellipse 600px 400px at 20% 10%, rgba(191,90,242,0.06) 0%, transparent 60%),
    radial-gradient(ellipse 500px 500px at 85% 80%, rgba(191,90,242,0.04) 0%, transparent 55%);
}

html.light body {
  background-color: #f2f2f7;
  background-image: none;
}

/* ========== NOISE TEXTURE ========== */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.03'/%3E%3C/svg%3E");
  mix-blend-mode: overlay;
  z-index: 1;
}

/* ========== SCROLLBARS ========== */
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.12);
  border-radius: 2px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255,255,255,0.22);
}

html.light ::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.15);
}
html.light ::-webkit-scrollbar-thumb:hover {
  background: rgba(0,0,0,0.25);
}

/* ========== INPUTS ========== */
input, textarea, select {
  background-color: var(--bg-input);
  color: var(--text-primary);
  border: none;
  border-radius: 12px;
  transition: all 200ms ease;
}

input::placeholder, textarea::placeholder {
  color: var(--text-tertiary);
}

input:focus, textarea:focus, select:focus {
  outline: none;
  box-shadow: 0 0 0 3px var(--accent-glow);
}

/* ========== LINKS ========== */
a {
  color: var(--accent);
  transition: opacity 0.15s ease;
  font-weight: 500;
}
a:hover { opacity: 0.8; }

/* ========== CODE ========== */
code {
  font-family: 'SF Mono', 'Geist Mono', 'Fira Code', monospace;
  font-size: 0.875em;
  background-color: var(--bg-elevated);
  color: var(--text-primary);
  padding: 2px 6px;
  border-radius: 6px;
}

/* ========== SELECTION ========== */
::selection {
  background: rgba(191,90,242,0.35);
  color: white;
}

/* ========== COMPONENT UTILITIES ========== */
@layer components {
  /* Apple-style card */
  .apple-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border);
    border-radius: 16px;
    box-shadow: var(--shadow-sm);
    transition: border-color 200ms ease, box-shadow 200ms ease;
  }
  .apple-card:hover {
    border-color: rgba(191,90,242,0.3);
    box-shadow: var(--shadow-md);
  }

  html.light .apple-card {
    background: #ffffff;
    border-color: rgba(0,0,0,0.08);
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  }
  html.light .apple-card:hover {
    border-color: rgba(191,90,242,0.3);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  /* Frosted glass header */
  .apple-header {
    background: rgba(28,28,30,0.85);
    backdrop-filter: blur(20px) saturate(1.8);
    -webkit-backdrop-filter: blur(20px) saturate(1.8);
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  html.light .apple-header {
    background: rgba(255,255,255,0.85);
    border-bottom: 1px solid rgba(0,0,0,0.08);
  }

  /* Pill nav container */
  .apple-tabs {
    background: rgba(255,255,255,0.06);
    border-radius: 12px;
    padding: 4px;
  }
  html.light .apple-tabs {
    background: rgba(0,0,0,0.06);
  }

  /* Primary button */
  .btn-apple-primary {
    background: var(--accent);
    color: #ffffff;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    font-size: 15px;
    box-shadow: 0 4px 12px var(--accent-glow);
    transition: all 200ms ease;
  }
  .btn-apple-primary:hover {
    background: var(--accent-hover);
    box-shadow: 0 6px 20px var(--accent-glow);
    transform: scale(1.01);
  }
  .btn-apple-primary:active {
    transform: scale(0.99);
  }

  /* Secondary button */
  .btn-apple-secondary {
    background: rgba(255,255,255,0.08);
    color: var(--text-primary);
    border: none;
    border-radius: 12px;
    font-weight: 500;
    transition: all 200ms ease;
  }
  .btn-apple-secondary:hover {
    background: rgba(255,255,255,0.12);
  }
  html.light .btn-apple-secondary {
    background: rgba(0,0,0,0.06);
    color: #000;
  }
  html.light .btn-apple-secondary:hover {
    background: rgba(0,0,0,0.1);
  }

  /* Status pills — Apple colors */
  .status-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 2px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0;
  }
  .status-running   { background: var(--color-green-muted);  color: var(--color-green); }
  .status-completed { background: var(--color-blue-muted);   color: var(--color-blue); }
  .status-failed    { background: var(--color-red-muted);    color: var(--color-red); }
  .status-pending   { background: var(--color-orange-muted); color: var(--color-orange); }
  .status-idle      { background: rgba(255,255,255,0.06);    color: var(--text-tertiary); }

  /* Online dot — Apple Green */
  .dot-online {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--color-green);
    box-shadow: 0 0 6px rgba(48,209,88,0.6);
    flex-shrink: 0;
  }
  .dot-offline {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: #48484a;
    flex-shrink: 0;
  }
  .dot-warning {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--color-orange);
    flex-shrink: 0;
  }
}

/* ========== LEGACY DARK OVERRIDES (removed — now using Apple tokens) ========== */
/* Status text and bg classes that survive in old code */
html.dark .bg-purple-50  { background-color: rgba(191,90,242,0.12) !important; }
html.dark .bg-teal-50    { background-color: rgba(90,200,250,0.12) !important; }
html.dark .bg-emerald-50 { background-color: rgba(48,209,88,0.12) !important; }
html.dark .bg-amber-50   { background-color: rgba(255,159,10,0.12) !important; }
html.dark .bg-blue-50    { background-color: rgba(10,132,255,0.12) !important; }
html.dark .bg-red-50     { background-color: rgba(255,69,58,0.12) !important; }
html.dark .bg-slate-50   { background-color: rgba(255,255,255,0.04) !important; }

html.dark .text-purple-600 { color: #BF5AF2 !important; }
html.dark .text-teal-600   { color: #5AC8FA !important; }
html.dark .text-teal-700   { color: #5AC8FA !important; }
html.dark .text-emerald-600 { color: #30D158 !important; }
html.dark .text-emerald-700 { color: #30D158 !important; }
html.dark .text-amber-600  { color: #FF9F0A !important; }
html.dark .text-amber-700  { color: #FF9F0A !important; }
html.dark .text-blue-600   { color: #0A84FF !important; }
html.dark .text-blue-700   { color: #0A84FF !important; }
html.dark .text-red-600    { color: #FF453A !important; }
html.dark .text-red-700    { color: #FF453A !important; }
html.dark .text-slate-600  { color: #aeaeb2 !important; }
html.dark .text-slate-500  { color: #aeaeb2 !important; }
html.dark .text-slate-900  { color: #ffffff !important; }

/* ========== ANIMATIONS ========== */
@keyframes pulse-dot {
  0%, 100% { box-shadow: 0 0 4px rgba(48,209,88,0.4); }
  50%       { box-shadow: 0 0 10px rgba(48,209,88,0.8); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.animate-pulse-dot {
  animation: pulse-dot 2s ease-in-out infinite;
}

.animate-fade-in  { animation: fadeIn 0.2s ease-out; }
.animate-slide-up { animation: slideUp 0.2s ease-out; }
```

**Step 2: Verify in browser**
Run `npm run dev`, open localhost:3000. The body should now be pure black with purple ambient glow. Cards will still show old colors (fixed in subsequent tasks).

**Step 3: Commit**
```bash
git add src/app/globals.css
git commit -m "style: Replace color system with Apple dark palette + purple accent"
```

---

### Task 2: Force Dark Default — layout.tsx

**Files:**
- Modify: `src/app/layout.tsx`

**What this does:** Adds `className="dark"` to `<html>` so the page loads dark by default without flash. Also adds the Apple font stack to the meta.

**Step 1: Replace layout.tsx**

```tsx
'use client';

import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="color-scheme" content="dark light" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
```

**Step 2: Update ThemeToggle.tsx to default to dark**

In `src/components/ThemeToggle.tsx`, in the `useEffect`, change the fallback when no `storedTheme` is set:

```tsx
// Change this block (lines 16-27):
let shouldBeDark = false;

if (storedTheme === 'dark') {
  shouldBeDark = true;
} else if (storedTheme === 'light') {
  shouldBeDark = false;
} else {
  // No stored preference → default to DARK (not system preference)
  shouldBeDark = true;
}
```

**Step 3: Commit**
```bash
git add src/app/layout.tsx src/components/ThemeToggle.tsx
git commit -m "style: Force dark mode by default, no system preference fallback"
```

---

### Task 3: Header — Apple Frosted Glass

**Files:**
- Modify: `src/app/page.tsx` — `renderHeader()` function only (lines 387–441)

**What this does:** Replaces the current header with Apple frosted glass styling. Thin separator, ghost icon buttons, purple logo glow, cleaner agent status pill.

**Step 1: Replace the `renderHeader` function**

Find `/* ============ RENDER: HEADER ============ */` and replace the entire `renderHeader` function with:

```tsx
const renderHeader = () => (
  <motion.header
    initial="hidden"
    animate="show"
    variants={headerVariants}
    transition={{ duration: 0.2 }}
    className="sticky top-0 z-40 apple-header"
  >
    <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
      {/* Left: sidebar toggle + logo */}
      <div className="flex items-center gap-3">
        <motion.button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
          style={{ color: 'var(--text-tertiary)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </motion.button>

        <div className="flex items-center gap-2.5">
          {/* Logo icon with purple glow */}
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #BF5AF2 0%, #9B42D4 100%)',
              boxShadow: '0 4px 12px rgba(191,90,242,0.4)',
            }}
          >
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
              <Building className="w-4 h-4 text-white" />
            </motion.div>
          </div>

          <div>
            <h1 className="text-sm font-semibold leading-tight" style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              The Begu Company
            </h1>
            <p className="text-[11px] leading-tight" style={{ color: 'var(--text-tertiary)' }}>
              Mission Control
            </p>
          </div>
        </div>
      </div>

      {/* Right: agent status + theme toggle */}
      <div className="flex items-center gap-2">
        {/* Agents online pill */}
        <motion.div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(255,255,255,0.06)' }}
          animate={{ opacity: [0.8, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            className="dot-online animate-pulse-dot"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
            {agentStates.filter(s => s.isOnline).length}/3 Online
          </span>
        </motion.div>

        <ThemeToggle />
      </div>
    </div>
  </motion.header>
);
```

**Step 2: Verify**
Header should now show frosted glass, purple logo, ghost hamburger button, cleaner agent status pill.

**Step 3: Commit**
```bash
git add src/app/page.tsx
git commit -m "style: Apple frosted glass header with purple logo glow"
```

---

### Task 4: Tab Navigation — Apple Capsule Pill

**Files:**
- Modify: `src/app/page.tsx` — `renderTabs()` function only (lines 444–487)

**What this does:** Replaces the tab bar with Apple's capsule pill style. No horizontal scrollbar clip issues.

**Step 1: Replace the `renderTabs` function**

```tsx
const renderTabs = () => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2, delay: 0.05 }}
    className="flex mb-6 sm:mb-8 rounded-xl p-1 overflow-x-auto apple-tabs w-full md:w-fit"
    style={{ scrollbarWidth: 'none' }}
  >
    {tabs.map((tab) => {
      const Icon = tab.icon;
      const isActive = activeTab === tab.id;
      return (
        <motion.button
          key={tab.id}
          onClick={() => setActiveTab(tab.id as any)}
          className="relative px-3 sm:px-4 py-2 rounded-[9px] text-xs sm:text-sm font-medium flex items-center gap-1.5 whitespace-nowrap min-h-[36px] transition-colors"
          style={{ color: isActive ? '#ffffff' : 'var(--text-tertiary)' }}
          whileTap={{ scale: 0.97 }}
        >
          {isActive && (
            <motion.div
              layoutId="active-tab"
              className="absolute inset-0 rounded-[9px]"
              style={{ background: 'var(--accent)' }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            <Icon className="w-3.5 h-3.5" />
            {tab.label}
            {tab.badge ? (
              <span
                className="ml-0.5 px-1.5 py-0.5 text-[10px] rounded-full font-medium"
                style={{
                  background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--accent-muted)',
                  color: isActive ? '#fff' : 'var(--accent)',
                }}
              >
                {tab.badge}
              </span>
            ) : null}
          </span>
        </motion.button>
      );
    })}
  </motion.div>
);
```

**Step 2: Verify**
Tabs should now be a pill container with purple active indicator that slides. Inactive tabs show `#636366` text.

**Step 3: Commit**
```bash
git add src/app/page.tsx
git commit -m "style: Apple capsule pill tab navigation with purple active state"
```

---

### Task 5: Dashboard — Stat Cards + Agent Cards

**Files:**
- Modify: `src/app/page.tsx` — `renderDashboard()` function only (lines 490–624)

**What this does:** Updates the 4 stat cards and 3 agent status cards to use Apple card styling, Apple status colors, and correct status dots.

**Step 1: Replace the dashboard section header and stat grid in `renderDashboard`**

Find the stat grid (the `<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">` section) and update each card:

```tsx
{/* Stats Grid */}
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 sm:mb-8">
  {[
    { label: 'Active Agents', value: `${agentStates.filter(s => s.isOnline).length}/3`, icon: Users, color: 'var(--color-purple)', muted: 'var(--color-purple-muted)' },
    { label: 'Tokens Today', value: totalTokens.toLocaleString(), icon: Zap, color: 'var(--color-teal)', muted: 'var(--color-teal-muted)' },
    { label: 'Tasks Done', value: totalTasks.toString(), icon: CheckCircle2, color: 'var(--color-green)', muted: 'var(--color-green-muted)' },
    { label: 'Active Time', value: formatDuration(totalActiveTime), icon: Clock, color: 'var(--color-orange)', muted: 'var(--color-orange-muted)' },
  ].map((stat) => {
    const Icon = stat.icon;
    return (
      <motion.div
        key={stat.label}
        variants={item}
        className="apple-card p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>{stat.label}</span>
          <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ background: stat.muted }}>
            <Icon className="w-4 h-4" style={{ color: stat.color }} />
          </div>
        </div>
        <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.022em' }}>{stat.value}</p>
      </motion.div>
    );
  })}
</div>
```

**Step 2: Update agent status cards (in the same function)**

Replace the agent cards grid:

```tsx
{/* Agent Status Cards */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
  {agentStates.map((state) => {
    const config = AGENT_CONFIG[state.agent.id];
    return (
      <motion.div
        key={state.agent.id}
        variants={item}
        className="apple-card p-4"
        whileHover={{ y: -2 }}
      >
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0"
            style={{ background: `${config.color}18`, border: `1px solid ${config.color}30` }}
          >
            {state.agent.id === 'begubot' ? (
              <Bot className="w-5 h-5" style={{ color: config.color }} />
            ) : state.agent.id === 'coder' ? (
              <Code className="w-5 h-5" style={{ color: config.color }} />
            ) : (
              <Microscope className="w-5 h-5" style={{ color: config.color }} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{config.name}</h3>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{config.role}</p>
          </div>
          <motion.div
            className={state.isOnline ? 'dot-online animate-pulse-dot' : 'dot-offline'}
            animate={state.isOnline ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>

        {state.latestActivity && (
          <div className="text-xs rounded-xl px-3 py-2" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)' }}>
            {state.latestActivity.description}
          </div>
        )}

        {state.stats && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="text-center rounded-xl py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Tokens</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{state.stats.daily_tokens_used.toLocaleString()}</p>
            </div>
            <div className="text-center rounded-xl py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Tasks</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{state.stats.daily_tasks_completed}</p>
            </div>
          </div>
        )}
      </motion.div>
    );
  })}
</div>
```

**Step 3: Update the section header too**
```tsx
<div className="mb-6">
  <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.022em' }}>Dashboard</h2>
  <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Real-time statistics for all agents</p>
</div>
```

**Step 4: Verify**
Dashboard should show dark cards with purple-tinted icons, Apple green online dots, clean typography.

**Step 5: Commit**
```bash
git add src/app/page.tsx
git commit -m "style: Apple stat cards and agent status cards on dashboard"
```

---

### Task 6: Activity Feed — Apple Status Pills

**Files:**
- Modify: `src/app/page.tsx` — `renderActivityFeed()` function only (lines 627–720)

**What this does:** Updates activity columns with Apple card styling, status pills using Apple system colors, and correct online indicator.

**Step 1: Update `renderActivityFeed`**

Replace the `statusStyles` object at the top of the function:

```tsx
const statusStyles: Record<string, { bg: string; text: string }> = {
  running:   { bg: 'var(--color-green-muted)',  text: 'var(--color-green)' },
  completed: { bg: 'var(--color-blue-muted)',   text: 'var(--color-blue)' },
  failed:    { bg: 'var(--color-red-muted)',    text: 'var(--color-red)' },
  idle:      { bg: 'rgba(255,255,255,0.06)',    text: 'var(--text-tertiary)' },
  pending:   { bg: 'var(--color-orange-muted)', text: 'var(--color-orange)' },
};
```

Update the `ActivityColumn` container div:
```tsx
<div className="apple-card p-4 flex flex-col">
```

Update the "Live" badge in ActivityColumn:
```tsx
<span className="text-[10px] px-2 py-0.5 rounded-full font-medium status-running">
  Live
</span>
```

Update each activity item `<div>`:
```tsx
<div key={activity.id} className="flex items-start gap-2 p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
  <div className="p-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)' }}>
    <CategoryIcon className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
  </div>
  <div className="flex-1">
    <p className="text-xs line-clamp-1" style={{ color: 'var(--text-primary)' }}>{activity.description}</p>
    <div className="flex flex-wrap items-center gap-2 text-[10px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
      <span>{category.label}</span>
      <span>·</span>
      <span>{formatTime(activity.timestamp)}</span>
      <span
        className="px-2 py-0.5 rounded-full"
        style={{ background: StatusClass.bg, color: StatusClass.text }}
      >
        {activity.status}
      </span>
    </div>
  </div>
</div>
```

**Step 2: Update section header**
```tsx
<h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.022em' }}>Live Activity</h2>
<p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Newest on top · Last 50 per agent</p>
```

**Step 3: Commit**
```bash
git add src/app/page.tsx
git commit -m "style: Apple status pills and card styling in Activity Feed"
```

---

### Task 7: Calendar, Search, Office, Docs — Apple Cards

**Files:**
- Modify: `src/app/page.tsx` — `renderCalendar`, `renderSearch`, `renderOffice`, `renderDocumentation`

**What this does:** Applies consistent Apple card styling to the remaining tab views.

**Step 1: renderCalendar — Update card containers**

Find every `className="rounded-lg ..."` in `renderCalendar` and replace with `apple-card`.

For the "today" highlight, update to use purple instead of teal:
```tsx
// isToday border — replace teal with purple
style={isToday ? { border: '1px solid rgba(191,90,242,0.5)', background: 'rgba(191,90,242,0.08)' } : {}}
```

Today's date number:
```tsx
<p className={`text-2xl font-bold`} style={{ color: isToday ? 'var(--accent)' : 'var(--text-primary)', letterSpacing: '-0.022em' }}>{date.getDate()}</p>
```

Filter pills (All Agents / agent pills):
```tsx
// Active state
style={scheduleAgentFilter === 'all' ? { background: 'var(--accent-muted)', color: 'var(--accent)', border: '1px solid rgba(191,90,242,0.3)' } : { background: 'rgba(255,255,255,0.06)', color: 'var(--text-tertiary)', border: '1px solid rgba(255,255,255,0.08)' }}
```

**Step 2: renderDocumentation — Update containers**

```tsx
// File tree panel
<div className="apple-card p-3 max-h-[600px] overflow-y-auto">

// Markdown viewer panel
<div className="apple-card p-4 min-h-[360px]">
```

Search input:
```tsx
<input
  className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none"
  style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'var(--text-primary)' }}
/>
```

**Step 3: renderOffice — Update sidebar panel**

```tsx
<div className="apple-card p-4">
```

**Step 4: renderSearch — Update search input and result cards**

```tsx
// Search input
<input
  className="w-full rounded-xl pl-12 pr-4 py-3 text-sm"
  style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'var(--text-primary)' }}
/>

// Result cards
<motion.div key={doc.id} variants={item} className="apple-card p-4" whileHover={{ x: 2 }}>
```

**Step 5: All section headers**

Pattern — replace in all render functions:
```tsx
// Old pattern (remove these):
style={{ color: 'var(--foreground)' }}
style={{ color: 'var(--subtle)' }}

// New pattern:
style={{ color: 'var(--text-primary)' }}
style={{ color: 'var(--text-tertiary)' }}
```

**Step 6: Commit**
```bash
git add src/app/page.tsx
git commit -m "style: Apple card styling across Calendar, Docs, Search, Office tabs"
```

---

### Task 8: AgentsSidebar — Apple Status

**Files:**
- Modify: `src/components/AgentsSidebar.tsx`

**What this does:** Updates sidebar background, agent card styling, status dots, and action badges to use Apple colors.

**Step 1: Update the sidebar container (in `AgentsSidebar` component, desktop and mobile)**

```tsx
// Desktop sidebar
style={{
  backgroundColor: '#1c1c1e',
  borderRight: '1px solid rgba(255,255,255,0.06)',
  width: '320px'
}}

// Mobile sidebar
style={{
  backgroundColor: '#1c1c1e',
  borderRight: '1px solid rgba(255,255,255,0.06)'
}}
```

**Step 2: Update `AgentCard` container**

```tsx
<motion.div
  className="rounded-[14px] overflow-hidden"
  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
  ...
>
```

**Step 3: Update `StatusIndicator` component**

```tsx
function StatusIndicator({ isOnline, status }: { isOnline: boolean; status?: string }) {
  if (!isOnline) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="dot-offline" />
        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Offline</span>
      </div>
    );
  }
  const dotClass = status === 'idle' ? 'dot-warning' : 'dot-online animate-pulse-dot';
  return (
    <div className="flex items-center gap-1.5">
      <div className={dotClass} />
      <span className="text-xs capitalize" style={{ color: 'var(--text-primary)' }}>{status || 'Active'}</span>
    </div>
  );
}
```

**Step 4: Update `AgentAvatar` border**

```tsx
style={{ backgroundColor: `${color}18`, border: `1px solid ${color}28` }}
```

**Step 5: Update online indicator dot on agent card**

```tsx
<motion.div
  className={isOnline ? 'dot-online animate-pulse-dot' : 'dot-offline'}
  style={{ border: '2px solid #1c1c1e', position: 'absolute', bottom: -1, right: -1 }}
  animate={isOnline ? { scale: [1, 1.2, 1] } : {}}
  transition={{ duration: 2, repeat: Infinity }}
/>
```

**Step 6: Update action badge in AgentCard**

```tsx
// Remove the bg/border className strings, replace with inline style:
<div
  className="flex items-center gap-1.5 mt-2 px-2 py-1 rounded-full"
  style={{
    background: 'rgba(255,255,255,0.06)',
    display: 'inline-flex',
  }}
>
  <ActionIcon className={`w-3.5 h-3.5 ${actionConfig?.color}`} />
  <span className={`text-xs font-medium ${actionConfig?.color}`}>{actionConfig?.label}</span>
  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>·</span>
  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{formatTimeAgo(latestActivity.timestamp)}</span>
</div>
```

**Step 7: Update expanded stats grid**

```tsx
<div className="rounded-xl p-2.5 text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Tokens Today</p>
  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{stats.daily_tokens_used.toLocaleString()}</p>
</div>
```

**Step 8: Update sidebar header and footer**

```tsx
// Header
style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}

// Footer
style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
```

**Step 9: Commit**
```bash
git add src/components/AgentsSidebar.tsx
git commit -m "style: Apple status dots and dark card styling in AgentsSidebar"
```

---

### Task 9: QuickActions — Apple Buttons

**Files:**
- Modify: `src/components/QuickActions.tsx`

**What this does:** Updates the Quick Actions panel to use Apple button styles and card styling.

**Step 1: Replace the outer `motion.div`**

```tsx
<motion.div
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.2 }}
  className="apple-card p-5"
>
```

**Step 2: Update action buttons**

Replace the `<Button variant="glow">` calls with native buttons:

```tsx
<button
  key={action.id}
  onClick={() => runAction(action.id)}
  disabled={isLoading}
  className="flex items-start gap-3 w-full p-3.5 rounded-xl text-left transition-all disabled:opacity-50"
  style={{
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.06)',
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
    e.currentTarget.style.borderColor = 'rgba(191,90,242,0.25)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
  }}
>
  <div className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: 'var(--accent-muted)' }}>
    {isLoading ? (
      <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--accent)' }} />
    ) : (
      <Icon className="w-4 h-4" style={{ color: 'var(--accent)' }} />
    )}
  </div>
  <div>
    <span className="text-sm font-medium block" style={{ color: 'var(--text-primary)' }}>{action.label}</span>
    <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{action.description}</span>
  </div>
</button>
```

**Step 3: Update the destructive button**

```tsx
// DialogTrigger button:
<button
  className="flex items-start gap-3 w-full p-3.5 rounded-xl text-left transition-all"
  style={{ background: 'var(--color-red-muted)', border: '1px solid rgba(255,69,58,0.2)' }}
  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,69,58,0.2)'; }}
  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-red-muted)'; }}
>
  <div className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,69,58,0.2)' }}>
    <Trash2 className="w-4 h-4" style={{ color: 'var(--color-red)' }} />
  </div>
  <div>
    <span className="text-sm font-medium block" style={{ color: 'var(--color-red)' }}>Clear Old Activities</span>
    <span className="text-[11px]" style={{ color: 'rgba(255,69,58,0.7)' }}>Delete 7+ day entries</span>
  </div>
</button>
```

**Step 4: Remove the `import { Button }` line** (no longer needed)

**Step 5: Commit**
```bash
git add src/components/QuickActions.tsx
git commit -m "style: Apple button styles in QuickActions panel"
```

---

### Task 10: ProactiveHub — Apple Colors

**Files:**
- Modify: `src/components/ProactiveHub.tsx`

**What this does:** Updates the Proactive Intelligence hub to use Apple system colors for status badges, cards, and buttons.

**Step 1: Update `StatsCards`**

Each stat card outer div:
```tsx
<motion.div
  key={card.label}
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: idx * 0.05, duration: 0.2 }}
  className="apple-card p-4"
>
```

**Step 2: Update section buttons (Analyze Patterns / Find Opportunities / Refresh)**

Analyze button:
```tsx
className="px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50 btn-apple-secondary"
```

Find Opportunities button:
```tsx
className="px-4 py-2 rounded-xl text-white text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50 btn-apple-primary"
```

Refresh button:
```tsx
className="p-2 rounded-xl transition-all btn-apple-secondary"
```

**Step 3: Update `ActionCard` container**

```tsx
<motion.div
  layout
  initial={{ opacity: 0, x: -16 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: 16 }}
  className="apple-card p-4 group"
>
```

**Step 4: Update section tabs**

```tsx
<div className="flex gap-1 mb-6 rounded-xl p-1 w-fit apple-tabs">
  {sections.map((section) => {
    const isActive = activeSection === section.id;
    return (
      <motion.button
        key={section.id}
        onClick={() => setActiveSection(section.id as any)}
        className="relative px-4 py-2 rounded-[9px] text-sm font-medium flex items-center gap-2 transition-colors"
        style={{ color: isActive ? '#ffffff' : 'var(--text-tertiary)' }}
        whileTap={{ scale: 0.97 }}
      >
        {isActive && (
          <motion.div
            layoutId="proactive-section"
            className="absolute inset-0 rounded-[9px]"
            style={{ background: 'var(--accent)' }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-2">
          <Icon className="w-4 h-4" />
          {section.label}
        </span>
      </motion.button>
    );
  })}
</div>
```

**Step 5: Update "Investigate" and "Implement" buttons**

```tsx
// Investigate
<button
  onClick={() => onUpdate(opportunity.id, 'investigating')}
  className="px-3 py-1.5 rounded-xl text-white text-xs font-medium btn-apple-primary"
>
  Investigate
</button>

// Implement
<button
  onClick={() => onUpdate(opportunity.id, 'implemented')}
  className="px-3 py-1.5 rounded-xl text-white text-xs font-medium"
  style={{ background: 'var(--color-green)', boxShadow: '0 2px 8px rgba(48,209,88,0.3)' }}
>
  Implement
</button>
```

**Step 6: Update sub-panel containers (Recent Actions, Detected Patterns, Top Opportunities)**

```tsx
<div className="apple-card p-4">
```

**Step 7: Commit**
```bash
git add src/components/ProactiveHub.tsx
git commit -m "style: Apple system colors and card styling in ProactiveHub"
```

---

### Task 11: HierarchyTab — Apple Cards

**Files:**
- Modify: `src/components/HierarchyTab.tsx`

**What this does:** Updates info cards and avatar styling to use Apple card tokens.

**Step 1: Update the 3 info cards at the bottom**

```tsx
<motion.div
  className="apple-card p-4"
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.6 }}
>
```

**Step 2: Update `HierarchyAvatar` container**

```tsx
<motion.div
  className="w-20 h-20 rounded-2xl flex items-center justify-center relative overflow-hidden"
  style={{
    background: `${color}10`,
    border: `1px solid ${color}30`,
    boxShadow: `0 4px 16px ${color}20`,
  }}
  ...
>
```

**Step 3: Update section header**

```tsx
<h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.022em' }}>
  Company Hierarchy
</h2>
<p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
  The Begu Company · Organizational structure
</p>
```

**Step 4: Commit**
```bash
git add src/components/HierarchyTab.tsx
git commit -m "style: Apple card styling in HierarchyTab"
```

---

### Task 12: AgentStatus — Apple Status Colors

**Files:**
- Modify: `src/components/AgentStatus.tsx`

**What this does:** Updates the standalone AgentStatus component (used in compact form) to use Apple system colors.

**Step 1: Replace `statusConfig`**

```tsx
const statusConfig = {
  online: {
    color: 'var(--color-green)',
    bg: 'var(--color-green-muted)',
    label: 'Online',
  },
  busy: {
    color: 'var(--color-orange)',
    bg: 'var(--color-orange-muted)',
    label: 'Busy',
  },
  offline: {
    color: '#636366',
    bg: 'rgba(255,255,255,0.04)',
    label: 'Offline',
  },
};
```

**Step 2: Update card container**

```tsx
<motion.div className="apple-card p-4">
```

**Step 3: Update each agent item container**

```tsx
<motion.div
  key={agent.id}
  className="flex items-center gap-3 p-3 rounded-xl"
  style={{ background: 'rgba(255,255,255,0.04)' }}
>
```

**Step 4: Commit**
```bash
git add src/components/AgentStatus.tsx
git commit -m "style: Apple status colors in AgentStatus component"
```

---

### Task 13: MarkdownViewer + FileTree — Apple Colors

**Files:**
- Modify: `src/components/MarkdownViewer.tsx`
- Modify: `src/components/FileTree.tsx`

**What this does:** Updates link colors, selected states, and icon colors to use Apple purple.

**Step 1: MarkdownViewer — update link color and code colors**

In `parseMarkdown`, update the link replacement:
```tsx
.replace(/\[([^\]]+)\]\(([^)]+)\)/g,
  '<a href="$2" style="color: #BF5AF2" class="hover:opacity-80 underline underline-offset-2" target="_blank" rel="noopener noreferrer">$1</a>')
```

Update blockquote border:
```tsx
.replace(/^\&gt; (.*$)/gim,
  '<blockquote style="border-color: #BF5AF2; color: var(--text-secondary)" class="border-l-2 pl-4 py-1 my-4 italic">$1</blockquote>')
```

Update the list bullet color:
```tsx
// Change before:text-[#5E6AD2] to before:text-[#BF5AF2]
.replace(/^\- (.*$)/gim, '<li style="color: var(--text-secondary)" class="ml-4 before:content-[\"•\"] before:mr-2 before:text-[#BF5AF2]">$1</li>')
```

Update the `RefreshCw` icon color:
```tsx
<RefreshCw className="w-6 h-6" style={{ color: 'var(--accent)' }} />
```

Update `FileText` icon:
```tsx
<FileText className="w-5 h-5" style={{ color: 'var(--accent)' }} />
```

Update copy button check icon:
```tsx
{copied ? <Check className="w-4 h-4" style={{ color: 'var(--color-green)' }} /> : <Copy className="w-4 h-4" />}
```

**Step 2: FileTree — update selected state**

In `FileTreeItem`, update the selected background and color:
```tsx
style={{
  paddingLeft: `${level * 12 + 8}px`,
  backgroundColor: isSelected ? 'rgba(191,90,242,0.12)' : 'transparent',
  color: isSelected ? '#BF5AF2' : 'var(--text-tertiary)',
}}
```

Update hover:
```tsx
onMouseEnter={(e) => {
  if (!isSelected) {
    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
    e.currentTarget.style.color = 'var(--text-primary)';
  }
}}
onMouseLeave={(e) => {
  if (!isSelected) {
    e.currentTarget.style.backgroundColor = 'transparent';
    e.currentTarget.style.color = 'var(--text-tertiary)';
  }
}}
```

Update `FileIcon` color:
```tsx
<FileIcon className="w-4 h-4 flex-shrink-0" style={{ color: isSelected ? '#BF5AF2' : 'inherit' }} />
```

Update priority star:
```tsx
<Star className="w-3 h-3" style={{ color: 'var(--color-yellow)', fill: 'var(--color-yellow)' }} />
```

**Step 3: Commit**
```bash
git add src/components/MarkdownViewer.tsx src/components/FileTree.tsx
git commit -m "style: Apple purple accent in MarkdownViewer and FileTree"
```

---

### Task 14: OfficeScene — Apple Background

**Files:**
- Modify: `src/components/OfficeScene.tsx`

**What this does:** Updates the office scene background, meeting room, water cooler, and ambient sparkle to use Apple tokens.

**Step 1: Update the outer container**

```tsx
<div className="relative w-full overflow-hidden rounded-2xl" style={{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.08)' }}>
```

**Step 2: Update the ambient radial gradient overlay**

```tsx
<div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(191,90,242,0.08) 0%, transparent 45%), radial-gradient(circle at 80% 10%, rgba(191,90,242,0.04) 0%, transparent 40%)' }} />
```

**Step 3: Update the floor**

```tsx
<div className="absolute inset-4 sm:inset-6 rounded-2xl" style={{ background: '#2c2c2e', border: '1px solid rgba(255,255,255,0.06)' }} />
```

**Step 4: Update meeting room**

```tsx
<div className="absolute top-8 sm:top-10 left-1/2 -translate-x-1/2 w-[70%] sm:w-[55%] h-[90px] sm:h-[120px] rounded-2xl backdrop-blur" style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}>
```

**Step 5: Update water cooler**

```tsx
<div className="absolute right-6 sm:right-10 bottom-6 sm:bottom-10 w-24 sm:w-28 h-16 sm:h-20 rounded-2xl flex flex-col items-center justify-center gap-1 sm:gap-2" style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}>
  <Coffee className="w-5 h-5" style={{ color: 'var(--accent)' }} />
```

**Step 6: Update ambient sparkles**

```tsx
<motion.div
  className="absolute left-10 bottom-16"
  animate={{ opacity: [0.2, 0.7, 0.2], y: [0, -6, 0] }}
  transition={{ duration: 3, repeat: Infinity }}
  style={{ color: 'rgba(191,90,242,0.5)' }}
>
  <Sparkles className="w-4 h-4" />
</motion.div>
```

**Step 7: Update live sync badge**

```tsx
<span className="inline-flex items-center gap-1 rounded-full px-2 py-1" style={{ background: 'rgba(255,255,255,0.06)' }}>
  <span className="h-2 w-2 rounded-full animate-pulse dot-online" /> Live Sync
</span>
```

**Step 8: Commit**
```bash
git add src/components/OfficeScene.tsx
git commit -m "style: Apple purple accent and dark surfaces in OfficeScene"
```

---

### Task 15: Final Polish + Verification

**Files:**
- Review: all modified files

**What this does:** Final pass to catch any remaining hardcoded colors, verify the theme toggle works, and ensure light mode still looks good.

**Step 1: Search for remaining hardcoded light-mode colors**

```bash
grep -r "bg-teal-50\|text-teal-700\|border-teal-200\|bg-slate-50\|#5E6AD2\|#5EAD5E" src/
```

For any remaining hits in component files, replace with Apple equivalents:
- `#5E6AD2` → `var(--accent)` or `#BF5AF2`
- `#5EAD5E` → `var(--color-green)`
- `bg-teal-50/text-teal-700/border-teal-200` → use `rgba(191,90,242,0.12)/var(--accent)/rgba(191,90,242,0.2)`

**Step 2: Verify dark mode (default)**
1. Open localhost:3000 — page loads dark, no flash
2. Check Dashboard: pure black bg, frosted cards, purple active tab
3. Check Activity Feed: Apple status pills (green/blue/red/orange)
4. Check Sidebar: opens with Apple dark surface
5. Check Quick Actions: purple icon squares, hover states

**Step 3: Verify light mode toggle**
1. Click theme toggle → page switches to light (`#f2f2f7` bg, white cards)
2. Toggle back → returns to dark
3. Refresh page → stays on whichever was selected

**Step 4: Commit**
```bash
git add -A
git commit -m "style: Final polish — remove remaining hardcoded light colors"
```

**Step 5: Push**
```bash
git push origin master
```

---

## Summary of Changes

| File | Tasks |
|------|-------|
| `src/app/globals.css` | Task 1 — Full Apple color system |
| `src/app/layout.tsx` | Task 2 — Dark default |
| `src/components/ThemeToggle.tsx` | Task 2 — Dark default |
| `src/app/page.tsx` | Tasks 3–7 — Header, tabs, all views |
| `src/components/AgentsSidebar.tsx` | Task 8 |
| `src/components/QuickActions.tsx` | Task 9 |
| `src/components/ProactiveHub.tsx` | Task 10 |
| `src/components/HierarchyTab.tsx` | Task 11 |
| `src/components/AgentStatus.tsx` | Task 12 |
| `src/components/MarkdownViewer.tsx` | Task 13 |
| `src/components/FileTree.tsx` | Task 13 |
| `src/components/OfficeScene.tsx` | Task 14 |

**Total commits: ~14** (one per logical change, easy to revert any step)
