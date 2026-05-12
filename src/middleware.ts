import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const session = request.cookies.get("odoo_session")
  const isAuthRoute = request.nextUrl.pathname.startsWith("/login")

  if (!session && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}