"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface AspectRatioOption {
  id: string
  label: string
  pixelDimensions?: string
}

interface AspectRatioSelectorProps {
  selected: string[]
  onChange: (selected: string[]) => void
  options?: AspectRatioOption[]
}

export function AspectRatioSelector({ selected, onChange, options }: AspectRatioSelectorProps) {
  const defaultAspectRatios = [
    { id: "1:1", label: "1:1 (Square)" },
    { id: "4:5", label: "4:5 (Portrait)" },
    { id: "9:16", label: "9:16 (Story)" },
    { id: "16:9", label: "16:9 (Landscape)" },
    { id: "1.91:1", label: "1.91:1 (Facebook)" },
  ]

  const googleAdSizes = [
    { id: "300x250", label: "Medium Rectangle", pixelDimensions: "300×250" },
    { id: "336x280", label: "Large Rectangle", pixelDimensions: "336×280" },
    { id: "728x90", label: "Leaderboard", pixelDimensions: "728×90" },
    { id: "300x600", label: "Half Page", pixelDimensions: "300×600" },
    { id: "250x250", label: "Square", pixelDimensions: "250×250" },
    { id: "200x200", label: "Small Square", pixelDimensions: "200×200" },
    { id: "160x600", label: "Wide Skyscraper", pixelDimensions: "160×600" },
    { id: "320x100", label: "Large Mobile Banner", pixelDimensions: "320×100" },
  ]

  const aspectRatios = options || [...defaultAspectRatios, ...googleAdSizes]

  const toggleAspectRatio = (id: string) => {
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
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <Badge
            variant={selected.includes(ratio.id) ? "default" : "outline"}
            className={cn(
              "cursor-pointer py-1.5 px-3 text-sm transition-all duration-200",
              selected.includes(ratio.id)
                ? "bg-primary hover:bg-primary/90 text-white"
                : "bg-background hover:bg-background/90",
            )}
            onClick={() => toggleAspectRatio(ratio.id)}
          >
            {ratio.label}
            {ratio.pixelDimensions && <span className="ml-1 opacity-80">({ratio.pixelDimensions})</span>}
          </Badge>
        </motion.div>
      ))}
    </div>
  )
}
