# Documentation Sync Guide

This document explains how to use the Supabase documentation sync system for Mission Control.

## Overview

The documentation tab on Mission Control now reads from Supabase instead of the local filesystem. This allows the deployed Vercel app to display workspace documentation files without needing access to the local server.

## How It Works

1. **Local Sync Script** (`scripts/sync-docs.ts`)
   - Reads all markdown files from `/home/hyper/.openclaw/workspace`
   - Uploads them to Supabase `documents` table
   - Can be run manually or via cron

2. **Supabase Storage**
   - Files are stored in the `documents` table with `category: 'workspace'`
   - Each document has metadata with file path and directory info

3. **API Route** (`src/app/api/files/route.ts`)
   - Replaced filesystem reading with Supabase queries
   - Returns file tree structure for the frontend
   - Supports both file list and single file content queries

4. **Frontend Hook**
   - No changes needed - still uses `/api/files` endpoint
   - Polls every 10 seconds for updates (real-time effect)

## Usage

### Manual Sync

Run the sync script manually before deployment:

```bash
npm run sync-docs
```

Output:
```
🔄 Syncing documents from: /home/hyper/.openclaw/workspace

📁 Found 15 markdown files

✅ AGENTS.md
✅ BOOTSTRAP.md
...
📊 Sync complete: 17 items synced
```

### Automated Sync (Cron)

Add to your deployment pipeline or cron job:

```bash
cd /home/hyper/.openclaw/workspace/mission-control
npm run sync-docs
```

### Configuration

Environment variables (optional):
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (default: configured in code)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (default: configured in code)
- `WORKSPACE_PATH` - Path to workspace (default: `/home/hyper/.openclaw/workspace`)

## Files Synced

The sync script finds and uploads:
- All `.md` files in the workspace root
- All `.md` files in the `memory/` subdirectory (e.g., `memory/YYYY-MM-DD.md`)
- Any other markdown files in included directories
- Directory metadata for proper tree structure

### Priority Files

These files appear at the top of the documentation tab:
- MEMORY.md
- SOUL.md
- USER.md
- IDENTITY.md
- TOOLS.md
- AGENTS.md
- memory/YYYY-MM-DD.md (date-based files)

## Data Structure

### Supabase Table: `documents`

```
{
  id: number,
  title: string,              // Filename (e.g., "MEMORY.md")
  content: string,            // File content
  category: string,           // "workspace" for synced files
  tags: string[],             // ["workspace", "synced", "priority"|"regular"]
  metadata: {
    path: string,             // Relative path (e.g., "memory/YYYY-MM-DD.md")
    isDirectory: boolean      // true for directories
  },
  created_at: string,         // ISO timestamp
  updated_at: string          // ISO timestamp
}
```

## API Endpoints

### Get File Tree

```
GET /api/files
```

Response:
```json
{
  "files": [
    {
      "name": "memory",
      "path": "memory",
      "type": "directory",
      "children": [
        {
          "name": "2026-02-15.md",
          "path": "memory/2026-02-15.md",
          "type": "file",
          "isPriority": true
        }
      ]
    },
    {
      "name": "MEMORY.md",
      "path": "MEMORY.md",
      "type": "file",
      "isPriority": true
    }
  ]
}
```

### Get File Content

```
GET /api/files?path=MEMORY.md
```

Response:
```json
{
  "content": "# MEMORY.md content...",
  "path": "MEMORY.md"
}
```

## Troubleshooting

### Sync fails with "Cannot find module"

Make sure dependencies are installed:
```bash
npm install
```

### Files not appearing in deployed app

1. Run the sync script:
   ```bash
   npm run sync-docs
   ```

2. Verify files in Supabase:
   ```bash
   # Use Supabase dashboard or:
   curl "https://[project].supabase.co/rest/v1/documents?category=eq.workspace" \
     -H "apikey: [anon-key]"
   ```

3. Check deployment - API must have Supabase credentials in env vars

### Sync script hangs

If the script seems stuck, it might be waiting for network I/O. Try:
```bash
timeout 60 npm run sync-docs
```

## Future Improvements

- [ ] Webhook trigger on file changes
- [ ] Batch sync for large workspaces
- [ ] Incremental sync (only changed files)
- [ ] File deletion tracking
- [ ] Search functionality
- [ ] File preview/diff functionality

## Support

Built by Begubot on OpenClaw
