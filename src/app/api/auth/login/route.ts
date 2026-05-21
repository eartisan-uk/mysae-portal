import { NextResponse } from "next/server"
import { odooAuthenticate, OdooAuthError } from "@/lib/odoo/client"
import { setSessionId, setServerProfile } from "@/lib/session"
import { odooSearchRead } from "@/lib/odoo/client"
import type { UserProfile } from "@/types/portal"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Authenticate against Odoo
    const auth = await odooAuthenticate(email, password)

    // Fetch full user record to get warehouse ID
    const users = await odooSearchRead<{
      id: number
      name: string
      login: string
      company_id: [number, string]
      partner_id: [number, string]
      parent_id: [number, string] | false
    }>(
      "res.users",
      [["id", "=", auth.uid]],
      ["id", "name", "login", "company_id", "partner_id", "parent_id"],
      auth.sessionId
    )

    if (!users.length) {
      return NextResponse.json({ error: "User record not found" }, { status: 401 })
    }

    const user = users[0]

    const partnerId = Array.isArray(user.partner_id) ? user.partner_id[0] : user.partner_id
    // parent_id is the Related Company partner. Fall back to own partnerId if user IS the company.
    const parentPartnerId = Array.isArray(user.parent_id) ? user.parent_id[0] : partnerId

    // Build safe profile object for the browser
    const profile: UserProfile = {
      uid: auth.uid,
      name: user.name,
      email: user.login,
      companyId: Array.isArray(user.company_id) ? user.company_id[0] : user.company_id,
      companyName: Array.isArray(user.parent_id) ? user.parent_id[1] : user.name,
      partnerId,
      parentPartnerId,
      warehouseId: null, // TODO: confirm warehouse field name with Odoo developer (Section 11.1)
    }

    // Store session server-side in httpOnly cookie
    await setSessionId(auth.sessionId)
    await setServerProfile(profile)

    return NextResponse.json({ success: true, profile })
  } catch (err) {
    if (err instanceof OdooAuthError) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    console.error("[auth/login]", err)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
