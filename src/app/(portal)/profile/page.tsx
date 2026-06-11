import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getServerProfile } from "@/lib/session"
import PageHeader from "@/components/shared/PageHeader"
import ChangePasswordForm from "@/components/profile/ChangePasswordForm"

export const metadata: Metadata = { title: "Profile" }

export default async function ProfilePage() {
  const profile = await getServerProfile()
  if (!profile) redirect("/login")

  return (
    <>
      <PageHeader title="My Profile" />

      <div className="space-y-8 max-w-2xl">

        {/* Profile Details */}
        <section className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">Profile Details</h2>
          <dl className="space-y-3">
            {[
              { label: "Full name",   value: profile.name },
              { label: "Email",       value: profile.email },
              { label: "Company",     value: profile.companyName },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center gap-4">
                <dt className="w-32 shrink-0 text-xs text-muted-foreground">{label}</dt>
                <dd className="text-sm text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs text-muted-foreground">
            To update your name or email, contact your SAE account manager.
          </p>
        </section>

        {/* Connection & Security */}
        <section className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-sm font-semibold text-foreground mb-1">Connection &amp; Security</h2>
          <p className="text-xs text-muted-foreground mb-6">Manage your password and account security.</p>

          <h3 className="text-xs font-medium text-foreground mb-3">Change password</h3>
          <ChangePasswordForm />
        </section>

        {/* Delete Account — disabled */}
        <section className="bg-card rounded-lg border border-destructive/20 p-6 opacity-60">
          <h2 className="text-sm font-semibold text-foreground mb-1">Delete Account</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Account deletion must be requested through your SAE account manager.
            Self-service deletion is not available on this portal.
          </p>
          <button
            disabled
            className="px-3 py-1.5 text-xs font-medium text-destructive border border-destructive/30 rounded-md cursor-not-allowed"
          >
            Delete my account
          </button>
        </section>

      </div>
    </>
  )
}
