import { createClient } from "@supabase/supabase-js"

// Check if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL and anon key are required. Please make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables are set.",
  )
}

// Create a simple Supabase client with minimal configuration
// This avoids any issues with browser-specific APIs during SSR
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// For client-side only code, you can use this function to get a client
// that uses sessionStorage for persistence
export function getClientSupabase() {
  if (typeof window === "undefined") {
    return supabase
  }

  // Only create this client in the browser
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: "adcreatify_auth_token",
      // Only set custom storage in the browser
      storage: typeof window !== "undefined" ? sessionStorage : undefined,
    },
  })
}
