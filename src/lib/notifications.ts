/**
 * Telegram Notifications Service
 * Sends task notifications to Telegram when tasks are created, updated, or deleted
 */

export type TaskNotificationType = 'created' | 'completed' | 'deleted' | 'updated';

interface TaskNotificationPayload {
  type: TaskNotificationType;
  taskTitle: string;
  taskId: number;
  timestamp: string;
}

/**
 * Send a task notification via Telegram using OpenClaw's message API
 */
export async function sendTaskNotification(payload: TaskNotificationPayload): Promise<boolean> {
  try {
    // Determine emoji and message format based on notification type
    let emoji = '';
    let action = '';
    
    switch (payload.type) {
      case 'created':
        emoji = '➕';
        action = 'New task';
        break;
      case 'completed':
        emoji = '✅';
        action = 'Task completed';
        break;
      case 'deleted':
        emoji = '🗑️';
        action = 'Task deleted';
        break;
      case 'updated':
        emoji = '✏️';
        action = 'Task updated';
        break;
    }

    const message = `${emoji} ${action}: ${payload.taskTitle}`;
    
    console.log(`[Notification] ${message}`);
    
    // Call the OpenClaw notification endpoint
    // This will send the notification via Telegram to the configured channel
    const response = await fetch('/api/notifications/telegram', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        type: payload.type,
        taskId: payload.taskId,
        timestamp: payload.timestamp,
      }),
    });

    if (!response.ok) {
      console.warn(`[Notification] Failed to send notification: ${response.statusText}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Notification] Error sending notification:', error);
    return false;
  }
}
