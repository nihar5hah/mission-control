# API Documentation

Mission Control provides a comprehensive REST API for all operations. Built for my OpenClaw instance to enable programmatic access to automation workflows.

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

Currently uses Supabase authentication. Include the authorization header for protected endpoints:

```bash
Authorization: Bearer YOUR_SUPABASE_TOKEN
```

For development, the anonymous key is used by default. For production, use service role key for backend operations.

## Response Format

All endpoints return JSON:

```json
{
  "success": true,
  "data": {},
  "error": null,
  "timestamp": "2025-02-15T20:00:00Z"
}
```

## Error Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error
- `503` - Service Unavailable

---

## Activities

### Get Activities

```bash
GET /api/activities?limit=50&status=completed&offset=0
```

**Query Parameters:**
- `limit` (int): Max results (default: 50, max: 500)
- `status` (string): Filter by status (running, completed, failed, pending)
- `offset` (int): Pagination offset (default: 0)
- `agent` (string): Filter by agent name
- `action` (string): Filter by action type

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "agent": "Main Agent",
      "action": "build",
      "description": "Building project",
      "status": "completed",
      "timestamp": "2025-02-15T19:30:00Z",
      "metadata": {
        "duration": 1200,
        "tokens_used": 500
      }
    }
  ],
  "total": 1250,
  "has_more": true
}
```

### Log Activity

```bash
POST /api/activities/log
Content-Type: application/json

{
  "agent": "Main Agent",
  "action": "build",
  "description": "Building new feature",
  "status": "completed",
  "metadata": {
    "duration": 1200,
    "tokens_used": 500,
    "files_modified": 5
  }
}
```

**Response:**
```json
{
  "id": 1,
  "created_at": "2025-02-15T20:00:00Z",
  "status": "completed"
}
```

---

## Tasks

### Get All Tasks

```bash
GET /api/tasks?status=pending&type=daily
```

**Query Parameters:**
- `status` (string): pending, in_progress, completed
- `type` (string): daily, one-time
- `scheduled_after` (ISO string): Filter by date
- `scheduled_before` (ISO string): Filter by date

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Review code",
      "scheduled_for": "2025-02-16T09:00:00Z",
      "status": "pending",
      "type": "daily",
      "day": "Monday"
    }
  ]
}
```

### Create Task

```bash
POST /api/tasks
Content-Type: application/json

{
  "title": "Review pull requests",
  "scheduled_for": "2025-02-16T10:00:00Z",
  "type": "daily",
  "day": "Monday",
  "status": "pending"
}
```

### Update Task

```bash
PUT /api/tasks/:id
Content-Type: application/json

{
  "status": "completed",
  "title": "Updated title"
}
```

### Delete Task

```bash
DELETE /api/tasks/:id
```

---

## Proactive Intelligence

### Get Proactive Actions

```bash
GET /api/proactive/actions?limit=50&status=pending
```

**Query Parameters:**
- `limit` (int): Max results (default: 50)
- `status` (string): pending, running, completed, failed, dismissed
- `type` (string): Filter by action type
- `category` (string): Filter by category

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "type": "suggestion",
      "category": "automation",
      "description": "Automate repetitive tasks",
      "impact": "high",
      "status": "pending",
      "confidence_score": 0.78,
      "created_at": "2025-02-15T20:00:00Z"
    }
  ]
}
```

### Create Proactive Action

```bash
POST /api/proactive/actions
Content-Type: application/json

{
  "type": "task_create",
  "category": "automation",
  "description": "Create automation script",
  "impact": "high",
  "status": "pending",
  "confidence_score": 0.78,
  "source": "opportunity_finder"
}
```

### Update Action Status

```bash
PATCH /api/proactive/actions/:id
Content-Type: application/json

{
  "status": "completed"
}
```

---

## Patterns

### Get Detected Patterns

```bash
GET /api/proactive/patterns?category=time&active=true
```

**Query Parameters:**
- `category` (string): time, workflow, attention, opportunity, learning, collaboration
- `active` (boolean): Show only active patterns (default: true)
- `limit` (int): Max results (default: 20)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "category": "time",
      "name": "activity_time_distribution",
      "pattern_data": {
        "typical_start_hour": 9,
        "typical_end_hour": 18,
        "most_productive_hours": [10, 11, 14, 15]
      },
      "frequency": "daily",
      "confidence": 0.92,
      "impact_score": 0.7,
      "suggested_action": "Schedule important tasks during peak hours"
    }
  ]
}
```

### Analyze Patterns

```bash
POST /api/proactive/patterns
Content-Type: application/json

{
  "type": "full"  // or "time", "workflow", "attention"
}
```

**Response:**
```json
{
  "success": true,
  "patterns": [
    {
      "id": 1,
      "category": "time",
      "name": "activity_time_distribution",
      "pattern_data": {...}
    }
  ],
  "analyzed": "full",
  "timestamp": "2025-02-15T20:00:00Z"
}
```

---

## Opportunities

### Get Opportunities

```bash
GET /api/proactive/opportunities?type=automation&status=discovered
```

**Query Parameters:**
- `type` (string): monetization, automation, collaboration, learning, efficiency
- `status` (string): discovered, investigating, validated, implemented
- `limit` (int): Max results (default: 20)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "type": "automation",
      "title": "Automate repetitive fix tasks",
      "description": "You perform fix tasks frequently...",
      "potential_value": "high",
      "effort_estimate": "medium",
      "priority_score": 0.8,
      "status": "discovered",
      "tags": ["automation", "efficiency"]
    }
  ]
}
```

### Find Opportunities

```bash
POST /api/proactive/opportunities
Content-Type: application/json

{}
```

**Response:**
```json
{
  "success": true,
  "total_found": 3,
  "opportunities": [
    {
      "id": 1,
      "type": "automation",
      "title": "Automate repetitive fix tasks",
      ...
    }
  ]
}
```

### Update Opportunity Status

```bash
PATCH /api/proactive/opportunities/:id
Content-Type: application/json

{
  "status": "investigating"  // or "validated", "implemented"
}
```

---

## Decisions

### Get Decisions

```bash
GET /api/proactive/decide?limit=20&status=executed
```

**Query Parameters:**
- `limit` (int): Max results
- `status` (string): pending, approved, rejected, executed

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "decision": "Focus on: Automate repetitive tasks",
      "reasoning": "Based on your patterns...",
      "confidence_score": 0.78,
      "status": "executed",
      "suggested_actions": [...]
    }
  ]
}
```

### Make Decision

```bash
POST /api/proactive/decide
Content-Type: application/json

{
  "type": "recommend",  // or "categorize", "route", "generate", "predict"
  "data": {
    "current_time": "2025-02-15T14:30:00Z",
    "recent_actions": 5
  }
}
```

**Response:**
```json
{
  "decision": "Focus on: Automate repetitive tasks",
  "reasoning": "Based on your patterns, this has high value",
  "confidence": 0.78,
  "suggested_actions": [
    "Implement: Automate repetitive tasks",
    "Set deadline for automation"
  ]
}
```

---

## Study Tracker

### Get Study Stats

```bash
GET /api/study/stats
```

**Response:**
```json
{
  "today_minutes": 120,
  "week_total": 720,
  "current_streak": 5,
  "subjects": [
    {
      "name": "Mathematics",
      "total_lectures": 10,
      "sessions_completed": 8
    }
  ]
}
```

### Create Study Session

```bash
POST /api/study/sessions
Content-Type: application/json

{
  "subject_id": 1,
  "lecture_number": 3,
  "duration_minutes": 45,
  "notes": "Covered complex integrals"
}
```

---

## Files

### List Files

```bash
GET /api/files?path=.&recursive=true
```

**Query Parameters:**
- `path` (string): Directory path (default: workspace root)
- `recursive` (boolean): Include subdirectories
- `limit` (int): Max results

**Response:**
```json
{
  "files": [
    {
      "name": "README.md",
      "path": "/README.md",
      "type": "file",
      "size": 1024,
      "modified": "2025-02-15T10:00:00Z"
    },
    {
      "name": "src",
      "path": "/src",
      "type": "directory"
    }
  ]
}
```

### Read File

```bash
GET /api/files?path=README.md&content=true
```

**Response:**
```json
{
  "name": "README.md",
  "path": "/README.md",
  "type": "file",
  "content": "# Mission Control\n...",
  "size": 1024,
  "modified": "2025-02-15T10:00:00Z"
}
```

---

## Rate Limiting

API endpoints are rate limited:

- **Default**: 60 requests/minute per IP
- **Authenticated**: 1000 requests/minute per user
- **Study endpoints**: 100 requests/minute

Headers included in response:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1708040400
```

---

## Batch Operations

### Batch Create Tasks

```bash
POST /api/tasks/batch
Content-Type: application/json

{
  "tasks": [
    {
      "title": "Task 1",
      "scheduled_for": "2025-02-16T09:00:00Z",
      "type": "daily"
    },
    {
      "title": "Task 2",
      "scheduled_for": "2025-02-16T10:00:00Z",
      "type": "one-time"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "created": 2,
  "failed": 0,
  "results": [...]
}
```

---

## Webhooks (Coming Soon)

Receive real-time notifications for events:

```bash
POST /api/webhooks/subscribe
Content-Type: application/json

{
  "event": "action.completed",
  "url": "https://your-domain.com/webhook",
  "secret": "your-secret-key"
}
```

---

## SDK Usage

### JavaScript/TypeScript

```typescript
import MissionControl from '@mission-control/sdk';

const mc = new MissionControl({
  url: 'https://your-domain.com/api',
  token: 'your-token'
});

// Get activities
const activities = await mc.activities.list({ limit: 50 });

// Create task
const task = await mc.tasks.create({
  title: 'My Task',
  scheduled_for: new Date(),
  type: 'daily'
});

// Find opportunities
const opps = await mc.proactive.findOpportunities();
```

### Python

```python
from mission_control import Client

mc = Client(
    url="https://your-domain.com/api",
    token="your-token"
)

# List activities
activities = mc.activities.list(limit=50)

# Create task
task = mc.tasks.create(
    title="My Task",
    scheduled_for="2025-02-16T09:00:00Z",
    type="daily"
)
```

---

## Pagination

For endpoints that return lists, use standard pagination:

```bash
GET /api/activities?limit=50&offset=0
```

**Pagination Response:**
```json
{
  "data": [...],
  "pagination": {
    "total": 1000,
    "limit": 50,
    "offset": 0,
    "has_more": true,
    "next_url": "/api/activities?limit=50&offset=50"
  }
}
```

---

## Filtering & Searching

### Text Search

```bash
GET /api/activities?search=build
```

### Date Range

```bash
GET /api/activities?after=2025-02-01&before=2025-02-28
```

### Multiple Filters

```bash
GET /api/activities?status=completed&agent=Main&action=build
```

---

## Changelog

### v1.0 (Feb 2025)
- Initial API release
- Proactive Intelligence endpoints
- Activity logging
- Task management
- Pattern detection
- Opportunity finding

### v1.1 (Planned)
- Webhooks
- Advanced analytics
- Custom decision rules
- Multi-user support

---

**Built for my OpenClaw instance** - An AI-powered automation system for intelligently managing complex workflows and providing proactive intelligence.

For more details, see [PROACTIVE_INTELLIGENCE.md](./PROACTIVE_INTELLIGENCE.md).
