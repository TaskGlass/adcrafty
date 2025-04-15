"use client"

import * as React from "react"
import { HexColorPicker } from "react-colorful"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Check, X } from "lucide-react"

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  className?: string
}

export function ColorPicker({ color, onChange, className }: ColorPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [localColor, setLocalColor] = React.useState(color)

  React.useEffect(() => {
    setLocalColor(color)
  }, [color])

  const handleAccept = () => {
    onChange(localColor)
    setOpen(false)
  }

  const handleCancel = () => {
    setLocalColor(color)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-10 h-10 p-0 border-2", className)}
          style={{ backgroundColor: color }}
        >
          <span className="sr-only">Pick a color</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3">
        <HexColorPicker color={localColor} onChange={setLocalColor} />
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md border" style={{ backgroundColor: localColor }} />
            <span className="text-sm font-mono">{localColor}</span>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
            <Button variant="default" size="icon" className="h-7 w-7" onClick={handleAccept}>
              <Check className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
