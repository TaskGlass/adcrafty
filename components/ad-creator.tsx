"use client"

import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Loader2, Upload, Sparkles, Info, X, Globe, CheckCircle2, AlertTriangle, ImageIcon } from "lucide-react"
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
import { Progress } from "@/components/ui/progress"

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
  const [showPerformanceAnalyzer, setShowPerformanceAnalyzer] = useState(false)
  const [generatedAdImage, setGeneratedAdImage] = useState<string | null>(null)
  const [adCopyError, setAdCopyError] = useState<string | null>(null)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [currentAspectRatio, setCurrentAspectRatio] = useState<string | null>(null)
  const [generationStatus, setGenerationStatus] = useState<string>("idle")
  const [debugLogs, setDebugLogs] = useState<string[]>([])
  const [showDebugLogs, setShowDebugLogs] = useState(false)
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const maxFreeUsage = 3
  const maxSquareFormatUsage = 3

  // Add these new state variables after the existing useState declarations
  const [adTone, setAdTone] = useState<string>("professional")
  const [adCta, setAdCta] = useState<string>("")
  const [adOffer, setAdOffer] = useState<string>("")
  const [adPoints, setAdPoints] = useState<string[]>(["", "", ""])

  // Add a function to update individual bullet points
  const updateAdPoint = (index: number, value: string) => {
    const newPoints = [...adPoints]
    newPoints[index] = value
    setAdPoints(newPoints)
  }

  // Clear progress timer on unmount
  useEffect(() => {
    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current)
      }
    }
  }, [])

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

  // Function to simulate progress even if the actual API call is taking time
  const startProgressSimulation = () => {
    // Clear any existing timer
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current)
    }

    // Start at current progress
    let simulatedProgress = generationProgress

    // Create a timer that increments progress
    progressTimerRef.current = setInterval(() => {
      // Increment progress but never reach 100%
      if (simulatedProgress < 95) {
        simulatedProgress += Math.random() * 2
        setGenerationProgress(Math.min(95, simulatedProgress))
      }
    }, 500)
  }

  // Stop the progress simulation
  const stopProgressSimulation = () => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current)
      progressTimerRef.current = null
    }
  }

  // Add a debug log
  const addDebugLog = (message: string) => {
    setDebugLogs((prev) => [...prev, `[${new Date().toISOString()}] ${message}`])
  }

  // Generate a fallback image URL directly in the client
  const generateFallbackImageUrl = (aspectRatio: string, promptText: string): string => {
    let width = 800
    let height = 800

    // Check if it's a Google ad size format (e.g., "300x250")
    if (/^\d+x\d+$/.test(aspectRatio)) {
      const [w, h] = aspectRatio.split("x").map(Number)
      width = w
      height = h
    } else {
      // For standard aspect ratios
      switch (aspectRatio) {
        case "1:1":
          width = 800
          height = 800
          break
        case "4:5":
          width = 800
          height = 1000
          break
        case "9:16":
          width = 800
          height = 1422
          break
        case "16:9":
          width = 1422
          height = 800
          break
        case "1.91:1":
          width = 1528
          height = 800
          break
      }
    }

    const placeholderText = promptText
      ? `Sample Ad - Based on: ${promptText.substring(0, 30)}...`
      : "Sample Ad - AI Generation Temporarily Unavailable"

    return `/placeholder.svg?height=${height}&width=${width}&text=${encodeURIComponent(placeholderText)}`
  }

  // Improved function to generate an ad with better error handling and retries
  const generateAdWithFallback = async (prompt: string, aspectRatio: string): Promise<any> => {
    // Reset any previous errors
    setGenerationError(null)
    setCurrentAspectRatio(aspectRatio)
    setGenerationStatus(`Generating ${aspectRatio} format with GPT-4...`)
    setDebugLogs([])

    // Start progress simulation
    startProgressSimulation()

    // Create the request payload
    const payload = {
      prompt,
      aspectRatio,
      brandAnalysis, // Include brand analysis
      brandSettings, // Include brand settings if available
      adTone,
      adCta,
      adOffer,
      adPoints: adPoints.filter((point) => point.trim() !== ""),
    }

    addDebugLog(`Generating ad with payload: ${JSON.stringify(payload, null, 2)}`)

    try {
      addDebugLog(`Attempting to generate ad image for ${aspectRatio} format using GPT-4`)
      setGenerationStatus(`Generating ${aspectRatio} format with GPT-4...`)

      // Set a timeout for the fetch request
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout for GPT-4

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

      // Clear the timeout
      clearTimeout(timeoutId)

      // Check if the request was successful
      if (!response.ok) {
        addDebugLog(`API response not OK: ${response.status}`)
        throw new Error(`API returned status ${response.status}`)
      }

      // Try to parse the response as JSON
      let data
      try {
        data = await response.json()
        addDebugLog(`API response received: ${JSON.stringify(data, null, 2)}`)

        // Add any logs from the server
        if (data.logs && Array.isArray(data.logs)) {
          data.logs.forEach((log: string) => addDebugLog(log))
        }
      } catch (parseError) {
        addDebugLog(`Failed to parse API response: ${parseError}`)
        throw new Error("Invalid response format")
      }

      // Stop progress simulation
      stopProgressSimulation()

      // If it's a fallback image, show a warning
      if (data.isFallback) {
        setGenerationError(
          data.message || "Using a placeholder image because the AI image generation service is currently unavailable.",
        )
      }

      // Set the preview image
      setPreviewImage(data.imageUrl)
      setGenerationStatus("Generation complete!")

      return data
    } catch (error: any) {
      addDebugLog(`Generation failed: ${error.message}`)
      setGenerationStatus(`Generation failed, trying fallback...`)

      // Stop progress simulation
      stopProgressSimulation()

      // Always provide a fallback image even if everything fails
      const fallbackUrl = generateFallbackImageUrl(aspectRatio, prompt)

      setGenerationError("Using a placeholder image due to technical issues with GPT-4 integration.")
      setPreviewImage(fallbackUrl)
      setGenerationStatus("Using fallback image")

      return {
        success: true,
        imageUrl: fallbackUrl,
        aspectRatio,
        isFallback: true,
        message: "Using placeholder image due to technical issues with GPT-4 integration.",
      }
    }
  }

  // Function to safely generate ad copy with fallback
  const generateAdCopyWithFallback = async () => {
    setAdCopyError(null)
    setGenerationStatus("Generating ad copy with GPT-4...")
    addDebugLog("Starting ad copy generation with GPT-4")

    // Default fallback ad copy in case of errors
    const fallbackAdCopy = {
      primaryText: "Your compelling ad copy will appear here.",
      headlines: ["Headline 1", "Headline 2", "Headline 3", "Headline 4", "Headline 5"],
      descriptions: ["Description 1", "Description 2"],
    }

    try {
      // First attempt with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

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
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        addDebugLog(`Ad copy generation failed with status: ${response.status}`)
        setAdCopyError("Ad copy generation failed. Using default copy instead.")
        return fallbackAdCopy
      }

      // Try to parse the JSON response
      try {
        const data = await response.json()
        addDebugLog(`Ad copy generation response: ${JSON.stringify(data, null, 2)}`)

        if (data.success) {
          if (data.warning) {
            setAdCopyError(data.warning)
            addDebugLog(`Ad copy warning: ${data.warning}`)
          }
          return data.adCopy
        } else {
          setAdCopyError(data.error || "Failed to generate ad copy. Using default copy instead.")
          addDebugLog(`Ad copy error: ${data.error}`)
          return fallbackAdCopy
        }
      } catch (parseError) {
        addDebugLog(`Error parsing ad copy response: ${parseError}`)
        setAdCopyError("Error parsing ad copy response. Using default copy instead.")
        return fallbackAdCopy
      }
    } catch (fetchError) {
      addDebugLog(`Error fetching ad copy: ${fetchError}`)
      setAdCopyError("Network error while generating ad copy. Using default copy instead.")
      return fallbackAdCopy
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

    // Reset states
    setIsGenerating(true)
    setAdCopyError(null)
    setGenerationError(null)
    setPreviewImage(null)
    setGenerationProgress(0)
    setGenerationStatus("Starting generation with GPT-4...")
    setDebugLogs([])
    addDebugLog("Starting ad generation process")

    // Generate ad copy if enabled
    let adCopy = null
    if (generateAdCopy) {
      try {
        adCopy = await generateAdCopyWithFallback()
        setGeneratedAdCopy(adCopy)
        addDebugLog("Ad copy generated successfully")

        if (adCopyError) {
          toast({
            title: "Ad Copy Warning",
            description: adCopyError,
            variant: "default",
          })
        }
      } catch (error) {
        console.error("Error generating ad copy:", error)
        addDebugLog(`Error generating ad copy: ${error}`)
        // Continue with image generation even if copy generation fails
        toast({
          title: "Ad Copy Generation Issue",
          description: "There was a problem generating ad copy with GPT-4, but we'll continue with your image.",
          variant: "default",
        })

        // Use fallback ad copy
        adCopy = {
          primaryText: "Your compelling ad copy will appear here.",
          headlines: ["Headline 1", "Headline 2", "Headline 3", "Headline 4", "Headline 5"],
          descriptions: ["Description 1", "Description 2"],
        }
      }
    }

    try {
      // Generate images for each selected aspect ratio
      const totalRatios = selectedAspectRatios.length
      const generatedImages = []
      let successCount = 0
      let failureCount = 0

      for (let i = 0; i < totalRatios; i++) {
        const aspectRatio = selectedAspectRatios[i]
        setGenerationProgress(Math.round(((i + 1) / totalRatios) * 100))
        addDebugLog(`Starting generation for aspect ratio: ${aspectRatio}`)

        try {
          // Use the improved generateAdWithFallback function
          const data = await generateAdWithFallback(prompt, aspectRatio)

          if (data.success) {
            successCount++
            generatedImages.push({
              url: data.imageUrl,
              aspectRatio,
            })
            addDebugLog(`Successfully generated image for ${aspectRatio}`)

            // Save the ad based on user status
            if (isAnonymous) {
              // Save to localStorage for anonymous users
              saveAnonymousAd({
                title,
                prompt,
                imageUrl: data.imageUrl,
                aspectRatio,
                type: "image",
                // Don't include advanced fields for anonymous users
              })
              addDebugLog(`Saved ad to local storage for anonymous user`)
            } else if (user?.id) {
              try {
                // Save to Supabase for authenticated users - but only with basic fields
                // This avoids the schema error with ad_copy
                await createAd({
                  title,
                  prompt,
                  imageUrl: data.imageUrl,
                  aspectRatio,
                  userId: user.id,
                  type: "image",
                  // Intentionally omitting adCopy, adTone, adCta, adOffer, adPoints
                })
                addDebugLog(`Saved ad to database for user: ${user.id}`)
              } catch (saveError: any) {
                addDebugLog(`Error saving to database: ${saveError.message}`)
                console.error("Error saving ad to database:", saveError)

                // Don't show an error toast for database issues
                // The image was still generated successfully
              }
            }
          } else {
            failureCount++
            addDebugLog(`Error from API: ${data.error}`)
            toast({
              title: "Error generating image",
              description: data.error || "Something went wrong. Please try again.",
              variant: "destructive",
            })
          }
        } catch (error: any) {
          failureCount++
          addDebugLog(`Error generating image: ${error.message}`)
          toast({
            title: "Error generating image",
            description: error.message || "Failed to generate image. Please try again.",
            variant: "destructive",
          })
        }
      }

      // Ensure progress reaches 100% at the end
      setGenerationProgress(100)
      setGenerationStatus("Generation complete!")

      if (successCount > 0) {
        // Show the ad performance analyzer for the first generated image
        setGeneratedAdImage(generatedImages[0]?.url || null)
        setShowPerformanceAnalyzer(true)
        addDebugLog(`Generation completed successfully: ${successCount} images generated`)

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
          description: `Successfully generated ${successCount} ad variations with GPT-4.`,
        })

        // Redirect to library after a short delay
        setTimeout(() => {
          router.push("/dashboard/library")
        }, 1500)
      } else {
        addDebugLog(`Generation failed: No successful images generated`)
        toast({
          title: "Generation failed",
          description: "Failed to generate any ads with GPT-4. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      addDebugLog(`Error in generation process: ${error.message}`)
      toast({
        title: "Error",
        description: "Failed to generate ads with GPT-4. Please try again.",
        variant: "destructive",
      })
    } finally {
      // Stop any running progress simulation
      stopProgressSimulation()
      setIsGenerating(false)
      addDebugLog("Generation process completed")
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

              {/* New alert to inform users about the GPT-4 model */}

              {adCopyError && (
                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-700">{adCopyError}</AlertDescription>
                </Alert>
              )}

              {generationError && (
                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-700">{generationError}</AlertDescription>
                </Alert>
              )}

              {isGenerating && (
                <div className="bg-background border border-border/40 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="font-medium">{generationStatus}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{generationProgress}%</span>
                  </div>
                  <Progress value={generationProgress} className="h-2" />
                  {currentAspectRatio && (
                    <p className="text-xs text-muted-foreground">Currently processing: {currentAspectRatio} format</p>
                  )}
                </div>
              )}

              {previewImage && (
                <div className="relative rounded-lg overflow-hidden border border-border/40">
                  <img
                    src={previewImage || "/placeholder.svg"}
                    alt="Preview of generated ad"
                    className="w-full h-auto object-contain"
                  />
                  <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">Preview</div>
                </div>
              )}

              {/* Debug logs section */}
              {debugLogs.length > 0 && (
                <div className="mt-4">
                  <Button variant="outline" size="sm" onClick={() => setShowDebugLogs(!showDebugLogs)} className="mb-2">
                    {showDebugLogs ? "Hide Debug Logs" : "Show Debug Logs"}
                  </Button>

                  {showDebugLogs && (
                    <div className="bg-black text-green-400 p-4 rounded-md text-xs font-mono overflow-auto max-h-60">
                      {debugLogs.map((log, index) => (
                        <div key={index} className="mb-1">
                          {log}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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

                <div className="space-y-6">
                  {/* Ad Tone Selection */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      Ad Tone
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              Select the tone of voice for your ad. This affects how your message is conveyed.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {["Professional", "Friendly", "Exciting", "Luxury", "Minimalist", "Bold"].map((tone) => (
                        <Button
                          key={tone}
                          type="button"
                          variant={adTone.toLowerCase() === tone.toLowerCase() ? "default" : "outline"}
                          className={`h-10 ${
                            adTone.toLowerCase() === tone.toLowerCase() ? "bg-primary text-white" : "bg-background"
                          }`}
                          onClick={() => setAdTone(tone.toLowerCase())}
                        >
                          {tone}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Call to Action Input */}
                  <div className="space-y-3">
                    <Label htmlFor="ad-cta" className="flex items-center gap-2">
                      Call to Action
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              The action you want viewers to take (e.g., "Shop Now", "Learn More", "Sign Up Today")
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <Input
                      id="ad-cta"
                      placeholder="e.g., Shop Now, Learn More, Sign Up Today"
                      className="bg-background transition-all duration-200 focus:ring-2 focus:ring-primary/50"
                      value={adCta}
                      onChange={(e) => setAdCta(e.target.value)}
                      maxLength={20}
                    />
                    <div className="text-xs text-right text-muted-foreground">{adCta.length}/20 characters</div>
                  </div>

                  {/* Special Offer Input */}
                  <div className="space-y-3">
                    <Label htmlFor="ad-offer" className="flex items-center gap-2">
                      Special Offer
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              Add a promotional offer to highlight in your ad (e.g., "50% Off", "Free Shipping")
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <Input
                      id="ad-offer"
                      placeholder="e.g., 50% Off, Free Shipping, Limited Time Offer"
                      className="bg-background transition-all duration-200 focus:ring-2 focus:ring-primary/50"
                      value={adOffer}
                      onChange={(e) => setAdOffer(e.target.value)}
                      maxLength={25}
                    />
                    <div className="text-xs text-right text-muted-foreground">{adOffer.length}/25 characters</div>
                  </div>

                  {/* Key Points Inputs */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      Key Points (max 25 characters each)
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Add up to three short bullet points to highlight in your ad</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <div className="space-y-2">
                      {[0, 1, 2].map((index) => (
                        <div key={index} className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground min-w-[20px]">{index + 1}.</span>
                            <Input
                              placeholder={`Key point ${index + 1}`}
                              className="bg-background transition-all duration-200 focus:ring-2 focus:ring-primary/50"
                              value={adPoints[index]}
                              onChange={(e) => updateAdPoint(index, e.target.value)}
                              maxLength={25}
                            />
                          </div>
                          <div className="text-xs text-right text-muted-foreground ml-7 mt-1">
                            {adPoints[index].length}/25 characters
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
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
                        {generationStatus}
                        <div
                          className="absolute bottom-0 left-0 h-1 bg-white/30"
                          style={{ width: `${generationProgress}%`, transition: "width 0.3s ease-in-out" }}
                        />
                      </>
                    ) : (
                      <>
                        <ImageIcon className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                        Generate
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
            adCopy={generatedAdCopy}
            prompt={prompt}
            aspectRatio={selectedAspectRatios[0]}
          />
        </motion.div>
      )}
    </>
  )
}
