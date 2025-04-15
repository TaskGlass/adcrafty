"use client"

import { Badge } from "@/components/ui/badge"

import Link from "next/link"
import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Loader2, Upload, Wand2, Sparkles, Info, X, Globe, CheckCircle2 } from "lucide-react"
import { AspectRatioSelector } from "@/components/aspect-ratio-selector"
import { UsageCounter } from "@/components/usage-counter"
import { PaywallModal } from "@/components/paywall-modal"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/auth-context"
import { createAd } from "@/lib/ad-service"
import { saveAnonymousAd, getAnonymousAds } from "@/lib/anonymous-storage"
import { motion, AnimatePresence } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { supabase } from "@/lib/supabase"
import { getBrandSettings } from "@/lib/brand-settings-service"
import type { BrandSettings } from "@/lib/brand-settings-service"
import { Switch } from "@/components/ui/switch"
import { AdPerformanceAnalyzer } from "@/components/ad-performance-analyzer"

const supabaseClient = createClientComponentClient()

export function AdCreator() {
  const router = useRouter()
  const { user, isAnonymous, subscription } = useAuth()
  const [title, setTitle] = useState("")
  const [prompt, setPrompt] = useState("")
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [images, setImages] = useState<File[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isAnalyzingWebsite, setIsAnalyzingWebsite] = useState(false)
  const [selectedAspectRatios, setSelectedAspectRatios] = useState<string[]>(["1:1"])
  const [showPaywall, setShowPaywall] = useState(false)
  const [paywallTriggerRatio, setPaywallTriggerRatio] = useState<string | null>(null)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [usageCount, setUsageCount] = useState(0)
  const [squareFormatUsage, setSquareFormatUsage] = useState(0)
  const [showPromptTips, setShowPromptTips] = useState(false)
  const [brandAnalysis, setBrandAnalysis] = useState<any>(null)
  const [brandSettings, setBrandSettings] = useState<BrandSettings | null>(null)
  const [isFetchingBrandSettings, setIsFetchingBrandSettings] = useState(false)
  const [generateAdCopy, setGenerateAdCopy] = useState(true)
  const [generatedAdCopy, setGeneratedAdCopy] = useState<any>(null)
  const [generatedAdImage, setGeneratedAdImage] = useState<string | null>(null)
  const [showPerformanceAnalyzer, setShowPerformanceAnalyzer] = useState(false)
  const maxFreeUsage = 3
  const maxSquareFormatUsage = 3

  // Fetch usage count based on user status
  useEffect(() => {
    async function fetchData() {
      if (isAnonymous) {
        // For anonymous users, get count from localStorage
        const anonymousAds = getAnonymousAds()
        setUsageCount(anonymousAds.length)

        // Count 1:1 format ads
        const squareCount = anonymousAds.filter((ad) => ad.aspectRatio === "1:1").length
        setSquareFormatUsage(squareCount)
      } else if (user?.id) {
        try {
          // For authenticated users, get count from Supabase
          const { data: ads, error } = await supabase.from("ads").select("*").eq("user_id", user.id)

          if (!error && ads) {
            setUsageCount(ads.length)

            // Count 1:1 format ads
            const squareCount = ads.filter((ad) => ad.aspect_ratio === "1:1").length
            setSquareFormatUsage(squareCount)
          }
        } catch (error) {
          console.error("Error fetching usage count:", error)
        }
      }

      // Add this code to fetch brand settings
      if (!isAnonymous && user?.id) {
        try {
          setIsFetchingBrandSettings(true)
          const settings = await getBrandSettings(user.id)
          if (settings) {
            setBrandSettings(settings)
          }
        } catch (error) {
          console.error("Error fetching brand settings:", error)
          // Don't show an error toast here, just log it
        } finally {
          setIsFetchingBrandSettings(false)
        }
      }
    }

    fetchData()
  }, [user, isAnonymous])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files).slice(0, 3)
      setImages(fileArray)
    }
  }

  const analyzeWebsite = async () => {
    if (!websiteUrl) {
      toast({
        title: "Please enter a website URL",
        description: "You need to provide a URL to analyze.",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzingWebsite(true)
    setBrandAnalysis(null)

    try {
      const response = await fetch("/api/analyze-website", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: websiteUrl,
        }),
      })

      const data = await response.json()

      if (data.success && data.brandAnalysis) {
        setBrandAnalysis(data.brandAnalysis)
        toast({
          title: "Website analyzed successfully",
          description: "Brand information has been extracted and will be used to tailor your ads.",
        })

        // If prompt is empty, suggest a prompt based on the brand analysis
        if (!prompt.trim()) {
          const suggestedPrompt = `Create a professional ad for ${data.brandAnalysis.title || "this brand"} that highlights ${
            data.brandAnalysis.description ? "their " + data.brandAnalysis.description : "their products or services"
          }.`
          setPrompt(suggestedPrompt)
        }
      } else {
        toast({
          title: "Failed to analyze website",
          description: data.error || "Please check the URL and try again.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error analyzing website:", error)
      toast({
        title: "Error",
        description: "Failed to analyze website. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzingWebsite(false)
    }
  }

  const generateAdWithFallback = async (prompt: string, aspectRatio: string) => {
    try {
      // First try the main API endpoint
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          aspectRatio,
          brandAnalysis, // Include brand analysis if available
          brandSettings, // Include brand settings if available
        }),
      })

      // If the main API fails, use the fallback
      if (!response.ok) {
        console.warn("Main API failed, using fallback")
        const fallbackResponse = await fetch("/api/generate/fallback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt,
            aspectRatio,
          }),
        })

        if (!fallbackResponse.ok) {
          throw new Error("Both main and fallback APIs failed")
        }

        return await fallbackResponse.json()
      }

      return await response.json()
    } catch (error) {
      console.error("Error in generateAdWithFallback:", error)
      throw error
    }
  }

  const handleGenerate = async () => {
    // Check if user has reached limit and needs to upgrade
    const hasUnlimitedAccess =
      subscription.status === "business" || user?.email?.toLowerCase() === "cameronnpost@outlook.com"

    // Check if pro user has reached their limit (50 generations)
    const isProUserReachedLimit = subscription.status === "pro" && usageCount >= 50

    // For anonymous users, only allow 1:1 format and check the limit
    if (isAnonymous) {
      // If reached the square format limit, show paywall
      if (squareFormatUsage >= maxSquareFormatUsage) {
        setShowPaywall(true)
        return
      }
    }
    // For logged in users with free plan
    else if (subscription.status === "free") {
      // If reached the free usage limit, show paywall
      if (usageCount >= maxFreeUsage) {
        setShowPaywall(true)
        return
      }
    }
    // For pro users who reached their limit
    else if (isProUserReachedLimit) {
      setShowPaywall(true)
      return
    }

    if (!prompt.trim()) {
      toast({
        title: "Please enter a prompt",
        description: "You need to describe the ad you want to create.",
        variant: "destructive",
      })
      return
    }

    if (!title.trim()) {
      toast({
        title: "Please enter a title",
        description: "You need to provide a title for your ad.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    // Generate ad copy if enabled
    let adCopy = null
    if (generateAdCopy) {
      try {
        const copyResponse = await fetch("/api/generate-ad-copy", {
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

        const copyData = await copyResponse.json()
        if (copyData.success) {
          adCopy = copyData.adCopy
          setGeneratedAdCopy(adCopy)
        }
      } catch (error) {
        console.error("Error generating ad copy:", error)
        // Continue with image generation even if copy generation fails
      }
    }

    setGenerationProgress(0)

    try {
      // Generate images for each selected aspect ratio
      const totalRatios = selectedAspectRatios.length
      const generatedImages = []
      let successCount = 0

      for (let i = 0; i < totalRatios; i++) {
        const aspectRatio = selectedAspectRatios[i]
        setGenerationProgress(Math.round(((i + 1) / totalRatios) * 100))

        try {
          // Use the generateAdWithFallback function
          const data = await generateAdWithFallback(prompt, aspectRatio)

          if (data.success) {
            successCount++
            generatedImages.push({
              url: data.imageUrl,
              aspectRatio,
            })

            // If it's a fallback image, show a warning
            if (data.isFallback) {
              toast({
                title: "Using placeholder image",
                description: "The AI image generation service is currently unavailable. Using a placeholder instead.",
              })
            }

            // Save the ad based on user status
            if (isAnonymous) {
              // Save to localStorage for anonymous users
              saveAnonymousAd({
                title,
                prompt,
                imageUrl: data.imageUrl,
                aspectRatio,
                type: "image",
                adCopy: adCopy,
              })
            } else if (user?.id) {
              // Save to Supabase for authenticated users
              await createAd({
                title,
                prompt,
                imageUrl: data.imageUrl,
                aspectRatio,
                userId: user.id,
                type: "image",
                adCopy: adCopy,
              })
            }
          } else {
            console.error("Error from API:", data.error)
            toast({
              title: "Error generating image",
              description: data.error || "Something went wrong. Please try again.",
              variant: "destructive",
            })
          }
        } catch (error: any) {
          console.error("Error generating image:", error)
          toast({
            title: "Error generating image",
            description: error.message || "Failed to generate image. Please try again.",
            variant: "destructive",
          })
        }
      }

      if (successCount > 0) {
        // Show the ad performance analyzer for the first generated image
        setGeneratedAdImage(generatedImages[0]?.url || null)
        setShowPerformanceAnalyzer(true)

        // Rest of the existing code...
        // Update usage counts
        // Update usage counts
        if (
          isAnonymous ||
          (subscription.status === "free" && user?.email?.toLowerCase() !== "cameronnpost@outlook.com")
        ) {
          setUsageCount((prev) => prev + successCount)

          // Update square format usage if applicable
          if (selectedAspectRatios.includes("1:1")) {
            setSquareFormatUsage((prev) => prev + 1)
          }
        }

        toast({
          title: "Ad generation complete!",
          description: `Successfully generated ${successCount} ad variations.`,
        })

        // Redirect to library after a short delay
        setTimeout(() => {
          router.push("/dashboard/library")
        }, 1500)
      } else {
        toast({
          title: "Generation failed",
          description: "Failed to generate any ads. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error in generation process:", error)
      toast({
        title: "Error",
        description: "Failed to generate ads. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const promptTips = [
    "Be specific about the product or service you're advertising",
    "Mention the desired mood or emotion (e.g., energetic, calm, professional)",
    "Include details about colors or visual style",
    "Specify if you want text or people in the image",
    "Describe the setting or background",
  ]

  // Handle when a user tries to select a disabled aspect ratio
  const handleDisabledAspectRatio = (id: string) => {
    setPaywallTriggerRatio(id)
    setShowPaywall(true)
  }

  // Get available aspect ratios based on subscription and user status
  const getAvailableAspectRatios = () => {
    // All users with Pro or Business subscription
    if (
      subscription.status === "pro" ||
      subscription.status === "business" ||
      user?.email?.toLowerCase() === "cameronnpost@outlook.com"
    ) {
      return [
        { id: "1:1", label: "1:1 (Square)" },
        { id: "4:5", label: "4:5 (Portrait)" },
        { id: "9:16", label: "9:16 (Story)" },
        { id: "16:9", label: "16:9 (Landscape)" },
        { id: "1.91:1", label: "1.91:1 (Facebook)" },
        // Google Display Ad Sizes
        { id: "300x250", label: "Medium Rectangle (300×250)" },
        { id: "336x280", label: "Large Rectangle (336×280)" },
        { id: "728x90", label: "Leaderboard (728×90)" },
        { id: "300x600", label: "Half Page (300×600)" },
        { id: "250x250", label: "Square (250×250)" },
        { id: "200x200", label: "Small Square (200×200)" },
        { id: "160x600", label: "Wide Skyscraper (160×600)" },
        { id: "320x100", label: "Large Mobile Banner (320×100)" },
      ]
    }

    // Anonymous users and free users only get 1:1 and 9:16 formats
    // Other formats are shown but disabled
    return [
      { id: "1:1", label: "1:1 (Square)" },
      { id: "4:5", label: "4:5 (Portrait)", disabled: true },
      { id: "9:16", label: "9:16 (Story)" },
      { id: "16:9", label: "16:9 (Landscape)", disabled: true },
      { id: "1.91:1", label: "1.91:1 (Facebook)", disabled: true },
      // Google Display Ad Sizes - all disabled for free users
      { id: "300x250", label: "Medium Rectangle", pixelDimensions: "300×250", disabled: true },
      { id: "336x280", label: "Large Rectangle", pixelDimensions: "336×280", disabled: true },
      { id: "728x90", label: "Leaderboard", pixelDimensions: "728×90", disabled: true },
      { id: "300x600", label: "Half Page", pixelDimensions: "300×600", disabled: true },
      { id: "250x250", label: "Square", pixelDimensions: "250×250", disabled: true },
      { id: "200x200", label: "Small Square", pixelDimensions: "200×200", disabled: true },
      { id: "160x600", label: "Wide Skyscraper", pixelDimensions: "160×600", disabled: true },
      { id: "320x100", label: "Large Mobile Banner", pixelDimensions: "320×100", disabled: true },
    ]
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="bg-secondary border border-border/40 w-full">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-bold">Create New Ad</h2>
                <div className="flex items-center gap-4">
                  <UsageCounter
                    current={selectedAspectRatios.includes("1:1") ? squareFormatUsage : usageCount}
                    max={selectedAspectRatios.includes("1:1") ? maxSquareFormatUsage : maxFreeUsage}
                    user={user}
                    subscription={subscription}
                    aspectRatio={selectedAspectRatios.includes("1:1") ? "1:1" : undefined}
                  />
                  {subscription.status !== "free" && (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {subscription.status === "pro" ? "Pro" : "Business"} Plan
                    </Badge>
                  )}
                </div>
              </div>

              {isAnonymous && (
                <Alert className="bg-primary/10 border-primary/20">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <AlertDescription>
                    <span className="font-medium">Try before you sign up!</span> You can create up to 3 square format
                    (1:1) ads without an account.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-6 pt-4">
                <div className="space-y-3">
                  <Label htmlFor="title">Ad Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter a title for your ad"
                    className="bg-background transition-all duration-200 focus:ring-2 focus:ring-primary/50"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* Website URL input */}
                <div className="space-y-3">
                  <Label htmlFor="website-url" className="flex items-center gap-2">
                    Website URL
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Enter your website URL to analyze your brand. This helps create ads that match your brand
                            identity.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="website-url"
                      placeholder="https://your-website.com"
                      className="bg-background transition-all duration-200 focus:ring-2 focus:ring-primary/50"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      disabled={isAnalyzingWebsite}
                    />
                    <Button
                      onClick={analyzeWebsite}
                      disabled={isAnalyzingWebsite || !websiteUrl}
                      className="whitespace-nowrap"
                    >
                      {isAnalyzingWebsite ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Globe className="mr-2 h-4 w-4" />
                          Analyze
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Brand analysis result */}
                <AnimatePresence>
                  {brandAnalysis && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Alert className="bg-primary/10 border-primary/20">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <AlertDescription className="flex flex-col gap-1">
                          <span className="font-medium">Brand analysis complete!</span>
                          <span className="text-sm">
                            We've analyzed{" "}
                            <span className="font-medium">{brandAnalysis.title || brandAnalysis.url}</span> and will use
                            this information to tailor your ads.
                          </span>
                          {brandAnalysis.description && (
                            <span className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              Description: {brandAnalysis.description}
                            </span>
                          )}
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Brand settings preview */}
                <AnimatePresence>
                  {brandSettings && brandSettings.primaryColor && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Alert className="bg-primary/10 border-primary/20">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <AlertDescription className="flex flex-col gap-1">
                          <span className="font-medium">Brand settings applied!</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {brandSettings.primaryColor && (
                              <div className="flex items-center gap-1.5">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: brandSettings.primaryColor }}
                                ></div>
                                <span className="text-xs">Primary</span>
                              </div>
                            )}
                            {brandSettings.secondaryColor && (
                              <div className="flex items-center gap-1.5">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: brandSettings.secondaryColor }}
                                ></div>
                                <span className="text-xs">Secondary</span>
                              </div>
                            )}
                            {brandSettings.accentColor && (
                              <div className="flex items-center gap-1.5">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: brandSettings.accentColor }}
                                ></div>
                                <span className="text-xs">Accent</span>
                              </div>
                            )}
                          </div>
                          {brandSettings.brandTone && (
                            <span className="text-xs text-muted-foreground mt-1">Tone: {brandSettings.brandTone}</span>
                          )}
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Tabs defaultValue="prompt" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-background">
                    <TabsTrigger
                      value="prompt"
                      className="data-[state=active]:bg-primary data-[state=active]:text-white"
                    >
                      Text Prompt Only
                    </TabsTrigger>
                    <TabsTrigger
                      value="images"
                      className="data-[state=active]:bg-primary data-[state=active]:text-white"
                    >
                      Text + Images
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="prompt" className="space-y-4 pt-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="prompt" className="flex items-center gap-2">
                          Describe your ad
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 rounded-full"
                                  onClick={() => setShowPromptTips(!showPromptTips)}
                                >
                                  <Info className="h-3.5 w-3.5" />
                                  <span className="sr-only">Prompt tips</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Click for prompt tips</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-primary"
                          onClick={() => {
                            setPrompt(
                              "A professional advertisement for a modern product with clean design, vibrant colors, and clear messaging. The image should be high quality and visually appealing.",
                            )
                          }}
                        >
                          <Sparkles className="mr-1 h-3 w-3" />
                          Use example
                        </Button>
                      </div>
                      <Textarea
                        id="prompt"
                        placeholder="Describe the ad you want to create in detail. For example: A modern smartphone on a minimalist desk with soft lighting, showing a shopping app, perfect for an e-commerce ad."
                        className="min-h-[120px] bg-background resize-y transition-all duration-200 focus:ring-2 focus:ring-primary/50"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                      />
                      <AnimatePresence>
                        {showPromptTips && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="bg-background/50 border border-border/40 rounded-md p-3 mt-2">
                              <h4 className="text-sm font-medium mb-2 flex items-center">
                                <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary" />
                                Prompt Tips
                              </h4>
                              <ul className="text-xs space-y-1.5 text-muted-foreground">
                                {promptTips.map((tip, index) => (
                                  <motion.li
                                    key={index}
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-start gap-1.5"
                                  >
                                    <span className="text-primary">•</span>
                                    {tip}
                                  </motion.li>
                                ))}
                              </ul>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </TabsContent>

                  <TabsContent value="images" className="space-y-4 pt-4">
                    <div className="space-y-3">
                      <Label htmlFor="prompt-with-images">Describe your ad</Label>
                      <Textarea
                        id="prompt-with-images"
                        placeholder="Describe how you want to use the uploaded images in your ad."
                        className="min-h-[120px] bg-background resize-y transition-all duration-200 focus:ring-2 focus:ring-primary/50"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>Upload Images (Max 3)</Label>
                      <div className="flex flex-wrap items-center gap-4">
                        <Label
                          htmlFor="image-upload"
                          className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-border hover:border-primary/50 bg-background transition-colors duration-200"
                        >
                          <Upload className="h-4 w-4 mb-1 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Upload</span>
                          <Input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                        </Label>

                        {images.map((image, index) => (
                          <motion.div
                            key={index}
                            className="relative h-24 w-24 rounded-md border overflow-hidden"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <img
                              src={URL.createObjectURL(image) || "/placeholder.svg"}
                              alt={`Uploaded image ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-5 w-5 rounded-full opacity-80 hover:opacity-100"
                              onClick={() => setImages(images.filter((_, i) => i !== index))}
                            >
                              <X className="h-3 w-3" />
                              <span className="sr-only">Remove image</span>
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="space-y-3">
                  <Label>Aspect Ratios (select at least one)</Label>
                  <AspectRatioSelector
                    selected={selectedAspectRatios}
                    onChange={setSelectedAspectRatios}
                    options={getAvailableAspectRatios()}
                    onSelectDisabled={handleDisabledAspectRatio}
                  />
                  {isAnonymous ? (
                    <p className="text-xs text-muted-foreground">
                      Guest users can only use 1:1 and 9:16 formats. Sign up for more options.
                    </p>
                  ) : subscription.status === "free" ? (
                    <p className="text-xs text-muted-foreground">
                      Free plan: Only 1:1 and 9:16 formats available. Upgrade to Pro or Business for all formats.
                    </p>
                  ) : null}
                </div>

                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    Meta Ad Copy
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            We'll automatically generate Meta ad copy (primary text, headlines, and descriptions) to
                            accompany your image ad.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <div className="bg-background/50 border border-border/40 rounded-md p-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      Your ad copy will be generated based on your prompt and brand information.
                    </p>
                    <div className="flex items-center">
                      <Switch id="generate-copy" checked={generateAdCopy} onCheckedChange={setGenerateAdCopy} />
                      <Label htmlFor="generate-copy" className="ml-2">
                        Generate Meta ad copy with my image
                      </Label>
                    </div>
                  </div>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 h-12 text-base relative overflow-hidden group"
                    onClick={handleGenerate}
                    disabled={!prompt || !title || isGenerating || selectedAspectRatios.length === 0}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generating... {generationProgress > 0 ? `${generationProgress}%` : ""}
                        <div
                          className="absolute bottom-0 left-0 h-1 bg-white/30"
                          style={{ width: `${generationProgress}%`, transition: "width 0.3s ease-in-out" }}
                        />
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                        Generate {brandAnalysis ? "Brand-Tailored" : ""} Image Ad
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 -translate-x-full group-hover:animate-shimmer" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>

              {isAnonymous && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-sm"
                >
                  <p>
                    <strong>Note:</strong> As a guest user, your ads are stored locally in your browser. To keep them
                    permanently and access them from any device,{" "}
                    <Link href="/signup" className="text-primary hover:underline">
                      create an account
                    </Link>
                    .
                  </p>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <PaywallModal
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        user={user}
        subscription={subscription}
        squareFormatOnly={paywallTriggerRatio !== null}
      />
      {showPerformanceAnalyzer && generatedAdImage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-6"
        >
          <AdPerformanceAnalyzer
            imageUrl={generatedAdImage}
            adCopy={adCopy}
            prompt={prompt}
            aspectRatio={selectedAspectRatios[0]}
          />
        </motion.div>
      )}
    </>
  )
}
