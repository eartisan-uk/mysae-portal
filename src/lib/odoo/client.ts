// Core JSON-RPC client for Odoo
// Handles both portal user sessions and service account credentials
// All Odoo communication passes through this module

import type { OdooJsonRpcResponse } from "@/types/odoo"

const ODOO_BASE_URL = process.env.ODOO_BASE_URL!
const ODOO_SERVICE_USER = process.env.ODOO_SERVICE_USER!
const ODOO_SERVICE_PASS = process.env.ODOO_SERVICE_PASS!

let requestId = 1

// Service account session cached in server memory
let serviceAccountSessionId: string | null = null
let serviceAccountUid: number | null = null

// ---------------------------------------------------------------------------
// Core JSON-RPC fetch
// ---------------------------------------------------------------------------

async function jsonRpc<T>(
  endpoint: string,
  params: Record<string, unknown>,
  sessionId?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (sessionId) {
    headers["Cookie"] = `session_id=${sessionId}`
  }

  const body = JSON.stringify({
    jsonrpc: "2.0",
    method: "call",
    id: requestId++,
    params,
  })

  const response = await fetch(`${ODOO_BASE_URL}${endpoint}`, {
    method: "POST",
    headers,
    body,
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Odoo HTTP error: ${response.status} ${response.statusText}`)
  }

  const json: OdooJsonRpcResponse<T> = await response.json()

  if (json.error) {
    throw new OdooError(json.error.data.message || json.error.message, json.error.code)
  }

  return json.result as T
}

// ---------------------------------------------------------------------------
// Web session calls (login, logout, authenticate)
// ---------------------------------------------------------------------------

export async function odooAuthenticate(
  login: string,
  password: string
): Promise<{ sessionId: string; uid: number; name: string; companyId: number; partnerId: number }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  const body = JSON.stringify({
    jsonrpc: "2.0",
    method: "call",
    id: requestId++,
    params: {
      db: process.env.ODOO_DB || "odoo",
      login,
      password,
    },
  })

  const response = await fetch(`${ODOO_BASE_URL}/web/session/authenticate`, {
    method: "POST",
    headers,
    body,
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Odoo HTTP error: ${response.status}`)
  }

  const json = await response.json()

  if (json.error || !json.result?.uid) {
    throw new OdooAuthError("Invalid credentials")
  }

  // Extract session_id from Set-Cookie header
  const setCookie = response.headers.get("set-cookie") || ""
  const sessionMatch = setCookie.match(/session_id=([^;]+)/)
  const sessionId = sessionMatch ? sessionMatch[1] : json.result.session_id

  if (!sessionId) {
    throw new OdooAuthError("No session ID returned from Odoo")
  }

  return {
    sessionId,
    uid: json.result.uid,
    name: json.result.name,
    companyId: Array.isArray(json.result.company_id) ? json.result.company_id[0] : json.result.company_id,
    partnerId: Array.isArray(json.result.partner_id) ? json.result.partner_id[0] : json.result.partner_id,
  }
}

export async function odooDestroySession(sessionId: string): Promise<void> {
  await fetch(`${ODOO_BASE_URL}/web/session/destroy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `session_id=${sessionId}`,
    },
    body: JSON.stringify({ jsonrpc: "2.0", method: "call", id: requestId++, params: {} }),
    cache: "no-store",
  })
}

// ---------------------------------------------------------------------------
// Service account session management
// ---------------------------------------------------------------------------

export async function getServiceAccountSession(): Promise<{ sessionId: string; uid: number }> {
  if (serviceAccountSessionId && serviceAccountUid) {
    return { sessionId: serviceAccountSessionId, uid: serviceAccountUid }
  }
  return refreshServiceAccountSession()
}

async function refreshServiceAccountSession(): Promise<{ sessionId: string; uid: number }> {
  const result = await odooAuthenticate(ODOO_SERVICE_USER, ODOO_SERVICE_PASS)
  serviceAccountSessionId = result.sessionId
  serviceAccountUid = result.uid
  return { sessionId: result.sessionId, uid: result.uid }
}

// ---------------------------------------------------------------------------
// Model read/write helpers
// ---------------------------------------------------------------------------

export async function odooSearchRead<T>(
  model: string,
  domain: unknown[][],
  fields: string[],
  sessionId: string,
  options?: { limit?: number; offset?: number; order?: string }
): Promise<T[]> {
  return jsonRpc<T[]>(
    "/web/dataset/call_kw",
    {
      model,
      method: "search_read",
      args: [domain],
      kwargs: {
        fields,
        limit: options?.limit ?? 100,
        offset: options?.offset ?? 0,
        order: options?.order,
      },
    },
    sessionId
  )
}

export async function odooCreate(
  model: string,
  values: Record<string, unknown>,
  sessionId: string
): Promise<number> {
  return jsonRpc<number>(
    "/web/dataset/call_kw",
    {
      model,
      method: "create",
      args: [values],
      kwargs: {},
    },
    sessionId
  )
}

export async function odooWrite(
  model: string,
  ids: number[],
  values: Record<string, unknown>,
  sessionId: string
): Promise<boolean> {
  return jsonRpc<boolean>(
    "/web/dataset/call_kw",
    {
      model,
      method: "write",
      args: [ids, values],
      kwargs: {},
    },
    sessionId
  )
}

export async function odooCallMethod(
  model: string,
  method: string,
  ids: number[],
  sessionId: string,
  kwargs?: Record<string, unknown>
): Promise<unknown> {
  return jsonRpc<unknown>(
    "/web/dataset/call_kw",
    {
      model,
      method,
      args: [ids],
      kwargs: kwargs ?? {},
    },
    sessionId
  )
}

// For @api.model methods that take positional args, not record IDs
export async function odooCallModelMethod(
  model: string,
  method: string,
  args: unknown[],
  sessionId: string,
  kwargs?: Record<string, unknown>
): Promise<unknown> {
  return jsonRpc<unknown>(
    "/web/dataset/call_kw",
    {
      model,
      method,
      args,
      kwargs: kwargs ?? {},
    },
    sessionId
  )
}

// ---------------------------------------------------------------------------
// Service account write wrapper with auto-retry on session expiry
// ---------------------------------------------------------------------------

export async function serviceAccountWrite<T>(
  fn: (sessionId: string) => Promise<T>
): Promise<T> {
  const { sessionId } = await getServiceAccountSession()
  try {
    return await fn(sessionId)
  } catch (err) {
    if (err instanceof OdooError && err.code === 100) {
      // Session expired - refresh and retry once
      serviceAccountSessionId = null
      serviceAccountUid = null
      const refreshed = await refreshServiceAccountSession()
      return fn(refreshed.sessionId)
    }
    throw err
  }
}

// ---------------------------------------------------------------------------
// Custom error classes
// ---------------------------------------------------------------------------

export class OdooError extends Error {
  constructor(message: string, public code?: number) {
    super(message)
    this.name = "OdooError"
  }
}

export class OdooAuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "OdooAuthError"
  }
}
