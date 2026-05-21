import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSessionId } from "@/lib/session"
import { getStockProduct, updateProductImage, updateProductDimensions } from "@/lib/odoo/stock"
import { OdooError } from "@/lib/odoo/client"

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/stock/[id]">) {
  const sessionId = await getSessionId()

  if (!sessionId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { id } = await ctx.params
  const productId = parseInt(id, 10)

  if (isNaN(productId)) {
    return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
  }

  try {
    const product = await getStockProduct(productId)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }
    return NextResponse.json({ product })
  } catch (err) {
    if (err instanceof OdooError) {
      return NextResponse.json({ error: err.message }, { status: 502 })
    }
    console.error("[api/stock/[id]] GET", err)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/stock/[id]">) {
  const sessionId = await getSessionId()

  if (!sessionId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { id } = await ctx.params
  const productId = parseInt(id, 10)

  if (isNaN(productId)) {
    return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  try {
    if (typeof body.imageBase64 === "string") {
      await updateProductImage(productId, body.imageBase64)
    }

    if (body.dimensions && typeof body.dimensions === "object") {
      const dims = body.dimensions as Record<string, unknown>
      await updateProductDimensions(productId, {
        weight: typeof dims.weight === "number" ? dims.weight : undefined,
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof OdooError) {
      return NextResponse.json({ error: err.message }, { status: 502 })
    }
    console.error("[api/stock/[id]] PATCH", err)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}
