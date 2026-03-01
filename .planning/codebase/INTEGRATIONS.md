# External Integrations

**Analysis Date:** 2026-03-02

## APIs & External Services

**Database & Backend:**
- Supabase - Primary database and real-time backend
  - SDK/Client: `@supabase/supabase-js`
  - Tables: `activities`, `tasks`, `documents`, `task_completions`, `work_sessions`, `agent_stats`
  - Auth: `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public), `SUPABASE_SERVICE_ROLE_KEY` (service)
  - Real-time subscriptions enabled for task completions and activities

**Development Platforms:**
- GitHub - Repository, issue, and PR data
  - Integration: `src/lib/proactive/integrations.ts` - `github` object
  - Auth: `GITHUB_TOKEN` (Personal Access Token)
  - API: GitHub REST API v3
  - Scopes: `repo`, `gist`, `read:user`
  - Endpoints: `/user/repos`, `/issues`, `/pulls`
  - Cache TTL: 5 minutes

- Vercel - Deployment and project data
  - Integration: `src/lib/proactive/integrations.ts` - `vercel` object
  - Auth: `VERCEL_TOKEN`
  - Team ID: `VERCEL_TEAM_ID` (optional)
  - API: Vercel API v6
  - Endpoints: `/v6/deployments`, `/v6/projects`
  - Cache TTL: 2 minutes

**Notifications:**
- Telegram - Bot notifications
  - Integration: `src/app/api/notifications/telegram/route.ts`
  - Auth: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`
  - API: Telegram Bot API (`https://api.telegram.org/bot{TOKEN}/sendMessage`)
  - Used for task notifications

**Optional Integrations (from .env.example):**
- Email/SMTP - Task notifications via email
  - Config: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`
- Slack - Notifications via webhook
  - Config: `SLACK_WEBHOOK_URL`
- Discord - Notifications via webhook
  - Config: `DISCORD_WEBHOOK_URL`

**Calendar:**
- Calendar API integration planned
  - Provider support: Google, Outlook, CALDAV
  - Config: `CALENDAR_API_KEY`, `CALENDAR_PROVIDER`

## Data Storage

**Database:**
- PostgreSQL via Supabase
  - Connection: `NEXT_PUBLIC_SUPABASE_URL`
  - Client: `@supabase/supabase-js` JS client
  - Schema: Tables defined in `supabase/` directory
  - Migrations: `supabase/migrations/`

**File Storage:**
- Supabase Storage (implied by document management)
- Local filesystem (workspace path configurable via `WORKSPACE_PATH`)

**Caching:**
- In-memory caching via `getCachedData`/`setCachedData` in `src/lib/proactive/integrations.ts`
- Cache TTL configurable per integration

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (implied but not fully implemented in current code)
  - Implementation: Supabase anonymous keys
  - Environment: `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Session Management:**
- Session configuration: `SESSION_SECRET`, `SESSION_TIMEOUT`
- Agent identification: `AGENT_ID`, `OPENCLAW_SESSION_KEY`

## Monitoring & Observability

**Error Tracking:**
- Sentry support planned
  - Config: `SENTRY_DSN`

**Logs:**
- Console logging via `console.log`/`console.error`/`console.warn`
- Configurable log levels: `LOG_LEVEL` (debug, info, warn, error)
- Debug mode: `DEBUG` env var

**Analytics:**
- Google Analytics support planned
  - Config: `NEXT_PUBLIC_GA_ID`

## CI/CD & Deployment

**Hosting:**
- Vercel - Primary deployment platform
  - Config: `vercel.json`
  - Framework: Next.js

**CI Pipeline:**
- Vercel automatic deployments on git push

## Environment Configuration

**Required env vars:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

**Optional but recommended:**
- `SUPABASE_SERVICE_ROLE_KEY` - Service role for admin operations
- `GITHUB_TOKEN` - For GitHub integration
- `VERCEL_TOKEN` - For Vercel integration
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` - For notifications

**Secrets location:**
- Environment variables (`.env` file, deployment platform secrets)
- `.env.example` provides template

## Webhooks & Callbacks

**Incoming:**
- None detected (app is API-first, not webhook receiver)

**Outgoing:**
- Telegram notifications via `src/app/api/notifications/telegram/route.ts`
- Slack/Discord webhook notifications (optional)

---

*Integration audit: 2026-03-02*
