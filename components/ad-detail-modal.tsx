"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Copy, FileText, ImageIcon, Tag, MessageSquare, ListChecks } from "lucide-react"
import Image from "next/image"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"

// Define the ad copy type
interface AdCopy {
  primaryText?: string
  headlines?: string[]
  descriptions?: string[]
}

// Define the ad type
interface Ad {
  id?: string
  title: string
  prompt: string
  imageUrl: string
  aspectRatio: string
  createdAt?: string
  type?: string
  adCopy?: AdCopy | null
  adTone?: string | null
  adCta?: string | null
  adOffer?: string | null
  adPoints?: string[] | null
}

interface AdDetailModalProps {
  ad: Ad | null
  isOpen: boolean
  onClose: () => void
  onDownload?: (ad: Ad, size?: string) => void
}

// Define common ad sizes for different aspect ratios
const adSizes = {
  "1:1": ["1080x1080", "800x800", "600x600"],
  "4:5": ["1080x1350", "800x1000", "600x750"],
  "16:9": ["1920x1080", "1280x720", "854x480"],
  "9:16": ["1080x1920", "720x1280", "480x854"],
  "1.91:1": ["1200x628", "1080x565", "820x428"],
}

export function AdDetailModal({ ad, isOpen, onClose, onDownload }: AdDetailModalProps) {
  const [activeTab, setActiveTab] = useState("preview")

  if (!ad) return null

  // Get available sizes for this ad's aspect ratio
  const availableSizes = adSizes[ad.aspectRatio as keyof typeof adSizes] || []

  // Format the prompt for better readability
  const formattedPrompt = ad.prompt.split(/\s*\|\s*/).join("\n• ")
  const hasFormattedPrompt = formattedPrompt.includes("\n• ")

  // Function to copy ad copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "The text has been copied to your clipboard.",
    })
  }

  const handleDownload = (size?: string) => {
    if (onDownload) {
      onDownload(ad, size)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{ad.title}</DialogTitle>
          <DialogDescription>
            {ad.createdAt ? `Created on ${new Date(ad.createdAt).toLocaleDateString()}` : "Recently created"}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              <span>Preview</span>
            </TabsTrigger>
            <TabsTrigger value="sizes" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span>Download Sizes</span>
            </TabsTrigger>
            <TabsTrigger value="copy" className="flex items-center gap-2" disabled={!ad.adCopy}>
              <FileText className="h-4 w-4" />
              <span>Ad Copy</span>
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-2">
              <ListChecks className="h-4 w-4" />
              <span>Ad Details</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Ad Preview</CardTitle>
                    <CardDescription>
                      <Badge variant="outline" className="mr-2">
                        {ad.aspectRatio}
                      </Badge>
                      <Badge variant="secondary">{ad.type || "image"}</Badge>
                      {ad.adTone && (
                        <Badge variant="secondary" className="ml-2">
                          {ad.adTone}
                        </Badge>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative overflow-hidden rounded-md border">
                      <AspectRatio ratio={getAspectRatioValue(ad.aspectRatio)}>
                        <Image
                          src={ad.imageUrl || "/placeholder.svg"}
                          alt={ad.title}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg"
                          }}
                        />
                      </AspectRatio>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={() => handleDownload()} className="w-full" variant="default">
                      <Download className="h-4 w-4 mr-2" />
                      Download Original
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Prompt Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/50 p-4 rounded-md whitespace-pre-line">
                      {hasFormattedPrompt ? (
                        <>
                          <p className="font-medium mb-2">Prompt parameters:</p>
                          <p>{formattedPrompt}</p>
                        </>
                      ) : (
                        <p>{ad.prompt}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sizes">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Available Sizes</CardTitle>
                <CardDescription>Download your ad in different sizes for various platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {availableSizes.map((size) => (
                    <Card key={size} className="overflow-hidden">
                      <CardHeader className="p-4 pb-0">
                        <CardTitle className="text-base">{size}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <div className="relative overflow-hidden rounded-md border h-32">
                          <Image
                            src={ad.imageUrl || "/placeholder.svg"}
                            alt={`${ad.title} - ${size}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Button onClick={() => handleDownload(size)} className="w-full" variant="outline" size="sm">
                          <Download className="h-3 w-3 mr-2" />
                          Download {size}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="copy">
            {ad.adCopy ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Meta Ad Copy</CardTitle>
                  <CardDescription>Copy and paste these elements into your Meta Ads Manager</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {ad.adCopy.primaryText && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Primary Text</h4>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(ad.adCopy?.primaryText || "")}>
                          <Copy className="h-3 w-3 mr-2" />
                          Copy
                        </Button>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-md text-sm">{ad.adCopy.primaryText}</div>
                    </div>
                  )}

                  {ad.adCopy.headlines && ad.adCopy.headlines.some((h) => h) && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Headlines</h4>
                      <div className="space-y-2">
                        {ad.adCopy.headlines
                          .filter((h) => h)
                          .map((headline, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <div className="bg-muted/50 p-3 rounded-md text-sm flex-1">{headline}</div>
                              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(headline)}>
                                <Copy className="h-3 w-3" />
                                <span className="sr-only">Copy</span>
                              </Button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {ad.adCopy.descriptions && ad.adCopy.descriptions.some((d) => d) && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Descriptions</h4>
                      <div className="space-y-2">
                        {ad.adCopy.descriptions
                          .filter((d) => d)
                          .map((description, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <div className="bg-muted/50 p-3 rounded-md text-sm flex-1">{description}</div>
                              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(description)}>
                                <Copy className="h-3 w-3" />
                                <span className="sr-only">Copy</span>
                              </Button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No ad copy available for this ad.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ad Details</CardTitle>
                <CardDescription>Custom elements included in this ad</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {ad.adTone && (
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <h4 className="text-sm font-medium flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Tone
                      </h4>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-md text-sm">{ad.adTone}</div>
                  </div>
                )}

                {ad.adCta && (
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <h4 className="text-sm font-medium flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        Call to Action
                      </h4>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-md text-sm">{ad.adCta}</div>
                  </div>
                )}

                {ad.adOffer && (
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <h4 className="text-sm font-medium flex items-center">
                        <Tag className="h-4 w-4 mr-2" />
                        Special Offer
                      </h4>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-md text-sm">{ad.adOffer}</div>
                  </div>
                )}

                {ad.adPoints && ad.adPoints.length > 0 && ad.adPoints.some((point) => point) && (
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <h4 className="text-sm font-medium flex items-center">
                        <ListChecks className="h-4 w-4 mr-2" />
                        Key Points
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {ad.adPoints
                        .filter((point) => point)
                        .map((point, i) => (
                          <div key={i} className="bg-muted/50 p-3 rounded-md text-sm">
                            • {point}
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {!ad.adTone && !ad.adCta && !ad.adOffer && (!ad.adPoints || !ad.adPoints.some((point) => point)) && (
                  <div className="p-8 text-center">
                    <p className="text-muted-foreground">No custom details available for this ad.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

// Helper function to convert aspect ratio string to numeric value
function getAspectRatioValue(aspectRatio: string): number {
  // Check if it's a Google ad size format (e.g., "300x250")
  if (/^\d+x\d+$/.test(aspectRatio)) {
    const [width, height] = aspectRatio.split("x").map(Number)
    return width / height
  }

  // For standard aspect ratios
  switch (aspectRatio) {
    case "1:1":
      return 1
    case "4:5":
      return 4 / 5
    case "9:16":
      return 9 / 16
    case "16:9":
      return 16 / 9
    case "1.91:1":
      return 1.91
    default:
      return 1
  }
}
