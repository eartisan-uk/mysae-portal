import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSessionId } from "@/lib/session"
import { changePassword } from "@/lib/odoo/auth"
import { OdooError } from "@/lib/odoo/client"

export async function POST(request: NextRequest) {
  const sessionId = await getSessionId()
  if (!sessionId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  let body: { oldPassword?: string; newPassword?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { oldPassword, newPassword } = body

  if (!oldPassword || !newPassword) {
    return NextResponse.json(
      { error: "oldPassword and newPassword are required" },
      { status: 400 }
    )
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "New password must be at least 8 characters" },
      { status: 400 }
    )
  }

  try {
    await changePassword(sessionId, oldPassword, newPassword)
    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof OdooError) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }
    console.error("[auth/change-password]", err)
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 })
  }
}
