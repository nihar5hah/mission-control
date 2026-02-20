# Tasks Board - Agent Integration

This document explains how agents interact with the Tasks Board for autonomous task management.

---

## Overview

The Tasks Board enables autonomous task management:
- **Begu** creates tasks and assigns to agents
- **Agents** get notified automatically
- **Agents** can check their tasks, update status, mark complete
- **Mission Control** shows real-time progress

---

## For Agents: How to Use Tasks

### Check Your Tasks

```bash
# Get all your TODO tasks
curl -s "https://mission-control-one-gold.vercel.app/api/tasks-board?owner=YOUR_AGENT_ID&status=TODO" \
  -H "X-API-Key: your-api-key"

# Get all your tasks (any status)
curl -s "https://mission-control-one-gold.vercel.app/api/tasks-board?owner=YOUR_AGENT_ID" \
  -H "X-API-Key: your-api-key"
```

Replace `YOUR_AGENT_ID` with: `extractor`, `coder`, `researcher`, or `begubot`

### Update Task Status

```bash
# Mark task as IN_PROGRESS (when you start working)
curl -X PATCH "https://mission-control-one-gold.vercel.app/api/tasks-board/TASK_ID" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"status": "IN_PROGRESS"}'

# Mark task as DONE (when complete)
curl -X PATCH "https://mission-control-one-gold.vercel.app/api/tasks-board/TASK_ID" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"status": "DONE"}'
```

Replace `TASK_ID` with the actual task ID from the GET request.

---

## Workflow for Agents

1. **Receive notification** - You'll get a message when a task is assigned to you
2. **Check your tasks** - Use GET endpoint to see all your tasks
3. **Start working** - Update status to IN_PROGRESS
4. **Complete task** - Update status to DONE when finished
5. **Mission Control updates** - Status change reflects in UI automatically

---

## Task Properties

Each task has:
- `id` - Unique task ID (UUID)
- `title` - Task title
- `description` - Task details
- `owner` - Assigned agent (extractor, coder, researcher, begubot)
- `status` - TODO | IN_PROGRESS | DONE
- `priority` - LOW | MEDIUM | HIGH | CRITICAL
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp
- `completed_at` - Completion timestamp (set when status=DONE)

---

## Example: Full Task Workflow

```bash
# 1. Check your tasks
curl -s "https://mission-control-one-gold.vercel.app/api/tasks-board?owner=coder&status=TODO" \
  -H "X-API-Key: test-key"

# Response:
# [{"id":"abc-123","title":"Build Memory UI","description":"Create searchable memory interface","status":"TODO","owner":"coder","priority":"HIGH"}]

# 2. Start working on task
curl -X PATCH "https://mission-control-one-gold.vercel.app/api/tasks-board/abc-123" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: test-key" \
  -d '{"status": "IN_PROGRESS"}'

# 3. Complete task
curl -X PATCH "https://mission-control-one-gold.vercel.app/api/tasks-board/abc-123" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: test-key" \
  -d '{"status": "DONE"}'
```

---

## Integration with Agent Memory

Add this to your MEMORY.md:

```markdown
## Tasks Board Integration

**Check Tasks:** GET /api/tasks-board?owner=YOUR_ID&status=TODO
**Update Status:** PATCH /api/tasks-board/TASK_ID with {"status": "IN_PROGRESS" or "DONE"}

When assigned a task:
1. Check your tasks
2. Update to IN_PROGRESS when starting
3. Update to DONE when complete
```

---

## API Authentication

Use the `X-API-Key` header for API calls. The API key is configured in Mission Control.

For internal agent use, the gateway can also make direct calls.

---

**Created:** 2026-02-20
**Purpose:** Enable autonomous task management for all agents
