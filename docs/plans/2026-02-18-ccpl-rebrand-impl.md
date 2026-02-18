# CCPL Rebrand & UI Refinements — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebrand to CCPL with Mac Command icon logo, shift color system from Apple Purple (#BF5AF2) to deep teal (#06402B), darken dark mode palette, add glow effects to hierarchy tab, and redesign hamburger sidebar with compact view + modal.

**Architecture:** Pure styling and layout refactor. No functional changes to data, state, or API calls. Update color tokens in globals.css, replace all color references in components, redesign sidebar layout with React modal, add CSS glow effects.

**Tech Stack:** Next.js 14, Tailwind CSS, Framer Motion, React hooks (useState for modal), CSS custom properties

**Design Doc:** `docs/plans/2026-02-18-ccpl-rebrand-design.md`

---

## Visual Checklist (verify after each task)

Run `npm run dev` and open `http://localhost:3000` to verify:
- Command icon visible in header and favicon
- All UI elements use deep teal (#06402B), not purple
- Dark mode is noticeably darker (black, not grey)
- Hamburger sidebar shows compact agent list
- Clicking agent opens modal with details
- Hierarchy tab avatars glow

---

### Task 1: Update Color Tokens — globals.css

**Files:**
- Modify: `src/app/globals.css` (color variable section, lines 6–100)

**What this does:** Replace all Apple Purple tokens with CCPL deep teal, darken dark mode palette.

**Step 1: Replace primary accent color in :root**

In `:root { ... }` section (around line 23), change:
```css
/* OLD */
--accent: #BF5AF2;
--accent-hover: #D87EF5;
--accent-muted: rgba(191,90,242,0.15);
--accent-glow: rgba(191,90,242,0.3);

/* NEW */
--accent: #06402B;
--accent-hover: #087860;
--accent-muted: rgba(6, 64, 43, 0.15);
--accent-glow: rgba(6, 64, 43, 0.3);
```

**Step 2: Darken the dark mode palette**

In `:root { ... }` section (lines 7–15), replace:
```css
/* OLD */
--bg-base: #000000;
--bg-card: #1c1c1e;
--bg-elevated: #2c2c2e;
--bg-overlay: #3a3a3c;
--border: rgba(255,255,255,0.08);
--border-hover: rgba(255,255,255,0.14);

/* NEW */
--bg-base: #000000;
--bg-card: #0a0a0a;
--bg-elevated: #111111;
--bg-overlay: #1a1a1a;
--border: rgba(255,255,255,0.06);
--border-hover: rgba(255,255,255,0.1);
```

**Step 3: Update focus ring color**

Line 15, change:
```css
/* OLD */
--border-focus: rgba(191,90,242,0.5);

/* NEW */
--border-focus: rgba(6, 64, 43, 0.5);
```

**Step 4: Update gradient**

Line 51, change:
```css
/* OLD */
--gradient-primary: linear-gradient(135deg, #BF5AF2 0%, #9B42D4 100%);

/* NEW */
--gradient-primary: linear-gradient(135deg, #06402B 0%, #04311f 100%);
```

**Step 5: Update utility classes**

In `@layer components` section (lines 219–376), update `.apple-card:hover` border-color (line 227):
```css
/* OLD */
border-color: rgba(191,90,242,0.3);

/* NEW */
border-color: rgba(6, 64, 43, 0.3);
```

Also update line 236 for light mode `.apple-card:hover`:
```css
border-color: rgba(191,90,242,0.3); /* keep same */
```

And line 264 `.apple-card:hover`:
```css
border-color: rgba(191,90,242,0.3);

/* NEW */
border-color: rgba(6, 64, 43, 0.3);
```

**Step 6: Update button classes**

Lines 267 and 273 in `.btn-apple-primary`, no color value there — they reference `var(--accent)` which is already updated.

**Step 7: Verify and commit**

```bash
cd /home/hyper/.openclaw/workspace/mission-control
npm run dev  # Open http://localhost:3000 and check that button/accent colors are now deep teal
git add src/app/globals.css
git commit -m "style: Replace Apple Purple with CCPL teal (#06402B), darken dark mode palette"
```

Expected: App loads with teal accents instead of purple, dark mode is noticeably darker.

---

### Task 2: Update Favicon & Logo Asset

**Files:**
- Modify: `public/favicon.ico`
- Create: `public/command-icon.svg` (optional, if needed)

**What this does:** Replace favicon with Mac Command icon.

**Step 1: Create Command icon SVG**

Create `public/command-icon.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#06402B" stroke-width="2">
  <!-- Command icon shape -->
  <path d="M8 6h8M8 6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2M6 8v8a2 2 0 0 0 2 2M16 6v8a2 2 0 0 0 2 2M8 6v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M8 18v2a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2"/>
  <!-- Four corner dots (macOS Command key style) -->
  <circle cx="7" cy="7" r="1.5" fill="#06402B"/>
  <circle cx="17" cy="7" r="1.5" fill="#06402B"/>
  <circle cx="7" cy="17" r="1.5" fill="#06402B"/>
  <circle cx="17" cy="17" r="1.5" fill="#06402B"/>
</svg>
```

**Step 2: Update favicon.ico**

Use an online SVG-to-ICO converter (or use ImageMagick) to convert the SVG above to favicon.ico. Save to `public/favicon.ico`. The icon should:
- Have `#06402B` (deep teal) background
- White Command symbol (⌘)
- 32×32 pixels

Alternatively, if you have a design tool available, create the icon directly in Figma/Sketch.

**Step 3: Update favicon link in layout.tsx**

See Task 3 for this.

**Step 4: Commit**

```bash
git add public/favicon.ico public/command-icon.svg
git commit -m "assets: Replace favicon with CCPL Command icon"
```

Expected: Browser tab shows Command icon (⌘).

---

### Task 3: Update Header — Logo & Company Name

**Files:**
- Modify: `src/app/layout.tsx` (favicon link)
- Modify: `src/app/page.tsx` (header section, lines 387–441)

**What this does:** Display Command icon in header, update company name to CCPL.

**Step 1: Update favicon link in layout.tsx**

In `src/app/layout.tsx`, in the `<head>` section, ensure the favicon link is present:
```tsx
<link rel="icon" href="/favicon.ico" />
```

Add if missing.

**Step 2: Update page.tsx header**

In `src/app/page.tsx`, find the `renderHeader()` function. Update the logo section (around line 535):

**OLD:**
```tsx
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
```

**NEW:**
```tsx
<div
  className="w-8 h-8 rounded-xl flex items-center justify-center"
  style={{
    background: 'linear-gradient(135deg, #06402B 0%, #04311f 100%)',
    boxShadow: '0 4px 12px rgba(6, 64, 43, 0.4)',
  }}
>
  <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
    <Command className="w-4 h-4 text-white" />
  </motion.div>
</div>

<div>
  <h1 className="text-sm font-semibold leading-tight" style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
    CCPL
  </h1>
  <p className="text-[11px] leading-tight" style={{ color: 'var(--text-tertiary)' }}>
    Mission Control
  </p>
</div>
```

**Step 3: Import Command icon**

At the top of `src/app/page.tsx`, import Command from lucide-react:
```tsx
import { ..., Command, ... } from 'lucide-react';
```

**Step 4: Commit**

```bash
git add src/app/page.tsx src/app/layout.tsx
git commit -m "style: Update header logo to CCPL Command icon, change company name"
```

Expected: Header shows Command icon (⌘) with teal background, "CCPL" text, favicon shows Command icon.

---

### Task 4: Replace All Purple Accent Colors in Components

**Files:**
- Modify: `src/app/page.tsx` (all tab sections, lines 490–1136)
- Modify: `src/components/QuickActions.tsx`
- Modify: `src/components/ProactiveHub.tsx`
- Modify: `src/components/MarkdownViewer.tsx`
- Modify: `src/components/FileTree.tsx`
- Modify: `src/components/OfficeScene.tsx`

**What this does:** Replace all hardcoded `#BF5AF2` and `rgba(191,90,242,...)` with `var(--accent)` or the new teal values.

**Step 1: Search for purple values**

```bash
grep -rn "#BF5AF2\|#D87EF5\|rgba(191,90,242" src/ --include="*.tsx"
```

Replace all instances:
- `#BF5AF2` → `var(--accent)` (if inline style in component)
- `#D87EF5` → `var(--accent-hover)` (if inline style)
- `rgba(191,90,242,0.15)` → `var(--accent-muted)` (if inline style)
- `rgba(191,90,242,0.3)` → `var(--accent-glow)` (if inline style)

**Step 2: Update page.tsx tab navigation**

Lines 629, 630: Update the active tab background color:
```tsx
/* OLD */
style={{ background: 'var(--accent)' }}

/* NEW */
style={{ background: 'var(--accent)' }}  /* Already uses var, so no change needed */
```

Check line 639 for badge colors — should already use `var(--accent-muted)`.

**Step 3: Update ProactiveHub.tsx**

Search for hardcoded purple in ProactiveHub and replace with `var(--accent)`:
```tsx
/* OLD example */
style={{ background: 'rgba(191,90,242,0.08)' }}

/* NEW */
style={{ background: 'var(--accent-muted)' }}
```

**Step 4: Update FileTree.tsx**

Line 48 (selected background): Already updated to `rgba(191,90,242,0.12)`. Change to:
```tsx
backgroundColor: 'rgba(6,64,43,0.12)',
```

Line 49 (selected color): Already `#BF5AF2`. Change to:
```tsx
color: 'var(--accent)',
```

Line 78 (FileIcon color): Change from `#BF5AF2` to `var(--accent)`.

**Step 5: Update OfficeScene.tsx**

Lines with purple gradient/color. They should already be using teal from Task 1, but verify no hardcoded `#BF5AF2` remains.

**Step 6: Verify with search**

```bash
grep -rn "#BF5AF2\|#D87EF5" src/ --include="*.tsx"
```

Should return no results (or only in comments/strings).

**Step 7: Commit**

```bash
git add src/app/page.tsx src/components/*.tsx
git commit -m "style: Replace all hardcoded purple with CCPL teal accent colors"
```

Expected: All UI accents now use deep teal (#06402B) via `var(--accent)`.

---

### Task 5: Add Glow Effects to Hierarchy Tab Avatars

**Files:**
- Modify: `src/components/HierarchyTab.tsx` (HierarchyAvatar component, lines 14–53)

**What this does:** Add glowing effect to all agent avatars in the Hierarchy tab.

**Step 1: Update HierarchyAvatar container style**

Find the `<motion.div>` on line 25 with the avatar styles. Replace:

**OLD:**
```tsx
style={{
  backgroundColor: `${color}10`,
  borderColor: `${color}40`,
  border: `1px solid ${color}40`
}}
```

**NEW:**
```tsx
style={{
  background: `${color}10`,
  border: `1px solid ${color}`,
  boxShadow: `0 0 16px ${color}40`,  /* Glow effect */
}}
```

This adds the glow effect to all three avatars.

**Step 2: Update hover state**

On the same `<motion.div>`, update the `whileHover` prop (line 32):

**OLD:**
```tsx
whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
```

**NEW:**
```tsx
whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}  /* Keep same, glow is in CSS shadow */
```

(The glow intensifies naturally due to the shadow already being in the style. If you want to intensify it on hover, add a motion effect.)

Optional: Add hover glow intensification:
```tsx
whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
// Add to component:
animate={{ boxShadow: isHovered ? `0 0 24px ${color}60` : `0 0 16px ${color}40` }}
```

But for simplicity, the basic glow is sufficient.

**Step 3: Verify all three avatars (Begubot, Coder, Researcher) render with glow**

The `HierarchyAvatar` component is reused for all three, so one update applies to all.

**Step 4: Commit**

```bash
git add src/components/HierarchyTab.tsx
git commit -m "style: Add glow effect to hierarchy tab avatars"
```

Expected: All three agent avatars in Hierarchy tab glow with their respective colors (purple for Begubot, etc.). They're now clearly visible in dark mode.

---

### Task 6: Redesign Hamburger Menu Sidebar — Compact View

**Files:**
- Modify: `src/components/AgentsSidebar.tsx` (complete redesign, lines 151–300)

**What this does:** Replace nested expandable layout with compact agent list + modal for full details.

**Step 1: Create AgentDetailsModal component**

In the same file, add a new component before the main export. Insert at line 150:

```tsx
// Agent Details Modal Component
function AgentDetailsModal({
  state,
  isOpen,
  onClose,
  activities,
}: {
  state: AgentState | null;
  isOpen: boolean;
  onClose: () => void;
  activities: AgentActivity[];
}) {
  if (!isOpen || !state) return null;

  const { agent, session, stats } = state;
  const config = AGENT_CONFIG[agent.id];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="apple-card p-6 max-w-md w-full max-h-[80vh] overflow-y-auto rounded-2xl"
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <AgentAvatar agentId={agent.id} color={config.color} size="md" />
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                {config.name}
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {config.role}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-all"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="rounded-xl p-2 text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Tokens</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {(stats.daily_tokens_used / 1000).toFixed(1)}K
              </p>
            </div>
            <div className="rounded-xl p-2 text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Tasks</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {stats.daily_tasks_completed}
              </p>
            </div>
            <div className="rounded-xl p-2 text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Active</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {formatDuration(stats.daily_active_seconds)}
              </p>
            </div>
          </div>
        )}

        {/* Recent Activities */}
        <div>
          <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Recent Activity
          </h3>
          <div className="space-y-2">
            {activities.slice(0, 5).map((activity) => {
              const ac = getActionConfig(activity.action);
              const AcIcon = ICON_MAP[ac.icon] || Circle;
              return (
                <div
                  key={activity.id}
                  className="flex items-center gap-2 p-2 rounded-lg text-xs"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  <AcIcon className={`w-3.5 h-3.5 flex-shrink-0 ${ac.color}`} />
                  <span className="flex-1 line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                    {activity.description}
                  </span>
                  <span style={{ color: 'var(--text-tertiary)' }}>{formatTimeAgo(activity.timestamp)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Session Info */}
        {session && (
          <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              <Clock className="w-3 h-3 inline mr-1" />
              Session started {formatTimeAgo(session.started_at)}
              {session.current_action && (
                <>
                  <span> • </span>
                  <span>Currently: {session.current_action}</span>
                </>
              )}
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
```

**Step 2: Simplify AgentCard component**

Replace the entire `AgentCard` function (lines 151–299) with a simpler compact version:

```tsx
function AgentCard({
  state,
  onSelectAgent,
}: {
  state: AgentState;
  onSelectAgent: (state: AgentState) => void;
}) {
  const { agent, session, stats, latestActivity, isOnline } = state;
  const config = AGENT_CONFIG[agent.id];

  return (
    <motion.button
      onClick={() => onSelectAgent(state)}
      className="w-full text-left p-3 rounded-xl flex items-center gap-3"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
      whileHover={{
        background: 'rgba(6,64,43,0.08)',
        borderColor: 'rgba(6,64,43,0.3)',
      }}
      transition={{ duration: 0.2 }}
    >
      {/* Avatar with online indicator */}
      <div className="relative flex-shrink-0">
        <AgentAvatar agentId={agent.id} color={config.color} size="sm" />
        <motion.div
          className={isOnline ? 'dot-online' : 'dot-offline'}
          style={{ position: 'absolute', bottom: -2, right: -2, border: '2px solid #0a0a0a' }}
        />
      </div>

      {/* Agent info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          {config.name}
        </h3>
        <p className="text-xs line-clamp-1" style={{ color: 'var(--text-tertiary)' }}>
          {config.role}
        </p>
      </div>

      {/* Status and stat */}
      <div className="flex flex-col items-end gap-1">
        <StatusIndicator isOnline={isOnline} status={session?.status} />
        {stats && (
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {stats.daily_tasks_completed} tasks
          </span>
        )}
      </div>
    </motion.button>
  );
}
```

**Step 3: Update main sidebar component**

Replace the sidebar content section (lines 321–342):

**OLD:**
```tsx
{/* Agent list */}
<div className="flex-1 overflow-y-auto p-3 space-y-3">
  {agentStates.map((state) => (
    <AgentCard
      key={state.agent.id}
      state={state}
      isExpanded={expandedAgent === state.agent.id}
      onToggle={() => setExpandedAgent(expandedAgent === state.agent.id ? null : state.agent.id)}
      activities={expandedAgent === state.agent.id ? expandedActivities : []}
    />
  ))}
</div>
```

**NEW:**
```tsx
{/* Agent list - compact */}
<div className="flex-1 overflow-y-auto p-3 space-y-2">
  {agentStates.map((state) => (
    <AgentCard
      key={state.agent.id}
      state={state}
      onSelectAgent={() => {
        setSelectedAgent(state);
        setModalOpen(true);
      }}
    />
  ))}
</div>
```

**Step 4: Add state for modal**

In the `AgentsSidebar` component function (line 302), add state for the modal:

```tsx
const [selectedAgent, setSelectedAgent] = useState<AgentState | null>(null);
const [modalOpen, setModalOpen] = useState(false);
```

**Step 5: Add modal to render**

After the footer `</div>` (after line 350), add the modal:

```tsx
{/* Details Modal */}
<AnimatePresence>
  <AgentDetailsModal
    state={selectedAgent}
    isOpen={modalOpen}
    onClose={() => {
      setModalOpen(false);
      setSelectedAgent(null);
    }}
    activities={selectedAgent ? expandedActivities : []}
  />
</AnimatePresence>
```

Also add:
```tsx
const { activities: expandedActivities } = useAgentActivities(selectedAgent?.agent.id || undefined, 5);
```

After line 307.

**Step 6: Update header**

Update the sidebar header (line 323–328) to remove the "Begu Company" text and just show "Agents":

```tsx
{/* Header */}
<div className="p-4 transition-all duration-300" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
  <h2 className="font-semibold flex items-center gap-2 text-sm transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>
    <Users className="w-5 h-5" style={{ color: 'var(--accent)' }} />
    Agents
  </h2>
  <p className="text-xs mt-1 transition-colors duration-300" style={{ color: 'var(--text-tertiary)' }}>
    {agentStates.length} agents • {agentStates.filter(s => s.isOnline).length} online
  </p>
</div>
```

**Step 7: Commit**

```bash
git add src/components/AgentsSidebar.tsx
git commit -m "refactor: Redesign hamburger sidebar with compact view and modal details"
```

Expected: Hamburger sidebar shows compact agent list with no overlaps, clicking agent opens modal with full details.

---

### Task 7: Final Polish & Verification

**Files:**
- Review: all modified files
- Verify: favicon, colors, layouts

**Step 1: Visual verification**

```bash
npm run dev
```

Check:
- ✓ Header shows CCPL + Command icon (⌘)
- ✓ Browser tab shows Command icon favicon
- ✓ All accent colors are deep teal (#06402B)
- ✓ Dark mode is darker (black, not grey)
- ✓ Hamburger menu shows compact agent list
- ✓ Clicking agent opens modal
- ✓ Hierarchy tab avatars glow
- ✓ Light mode still works

**Step 2: Search for remaining old references**

```bash
grep -rn "Begu\|#BF5AF2\|rgba(191,90,242" src/ --include="*.tsx" --include="*.ts"
```

Fix any remaining instances.

**Step 3: Test dark/light toggle**

Click theme toggle in header. Verify:
- Dark mode uses new darker palette
- Light mode still looks good
- Colors consistent in both modes

**Step 4: Test sidebar interactions**

- Click hamburger menu
- Click each agent in list
- Modal opens with full details
- Close modal
- Sidebar should have no text overlaps

**Step 5: Final commit if needed**

```bash
git add -A
git commit -m "style: Final polish and verification — CCPL rebrand complete"
```

**Step 6: Push**

```bash
git push origin master
```

---

## Summary of Changes

| File | Tasks |
|------|-------|
| `src/app/globals.css` | Task 1 — Color tokens, dark palette |
| `public/favicon.ico` | Task 2 — Command icon |
| `src/app/layout.tsx` | Task 3 — Favicon link |
| `src/app/page.tsx` | Tasks 3, 4 — Header logo, color updates |
| `src/components/AgentsSidebar.tsx` | Task 6 — Compact redesign + modal |
| `src/components/HierarchyTab.tsx` | Task 5 — Glow effects |
| All other components | Task 4 — Purple to teal colors |

**Total commits: ~7** (one per logical group)
