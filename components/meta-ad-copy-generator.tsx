"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Loader2, Wand2, Copy, CheckCircle2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion } from "framer-motion"
import type { BrandSettings } from "@/lib/brand-settings-service"

interface MetaAdCopyGeneratorProps {
  prompt: string
  brandAnalysis?: any
  brandSettings?: BrandSettings | null
}

export function MetaAdCopyGenerator({ prompt, brandAnalysis, brandSettings }: MetaAdCopyGeneratorProps) {
  const [primaryText, setPrimaryText] = useState("")
  const [headlines, setHeadlines] = useState<string[]>(["", "", "", "", ""])
  const [descriptions, setDescriptions] = useState<string[]>(["", ""])
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({})

  const handleGenerateAdCopy = async () => {
    if (!prompt) {
      toast({
        title: "Please enter a prompt",
        description: "You need to describe the ad you want to create copy for.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate-ad-copy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          brandAnalysis,
          brandSettings,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setPrimaryText(data.adCopy.primaryText || "")
        setHeadlines(data.adCopy.headlines || ["", "", "", "", ""])
        setDescriptions(data.adCopy.descriptions || ["", ""])

        toast({
          title: "Ad copy generated!",
          description: "Your Meta ad copy has been created successfully.",
        })
      } else {
        toast({
          title: "Error generating ad copy",
          description: data.error || "Something went wrong. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error generating ad copy:", error)
      toast({
        title: "Error",
        description: "Failed to generate ad copy. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied({ ...copied, [key]: true })

    setTimeout(() => {
      setCopied({ ...copied, [key]: false })
    }, 2000)

    toast({
      title: "Copied to clipboard",
      description: "The text has been copied to your clipboard.",
    })
  }

  const updateHeadline = (index: number, value: string) => {
    const newHeadlines = [...headlines]
    newHeadlines[index] = value
    setHeadlines(newHeadlines)
  }

  const updateDescription = (index: number, value: string) => {
    const newDescriptions = [...descriptions]
    newDescriptions[index] = value
    setDescriptions(newDescriptions)
  }

  return (
    <div className="space-y-6">
      <Alert className="bg-primary/10 border-primary/20">
        <CheckCircle2 className="h-4 w-4 text-primary" />
        <AlertDescription>
          <span className="font-medium">Meta Ad Copy Generator</span>
          <p className="text-sm mt-1">
            Generate primary text, headlines, and descriptions for your Meta ads. You can edit the generated copy to fit
            your needs.
          </p>
        </AlertDescription>
      </Alert>

      <div className="space-y-3">
        <Label htmlFor="ad-prompt">Describe your product or service</Label>
        <Textarea
          id="ad-prompt"
          placeholder="Describe your product, target audience, and key selling points. The more details you provide, the better the generated copy will be."
          className="min-h-[120px] bg-background resize-y transition-all duration-200 focus:ring-2 focus:ring-primary/50"
          value={prompt}
          readOnly
        />
      </div>

      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
        <Button
          className="w-full bg-primary hover:bg-primary/90 h-12 text-base relative overflow-hidden group"
          onClick={handleGenerateAdCopy}
          disabled={!prompt || isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating Ad Copy...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
              Generate Meta Ad Copy
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 -translate-x-full group-hover:animate-shimmer" />
            </>
          )}
        </Button>
      </motion.div>

      {(primaryText || headlines.some((h) => h) || descriptions.some((d) => d)) && (
        <Card className="mt-6">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label htmlFor="primary-text">Primary Text (125 characters)</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => handleCopy(primaryText, "primary")}
                  disabled={!primaryText}
                >
                  {copied.primary ? <CheckCircle2 className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                  {copied.primary ? "Copied" : "Copy"}
                </Button>
              </div>
              <Textarea
                id="primary-text"
                value={primaryText}
                onChange={(e) => setPrimaryText(e.target.value)}
                className="bg-background resize-y"
                placeholder="Primary text appears above your ad and should grab attention."
                maxLength={125}
              />
              <div className="text-xs text-right text-muted-foreground">{primaryText.length}/125 characters</div>
            </div>

            <div className="space-y-3">
              <Label>Headlines (30 characters each)</Label>
              <div className="grid gap-3">
                {headlines.map((headline, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={headline}
                      onChange={(e) => updateHeadline(index, e.target.value)}
                      className="bg-background"
                      placeholder={`Headline ${index + 1}`}
                      maxLength={30}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => handleCopy(headline, `headline-${index}`)}
                      disabled={!headline}
                    >
                      {copied[`headline-${index}`] ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Descriptions (30 characters each)</Label>
              <div className="grid gap-3">
                {descriptions.map((description, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={description}
                      onChange={(e) => updateDescription(index, e.target.value)}
                      className="bg-background"
                      placeholder={`Description ${index + 1}`}
                      maxLength={30}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => handleCopy(description, `description-${index}`)}
                      disabled={!description}
                    >
                      {copied[`description-${index}`] ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Button
              className="w-full"
              variant="outline"
              onClick={() => {
                const allText = `PRIMARY TEXT:\n${primaryText}\n\nHEADLINES:\n${headlines.filter((h) => h).join("\n")}\n\nDESCRIPTIONS:\n${descriptions.filter((d) => d).join("\n")}`
                handleCopy(allText, "all")
              }}
              disabled={!primaryText && !headlines.some((h) => h) && !descriptions.some((d) => d)}
            >
              {copied.all ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied.all ? "All Copy Copied" : "Copy All Text"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
