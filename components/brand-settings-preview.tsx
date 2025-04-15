"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Palette, ChevronDown, ChevronUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface BrandSettingsPreviewProps {
  brandSettings: any
}

export function BrandSettingsPreview({ brandSettings }: BrandSettingsPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!brandSettings) return null

  const hasSettings =
    brandSettings.logoUrl ||
    brandSettings.primaryColor ||
    brandSettings.secondaryColor ||
    brandSettings.accentColor ||
    brandSettings.brandTone ||
    brandSettings.brandVoice

  if (!hasSettings) return null

  return (
    <Card className="bg-primary/10 border border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-medium">Brand Settings Applied</h3>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {brandSettings.logoUrl && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Logo</p>
                    <div className="h-12 w-12 bg-background rounded-md flex items-center justify-center overflow-hidden">
                      <img
                        src={brandSettings.logoUrl || "/placeholder.svg"}
                        alt="Brand Logo"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  </div>
                )}

                {(brandSettings.primaryColor || brandSettings.secondaryColor || brandSettings.accentColor) && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Brand Colors</p>
                    <div className="flex gap-2">
                      {brandSettings.primaryColor && (
                        <div
                          className="w-6 h-6 rounded-full border border-border/40"
                          style={{ backgroundColor: brandSettings.primaryColor }}
                          title="Primary Color"
                        />
                      )}
                      {brandSettings.secondaryColor && (
                        <div
                          className="w-6 h-6 rounded-full border border-border/40"
                          style={{ backgroundColor: brandSettings.secondaryColor }}
                          title="Secondary Color"
                        />
                      )}
                      {brandSettings.accentColor && (
                        <div
                          className="w-6 h-6 rounded-full border border-border/40"
                          style={{ backgroundColor: brandSettings.accentColor }}
                          title="Accent Color"
                        />
                      )}
                    </div>
                  </div>
                )}

                {brandSettings.brandTone && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Brand Tone</p>
                    <p className="text-sm">{brandSettings.brandTone}</p>
                  </div>
                )}

                {brandSettings.brandVoice && (
                  <div className="space-y-1 md:col-span-2">
                    <p className="text-xs text-muted-foreground">Brand Voice</p>
                    <p className="text-sm line-clamp-2">{brandSettings.brandVoice}</p>
                  </div>
                )}
              </div>

              <div className="mt-3 text-xs text-muted-foreground">
                Your brand settings will be used to guide the AI in generating on-brand ads.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
