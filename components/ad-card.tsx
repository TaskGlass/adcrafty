"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Video, Trash, FileText, BarChart2 } from "lucide-react"
import Image from "next/image"
import { AdPerformanceAnalyzer } from "@/components/ad-performance-analyzer"
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
  onDownload: () => void
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
  const [showAdCopy, setShowAdCopy] = useState(false)
  const [showAnalyzer, setShowAnalyzer] = useState(false)

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

  return (
    <Card>
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
                <Badge variant="secondary" className="cursor-pointer" onClick={() => setShowAdCopy(!showAdCopy)}>
                  <FileText className="h-3 w-3 mr-1" />
                  Ad Copy
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{safeAd.prompt}</p>
            <div className="text-xs text-muted-foreground">
              Created on {new Date(safeAd.createdAt).toLocaleDateString()}
            </div>

            {showAdCopy && safeAd.adCopy && (
              <div className="mt-2 p-3 bg-background/50 border border-border/40 rounded-md">
                <h4 className="text-sm font-medium mb-2">Meta Ad Copy</h4>
                {safeAd.adCopy.primaryText && (
                  <div className="mb-2">
                    <p className="text-xs font-medium">Primary Text:</p>
                    <p className="text-xs text-muted-foreground">{safeAd.adCopy.primaryText}</p>
                  </div>
                )}
                {safeAd.adCopy.headlines && safeAd.adCopy.headlines.some((h) => h) && (
                  <div className="mb-2">
                    <p className="text-xs font-medium">Headlines:</p>
                    <ul className="text-xs text-muted-foreground">
                      {safeAd.adCopy.headlines
                        .filter((h) => h)
                        .map((headline, i) => (
                          <li key={i}>{headline}</li>
                        ))}
                    </ul>
                  </div>
                )}
                {safeAd.adCopy.descriptions && safeAd.adCopy.descriptions.some((d) => d) && (
                  <div>
                    <p className="text-xs font-medium">Descriptions:</p>
                    <ul className="text-xs text-muted-foreground">
                      {safeAd.adCopy.descriptions
                        .filter((d) => d)
                        .map((description, i) => (
                          <li key={i}>{description}</li>
                        ))}
                    </ul>
                  </div>
                )}
                <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs" onClick={() => setShowAdCopy(false)}>
                  Hide Ad Copy
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative aspect-square h-20 overflow-hidden rounded-md">
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
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onDownload}
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

      {showDeleteConfirm && (
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
      )}
    </Card>
  )
}
