import { createClient } from "@supabase/supabase-js"

// Check if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Throw a more descriptive error if environment variables are missing
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL and anon key are required. Please make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables are set.",
  )
}

// Update the Supabase client configuration to ensure persistent sessions
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: "adcreatify_auth_token",
    storage: {
      getItem: (key) => {
        if (typeof window !== "undefined") {
          return sessionStorage.getItem(key)
        }
        return null
      },
      setItem: (key, value) => {
        if (typeof window !== "undefined") {
          sessionStorage.setItem(key, value)
        }
      },
      removeItem: (key) => {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem(key)
        }
      },
    },
  },
})
