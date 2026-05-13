// Server-side session helpers
// Reads and writes the httpOnly session cookie
// These functions only run on the server - never in the browser

import { cookies } from "next/headers"
import type { UserProfile } from "@/types/portal"

const SESSION_COOKIE = "odoo_session"
const PROFILE_COOKIE = "user_profile"

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 8, // 8 hours
}

// ---------------------------------------------------------------------------
// Session ID (Odoo session_id stored in httpOnly cookie)
// ---------------------------------------------------------------------------

export async function getSessionId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE)?.value ?? null
}

export async function setSessionId(sessionId: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, sessionId, COOKIE_OPTIONS)
}

export async function clearSessionId(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

// ---------------------------------------------------------------------------
// User profile (non-sensitive display data stored separately)
// ---------------------------------------------------------------------------

export async function getServerProfile(): Promise<UserProfile | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(PROFILE_COOKIE)?.value
  if (!raw) return null
  try {
    return JSON.parse(raw) as UserProfile
  } catch {
    return null
  }
}

export async function setServerProfile(profile: UserProfile): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(PROFILE_COOKIE, JSON.stringify(profile), {
    ...COOKIE_OPTIONS,
    httpOnly: false, // Profile is safe to read client-side for display purposes
  })
}

export async function clearServerProfile(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(PROFILE_COOKIE)
}

// ---------------------------------------------------------------------------
// Combined clear on logout
// ---------------------------------------------------------------------------

export async function clearAllSessionData(): Promise<void> {
  await clearSessionId()
  await clearServerProfile()
}
