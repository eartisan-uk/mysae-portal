import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSessionId, getServerProfile } from "@/lib/session"
import { getOrder } from "@/lib/odoo/orders"
import { OdooError } from "@/lib/odoo/client"

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/orders/[id]">) {
  const sessionId = await getSessionId()
  if (!sessionId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const profile = await getServerProfile()
  if (!profile) {
    return NextResponse.json({ error: "No profile found" }, { status: 401 })
  }

  const { id } = await ctx.params
  const orderId = parseInt(id, 10)
  if (isNaN(orderId)) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
  }

  try {
    const order = await getOrder(orderId, profile.parentPartnerId)
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }
    return NextResponse.json({ order })
  } catch (err) {
    if (err instanceof OdooError) {
      return NextResponse.json({ error: err.message }, { status: 502 })
    }
    console.error("[api/orders/[id]] GET", err)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}
