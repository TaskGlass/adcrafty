"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface PricingToggleProps {
  onToggle: (isYearly: boolean) => void
}

export function PricingToggle({ onToggle }: PricingToggleProps) {
  const [isYearly, setIsYearly] = useState(false)

  const handleToggle = (checked: boolean) => {
    setIsYearly(checked)
    onToggle(checked)
  }

  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      <span className={`text-sm font-medium ${!isYearly ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
      <div className="flex items-center">
        <Switch id="pricing-toggle" checked={isYearly} onCheckedChange={handleToggle} />
        <Label htmlFor="pricing-toggle" className="sr-only">
          Toggle yearly pricing
        </Label>
      </div>
      <div className="flex items-center">
        <span className={`text-sm font-medium ${isYearly ? "text-foreground" : "text-muted-foreground"}`}>Yearly</span>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: isYearly ? 1 : 0, scale: isYearly ? 1 : 0.8 }}
          className="ml-2 bg-primary/20 text-primary text-xs font-bold px-2 py-0.5 rounded-full"
        >
          Save 20%
        </motion.div>
      </div>
    </div>
  )
}
