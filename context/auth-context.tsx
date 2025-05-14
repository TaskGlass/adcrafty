"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"
import type { Session, User } from "@supabase/supabase-js"

// Simplified auth context type
type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  subscription: {
    status: "free" | "pro" | "business"
    isActive: boolean
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [subscription, setSubscription] = useState({
    status: "free" as const,
    isActive: true,
  })
  const router = useRouter()

  // Initialize auth state
  useEffect(() => {
    console.log("Auth provider initializing...")

    // Get initial session
    const initAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting initial session:", error.message)
          setIsLoading(false)
          return
        }

        console.log("Initial session check:", !!data.session)

        if (data.session) {
          setSession(data.session)
          setUser(data.session.user)
        }
      } catch (err) {
        console.error("Unexpected error during auth initialization:", err)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log("Auth state change:", event)

      if (newSession) {
        setSession(newSession)
        setUser(newSession.user)
      } else {
        setSession(null)
        setUser(null)
      }
    })

    // Clean up subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Sign in function with explicit error handling
  const signIn = async (email: string, password: string) => {
    console.log("Sign in attempt for:", email)

    try {
      // Basic validation
      if (!email || !password) {
        return { success: false, error: "Email and password are required" }
      }

      // Direct auth call with minimal wrapping
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log("Sign in response:", {
        hasData: !!result.data,
        hasUser: !!result.data.user,
        hasSession: !!result.data.session,
        hasError: !!result.error,
        errorMessage: result.error?.message,
      })

      if (result.error) {
        return {
          success: false,
          error: result.error.message || "Authentication failed",
        }
      }

      if (result.data.session) {
        setSession(result.data.session)
        setUser(result.data.user)
        return { success: true }
      } else {
        return {
          success: false,
          error: "No session returned from authentication",
        }
      }
    } catch (err: any) {
      console.error("Unexpected error during sign in:", err)
      return {
        success: false,
        error: "An unexpected error occurred",
      }
    }
  }

  // Sign up function
  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (err: any) {
      console.error("Error during sign up:", err)
      return { success: false, error: "An unexpected error occurred" }
    }
  }

  // Sign out function
  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/")
    } catch (err) {
      console.error("Error signing out:", err)
    }
  }

  // Context value
  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    subscription,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
