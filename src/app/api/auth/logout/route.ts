import { NextResponse } from "next/server"
import { odooDestroySession } from "@/lib/odoo/client"
import { getSessionId, clearAllSessionData } from "@/lib/session"

export async function POST() {
  try {
    const sessionId = await getSessionId()

    if (sessionId) {
      await odooDestroySession(sessionId)
    }
  } catch (err) {
    console.error("[auth/logout] Odoo session destroy failed:", err)
  } finally {
    await clearAllSessionData()
  }

  return NextResponse.json({ success: true })
}
