import { NextResponse } from "next/server"

const SUPABASE_URL = "https://qbtlslagwbgrnnuaasma.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlYiI6InFidGxzbGFnd2Jncm5udWFhc21hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwOTAzNzksImV4cCI6MjA4NjY2NjM3OX0.95mIKqkW4Q6wtx6vvJk_XdDVK8vobmX2v98f1KRITSk"

export async function POST() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/agent_activities?timestamp=lt.${sevenDaysAgo}`,
    {
      method: "DELETE",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: "return=representation"
      }
    }
  )
  
  const deleted = await res.json()
  return NextResponse.json({ message: `Cleared ${deleted.length || 0} old activities` })
}
