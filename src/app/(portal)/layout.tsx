import { redirect } from "next/navigation"
import { getServerProfile } from "@/lib/session"
import NavSidebar from "@/components/shared/NavSidebar"

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const profile = await getServerProfile()

  if (!profile) {
    redirect("/login")
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <NavSidebar profile={profile} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
