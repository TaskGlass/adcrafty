import { createClient } from "@supabase/supabase-js"

// Check if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Log environment variable status for debugging
if (!supabaseUrl) {
  console.error("NEXT_PUBLIC_SUPABASE_URL is missing. Please check your environment variables.")
}

if (!supabaseAnonKey) {
  console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY is missing. Please check your environment variables.")
}

// Throw a more descriptive error if environment variables are missing
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL and anon key are required. Please make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables are set.",
  )
}

// Create Supabase client with session persistence in browser storage
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: typeof window !== "undefined" ? sessionStorage : undefined,
  },
})

// Export a function to check if Supabase is properly configured
export function checkSupabaseConnection() {
  return new Promise(async (resolve, reject) => {
    try {
      // Try a simple query to check connection
      const { error } = await supabase.from("subscriptions").select("count").limit(1).single()

      // If the table doesn't exist, that's okay - we're still connected
      if (error && error.code === "42P01") {
        resolve({ connected: true, message: "Connected, but subscriptions table doesn't exist yet" })
        return
      }

      if (error) {
        reject({ connected: false, error })
        return
      }

      resolve({ connected: true, message: "Successfully connected to Supabase" })
    } catch (error) {
      reject({ connected: false, error })
    }
  })
}
