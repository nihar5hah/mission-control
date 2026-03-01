# Technology Stack

**Analysis Date:** 2026-03-02

## Languages

**Primary:**
- TypeScript 5.3+ - Entire codebase (frontend, backend API routes, hooks, utilities)
- JavaScript (JSX/TSX) - React components

**Secondary:**
- CSS - Tailwind CSS utility classes

## Runtime

**Environment:**
- Node.js (via Next.js runtime)
- Browser (client-side React)

**Package Manager:**
- npm (version from package-lock.json)
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js 14.0.0 - Full-stack React framework with App Router
- React 18.2.0 - UI library
- TypeScript 5.3+ - Type safety

**UI Component Libraries:**
- Radix UI - Headless UI primitives
  - `@radix-ui/react-dialog`
  - `@radix-ui/react-dropdown-menu`
  - `@radix-ui/react-tabs`
  - `@radix-ui/react-slot`
- shadcn/ui 0.9.5 - Component library built on Radix UI
- Tailwind CSS 3.3+ - Utility-first CSS framework
- Framer Motion 12.34.0 - Animation library

**Icons:**
- Lucide React 0.294.0 - Icon library
- Radix UI Icons 1.3.2

**State & Data:**
- Supabase JS Client 2.95.3 - Database client and real-time subscriptions

**Build/Dev:**
- ESLint 8.50+ - Linting
- eslint-config-next 14.0.0 - Next.js ESLint config
- Autoprefixer 10.4.0 - CSS vendor prefixes
- PostCSS 8.4.0 - CSS processing

## Key Dependencies

**Critical:**
- `@supabase/supabase-js` - Primary database and real-time data layer
- `next` 14.0.0 - Framework backbone
- `react` / `react-dom` 18.2.0 - UI framework

**UI/UX:**
- `framer-motion` - Complex animations and transitions
- `lucide-react` - Icon system
- `sonner` 1.7.4 - Toast notifications
- `tailwind-merge` / `clsx` - Tailwind utility helpers
- `class-variance-authority` - CVA pattern for component variants

**Styling:**
- `tailwindcss` 3.3.0 - CSS framework
- `postcss` 8.4.0 - CSS transpilation
- `autoprefixer` 10.4.0 - CSS compatibility

## Configuration

**Environment:**
- Configuration via `.env` files (`.env.example` template provided)
- Required variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Optional integrations: GitHub, Vercel, Telegram, Calendar

**Build:**
- `tsconfig.json` - TypeScript configuration with strict mode enabled
- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind with custom colors and animations
- `postcss.config.js` - PostCSS configuration
- `components.json` - shadcn/ui configuration

**TypeScript Settings:**
- Target: ES2020
- Module: ESNext
- Strict mode enabled
- Path alias: `@/*` maps to `./src/*`

## Platform Requirements

**Development:**
- Node.js 18+
- npm for package management
- Supabase local development or cloud instance

**Production:**
- Deployment target: Vercel (detected from `vercel.json`)
- Supabase cloud or self-hosted
- Environment variables must be configured in deployment platform

---

*Stack analysis: 2026-03-02*
