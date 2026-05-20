import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getSessionId } from "@/lib/session"
import PageHeader from "@/components/shared/PageHeader"

export const metadata: Metadata = { title: "Reports" }

export default async function ReportsPage() {
  const sessionId = await getSessionId()
  if (!sessionId) redirect("/login")

  return (
    <>
      <PageHeader title="Reports" description="Analytics and reports" />
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Reports coming soon.
      </div>
    </>
  )
}
