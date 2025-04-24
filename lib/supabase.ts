import { createClient } from "@supabase/supabase-js"

// Check if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Log environment variable status for debugging
if (!supabaseUrl) {
  console.error("NEXT_PUBLIC_SUPABASE_URL is missing. Please check your environment variables.")
}

if (!supabaseAnonKey) {
  console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY is missing. Please check your environment variables.")
}

// Create a simple Supabase client with minimal configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// For client-side only code
export function getClientSupabase() {
  if (typeof window === "undefined") {
    return supabase
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

// Function to test the Supabase connection
export async function testSupabaseConnection() {
  try {
    // Try a simple query to check connection
    const { data, error } = await supabase.from("subscriptions").select("count").limit(1)

    if (error) {
      // If the table doesn't exist, that's okay - we're still connected
      if (error.code === "42P01") {
        return { connected: true, message: "Connected, but subscriptions table doesn't exist yet" }
      }

      return { connected: false, error: error.message }
    }

    return { connected: true, data }
  } catch (error: any) {
    return { connected: false, error: error.message }
  }
}
