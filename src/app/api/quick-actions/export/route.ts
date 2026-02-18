import { NextResponse } from "next/server"

const SUPABASE_URL = "https://qbtlslagwbgrnnuaasma.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlYiI6InFidGxzbGFnd2Jncm5udWFhc21hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwOTAzNzksImV4cCI6MjA4NjY2NjM3OX0.95mIKqkW4Q6wtx6vvJk_XdDVK8vobmX2v98f1KRITSk"

export async function POST() {
  const today = new Date().toISOString().split("T")[0]
  
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/agent_activities?timestamp=gte.${today}`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      }
    }
  )
  
  const activities = await res.json()
  return NextResponse.json({ 
    message: `Exported ${activities.length || 0} activities for today`,
    data: activities 
  })
}
