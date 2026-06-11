import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getSessionId, getServerProfile } from "@/lib/session"
import { getOrders } from "@/lib/odoo/orders"
import { OdooError } from "@/lib/odoo/client"
import PageHeader from "@/components/shared/PageHeader"
import OrdersTable from "@/components/orders/OrdersTable"

export const metadata: Metadata = { title: "Orders" }

export default async function OrdersPage() {
  const sessionId = await getSessionId()
  if (!sessionId) redirect("/login")

  const profile = await getServerProfile()
  if (!profile) redirect("/login")

  let orders: Awaited<ReturnType<typeof getOrders>> = []
  let error: string | null = null

  try {
    orders = await getOrders(profile.parentPartnerId)
  } catch (err) {
    if (err instanceof OdooError) {
      error = err.message
    } else {
      console.error("[orders/page]", err)
      error = "Could not load orders. Please try again."
    }
  }

  return (
    <>
      <PageHeader
        title="Orders"
        description={error ? undefined : `${orders.length} orders`}
      />
      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <OrdersTable orders={orders} />
      )}
    </>
  )
}
