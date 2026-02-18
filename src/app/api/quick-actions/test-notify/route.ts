import { NextResponse } from "next/server"

const BOT_TOKEN = "8280125672:AAH-jHTtO1Q-i8CU8hiF9RfnHs1bVm2G5-4"
const CHAT_ID = "873338648"

export async function POST() {
  const res = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: "🔔 Test notification from Mission Control Quick Actions!"
      })
    }
  )
  
  const data = await res.json()
  return NextResponse.json({ 
    message: data.ok ? "Notification sent!" : "Failed to send",
    result: data 
  })
}
