"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { CreditCard, Info } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { getMonthlyUsage, getUsageLimits } from "@/lib/usage-service"

export function SubscriptionStatus() {
  const { user, subscription } = useAuth()
  const [usage, setUsage] = useState({ generations: 0, downloads: 0 })
  const [limits, setLimits] = useState({ generations: 5, downloads: 5 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (user) {
        try {
          // Get monthly usage from the existing service
          const usageData = await getMonthlyUsage(user.id)
          setUsage(usageData || { generations: 0, downloads: 0 })

          // Get limits based on subscription status
          const planLimits = getUsageLimits(subscription?.status || "free")
          setLimits(planLimits)
        } catch (error) {
          console.error("Error loading usage data:", error)
          // Set default values in case of error
          setUsage({ generations: 0, downloads: 0 })
          setLimits({ generations: 5, downloads: 5 })
        }
      }
      setLoading(false)
    }

    loadData()
  }, [user, subscription?.status])

  // Calculate remaining credits
  const generationsRemaining = Math.max(0, limits.generations - usage.generations)
  const downloadsRemaining = Math.max(0, limits.downloads - usage.downloads)

  // Calculate percentages for progress bars
  const generationsPercentage =
    limits.generations === Number.POSITIVE_INFINITY
      ? 100
      : Math.max(0, Math.min(100, (generationsRemaining / limits.generations) * 100))

  const downloadsPercentage =
    limits.downloads === Number.POSITIVE_INFINITY
      ? 100
      : Math.max(0, Math.min(100, (downloadsRemaining / limits.downloads) * 100))

  // Determine if the plan has unlimited credits
  const hasUnlimitedGenerations = limits.generations === Number.POSITIVE_INFINITY
  const hasUnlimitedDownloads = limits.downloads === Number.POSITIVE_INFINITY

  // Plan display name mapping
  const getPlanName = () => {
    switch (subscription?.status) {
      case "business":
        return "Business"
      case "pro":
        return "Pro"
      case "free":
      default:
        return "Free"
    }
  }

  return (
    <TooltipProvider>
      <div className="border border-border/40 rounded-lg p-3 mb-4 bg-background/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Your Plan</span>
          </div>
          <Badge variant={subscription?.status === "free" ? "outline" : "default"} className="capitalize">
            {getPlanName()}
          </Badge>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Creation Credits</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Credits used when creating new content</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="text-xs font-medium">
                {loading
                  ? "Loading..."
                  : hasUnlimitedGenerations
                    ? "∞"
                    : `${generationsRemaining}/${limits.generations}`}
              </span>
            </div>
            {!hasUnlimitedGenerations && <Progress value={generationsPercentage} className="h-1.5" />}
          </div>

          {subscription?.status !== "free" && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">Download Credits</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Credits used when downloading content</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className="text-xs font-medium">
                  {loading ? "Loading..." : hasUnlimitedDownloads ? "∞" : `${downloadsRemaining}/${limits.downloads}`}
                </span>
              </div>
              {!hasUnlimitedDownloads && <Progress value={downloadsPercentage} className="h-1.5" />}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
