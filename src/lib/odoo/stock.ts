import { odooSearchRead, odooWrite, serviceAccountWrite } from "@/lib/odoo/client"

async function serviceAccountRead<T>(fn: (sessionId: string) => Promise<T>): Promise<T> {
  return serviceAccountWrite(fn)
}
import type { OdooProductTemplate } from "@/types/odoo"
import type { StockProduct } from "@/types/portal"

type OdooProductDetail = OdooProductTemplate & {
  image_1920: string | false
  weight: number
  volume: number
}

const LIST_FIELDS = ["id", "name", "default_code", "categ_id", "qty_available"]
const DETAIL_FIELDS = [...LIST_FIELDS, "image_1920", "weight", "volume"]

function shapeProduct(raw: OdooProductTemplate, imageBase64?: string | false): StockProduct {
  return {
    id: raw.id,
    name: raw.name,
    code: raw.default_code || null,
    imageUrl: imageBase64 ? `data:image/png;base64,${imageBase64}` : null,
    category: Array.isArray(raw.categ_id) ? raw.categ_id[1] : "",
    onHand: raw.qty_available,
  }
}

// TODO: filter by user warehouseId once field name confirmed (Open Items §11.1)
// Uses service account — portal users lack stock.move read access needed by
// Odoo's qty_available compute method.
export async function getStockProducts(): Promise<StockProduct[]> {
  return serviceAccountRead(async (sessionId) => {
    const raw = await odooSearchRead<OdooProductTemplate>(
      "product.template",
      [["sale_ok", "=", true], ["active", "=", true]],
      LIST_FIELDS,
      sessionId,
      { order: "name asc", limit: 500 }
    )
    return raw.map(p => shapeProduct(p))
  })
}

export async function getStockProduct(id: number): Promise<StockProduct | null> {
  return serviceAccountRead(async (sessionId) => {
    const raw = await odooSearchRead<OdooProductDetail>(
      "product.template",
      [["id", "=", id]],
      DETAIL_FIELDS,
      sessionId
    )
    if (!raw.length) return null
    return shapeProduct(raw[0], raw[0].image_1920)
  })
}

export async function updateProductImage(
  id: number,
  imageBase64: string
): Promise<void> {
  await serviceAccountWrite(sessionId =>
    odooWrite("product.template", [id], { image_1920: imageBase64 }, sessionId)
  )
}

export type DimensionUpdate = {
  weight?: number
  // TODO: confirm L/W/H field names with Odoo developer (Open Items §11.1)
  // lengthCm?: number
  // widthCm?: number
  // heightCm?: number
}

export async function updateProductDimensions(
  id: number,
  values: DimensionUpdate
): Promise<void> {
  const odooValues: Record<string, unknown> = {}
  if (values.weight !== undefined) odooValues.weight = values.weight

  if (!Object.keys(odooValues).length) return

  await serviceAccountWrite(sessionId =>
    odooWrite("product.template", [id], odooValues, sessionId)
  )
}
