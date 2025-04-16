import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  // Create a response object
  const res = NextResponse.next()

  // Instead of using createMiddlewareClient, we'll check for the auth cookie directly
  // This avoids the dependency on set-cookie-parser
  const hasSession =
    req.cookies.has("sb-auth-token") || req.cookies.has("supabase-auth-token") || req.cookies.has("sb:token")

  // If there's a session cookie, the user is likely logged in
  if (hasSession) {
    // User is authenticated, allow access
    return res
  }

  // For unauthenticated users, we'll handle access control in the component
  // This ensures we don't accidentally block authenticated users
  return res
}

// Remove the matcher to prevent the middleware from running on the settings page
export const config = {
  matcher: [], // Empty array means middleware won't run on any routes
}
