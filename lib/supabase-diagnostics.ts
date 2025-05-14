import { supabase } from "./supabase-client"

// Function to check Supabase connection and auth status
export async function checkSupabaseStatus() {
  const diagnostics = {
    connection: false,
    auth: false,
    session: null as any,
    error: null as any,
  }

  try {
    // Test basic connection with a simple query
    const { data, error } = await supabase.from("subscriptions").select("count", { count: "exact" }).limit(1)

    // If we get a permission error, that's actually good - it means we connected
    diagnostics.connection = !error || error.code === "42501" || error.code === "PGRST116"

    // Check auth status
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      diagnostics.error = sessionError
    } else {
      diagnostics.auth = true
      diagnostics.session = sessionData
    }

    return diagnostics
  } catch (err) {
    diagnostics.error = err
    return diagnostics
  }
}

// Function to log Supabase diagnostics
export async function logSupabaseDiagnostics() {
  console.log("Running Supabase diagnostics...")
  const status = await checkSupabaseStatus()

  console.log("Supabase Status:", {
    connection: status.connection ? "✅" : "❌",
    auth: status.auth ? "✅" : "❌",
    hasSession: !!status.session?.session,
    error: status.error,
  })

  return status
}
