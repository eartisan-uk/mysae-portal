import type { Metadata } from "next"
import { LoginForm } from "@/components/auth/LoginForm"

export const metadata: Metadata = { title: "Login" }

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-muted/40 px-4">
      <div className="flex flex-col items-center gap-8 w-full max-w-sm">
        <div className="flex flex-col items-center gap-2">
          <div className="text-3xl font-bold tracking-tight">
            <span className="text-green-500 italic">My</span>
            <span className="text-[#1e2a5e]">SAE</span>
          </div>
          <p className="text-sm text-muted-foreground">Client Portal</p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
