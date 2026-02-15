import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, type, taskId, timestamp } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Send notification via OpenClaw's internal notification system
    // This uses the configured Telegram channel
    try {
      const notificationResponse = await fetch('http://localhost:3030/api/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: 'telegram',
          message,
          data: {
            type,
            taskId,
            timestamp,
          },
        }),
      });

      if (!notificationResponse.ok) {
        console.warn(`[Telegram] Notification endpoint returned: ${notificationResponse.status}`);
      }
    } catch (notificationError) {
      console.warn('[Telegram] Could not reach notification endpoint, will retry:', notificationError);
    }

    // Also try direct Telegram API if available
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;

    if (telegramToken && telegramChatId) {
      try {
        await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text: message,
            parse_mode: 'HTML',
          }),
        });
      } catch (telegramError) {
        console.warn('[Telegram] Direct API call failed:', telegramError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Notification sent',
    });
  } catch (error) {
    console.error('[Telegram API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process notification' },
      { status: 500 }
    );
  }
}
