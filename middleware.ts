import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req: NextRequest) {
  // Create a response object
  const res = NextResponse.next()

  // Create the Supabase middleware client
  const supabase = createMiddlewareClient({ req, res })

  try {
    // Get the session with more robust error handling
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If there's a session, the user is logged in - allow access to all routes
    if (session) {
      // User is authenticated, always allow access
      return res
    }

    // For unauthenticated users, we'll handle access control in the component
    // This ensures we don't accidentally block authenticated users
    return res
  } catch (error) {
    console.error("Middleware - Error checking auth:", error)
    // If there's an error checking auth, still allow access
    return res
  }
}

// Remove the matcher to prevent the middleware from running on the settings page
export const config = {
  matcher: [], // Empty array means middleware won't run on any routes
}
