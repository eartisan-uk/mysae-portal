import {
  odooSearchRead,
  odooCreate,
  odooCallMethod,
  serviceAccountWrite,
  OdooError,
} from "@/lib/odoo/client"
import type { OdooSaleOrder } from "@/types/odoo"
import type {
  Order,
  OrderSummary,
  OrderLine,
  OrderStatus,
  OrderType,
  CreateOrderPayload,
  CreateGoodsOrderPayload,
} from "@/types/portal"

// ---------------------------------------------------------------------------
// TODO: Replace these constants once questionnaire §2 is returned by Odoo dev
// ---------------------------------------------------------------------------
const F_ORDER_TYPE   = "sale_order_template_id" // §2.1 — many2one to sale.order.template
const F_COST_CENTRE  = "x_cost_centre"         // §2.2
const F_COLLECT_DATE = "x_collect_date"        // §2.3
const F_DELIVER_DATE = "commitment_date"       // §2.4 — likely standard field
const F_COLLECT_ADDR = "x_collection_address" // §2.5
const F_DELIVER_ADDR = "x_delivery_address"   // §2.6
const F_COLLECT_NOTE = "x_collection_note"    // §2.7
const F_DELIVER_NOTE = "note"                 // §2.8 — likely standard field

const ORDER_TYPE_VALUES: Record<OrderType, string> = {
  "goods-out": "goods_out",
  "goods-in":  "goods_in",
  "transport": "transport",
}

// TODO: confirm cancel method name (§6.3) — "action_cancel" is standard Odoo
const METHOD_CONFIRM = "action_confirm"
const METHOD_CANCEL  = "action_cancel"

// ---------------------------------------------------------------------------
// Extended raw type — TBD fields typed loosely until confirmed
// ---------------------------------------------------------------------------
type OdooOrderRaw = OdooSaleOrder & {
  create_uid: [number, string] | false
  [F_ORDER_TYPE]: [number, string] | false
  [F_COST_CENTRE]: string | false
  [F_COLLECT_DATE]: string | false
  [F_DELIVER_DATE]: string | false
  [F_COLLECT_ADDR]: string | false
  [F_DELIVER_ADDR]: string | false
  [F_COLLECT_NOTE]: string | false
  [F_DELIVER_NOTE]: string | false
}

type OdooOrderLine = {
  id: number
  product_id: [number, string] | false
  product_uom_qty: number
  name: string
}

// ---------------------------------------------------------------------------
// Mapping helpers
// ---------------------------------------------------------------------------
function mapStatus(state: OdooSaleOrder["state"]): OrderStatus {
  switch (state) {
    case "draft":          return "draft"
    case "sent":
    case "sale":           return "active"
    case "done":           return "done"
    case "cancel":         return "cancelled"
  }
}

function mapOrderType(raw: [number, string] | false): OrderType {
  if (!raw) return "goods-out"
  const name = raw[1].toLowerCase()
  if (name.includes("out"))       return "goods-out"
  if (name.includes("in"))        return "goods-in"
  if (name.includes("transport")) return "transport"
  return "goods-out"
}

function str(val: string | false | undefined | null): string | null {
  return val || null
}

// Only confirmed standard fields — x_* fields added once Odoo dev confirms names (§2)
const SUMMARY_FIELDS = [
  "id", "name", "state", "date_order", "create_uid",
  "partner_id", F_DELIVER_DATE, F_ORDER_TYPE,
]

const DETAIL_FIELDS = [
  ...SUMMARY_FIELDS,
  F_DELIVER_NOTE,
  // F_ORDER_TYPE, F_COST_CENTRE, F_COLLECT_DATE, F_COLLECT_ADDR, F_DELIVER_ADDR, F_COLLECT_NOTE — pending §2
]

function shapeOrderSummary(raw: OdooOrderRaw): OrderSummary {
  return {
    id:          raw.id,
    reference:   raw.name,
    type:        mapOrderType(raw[F_ORDER_TYPE]),  // defaults "goods-out" until §2.1 confirmed
    status:      mapStatus(raw.state),
    createdBy:   Array.isArray(raw.create_uid) ? raw.create_uid[1] : "",
    createdAt:   raw.date_order,
    collectDate: null,                             // pending §2.3
    deliverDate: str(raw[F_DELIVER_DATE]),
  }
}

function shapeLine(raw: OdooOrderLine): OrderLine {
  return {
    productId:   Array.isArray(raw.product_id) ? raw.product_id[0] : 0,
    productName: Array.isArray(raw.product_id) ? raw.product_id[1] : raw.name,
    productCode: null,
    quantity:    raw.product_uom_qty,
  }
}

function shapeOrder(raw: OdooOrderRaw, lines: OdooOrderLine[]): Order {
  return {
    ...shapeOrderSummary(raw),
    collectionAddress: null,           // pending §2.5
    deliveryAddress:   null,           // pending §2.6
    collectionNote:    null,           // pending §2.7
    deliveryNote:      str(raw[F_DELIVER_NOTE]),
    costCentre:        null,           // pending §2.2
    lines:             lines.map(shapeLine),
  }
}

// ---------------------------------------------------------------------------
// Public query functions (service account — portal users lack sale.order ACL)
// Scoped to the user's company via partner_id domain.
// ---------------------------------------------------------------------------

function companyDomain(parentPartnerId: number): unknown[] {
  return ["|", ["partner_id", "=", parentPartnerId], ["partner_id.parent_id", "=", parentPartnerId]]
}

export async function getOrders(parentPartnerId: number): Promise<OrderSummary[]> {
  return serviceAccountWrite(async (sessionId) => {
    const raw = await odooSearchRead<OdooOrderRaw>(
      "sale.order",
      companyDomain(parentPartnerId),
      SUMMARY_FIELDS,
      sessionId,
      { order: "date_order desc", limit: 200 }
    )
    return raw.map(shapeOrderSummary)
  })
}

export async function getOrder(id: number, parentPartnerId: number): Promise<Order | null> {
  return serviceAccountWrite(async (sessionId) => {
    const domain = [["id", "=", id], ...companyDomain(parentPartnerId)]
    const [raw] = await odooSearchRead<OdooOrderRaw>("sale.order", domain, DETAIL_FIELDS, sessionId)
    if (!raw) return null

    const lines = await odooSearchRead<OdooOrderLine>(
      "sale.order.line",
      [["order_id", "=", id]],
      ["id", "product_id", "product_uom_qty", "name"],
      sessionId
    )

    return shapeOrder(raw, lines)
  })
}

// ---------------------------------------------------------------------------
// Public write functions (service account — called from API routes)
// ---------------------------------------------------------------------------

function buildOrderValues(
  payload: CreateOrderPayload,
  companyId: number
): Record<string, unknown> {
  const isGoods = payload.type === "goods-out" || payload.type === "goods-in"
  const g = payload as CreateGoodsOrderPayload

  return {
    company_id:        companyId,
    [F_ORDER_TYPE]:    ORDER_TYPE_VALUES[payload.type],
    [F_COST_CENTRE]:   payload.costCentre,
    [F_COLLECT_DATE]:  payload.collectDate || false,
    [F_DELIVER_DATE]:  payload.deliverDate || false,
    [F_COLLECT_NOTE]:  payload.collectionNote || false,
    [F_DELIVER_NOTE]:  payload.deliveryNote || false,
    // TODO: map OrderAddress → Odoo address fields once §2.5/2.6 confirmed
    // [F_COLLECT_ADDR]: serializeAddress(payload.collectionAddress),
    // [F_DELIVER_ADDR]: serializeAddress(payload.deliveryAddress),
    ...(isGoods && g.exportInfo ? {
      // TODO: map exportInfo fields once §3.1–3.4 confirmed
    } : {}),
  }
}

export async function createOrder(
  payload: CreateOrderPayload,
  companyId: number
): Promise<number> {
  const isGoods = "lines" in payload
  const values = buildOrderValues(payload, companyId)

  const orderId = await serviceAccountWrite(sessionId =>
    odooCreate("sale.order", values, sessionId)
  )

  if (isGoods) {
    const g = payload as CreateGoodsOrderPayload
    try {
      for (const line of g.lines) {
        await serviceAccountWrite(sessionId =>
          odooCreate(
            "sale.order.line",
            { order_id: orderId, product_id: line.productId, product_uom_qty: line.quantity },
            sessionId
          )
        )
      }
    } catch (err) {
      // Rollback: cancel the header order so Odoo is not left with a partial record
      try {
        await serviceAccountWrite(sessionId =>
          odooCallMethod("sale.order", METHOD_CANCEL, [orderId], sessionId)
        )
      } catch (rollbackErr) {
        console.error("[orders] rollback failed for order", orderId, rollbackErr)
      }
      throw new OdooError(`Line creation failed for order ${orderId}: ${(err as Error).message}`)
    }
  }

  if (!payload.isDraft) {
    await serviceAccountWrite(sessionId =>
      odooCallMethod("sale.order", METHOD_CONFIRM, [orderId], sessionId)
    )
  }

  return orderId
}

export async function saveDraftOrder(
  payload: CreateOrderPayload,
  companyId: number
): Promise<number> {
  return createOrder({ ...payload, isDraft: true }, companyId)
}
