# MySAE Claude Code Context Document

This document summarises the project setup decisions and foundation layer files already created
for the MySAE Client Portal. Use this alongside `requirement-specification.md` as context when
continuing the build in Claude Code.

---

## Technology Decisions

- **Framework:** Next.js (React) with App Router and TypeScript
- **Styling:** Tailwind CSS
- **Components:** Shadcn/ui (initialised with Default style, Slate base colour)
- **Forms:** React Hook Form with Zod validation
- **Maps:** Google Maps Places API via `@googlemaps/js-api-loader`
- **Architecture:** Three-tier headless proxy. Browser never talks to Odoo directly.
- **Backend:** Odoo v18 Community Edition via JSON-RPC (primary) and limited REST

---

## Project Structure

```
mysae/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── (portal)/
│   │   │   ├── layout.tsx              # Protected layout with nav
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── stock/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   └── orders/
│   │   │       ├── page.tsx
│   │   │       ├── new/
│   │   │       │   └── page.tsx
│   │   │       └── [id]/
│   │   │           └── page.tsx
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── login/route.ts
│   │       │   ├── logout/route.ts
│   │       │   └── me/route.ts
│   │       ├── stock/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       └── orders/
│   │           ├── route.ts
│   │           ├── draft/route.ts
│   │           └── [id]/route.ts
│   ├── components/
│   │   ├── ui/                         # Shadcn components (auto-generated)
│   │   ├── auth/
│   │   │   └── LoginForm.tsx
│   │   ├── stock/
│   │   │   ├── StockTable.tsx
│   │   │   └── ItemPickerDialog.tsx
│   │   ├── orders/
│   │   │   ├── OrderTabs.tsx
│   │   │   ├── OrderForm.tsx
│   │   │   └── OrderStatusBadge.tsx
│   │   └── shared/
│   │       ├── AddressAutocomplete.tsx
│   │       └── PageHeader.tsx
│   ├── lib/
│   │   ├── odoo/
│   │   │   ├── client.ts               # JSON-RPC wrapper and service account session
│   │   │   ├── auth.ts
│   │   │   ├── stock.ts
│   │   │   └── orders.ts
│   │   ├── session.ts                  # httpOnly cookie helpers
│   │   └── utils.ts                    # Shadcn cn() utility
│   ├── types/
│   │   ├── odoo.ts                     # Raw Odoo response shapes
│   │   └── portal.ts                   # Shaped portal-facing types
│   └── middleware.ts                   # Route protection
├── .env.local                          # Never committed to Git
├── .env.example                        # Committed as a reference template
└── next.config.ts
```

---

## Environment Variables

Required in `.env.local`:

```env
ODOO_BASE_URL=https://staging.mysae.net
ODOO_DB=odoo
ODOO_SERVICE_USER=service@mysae.net
ODOO_SERVICE_PASS=your_service_password
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

`NEXT_PUBLIC_` prefix exposes the Maps key to the browser. All Odoo credentials are server-side only.

---

## Foundation Layer Files Already Created

The following files have been created and are in place.

### `src/types/odoo.ts`
Raw response shapes mirroring Odoo's internal data model. Covers:
`OdooSessionResponse`, `OdooUser`, `OdooPartner`, `OdooProductTemplate`,
`OdooStockQuant`, `OdooSaleOrder`, `OdooStockPicking`, `OdooJsonRpcError`,
`OdooJsonRpcResponse`.

### `src/types/portal.ts`
Clean portal-facing types returned by the proxy to the React frontend. Covers:
`UserProfile`, `StockProduct`, `OrderType`, `OrderStatus`, `OrderView`,
`OrderAddress`, `OrderLine`, `Order`, `OrderSummary`, `ExportInfo`,
`TransportDetails`, `CreateGoodsOrderPayload`, `CreateTransportOrderPayload`,
`CreateOrderPayload`, `ApiResponse`.

### `src/lib/odoo/client.ts`
Core JSON-RPC client. Key responsibilities:
- `odooAuthenticate(login, password)` - authenticates against `/web/session/authenticate`
- `odooDestroySession(sessionId)` - destroys Odoo session on logout
- `getServiceAccountSession()` - returns cached service account session, refreshes if expired
- `odooSearchRead(model, domain, fields, sessionId, options)` - read operations
- `odooCreate(model, values, sessionId)` - create records
- `odooWrite(model, ids, values, sessionId)` - update records
- `odooCallMethod(model, method, ids, sessionId, kwargs)` - call arbitrary model methods
- `serviceAccountWrite(fn)` - wraps any write operation with auto-retry on session expiry
- Custom error classes: `OdooError`, `OdooAuthError`

### `src/lib/session.ts`
Server-side httpOnly cookie helpers (Next.js `cookies()` API):
- `getSessionId()` / `setSessionId()` / `clearSessionId()` - Odoo session cookie
- `getServerProfile()` / `setServerProfile()` / `clearServerProfile()` - user profile cookie (readable client-side for display)
- `clearAllSessionData()` - clears both cookies on logout

### `src/app/api/auth/login/route.ts`
POST handler. Authenticates via `odooAuthenticate`, fetches `res.users` record,
builds a `UserProfile`, sets the httpOnly session cookie and profile cookie,
returns safe profile to the browser.

Note: `warehouseId` is currently set to `null` pending confirmation of the
Odoo field name from the Odoo developer (see Open Items section below).

### `src/app/api/auth/logout/route.ts`
POST handler. Calls `odooDestroySession`, clears all session cookies,
returns success regardless of whether the Odoo call succeeds.

### `src/app/api/auth/me/route.ts`
GET handler. Reads session cookie and returns the cached user profile.
Returns 401 if no session or profile found.

### `src/components/auth/LoginForm.tsx`
Client component. React Hook Form with Zod schema validation (`email` + `password`).
POSTs to `/api/auth/login`, redirects to `/dashboard` on success,
displays server error message on failure.

### `src/app/(auth)/login/page.tsx`
Login page. Uses the `(auth)` route group to sit outside the protected portal layout.
Renders the MySAE wordmark and `LoginForm` component.

---

## Middleware

`src/middleware.ts` is in place and handles route protection:
- Redirects unauthenticated requests to `/login`
- Redirects authenticated users away from `/login` to `/dashboard`
- Excludes API routes, static assets, and images from the matcher

---

## Two Credential Contexts

This is a core architectural principle. All proxy routes follow this rule:

| Operation | Credential used |
| --- | --- |
| Read (GET) | Portal user's Odoo session (scopes data to their company automatically) |
| Write (POST, PATCH) | Service account (proxy must explicitly pass company ID and warehouse ID) |

---

## Recommended Build Order for Remaining Phase 1 Work

1. `src/lib/odoo/stock.ts` - product and stock query functions
2. `src/app/api/stock/route.ts` and `src/app/api/stock/[id]/route.ts`
3. `src/(portal)/layout.tsx` - protected layout shell with navigation
4. `src/(portal)/dashboard/page.tsx` - placeholder dashboard
5. `src/(portal)/stock/page.tsx` - stock listing with StockTable component
6. `src/lib/odoo/orders.ts` - order read/write functions
7. `src/app/api/orders/route.ts` - order listing
8. `src/app/api/orders/[id]/route.ts` - order detail
9. `src/app/api/orders/route.ts` POST handler - order creation (dual write)
10. `src/app/api/orders/draft/route.ts` - draft saving
11. Goods Out order form
12. Goods In order form
13. Transport order form
14. Order detail view

---

## Open Items Requiring Odoo Developer Input

These are blockers or near-blockers for integration. Refer to Section 11 of the
Technical Specification for full detail.

| Item | Impact |
| --- | --- |
| Exact API field name for `order_type` on `sale.order` | Required before any order creation |
| Field name for client warehouse on `res.users` | `warehouseId` is currently `null` in user profile |
| Technical name of `cost_centre` on `sale.order` | Required for order forms |
| Minimum permission set for service account | Required before write routes can be tested |
| Confirm whether portal users can create draft `sale.order` records | Affects whether service account is needed for all writes |
| Rollback method for failed dual write (cancel a confirmed `sale.order`) | Required before order creation route goes live |
| Whether Goods In uses same stock query as Goods Out for item picker | Affects `lib/odoo/stock.ts` implementation |
| Mapping of client company IDs to warehouse IDs and location IDs | Required for integration testing |
