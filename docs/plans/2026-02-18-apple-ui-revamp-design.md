# Apple UI Revamp — Mission Control
**Date:** 2026-02-18
**Approach:** Option A — SF Pro DNA
**Accent:** Apple Purple (#BF5AF2)

---

## Goal

Revamp the Mission Control dashboard to look and feel like it was built by Apple: clean, disciplined, dark-first, with frosted glass surfaces, a pure-black base, Apple system colors, and Apple Purple as the accent.

---

## Color System

### Dark Palette (forced default)

| Token         | Value        | Usage                              |
|---------------|--------------|-------------------------------------|
| `--bg-base`   | `#000000`    | Page background, sidebar backdrop  |
| `--bg-card`   | `#1c1c1e`    | Card surface, header               |
| `--bg-elevated` | `#2c2c2e`  | Hover state, nested cards          |
| `--bg-overlay` | `#3a3a3c`   | Active items, menus                |
| `--border`    | `rgba(255,255,255,0.08)` | Card borders, separators |
| `--border-hover` | `rgba(255,255,255,0.14)` | Hover border            |
| `--text-primary` | `#ffffff` | Headings, key values               |
| `--text-secondary` | `#aeaeb2` | Body text, descriptions           |
| `--text-tertiary` | `#636366` | Placeholders, icons, timestamps   |

### Accent Colors (Apple System)

| Name     | Value     | Usage                          |
|----------|-----------|--------------------------------|
| Purple   | `#BF5AF2` | Primary accent, active states  |
| Purple+  | `#D87EF5` | Hover on purple                |
| Green    | `#30D158` | Online, success, completed     |
| Red      | `#FF453A` | Error, failed, destructive     |
| Orange   | `#FF9F0A` | Warning, pending, in-progress  |
| Blue     | `#0A84FF` | Info, completed tasks          |

### Light Mode
Light mode is supported but dark is the default. Light uses standard system light colors: `#f2f2f7` base, `#ffffff` cards, `#8e8e93` tertiary text. Purple accent stays consistent.

---

## Typography

```css
font-family: -apple-system, 'SF Pro Display', 'SF Pro Text', BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
```

| Style          | Size | Weight | Letter-spacing |
|----------------|------|--------|----------------|
| Display        | 34px | 700    | -0.022em       |
| Title 1        | 28px | 700    | -0.022em       |
| Title 2        | 22px | 700    | -0.016em       |
| Title 3        | 20px | 600    | -0.012em       |
| Headline       | 17px | 600    | -0.01em        |
| Body           | 15px | 400    | -0.01em        |
| Caption        | 12px | 400    | 0              |

Line-height: 1.47 for body (Apple's ratio).

---

## Layout

### Forced Dark Mode Default
```tsx
// layout.tsx
<html lang="en" className="dark">
```
ThemeToggle still works to switch between dark/light. No system preference detection on first load — dark is the default. If user switches, localStorage persists.

### Header (macOS Title Bar)
- `background: rgba(28,28,30,0.85); backdrop-filter: blur(20px) saturate(1.8)`
- `border-bottom: 1px solid rgba(255,255,255,0.06)`
- Left: sidebar toggle (ghost icon button, no border) + logo (Building icon with `#BF5AF2` glow) + "The Begu Company" 600 + "Mission Control" 400 secondary
- Right: agents online status pill + theme toggle (ghost, no border)

### Tab Navigation (Apple Capsule Pill)
- Container: `background: rgba(255,255,255,0.06); border-radius: 12px; padding: 4px`
- Active tab indicator: filled purple pill, `border-radius: 9px`, slides with `layoutId`
- Tab text: white when active, `#636366` when inactive
- Icons: keep them (they add clarity for a dashboard)
- Badges: small purple pill with count

### Main Content
- Background: `#000000` (true black)
- Padding: 24px desktop, 16px mobile
- Cards: `background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px`
- Card hover: border becomes `rgba(191,90,242,0.3)`, shadow lifts

### Sidebar (Agents)
- `background: #1c1c1e`
- `border-right: 1px solid rgba(255,255,255,0.06)`
- Width: 320px desktop
- Agent cards: `background: #2c2c2e; border-radius: 14px`

---

## Components

### Cards
```css
background: rgba(255,255,255,0.04);
border: 1px solid rgba(255,255,255,0.08);
border-radius: 16px;
box-shadow: 0 2px 8px rgba(0,0,0,0.4);
transition: all 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
```
Hover:
```css
border-color: rgba(191,90,242,0.3);
box-shadow: 0 8px 32px rgba(0,0,0,0.6);
```

### Stat Cards (Dashboard)
- Icon container: `border-radius: 10px; background: rgba(color, 0.15); width: 36px; height: 36px`
- Value: 34px, weight 700, `#ffffff`
- Label: 12px, `#636366`

### Buttons
Primary:
```css
background: #BF5AF2;
color: #ffffff;
border-radius: 12px;
border: none;
box-shadow: 0 4px 12px rgba(191,90,242,0.3);
font-weight: 600;
font-size: 15px;
```

Secondary:
```css
background: rgba(255,255,255,0.08);
color: #ffffff;
border-radius: 12px;
border: none;
```

Destructive:
```css
background: rgba(255,69,58,0.12);
color: #FF453A;
border-radius: 12px;
```

### Agent Status Dots
- Online: `#30D158` with `box-shadow: 0 0 6px rgba(48,209,88,0.6)` glow + pulse animation
- Offline: `#48484a` static
- Warning/Idle: `#FF9F0A`

### Activity Status Pills
```css
/* Status badge */
border-radius: 20px;
padding: 2px 8px;
font-size: 12px;
font-weight: 500;
/* No border — just bg+text */
```
- Running: `background: rgba(48,209,88,0.15); color: #30D158`
- Completed: `background: rgba(10,132,255,0.15); color: #0A84FF`
- Failed: `background: rgba(255,69,58,0.15); color: #FF453A`
- Pending: `background: rgba(255,159,10,0.15); color: #FF9F0A`

### Inputs / Search
```css
background: rgba(255,255,255,0.08);
border: none;
border-radius: 12px;
color: #ffffff;
padding: 10px 16px;
```
Focus ring:
```css
box-shadow: 0 0 0 3px rgba(191,90,242,0.4);
```

### Scrollbars
```css
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.15);
  border-radius: 2px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255,255,255,0.25);
}
::-webkit-scrollbar-track { background: transparent; }
```

---

## Motion

Use Framer Motion with Apple-like spring physics:

```ts
// Spring config (snappy like macOS)
{ type: 'spring', stiffness: 400, damping: 35 }

// Fade transitions (200ms — Apple is fast)
{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }

// Tab/page transitions
hidden: { opacity: 0, y: 6 }
show: { opacity: 1, y: 0 }
```

Reduce all existing `duration: 0.3–0.4` to `0.2`. Remove horizontal slide tab transitions — use vertical fade instead.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/app/layout.tsx` | Add `className="dark"` to `<html>`, update font meta |
| `src/app/globals.css` | Full palette overhaul, Apple system colors, scrollbar, typography |
| `src/app/page.tsx` | Header, tab nav, all card styles, activity status colors |
| `src/components/AgentsSidebar.tsx` | Card styles, status indicators |
| `src/components/QuickActions.tsx` | Button variants, card style |
| `src/components/ThemeToggle.tsx` | Force dark default |
| `src/components/HierarchyTab.tsx` | Card styles |
| `src/components/ProactiveHub.tsx` | Status colors, card styles, button styles |
| `src/components/AgentStatus.tsx` | Status dot colors |
| `src/components/MarkdownViewer.tsx` | Dark typography |
| `src/components/FileTree.tsx` | Selection + hover colors |
| `src/components/OfficeScene.tsx` | Background and card colors |

---

## Implementation Order

1. `globals.css` — Color system + typography + scrollbars + base styles
2. `layout.tsx` — Dark class default
3. `page.tsx` — Header, tabs, dashboard cards, all tab views
4. Component files — Sidebar, QuickActions, ProactiveHub, HierarchyTab, others
5. Verify dark/light toggle still works correctly
