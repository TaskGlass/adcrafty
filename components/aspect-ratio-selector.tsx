"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Lock } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface AspectRatioOption {
  id: string
  label: string
  pixelDimensions?: string
  disabled?: boolean
}

interface AspectRatioSelectorProps {
  selected: string[]
  onChange: (selected: string[]) => void
  options?: AspectRatioOption[]
  onSelectDisabled?: (id: string) => void
}

export function AspectRatioSelector({ selected, onChange, options, onSelectDisabled }: AspectRatioSelectorProps) {
  const defaultAspectRatios = [
    { id: "1:1", label: "1:1 (Square)" },
    { id: "4:5", label: "4:5 (Portrait)", disabled: true },
    { id: "9:16", label: "9:16 (Story)" },
    { id: "16:9", label: "16:9 (Landscape)", disabled: true },
    { id: "1.91:1", label: "1.91:1 (Facebook)", disabled: true },
  ]

  const googleAdSizes = [
    { id: "300x250", label: "Medium Rectangle", pixelDimensions: "300×250", disabled: true },
    { id: "336x280", label: "Large Rectangle", pixelDimensions: "336×280", disabled: true },
    { id: "728x90", label: "Leaderboard", pixelDimensions: "728×90", disabled: true },
    { id: "300x600", label: "Half Page", pixelDimensions: "300×600", disabled: true },
    { id: "250x250", label: "Square", pixelDimensions: "250×250", disabled: true },
    { id: "200x200", label: "Small Square", pixelDimensions: "200×200", disabled: true },
    { id: "160x600", label: "Wide Skyscraper", pixelDimensions: "160×600", disabled: true },
    { id: "320x100", label: "Large Mobile Banner", pixelDimensions: "320×100", disabled: true },
  ]

  const aspectRatios = options || [...defaultAspectRatios, ...googleAdSizes]

  const toggleAspectRatio = (id: string, disabled = false) => {
    if (disabled) {
      if (onSelectDisabled) {
        onSelectDisabled(id)
      }
      return
    }

    if (selected.includes(id)) {
      // Don't allow deselecting the last aspect ratio
      if (selected.length > 1) {
        onChange(selected.filter((item) => item !== id))
      }
    } else {
      onChange([...selected, id])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {aspectRatios.map((ratio) => (
        <motion.div
          key={ratio.id}
          whileHover={{ scale: ratio.disabled ? 1 : 1.05 }}
          whileTap={{ scale: ratio.disabled ? 1 : 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant={selected.includes(ratio.id) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer py-1.5 px-3 text-sm transition-all duration-200 relative",
                    selected.includes(ratio.id)
                      ? "bg-primary hover:bg-primary/90 text-white"
                      : ratio.disabled
                        ? "bg-background/50 text-muted-foreground hover:bg-background/50 cursor-not-allowed"
                        : "bg-background hover:bg-background/90",
                  )}
                  onClick={() => toggleAspectRatio(ratio.id, ratio.disabled)}
                >
                  {ratio.label}
                  {ratio.pixelDimensions && <span className="ml-1 opacity-80">({ratio.pixelDimensions})</span>}
                  {ratio.disabled && <Lock className="ml-1.5 h-3 w-3 inline-block" />}
                </Badge>
              </TooltipTrigger>
              {ratio.disabled && (
                <TooltipContent>
                  <p className="text-xs">Upgrade to access this aspect ratio</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </motion.div>
      ))}
    </div>
  )
}
