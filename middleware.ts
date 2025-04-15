import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Get the pathname from the URL
  const { pathname } = req.nextUrl

  // If user is logged in, allow access to all routes
  if (session) {
    return res
  }

  // If user is not logged in and trying to access settings, redirect to login
  if (pathname === "/dashboard/settings") {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/login"
    redirectUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // For all other routes, allow access
  return res
}

export const config = {
  matcher: ["/dashboard/settings"],
}
