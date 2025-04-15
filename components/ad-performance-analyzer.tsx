"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Loader2, BarChart2, ChevronDown, ChevronUp, ThumbsUp, AlertTriangle, TrendingUp, Info } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AdPerformanceAnalyzerProps {
  imageUrl?: string
  adCopy?: any
  prompt?: string
  aspectRatio?: string
}

export function AdPerformanceAnalyzer({ imageUrl, adCopy, prompt, aspectRatio }: AdPerformanceAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [targetAudience, setTargetAudience] = useState("")
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const analyzeAd = async () => {
    if (!imageUrl && !adCopy && !prompt) {
      toast({
        title: "Missing information",
        description: "Please provide an image, ad copy, or prompt to analyze.",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)
    setFallbackMessage(null)

    try {
      // Add a small delay to prevent rapid retries
      if (retryCount > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      const response = await fetch("/api/analyze-ad", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl,
          adCopy,
          prompt,
          aspectRatio,
          targetAudience: targetAudience || undefined,
        }),
      })

      // Handle non-JSON responses
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Server returned non-JSON response: ${contentType}`)
      }

      const data = await response.json()

      if (data.success) {
        setAnalysis(data.analysis)
        setIsExpanded(true)

        if (data.fallback) {
          setFallbackMessage(data.message || "Showing estimated analysis due to processing limitations.")
        }
      } else {
        // If we get an error but have retries left, try again
        if (retryCount < 2) {
          setRetryCount((prev) => prev + 1)
          toast({
            title: "Retrying analysis",
            description: "First attempt failed, trying again...",
          })
          setIsAnalyzing(false)
          analyzeAd() // Retry
          return
        }

        toast({
          title: "Analysis failed",
          description: data.error || "Failed to analyze ad. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error analyzing ad:", error)

      // If we have retries left, try again
      if (retryCount < 2) {
        setRetryCount((prev) => prev + 1)
        toast({
          title: "Retrying analysis",
          description: "Connection issue, trying again...",
        })
        setIsAnalyzing(false)
        analyzeAd() // Retry
        return
      }

      // If we've exhausted retries, show fallback
      setAnalysis({
        overallScore: 65,
        categoryScores: {
          visualAppeal: 16,
          messageClarity: 16,
          brandAlignment: 13,
          callToAction: 10,
          targetAudienceFit: 10,
        },
        strengths: ["The ad appears to have a professional design", "The core message seems to be present"],
        improvementAreas: [
          "Consider refining the visual elements for better engagement",
          "The call to action could be strengthened",
          "More targeted messaging may improve audience response",
        ],
        performancePrediction:
          "This ad may perform at an average level but has potential for improvement with some refinements.",
      })
      setIsExpanded(true)
      setFallbackMessage("Unable to connect to analysis service. Showing estimated analysis.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "visualAppeal":
        return "Visual Appeal"
      case "messageClarity":
        return "Message Clarity"
      case "brandAlignment":
        return "Brand Alignment"
      case "callToAction":
        return "Call to Action"
      case "targetAudienceFit":
        return "Target Audience Fit"
      default:
        return category
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-primary" />
          Ad Performance Analyzer
        </CardTitle>
        <CardDescription>Analyze your ad to get a performance score and suggestions for improvement</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="targetAudience">Target Audience (Optional)</Label>
            <Input
              id="targetAudience"
              placeholder="e.g., 'Women 25-34 interested in fitness' or 'Small business owners'"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="bg-background"
            />
            <p className="text-xs text-muted-foreground">
              Providing your target audience helps generate more accurate analysis
            </p>
          </div>

          <Button
            onClick={() => {
              setRetryCount(0) // Reset retry count on new analysis
              analyzeAd()
            }}
            disabled={isAnalyzing || (!imageUrl && !adCopy && !prompt)}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {retryCount > 0 ? `Retrying (${retryCount}/2)...` : "Analyzing..."}
              </>
            ) : (
              <>
                <BarChart2 className="mr-2 h-4 w-4" />
                Analyze Ad Performance
              </>
            )}
          </Button>

          <AnimatePresence>
            {analysis && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {fallbackMessage && (
                  <Alert className="mb-4 bg-yellow-50 border-yellow-200">
                    <Info className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-700 text-sm">{fallbackMessage}</AlertDescription>
                  </Alert>
                )}

                <div className="pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold ${getScoreBg(
                          analysis.overallScore,
                        )}`}
                      >
                        {Math.round(analysis.overallScore)}
                      </div>
                      <div>
                        <h3 className="font-medium">Overall Score</h3>
                        <p className="text-sm text-muted-foreground">Out of 100 points</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="h-8 w-8 p-0"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="space-y-6 pt-2">
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium">Category Scores</h4>
                            {analysis.categoryScores &&
                              Object.entries(analysis.categoryScores).map(([category, score]: [string, any]) => (
                                <div key={category} className="space-y-1">
                                  <div className="flex items-center justify-between">
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className="text-sm">{getCategoryLabel(category)}</span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p className="text-xs max-w-xs">
                                            {category === "visualAppeal"
                                              ? "How visually attractive and professional the ad looks"
                                              : category === "messageClarity"
                                                ? "How clear and compelling the message is"
                                                : category === "brandAlignment"
                                                  ? "How well it represents the brand identity"
                                                  : category === "callToAction"
                                                    ? "Effectiveness of the call to action"
                                                    : "How well it appeals to the intended audience"}
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                    <span className={`text-sm font-medium ${getScoreColor(score)}`}>{score}</span>
                                  </div>
                                  <Progress
                                    value={score}
                                    max={
                                      category === "visualAppeal" || category === "messageClarity"
                                        ? 25
                                        : category === "brandAlignment"
                                          ? 20
                                          : 15
                                    }
                                    className="h-2"
                                    indicatorClassName={getScoreBg(
                                      (score /
                                        (category === "visualAppeal" || category === "messageClarity"
                                          ? 25
                                          : category === "brandAlignment"
                                            ? 20
                                            : 15)) *
                                        100,
                                    )}
                                  />
                                </div>
                              ))}
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium flex items-center gap-2">
                                <ThumbsUp className="h-4 w-4 text-green-500" />
                                Strengths
                              </h4>
                              <ul className="space-y-1">
                                {analysis.strengths &&
                                  analysis.strengths.map((strength: string, index: number) => (
                                    <li key={index} className="text-sm flex items-start gap-2">
                                      <Badge variant="outline" className="bg-green-500/10 text-green-500 mt-0.5">
                                        {index + 1}
                                      </Badge>
                                      <span>{strength}</span>
                                    </li>
                                  ))}
                              </ul>
                            </div>

                            <div className="space-y-2">
                              <h4 className="text-sm font-medium flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                Areas for Improvement
                              </h4>
                              <ul className="space-y-1">
                                {analysis.improvementAreas &&
                                  analysis.improvementAreas.map((area: string, index: number) => (
                                    <li key={index} className="text-sm flex items-start gap-2">
                                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 mt-0.5">
                                        {index + 1}
                                      </Badge>
                                      <span>{area}</span>
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-sm font-medium flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-primary" />
                              Performance Prediction
                            </h4>
                            <p className="text-sm bg-primary/10 p-3 rounded-md border border-primary/20">
                              {analysis.performancePrediction}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  )
}
