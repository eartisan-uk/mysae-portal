import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getServerProfile } from "@/lib/session"
import { getStockProducts } from "@/lib/odoo/stock"
import PageHeader from "@/components/shared/PageHeader"
import StockTable from "@/components/stock/StockTable"

export const metadata: Metadata = { title: "Stock" }

export default async function StockPage() {
  const profile = await getServerProfile()
  if (!profile) redirect("/login")

  let products: Awaited<ReturnType<typeof getStockProducts>> = []
  let error: string | null = null

  try {
    products = await getStockProducts(profile.parentPartnerId)
  } catch (err) {
    console.error("[stock/page]", err)
    error = "Could not load stock data. Please try again."
  }

  return (
    <>
      <PageHeader
        title="Stock"
        description={error ? undefined : `${products.length} products`}
      />
      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <StockTable products={products} />
      )}
    </>
  )
}
