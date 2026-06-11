import { NextResponse } from "next/server"
import { getServerProfile } from "@/lib/session"
import { getStockProducts } from "@/lib/odoo/stock"
import { OdooError } from "@/lib/odoo/client"

export async function GET() {
  const profile = await getServerProfile()

  if (!profile) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const products = await getStockProducts(profile.parentPartnerId)
    return NextResponse.json({ products })
  } catch (err) {
    if (err instanceof OdooError) {
      return NextResponse.json({ error: err.message }, { status: 502 })
    }
    console.error("[api/stock]", err)
    return NextResponse.json({ error: "Failed to fetch stock" }, { status: 500 })
  }
}
