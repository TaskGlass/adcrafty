"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { motion } from "framer-motion"
import { Check, Loader2, AlertTriangle } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PaywallModalProps {
  open: boolean
  onClose: () => void
  user?: any
  subscription?: {
    status: "free" | "pro" | "business" | null
    isActive: boolean
  }
  squareFormatOnly?: boolean
}

export function PaywallModal({ open, onClose, user, subscription, squareFormatOnly = false }: PaywallModalProps) {
  const { isAnonymous, updateSubscription } = useAuth()
  const [isUpdating, setIsUpdating] = useState(false)
  const [isTableAvailable, setIsTableAvailable] = useState(true)

  // Check if subscriptions table exists
  useEffect(() => {
    async function checkSubscriptionsTable() {
      try {
        const { error } = await supabase.from("subscriptions").select("count").limit(1).single()

        if (error && error.code === "42P01") {
          // PostgreSQL error code for undefined_table
          setIsTableAvailable(false)
        } else {
          setIsTableAvailable(true)
        }
      } catch (error) {
        console.error("Error checking subscriptions table:", error)
        setIsTableAvailable(false)
      }
    }

    if (open && !isAnonymous) {
      checkSubscriptionsTable()
    }
  }, [open, isAnonymous])

  // If this is our special user or already on a paid plan, don't show the paywall
  if (
    user?.email?.toLowerCase() === "cameronnpost@outlook.com" ||
    subscription?.status === "pro" ||
    subscription?.status === "business"
  ) {
    return null
  }

  const handleUpgrade = async (plan: "pro" | "business") => {
    if (isAnonymous) {
      // If anonymous, redirect to signup
      return
    }

    setIsUpdating(true)
    try {
      await updateSubscription(plan)
      onClose()
    } finally {
      setIsUpdating(false)
    }
  }

  const features = [
    "Unlimited ad generations",
    "All aspect ratios",
    "Priority support",
    "Advanced customization options",
  ]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-secondary border border-border/40">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isAnonymous ? "Create an Account to Continue" : "Upgrade to Continue"}
          </DialogTitle>
          <DialogDescription>
            {isAnonymous
              ? squareFormatOnly
                ? "You've used all your 3 free square format (1:1) generations. Sign up to continue creating ads."
                : "As a guest user, you can only create square format (1:1) ads. Sign up to access all formats."
              : squareFormatOnly
                ? "You've used all your 3 free square format (1:1) generations. Upgrade to continue."
                : "You've used all your 5 free generations. Upgrade to a paid plan to create unlimited ads."}
          </DialogDescription>
        </DialogHeader>

        {!isTableAvailable && !isAnonymous && (
          <Alert className="bg-yellow-500/10 border-yellow-500/20 mb-4">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <AlertDescription>
              The subscription system is currently being set up. Please try again later or contact support.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 py-4">
          <motion.div
            className="rounded-lg border border-border/40 p-4 bg-background overflow-hidden relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
              POPULAR
            </div>
            <h3 className="font-medium mb-2">Pro Plan</h3>
            <p className="text-2xl font-bold mb-4">
              $19<span className="text-sm font-normal text-muted-foreground">/month</span>
            </p>

            <ul className="space-y-2 mb-4">
              {features.map((feature, i) => (
                <motion.li
                  key={i}
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                >
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm">{feature}</span>
                </motion.li>
              ))}
            </ul>

            {isAnonymous ? (
              <Link href="/signup">
                <Button className="w-full bg-primary hover:bg-primary/90">Sign Up & Upgrade</Button>
              </Link>
            ) : (
              <Button
                className="w-full bg-primary hover:bg-primary/90"
                onClick={() => handleUpgrade("pro")}
                disabled={isUpdating || !isTableAvailable}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Upgrading...
                  </>
                ) : (
                  "Upgrade Now"
                )}
              </Button>
            )}
          </motion.div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="sm:w-auto w-full">
            Maybe Later
          </Button>
          {isAnonymous ? (
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="ghost" className="w-full" onClick={onClose}>
                Log In
              </Button>
            </Link>
          ) : (
            <Link href="/dashboard/settings?tab=subscription" className="w-full sm:w-auto">
              <Button variant="ghost" className="w-full" onClick={onClose}>
                View All Plans
              </Button>
            </Link>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
