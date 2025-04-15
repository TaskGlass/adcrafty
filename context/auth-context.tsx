"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { Session, User, AuthError } from "@supabase/supabase-js"
import { useRouter, usePathname } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAnonymous: boolean
  signUp: (
    email: string,
    password: string,
    metadata?: any,
  ) => Promise<{
    error: AuthError | null
    data: any | null
  }>
  signIn: (
    email: string,
    password: string,
  ) => Promise<{
    error: AuthError | null
    data: any | null
  }>
  signOut: () => Promise<void>
  subscription: {
    status: "free" | "pro" | "business" | null
    isActive: boolean
    billingCycle: "monthly" | "yearly"
  }
  updateSubscription: (status: "free" | "pro" | "business", billingCycle?: "monthly" | "yearly") => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [subscription, setSubscription] = useState<{
    status: "free" | "pro" | "business" | null
    isActive: boolean
    billingCycle: "monthly" | "yearly"
  }>({
    status: "free",
    isActive: true,
    billingCycle: "monthly",
  })
  const router = useRouter()
  const pathname = usePathname()

  // Function to fetch user subscription
  const fetchSubscription = async (userId: string) => {
    try {
      // Check if the subscriptions table exists first
      const { error: tableCheckError } = await supabase.from("subscriptions").select("count").limit(1).single()

      // If the table doesn't exist, use default free subscription
      if (tableCheckError && tableCheckError.code === "42P01") {
        console.log("Subscriptions table doesn't exist yet, using default free plan")
        return
      }

      // If we get here, the table exists, so try to fetch the subscription
      const { data, error } = await supabase.from("subscriptions").select("*").eq("user_id", userId).single()

      if (error) {
        // If no subscription found for this user, that's okay - use default free plan
        if (error.code === "PGRST116") {
          console.log("No subscription found for user, using default free plan")
          return
        }

        console.error("Error fetching subscription:", error)
        return
      }

      if (data) {
        setSubscription({
          status: data.plan as "free" | "pro" | "business",
          isActive: data.is_active,
          billingCycle: data.billing_cycle || "monthly",
        })
      }
    } catch (error) {
      console.error("Error in fetchSubscription:", error)
    }
  }

  // Function to update user subscription
  const updateSubscription = async (
    status: "free" | "pro" | "business",
    billingCycle: "monthly" | "yearly" = "monthly",
  ) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update your subscription",
        variant: "destructive",
      })
      return
    }

    try {
      // Check if the subscriptions table exists
      const { error: tableCheckError } = await supabase.from("subscriptions").select("count").limit(1).single()

      // If the table doesn't exist, show an error message
      if (tableCheckError && tableCheckError.code === "42P01") {
        toast({
          title: "Subscription system unavailable",
          description: "The subscription system is currently being set up. Please try again later.",
          variant: "destructive",
        })
        return
      }

      // Check if subscription exists
      const { data: existingSubscription, error: fetchError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError
      }

      let result

      if (existingSubscription) {
        // Update existing subscription
        result = await supabase
          .from("subscriptions")
          .update({
            plan: status,
            billing_cycle: billingCycle,
            is_active: true,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id)
      } else {
        // Create new subscription
        result = await supabase.from("subscriptions").insert({
          user_id: user.id,
          plan: status,
          billing_cycle: billingCycle,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }

      if (result.error) {
        throw result.error
      }

      // Update local state
      setSubscription({
        status,
        isActive: true,
        billingCycle,
      })

      toast({
        title: "Subscription updated",
        description: `Your subscription has been updated to ${status.toUpperCase()} with ${billingCycle} billing.`,
      })
    } catch (error: any) {
      console.error("Error updating subscription:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update subscription",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get the current session
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error.message)
          throw error
        }

        // Log the session state for debugging
        console.log("Auth Context - Session Check:", {
          hasSession: !!data.session,
          path: pathname,
        })

        if (data.session) {
          setSession(data.session)
          setUser(data.session.user)
          setIsAnonymous(false)

          // Fetch subscription data
          await fetchSubscription(data.session.user.id)
        } else {
          setIsAnonymous(true)
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
        setIsAnonymous(true)
      } finally {
        setIsLoading(false)
      }
    }

    // Initialize auth when the component mounts
    initializeAuth()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, !!session)

      if (session) {
        setSession(session)
        setUser(session.user)
        setIsAnonymous(false)

        // Fetch subscription data
        await fetchSubscription(session.user.id)
      } else {
        setSession(null)
        setUser(null)
        setIsAnonymous(true)
        setSubscription({
          status: "free",
          isActive: true,
          billingCycle: "monthly",
        })
      }
    })

    // Clean up the subscription when the component unmounts
    return () => {
      subscription.unsubscribe()
    }
  }, [pathname])

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      })

      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to sign up.",
          variant: "destructive",
        })
      }

      return { data, error }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
      return { data: null, error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to sign in.",
          variant: "destructive",
        })
      } else {
        // Redirect to dashboard after successful login
        router.push("/dashboard")
      }

      return { data, error }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const value = {
    user,
    session,
    isLoading,
    isAnonymous,
    signUp,
    signIn,
    signOut,
    subscription,
    updateSubscription,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
