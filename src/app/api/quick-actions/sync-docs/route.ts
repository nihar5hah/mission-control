import { NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

export async function POST() {
  try {
    await execAsync("cd /home/hyper/.openclaw/workspace/mission-control && npm run sync-docs")
    return NextResponse.json({ message: "Docs synced!" })
  } catch (e) {
    return NextResponse.json({ message: "Sync failed: " + e }, { status: 500 })
  }
}
