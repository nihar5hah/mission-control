# Telegram Notifications Setup Guide

## Overview
The Mission Control dashboard now sends Telegram notifications for all task operations:
- Task created
- Task updated
- Task completed
- Task deleted

## How It Works

### Primary Method: OpenClaw Integration
Notifications are sent through the OpenClaw message tool to your configured Telegram channel.

**Usage in the app:**
```typescript
// Automatic - happens when you create/edit/delete a task
// The app calls sendTaskNotification() internally
```

### Secondary Method: Direct Telegram API (Optional)
For direct Telegram API integration, set these environment variables:

```bash
# .env.local
TELEGRAM_BOT_TOKEN=123456:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh
TELEGRAM_CHAT_ID=-1001234567890
```

## Getting Telegram Bot Token

1. **Open Telegram** and find `@BotFather`
2. **Type `/newbot`**
3. **Follow the prompts:**
   - Give your bot a name (e.g., "Mission Control Bot")
   - Give your bot a username (must be unique, e.g., "mission_control_bot")
4. **BotFather will give you:**
   - Token: `123456:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh`
5. **Save this token securely** in `.env.local`

## Getting Chat ID

### Method 1: Using the Bot (Recommended)
1. **Add your bot to a Telegram group or chat**
2. **Send a message:** `/start` or just say "hi"
3. **Visit:** `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
4. **Replace `<YOUR_TOKEN>` with your actual token**
5. **Look for `"chat":{"id":-1001234567890}`**
6. **Copy the ID** (including the negative sign if present)

### Method 2: Using getMe Endpoint
```bash
# Replace TOKEN with your actual token
curl https://api.telegram.org/botTOKEN/getMe
```

## Configuration Example

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://qbtlslagwbgrnnuaasma.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: Direct Telegram API
TELEGRAM_BOT_TOKEN=123456:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh
TELEGRAM_CHAT_ID=-1001234567890
```

## Notification Messages

The app sends notifications in this format:

```
✅ Task completed: Morning Brief
➕ New task: Review documentation  
✏️ Task updated: Weekly Sync
🗑️ Task deleted: Archived Task
```

## Testing Notifications

1. **Create a task**
   - Go to Calendar tab
   - Click "New Task"
   - Fill in the form
   - Submit
   - Check Telegram for: `➕ New task: [Your Task Title]`

2. **Edit a task**
   - Hover over a task
   - Click the pencil icon
   - Modify the task
   - Submit
   - Check Telegram for: `✏️ Task updated: [Your Task Title]`

3. **Complete a task**
   - Click on a task in the calendar
   - Watch it change to green (completed state)
   - Check Telegram for: `✅ Task completed: [Your Task Title]`

4. **Delete a task**
   - Hover over a task
   - Click the trash icon
   - Confirm deletion
   - Check Telegram for: `🗑️ Task deleted: [Your Task Title]`

## Troubleshooting

### Notifications Not Appearing

**Check 1: Is the app running?**
```bash
# From project directory
npm run dev
# Should see: "ready - started server on 0.0.0.0:3000"
```

**Check 2: Are credentials correct?**
- Open browser console (F12)
- Look for any API errors in Network tab
- Check `/api/notifications/telegram` requests

**Check 3: OpenClaw Integration**
- Verify OpenClaw is running: `openclaw gateway status`
- If not running: `openclaw gateway start`

**Check 4: Direct Telegram API (if using)**
- Verify token format: `123456:XXXXX`
- Verify chat ID is numeric with `-` prefix for groups
- Test token: `curl https://api.telegram.org/botTOKEN/getMe`

### Common Errors

**Error: "Failed to send notification"**
- Check network connectivity
- Verify Telegram API token is correct
- Ensure chat ID has read/write permissions

**Error: "Cannot find name 'sendTaskNotification'"**
- Rebuild the project: `npm run build`
- Clear cache: `rm -rf .next node_modules`
- Reinstall: `npm install`

## API Endpoint

**URL:** `/api/notifications/telegram`
**Method:** `POST`
**Content-Type:** `application/json`

### Request Body
```json
{
  "message": "✅ Task completed: Morning Brief",
  "type": "completed",
  "taskId": 123,
  "timestamp": "2026-02-15T10:43:00Z"
}
```

### Response
```json
{
  "success": true,
  "message": "Notification sent"
}
```

## Security Notes

⚠️ **Important:**
- **Never commit `.env.local`** to version control
- **Bot tokens are sensitive** - treat like passwords
- **Keep `.gitignore`** updated: `echo ".env.local" >> .gitignore`
- **Rotate tokens** if accidentally exposed

## Support

For issues with:
- **Telegram Bot/API:** See [@BotFather](https://t.me/botfather)
- **OpenClaw Integration:** Check OpenClaw docs
- **Mission Control App:** Check TASK_MANAGEMENT_FEATURES.md

---

**Last Updated:** 2026-02-15
**App Version:** 1.0.0
