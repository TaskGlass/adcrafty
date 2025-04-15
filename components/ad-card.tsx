"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Video, Trash, FileText, BarChart2, ExternalLink } from "lucide-react"
import Image from "next/image"
import { AdPerformanceAnalyzer } from "@/components/ad-performance-analyzer"
import { AdDetailModal } from "@/components/ad-detail-modal"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface AdCardProps {
  ad: any
  onDelete: () => void
  onDownload: (ad: any, size?: string) => void
  isVideo?: boolean
  canDownload?: boolean
  isCheckingDownloadPermission?: boolean
}

export function AdCard({
  ad,
  onDelete,
  onDownload,
  isVideo = false,
  canDownload = true,
  isCheckingDownloadPermission = false,
}: AdCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showAnalyzer, setShowAnalyzer] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Ensure ad has all required properties
  const safeAd = {
    id: ad.id || "",
    title: ad.title || "Untitled Ad",
    prompt: ad.prompt || "",
    imageUrl: ad.imageUrl || "/placeholder.svg",
    aspectRatio: ad.aspectRatio || "1:1",
    createdAt: ad.createdAt || new Date().toISOString(),
    type: ad.type || "image",
    adCopy: ad.adCopy || null,
  }

  // Format the prompt for better readability (truncated version for card)
  const truncatedPrompt = safeAd.prompt.length > 100 ? safeAd.prompt.substring(0, 100) + "..." : safeAd.prompt

  return (
    <>
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{safeAd.title}</h3>
                <Badge variant="outline" className="ml-auto">
                  {safeAd.aspectRatio}
                </Badge>
                {isVideo && (
                  <Badge variant="secondary">
                    <Video className="h-3 w-3 mr-1" />
                    Video
                  </Badge>
                )}
                {safeAd.adCopy && (
                  <Badge variant="secondary">
                    <FileText className="h-3 w-3 mr-1" />
                    Copy
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{truncatedPrompt}</p>
              <div className="text-xs text-muted-foreground">
                Created on {new Date(safeAd.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="relative aspect-square h-20 overflow-hidden rounded-md cursor-pointer border hover:border-primary/50"
                onClick={() => setShowDetailModal(true)}
              >
                <AspectRatio ratio={getAspectRatioValue(safeAd.aspectRatio)}>
                  <Image
                    src={safeAd.imageUrl || "/placeholder.svg"}
                    alt={safeAd.title}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      // Fallback if image fails to load
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg"
                    }}
                  />
                  {isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Video className="h-8 w-8 text-white" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/20 transition-opacity">
                    <ExternalLink className="h-6 w-6 text-white" />
                  </div>
                </AspectRatio>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDownload(ad)}
                  title="Download"
                  disabled={!canDownload || isCheckingDownloadPermission}
                >
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setShowDeleteConfirm(true)} title="Delete">
                  <Trash className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAnalyzer(!showAnalyzer)}
                  title="Analyze Performance"
                >
                  <BarChart2 className="h-4 w-4" />
                  <span className="sr-only">Analyze Performance</span>
                </Button>
              </div>
            </div>
          </div>

          {showAnalyzer && (
            <div className="mt-4 pt-4 border-t border-border/40">
              <AdPerformanceAnalyzer
                imageUrl={safeAd.imageUrl}
                adCopy={safeAd.adCopy}
                prompt={safeAd.prompt}
                aspectRatio={safeAd.aspectRatio}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteConfirm(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete()
                setShowDeleteConfirm(false)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Ad Detail Modal */}
      <AdDetailModal
        ad={safeAd}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onDownload={onDownload}
      />
    </>
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
