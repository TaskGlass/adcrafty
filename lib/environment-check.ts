import { testSupabaseConnection } from "./supabase"
import OpenAI from "openai"

// Function to check if OpenAI API key is configured
export async function checkOpenAIConfig() {
  if (!process.env.OPENAI_API_KEY) {
    return { configured: false, message: "OpenAI API key is missing" }
  }

  try {
    // Initialize the OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    // Try a simple models list call to verify the API key works
    await openai.models.list()

    return { configured: true, message: "OpenAI API key is valid" }
  } catch (error: any) {
    return {
      configured: false,
      message: "OpenAI API key is invalid or has issues",
      error: error.message,
    }
  }
}

// Function to check all required environment variables
export function checkEnvironmentVariables() {
  const variables = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  }

  const missing = Object.entries(variables)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  return {
    allConfigured: missing.length === 0,
    missing,
    configured: Object.entries(variables)
      .filter(([_, value]) => !!value)
      .map(([key]) => key),
  }
}

// Function to check all services
export async function checkAllServices() {
  const envCheck = checkEnvironmentVariables()
  const openaiCheck = await checkOpenAIConfig()
  const supabaseCheck = await testSupabaseConnection()

  return {
    environment: envCheck,
    openai: openaiCheck,
    supabase: supabaseCheck,
    allOperational: envCheck.allConfigured && openaiCheck.configured && supabaseCheck.connected,
  }
}
