// Raw response shapes from Odoo JSON-RPC
// These reflect Odoo's internal data model before proxy shaping

export interface OdooSessionResponse {
  uid: number
  name: string
  company_id: [number, string]
  partner_id: [number, string]
  session_id: string
}

export interface OdooUser {
  id: number
  name: string
  login: string
  company_id: [number, string]
  partner_id: [number, string]
  parent_id: [number, string] | false
}

export interface OdooPartner {
  id: number
  name: string
  street: string | false
  city: string | false
  zip: string | false
  country_id: [number, string] | false
  phone: string | false
  email: string | false
  company_id: [number, string] | false
}

export interface OdooProductTemplate {
  id: number
  name: string
  default_code: string | false
  image_1920: string | false
  categ_id: [number, string]
  qty_available: number
}

export interface OdooStockQuant {
  id: number
  product_id: [number, string]
  location_id: [number, string]
  quantity: number
  reserved_quantity: number
}

export interface OdooSaleOrder {
  id: number
  name: string
  state: "draft" | "sent" | "sale" | "done" | "cancel"
  partner_id: [number, string]
  date_order: string
  commitment_date: string | false
  note: string | false
}

export interface OdooStockPicking {
  id: number
  name: string
  state: "draft" | "waiting" | "confirmed" | "assigned" | "done" | "cancel"
  origin: string | false
  scheduled_date: string | false
  location_id: [number, string]
  location_dest_id: [number, string]
}

export interface OdooJsonRpcError {
  code: number
  message: string
  data: {
    name: string
    debug: string
    message: string
    arguments: string[]
  }
}

export interface OdooJsonRpcResponse<T = unknown> {
  jsonrpc: "2.0"
  id: number | null
  result?: T
  error?: OdooJsonRpcError
}

export interface OdooBlogPost {
  id: number
  name: string
  subtitle: string | false
  teaser: string | false
  post_date: string
  website_published: boolean
  website_url: string
  author_id: [number, string] | false
  blog_id: [number, string]
}
