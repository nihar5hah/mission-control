import { NextResponse } from "next/server"

export async function POST() {
  // Trigger morning brief - just return success for now
  return NextResponse.json({ message: "Morning brief triggered!" })
}
