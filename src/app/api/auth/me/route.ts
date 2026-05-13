import { NextResponse } from "next/server"
import { getSessionId, getServerProfile } from "@/lib/session"

export async function GET() {
  const sessionId = await getSessionId()

  if (!sessionId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const profile = await getServerProfile()

  if (!profile) {
    return NextResponse.json({ error: "No profile found" }, { status: 401 })
  }

  return NextResponse.json({ profile })
}
