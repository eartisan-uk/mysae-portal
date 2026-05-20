import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getSessionId } from "@/lib/session"
import PageHeader from "@/components/shared/PageHeader"

export const metadata: Metadata = { title: "Orders" }

export default async function OrdersPage() {
  const sessionId = await getSessionId()
  if (!sessionId) redirect("/login")

  return (
    <>
      <PageHeader title="Orders" description="Your order history" />
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Orders coming soon.
      </div>
    </>
  )
}
