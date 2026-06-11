"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Package, ClipboardList, Truck, LogOut, CircleUser, Newspaper, Files } from "lucide-react"
import type { UserProfile } from "@/types/portal"
import { cn } from "@/lib/utils"
import ThemeToggle from "@/components/shared/ThemeToggle"

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Orders", href: "/orders", icon: ClipboardList },
  { label: "Stock", href: "/stock", icon: Package },
  { label: "Transport", href: "/orders/new?type=transport", icon: Truck },
  { label: "News & Updates", href: "/news", icon: Newspaper },
  { label: "Reports", href: "/reports", icon: Files },
  { label: "My Profile", href: "/profile", icon: CircleUser },
]

export default function NavSidebar({ profile }: { profile: UserProfile }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  return (
    <aside className="flex flex-col w-64 shrink-0 h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="px-6 py-4 border-b border-sidebar-border">
        <span className="text-base font-semibold tracking-tight">MySAE</span>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(href.split("?")[0])
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-3 border-t border-sidebar-border space-y-0.5">
        <div className="mb-2 px-3">
          <p className="text-sm font-medium text-sidebar-foreground truncate">{profile.name}</p>
          <p className="text-xs text-sidebar-foreground/60 truncate">{profile.companyName}</p>
        </div>
        <ThemeToggle />
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-sidebar-foreground/60 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent rounded-md transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
