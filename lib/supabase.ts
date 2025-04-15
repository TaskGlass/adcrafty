import { createClient } from "@supabase/supabase-js"

// Check if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Create a simple Supabase client with minimal configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// For client-side only code
export function getClientSupabase() {
  if (typeof window === "undefined") {
    return supabase
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}
