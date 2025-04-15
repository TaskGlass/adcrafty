"use client"

import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface UsageCounterProps {
  current: number
  max: number
  user?: any
  subscription?: {
    status: "free" | "pro" | "business" | null
    isActive: boolean
  }
  aspectRatio?: string
}

export function UsageCounter({ current, max, user, subscription, aspectRatio }: UsageCounterProps) {
  const [percentage, setPercentage] = useState(0)

  const hasUnlimitedAccess =
    subscription?.status === "pro" ||
    subscription?.status === "business" ||
    user?.email?.toLowerCase() === "cameronnpost@outlook.com"

  useEffect(() => {
    // Animate the percentage
    const timer = setTimeout(() => {
      setPercentage((current / max) * 100)
    }, 300)

    return () => clearTimeout(timer)
  }, [current, max])

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>
          {hasUnlimitedAccess
            ? "Unlimited access"
            : aspectRatio === "1:1"
              ? `Square format: ${current}/${max}`
              : `Free uses: ${current}/${max}`}
        </span>
        {current >= max && !hasUnlimitedAccess && (
          <motion.span
            className="text-destructive"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            Limit reached
          </motion.span>
        )}
      </div>
      {hasUnlimitedAccess ? (
        <Progress value={100} className="h-2 w-36 bg-background" indicatorClassName="bg-green-500" />
      ) : (
        <Progress
          value={percentage}
          className="h-2 w-36 bg-background"
          indicatorClassName={percentage >= 100 ? "bg-destructive" : "bg-primary"}
        />
      )}
    </div>
  )
}
