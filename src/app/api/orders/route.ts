import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSessionId, getServerProfile } from "@/lib/session"
import { getOrders, createOrder } from "@/lib/odoo/orders"
import { OdooError } from "@/lib/odoo/client"
import type { OrderView, CreateOrderPayload } from "@/types/portal"

export async function GET(request: NextRequest) {
  const sessionId = await getSessionId()
  if (!sessionId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const profile = await getServerProfile()
  const view = (request.nextUrl.searchParams.get("view") ?? "my") as OrderView

  try {
    const orders = await getOrders(sessionId, view, profile?.uid)
    return NextResponse.json({ orders })
  } catch (err) {
    if (err instanceof OdooError) {
      return NextResponse.json({ error: err.message }, { status: 502 })
    }
    console.error("[api/orders] GET", err)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const sessionId = await getSessionId()
  if (!sessionId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const profile = await getServerProfile()
  if (!profile) {
    return NextResponse.json({ error: "No profile found" }, { status: 401 })
  }

  let payload: CreateOrderPayload
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!payload.type || !payload.costCentre) {
    return NextResponse.json({ error: "Missing required fields: type, costCentre" }, { status: 400 })
  }

  try {
    const orderId = await createOrder(payload, profile.companyId)
    return NextResponse.json({ orderId }, { status: 201 })
  } catch (err) {
    if (err instanceof OdooError) {
      return NextResponse.json({ error: err.message }, { status: 502 })
    }
    console.error("[api/orders] POST", err)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
