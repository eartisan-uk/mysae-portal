import PageHeader from "@/components/shared/PageHeader"

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Welcome to the MySAE client portal."
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Stock", href: "/stock", description: "View and manage your inventory" },
          { label: "Orders", href: "/orders", description: "Track and create orders" },
          { label: "Transport", href: "/orders/new?type=transport", description: "Request a transport job" },
        ].map(({ label, href, description }) => (
          <a
            key={href}
            href={href}
            className="block p-6 bg-white rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all"
          >
            <p className="font-medium text-slate-900">{label}</p>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </a>
        ))}
      </div>
    </>
  )
}
