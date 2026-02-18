# CCPL Rebrand & UI Refinements — Design Doc

**Date:** 2026-02-18
**Approved:** Yes

---

## Goal

Rebrand "The Begu Company" to **CCPL**, introduce a professional tech-forward identity with a Mac Command icon logo, shift the color system from Apple Purple to a deep teal (`#06402B`), darken the dark mode palette further, and redesign the hamburger menu sidebar with a compact layout to eliminate formatting issues and text overlaps.

---

## Branding

### Company Name & Logo

**New Name:** CCPL

**Logo:** Mac Command icon (⌘)
- Background container: `#06402B` (deep teal)
- Icon symbol: `#ffffff` (white)
- Size: 32px × 32px (header), 16px × 16px (favicon)
- Placement:
  - Header: left side, before "CCPL" text
  - Favicon: browser tab
  - Sidebar header: compact version

**Replaces:** "The Begu Company" name and current building icon throughout the app

---

## Color System: Tech/Professional Palette

### Primary Accent

- **Color:** `#06402B` (deep teal)
- **Hover:** `#087860` (lighter teal, 20% lighter)
- **Muted:** `rgba(6, 64, 43, 0.15)` (for backgrounds/mutes)
- **Used for:** Active states, buttons, links, highlights, focus rings, accent elements

### Supporting Status Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Success/Online | `#10b981` | Online status, success states |
| Error/Offline | `#ef4444` | Offline status, error states |
| Warning | `#f59e0b` | Warning/pending states |
| Neutral (Slate) | `#64748b` | Secondary text, borders |

### Implementation

- Replace all `#BF5AF2` (Apple Purple) with `#06402B`
- Replace all `rgba(191,90,242,...)` with `rgba(6, 64, 43, ...)`
- Update hover states: `#D87EF5` → `#087860`
- Update muted backgrounds: `rgba(191,90,242,0.15)` → `rgba(6, 64, 43, 0.15)`
- All legacy color tokens in `globals.css` get new values

---

## Dark Mode Palette: Deeper Blacks

Shift from greyish tones to deeper, more pure blacks.

### Color Tokens

| Token | Previous | New | Change |
|-------|----------|-----|--------|
| `--bg-base` | `#000000` | `#000000` | Keep |
| `--bg-card` | `#1c1c1e` | `#0a0a0a` | Darker grey |
| `--bg-elevated` | `#2c2c2e` | `#111111` | Darker grey |
| `--bg-overlay` | `#3a3a3c` | `#1a1a1a` | Darker grey |
| `--border` | `rgba(255,255,255,0.08)` | `rgba(255,255,255,0.06)` | More subtle |
| `--border-hover` | `rgba(255,255,255,0.14)` | `rgba(255,255,255,0.1)` | More subtle |

**Result:** Deeper, more premium feel — less grey, more true black/dark aesthetic.

---

## Hierarchy Tab: Agent Visibility with Glow

### Problem

Coder and Researcher agent avatars aren't visible in dark mode due to low contrast.

### Solution: Glowing Avatars

**HierarchyAvatar container styling:**

```css
background: rgba(6, 64, 43, 0.15);      /* Muted teal background */
border: 1px solid #06402B;              /* Teal border for visibility */
box-shadow: 0 0 16px rgba(6, 64, 43, 0.4);  /* Glow effect */
```

**Hover state:**
```css
box-shadow: 0 0 24px rgba(6, 64, 43, 0.6);  /* Intensified glow */
transform: scale(1.05);                     /* Subtle scale up */
```

**Result:** All three agents (Begubot, Coder, Researcher) are now clearly visible with a professional glow effect that emphasizes the new CCPL brand color.

---

## Hamburger Menu Sidebar: Compact Redesign

### Current Issues

- Crowded layout with nested expansions
- Text overlapping components
- Poor readability
- Activity details hard to scan

### New Design: Compact View with Modal Details

#### Layout Structure

**Sidebar Header:**
- Command icon + "Agents" title
- Compact, minimal spacing

**Agent List (Main Sidebar View):**
- 3 rows, one per agent
- Each row shows:
  - Avatar (small, glowing with new color)
  - Agent name (left-aligned)
  - Status indicator (online dot + status text: "Online", "Offline", "Idle")
  - Quick stat badge (e.g., "5 tasks")
- Click on any agent → opens **Details Modal**

**Details Modal (Click to View):**
- Modal/side panel that appears when clicking an agent
- Full content:
  - Large avatar with glow
  - Agent name and role
  - Full stats grid (Tokens Today, Tasks Done, Active Time)
  - Recent Activities section (scrollable, last 5 activities)
  - Session Info (started time, current action)
  - Close button
- Smooth open/close animation
- Overlay semi-transparent background

#### Spacing & Visual Hierarchy

- Agent rows: `12px` padding, `8px` gap between elements
- No cramping, clear visual separation
- Text sizing:
  - Agent name: `14px` (body)
  - Status: `12px` (caption)
  - Stat badge: `11px` (small)
- Colors:
  - Text primary: `var(--text-primary)` (#ffffff)
  - Text tertiary: `var(--text-tertiary)` (#636366)
  - Status dot: green for online, grey for offline, orange for idle

#### Card Styling

- Agent row background: `rgba(255,255,255,0.04)`
- Border: `1px solid rgba(255,255,255,0.06)`
- Hover: border becomes `rgba(6, 64, 43, 0.3)` with slight lift
- Cursor: pointer

---

## Files to Modify

| File | Change |
|------|--------|
| `src/app/globals.css` | Update color tokens to new palette and darker dark mode |
| `src/app/page.tsx` | Replace purple accent with #06402B throughout |
| `src/components/AgentsSidebar.tsx` | Redesign layout: compact view + modal for details |
| `src/components/HierarchyTab.tsx` | Add glow effect to avatars |
| All component files | Replace Apple Purple (#BF5AF2) with #06402B |
| `src/app/layout.tsx` | Update favicon to Command icon |
| `public/favicon.ico` | Command icon (⌘) |

---

## Implementation Order

1. `globals.css` — New color tokens, darker dark mode palette
2. `layout.tsx` — Command icon favicon
3. Component color updates — All files using old purple
4. `HierarchyTab.tsx` — Glow effects
5. `AgentsSidebar.tsx` — Compact redesign with modal
6. Test and verify all colors, dark mode, sidebar behavior

---

## Success Criteria

- ✓ CCPL branding visible (logo + name throughout)
- ✓ Command icon displays correctly in header and favicon
- ✓ All UI uses `#06402B` accent consistently
- ✓ Dark mode is noticeably darker (more black, less grey)
- ✓ Hierarchy tab avatars are clearly visible with glow
- ✓ Hamburger sidebar is compact with no text overlaps
- ✓ Clicking agent in sidebar opens modal with full details
- ✓ Light mode toggle still works properly
