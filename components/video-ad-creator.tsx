"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AspectRatioSelector } from "@/components/aspect-ratio-selector"
import { createAd } from "@/lib/ad-service"
import { saveAnonymousAd, getAnonymousAdCount, incrementAnonymousDownloadCount } from "@/lib/anonymous-storage"
import { PaywallModal } from "@/components/paywall-modal"
import { UsageCounter } from "@/components/usage-counter"
import { Clock, Download, Loader2 } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { useAuth } from "@/context/auth-context"

export function VideoAdCreator() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [prompt, setPrompt] = useState("")
  const [title, setTitle] = useState("")
  const [aspectRatio, setAspectRatio] = useState("16:9")
  const [duration, setDuration] = useState(15) // Default 15 seconds
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [showPaywall, setShowPaywall] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const progressInterval = useRef<NodeJS.Timeout | null>(null)

  // Clear progress interval on unmount
  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }
  }, [])

  const handleGenerate = async () => {
    if (!prompt) {
      toast({
        title: "Please enter a prompt",
        description: "You need to provide a description for your video ad.",
        variant: "destructive",
      })
      return
    }

    // Check if anonymous user has reached the limit
    if (!user) {
      const anonymousCount = getAnonymousAdCount()
      if (anonymousCount >= 3) {
        setShowPaywall(true)
        return
      }
    }

    setIsGenerating(true)
    setProgress(0)
    setVideoUrl(null)

    // Simulate progress
    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          if (progressInterval.current) {
            clearInterval(progressInterval.current)
          }
          return prev
        }
        return prev + 5
      })
    }, 1000)

    try {
      // For now, we'll simulate the API call
      await new Promise((resolve) => setTimeout(resolve, 5000))

      // Simulate a successful response
      const mockVideoUrl = `/placeholder.svg?height=720&width=${aspectRatio === "16:9" ? 1280 : aspectRatio === "9:16" ? 405 : 720}`

      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }

      setProgress(100)
      setVideoUrl(mockVideoUrl)

      // Save the ad to the database or local storage
      if (user?.id) {
        await createAd({
          title: title || "Untitled Video Ad",
          prompt,
          imageUrl: mockVideoUrl,
          aspectRatio,
          userId: user.id,
          type: "video",
        })
      } else {
        saveAnonymousAd({
          title: title || "Untitled Video Ad",
          prompt,
          imageUrl: mockVideoUrl,
          aspectRatio,
          type: "video",
        })
      }

      toast({
        title: "Video ad generated!",
        description: "Your video ad has been created successfully.",
      })
    } catch (error) {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
      setProgress(0)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = async () => {
    if (!videoUrl) return

    setIsDownloading(true)

    try {
      // In a real implementation, you would download the actual video file
      // For now, we'll just simulate a download
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Track download
      if (!user) {
        incrementAnonymousDownloadCount()
      }

      toast({
        title: "Download started",
        description: "Your video ad is being downloaded.",
      })
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download video ad. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const getAvailableAspectRatios = () => {
    const allRatios = [
      { value: "1:1", label: "Square (1:1)" },
      { value: "4:5", label: "Portrait (4:5)" },
      { value: "9:16", label: "Vertical (9:16)" },
      { value: "16:9", label: "Landscape (16:9)" },
      { value: "4:3", label: "Classic (4:3)" },
      { value: "21:9", label: "Cinematic (21:9)" },
    ]

    // For free users, only allow 1:1 and 9:16
    if (!user?.subscription || user.subscription.plan === "free") {
      return allRatios.map((ratio) => ({
        ...ratio,
        disabled: !["1:1", "9:16"].includes(ratio.value),
        tooltip: !["1:1", "9:16"].includes(ratio.value) ? "Upgrade to access this aspect ratio" : undefined,
      }))
    }

    return allRatios
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">
                Ad Title (Optional)
              </label>
              <Input
                id="title"
                placeholder="Enter a title for your ad"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isGenerating}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="prompt" className="text-sm font-medium">
                Ad Description
              </label>
              <Textarea
                id="prompt"
                placeholder="Describe your video ad in detail. Include information about the product, target audience, style, and any specific elements you want to include."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isGenerating}
                className="min-h-[120px]"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Aspect Ratio</label>
              <AspectRatioSelector
                selectedAspectRatio={aspectRatio}
                onAspectRatioChange={setAspectRatio}
                disabled={isGenerating}
                aspectRatios={getAvailableAspectRatios()}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Duration: {duration} seconds
              </label>
              <Slider
                value={[duration]}
                min={5}
                max={60}
                step={5}
                onValueChange={(values) => setDuration(values[0])}
                disabled={isGenerating}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5s</span>
                <span>30s</span>
                <span>60s</span>
              </div>
            </div>
            <Button onClick={handleGenerate} disabled={isGenerating || !prompt}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Video Ad"
              )}
            </Button>
            {isGenerating && (
              <div className="grid gap-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-center text-muted-foreground">
                  {progress < 100
                    ? "Generating your video ad... This may take a minute."
                    : "Video ad generated! Processing final result..."}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {videoUrl && (
        <Card>
          <CardContent className="p-6">
            <div className="grid gap-4">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                {/* In a real implementation, this would be a video player */}
                <div className="text-center p-4">
                  <p className="text-lg font-medium">Video Ad Preview</p>
                  <p className="text-sm text-muted-foreground">
                    {aspectRatio} • {duration}s
                  </p>
                </div>
              </div>
              <Button onClick={handleDownload} disabled={isDownloading}>
                {isDownloading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download Video
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <UsageCounter />

      <PaywallModal open={showPaywall} onOpenChange={setShowPaywall} />
    </div>
  )
}
