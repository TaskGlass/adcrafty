import { createClient } from "@supabase/supabase-js"

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Log environment variables for debugging (without exposing full keys)
console.log("Supabase URL available:", !!supabaseUrl)
console.log("Supabase Anon Key available:", !!supabaseAnonKey)

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables")
  throw new Error("Supabase URL and anon key are required. Please check your environment variables.")
}

// Create a simple Supabase client with minimal configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Export a direct auth reference for easier debugging
export const auth = supabase.auth
