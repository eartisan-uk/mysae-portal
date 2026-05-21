// Shaped types returned by the proxy to the React frontend
// These are clean, flat objects with no Odoo internals exposed

export interface UserProfile {
  uid: number
  name: string
  email: string
  companyId: number
  companyName: string
  partnerId: number
  parentPartnerId: number
  warehouseId: number | null
}

export interface StockProduct {
  id: number
  name: string
  code: string | null
  imageUrl: string | null
  category: string
  onHand: number
}

export type OrderType = "goods-out" | "goods-in" | "transport"
export type OrderStatus = "draft" | "active" | "done" | "cancelled"
export type OrderView = "my" | "company"

export interface OrderAddress {
  street: string
  city: string
  postcode: string
  country: string
}

export interface OrderLine {
  productId: number
  productName: string
  productCode: string | null
  quantity: number
}

export interface Order {
  id: number
  reference: string
  type: OrderType
  status: OrderStatus
  createdBy: string
  createdAt: string
  collectDate: string | null
  deliverDate: string | null
  collectionAddress: OrderAddress | null
  deliveryAddress: OrderAddress | null
  collectionNote: string | null
  deliveryNote: string | null
  lines: OrderLine[]
  costCentre: string | null
}

export interface OrderSummary {
  id: number
  reference: string
  type: OrderType
  status: OrderStatus
  createdBy: string
  createdAt: string
  collectDate: string | null
  deliverDate: string | null
}

// Export information for international Goods Out orders
export interface ExportInfo {
  consigneeEori: string
  consigneeVat: string
  exportReason: string
  exportTerms: string
}

// Transport order specific fields
export interface TransportDetails {
  quantity: number
  description: string
  dimensionDetails: string
  totalWeight: number
}

// Order creation payloads sent from the browser to the proxy
export interface CreateGoodsOrderPayload {
  type: "goods-out" | "goods-in"
  costCentre: string
  collectDate: string
  deliverDate: string
  collectionAddress: OrderAddress
  deliveryAddress: OrderAddress
  collectionNote: string
  deliveryNote: string
  lines: { productId: number; quantity: number }[]
  exportInfo?: ExportInfo
  isDraft: boolean
}

export interface CreateTransportOrderPayload {
  type: "transport"
  costCentre: string
  collectDate: string
  deliverDate: string
  collectionAddress: OrderAddress
  deliveryAddress: OrderAddress
  collectionNote: string
  deliveryNote: string
  transport: TransportDetails
  exportInfo?: ExportInfo
  isDraft: boolean
}

export type CreateOrderPayload = CreateGoodsOrderPayload | CreateTransportOrderPayload

// API response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export interface BlogPost {
  id: number
  title: string
  subtitle: string | null
  excerpt: string | null
  publishedAt: string
  externalUrl: string
  authorName: string | null
  blogName: string
}
