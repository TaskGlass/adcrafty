"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, ImageIcon, Video, Trash, FileText } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { getUserAds, deleteAd, type Ad } from "@/lib/ad-service"
import { getAnonymousAds, deleteAnonymousAd, type AnonymousAd } from "@/lib/anonymous-storage"
import { toast } from "@/components/ui/use-toast"
import { canUserDownload, trackDownload, trackAnonymousDownload } from "@/lib/usage-service"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

export default function AdLibrary() {
  const { user, isAnonymous, subscription } = useAuth()
  const [ads, setAds] = useState<(Ad | AnonymousAd)[]>([])
  const [filteredAds, setFilteredAds] = useState<(Ad | AnonymousAd)[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [canDownload, setCanDownload] = useState(true)
  const [isCheckingDownloadPermission, setIsCheckingDownloadPermission] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function fetchAds() {
      setIsLoading(true)
      try {
        if (isAnonymous) {
          // Get ads from localStorage for anonymous users
          const anonymousAds = getAnonymousAds()
          setAds(anonymousAds)
          setFilteredAds(anonymousAds)
        } else if (user?.id) {
          // Get ads from Supabase for authenticated users
          const userAds = await getUserAds(user.id)
          setAds(userAds)
          setFilteredAds(userAds)
        }
      } catch (error) {
        console.error("Error fetching ads:", error)
        toast({
          title: "Error",
          description: "Failed to load your ads. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAds()
  }, [user, isAnonymous])

  useEffect(() => {
    // Filter ads based on search query and selected filter
    let result = [...ads]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter((ad) => ad.title.toLowerCase().includes(query) || ad.prompt.toLowerCase().includes(query))
    }

    if (selectedFilter) {
      result = result.filter((ad) => ad.aspectRatio === selectedFilter)
    }

    setFilteredAds(result)
  }, [searchQuery, selectedFilter, ads])

  useEffect(() => {
    async function checkDownloadPermissions() {
      setIsCheckingDownloadPermission(true)
      try {
        const hasPermission = await canUserDownload(user?.id || null, subscription?.status || null)
        setCanDownload(hasPermission)
      } catch (error) {
        console.error("Error checking download permissions:", error)
        setCanDownload(true) // Default to allowing downloads if check fails
      } finally {
        setIsCheckingDownloadPermission(false)
      }
    }

    checkDownloadPermissions()
  }, [user, subscription])

  const handleDelete = async (id: string) => {
    try {
      let success = false

      if (isAnonymous) {
        // Delete from localStorage for anonymous users
        success = deleteAnonymousAd(id)
      } else {
        // Delete from Supabase for authenticated users
        await deleteAd(id)
        success = true
      }

      if (success) {
        setAds(ads.filter((ad) => ad.id !== id))
        setFilteredAds(filteredAds.filter((ad) => ad.id !== id))
        setDeleteConfirmId(null)
        toast({
          title: "Ad deleted",
          description: "The ad has been successfully deleted.",
        })
      }
    } catch (error) {
      console.error("Error deleting ad:", error)
      toast({
        title: "Error",
        description: "Failed to delete the ad. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getAspectRatioFilters = () => {
    const ratios = new Set<string>()
    ads.forEach((ad) => ratios.add(ad.aspectRatio))
    return Array.from(ratios)
  }

  const handleDownload = async (ad: Ad | AnonymousAd) => {
    if (!canDownload) {
      toast({
        title: "Download limit reached",
        description: isAnonymous
          ? "You've reached your monthly download limit. Sign up for more downloads."
          : "You've reached your monthly download limit. Please upgrade your plan for more downloads.",
        variant: "destructive",
      })
      return
    }

    try {
      // Track the download
      if (isAnonymous) {
        trackAnonymousDownload()
      } else if (user?.id) {
        await trackDownload(user.id, ad.id || "")
      }

      // Open the image in a new tab
      window.open(ad.imageUrl, "_blank")

      // Update the local state to reflect the new download count
      setCanDownload(await canUserDownload(user?.id || null, subscription?.status || null))
    } catch (error) {
      console.error("Error downloading image:", error)
      toast({
        title: "Download failed",
        description: "Failed to download the image. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="grid gap-6">
      <Tabs defaultValue="image" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="image" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            <span>Image Ads</span>
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            <span>Video Ads</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="image">
          {isLoading ? (
            <div className="grid gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <AdCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredAds.filter((ad) => ad.type === "image" || !ad.type).length > 0 ? (
            <div className="grid gap-4">
              {filteredAds
                .filter((ad) => ad.type === "image" || !ad.type)
                .map((ad) => (
                  <AdCard
                    key={ad.id || `anonymous-${ad.title}`}
                    ad={ad}
                    onDelete={() => handleDelete(ad.id || "")}
                    onDownload={() => handleDownload(ad)}
                    canDownload={canDownload}
                    isCheckingDownloadPermission={isCheckingDownloadPermission}
                  />
                ))}
            </div>
          ) : (
            <EmptyState
              title="No image ads yet"
              description="Create your first image ad to see it here."
              action={<Button onClick={() => router.push("/dashboard")}>Create Image Ad</Button>}
            />
          )}
        </TabsContent>

        <TabsContent value="video">
          {isLoading ? (
            <div className="grid gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <AdCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredAds.filter((ad) => ad.type === "video").length > 0 ? (
            <div className="grid gap-4">
              {filteredAds
                .filter((ad) => ad.type === "video")
                .map((ad) => (
                  <AdCard
                    key={ad.id || `anonymous-${ad.title}`}
                    ad={ad}
                    onDelete={() => handleDelete(ad.id || "")}
                    onDownload={() => handleDownload(ad)}
                    isVideo={true}
                    canDownload={canDownload}
                    isCheckingDownloadPermission={isCheckingDownloadPermission}
                  />
                ))}
            </div>
          ) : (
            <EmptyState
              title="No video ads yet"
              description="Create your first video ad to see it here."
              action={<Button onClick={() => router.push("/dashboard?tab=video")}>Create Video Ad</Button>}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Update the AdCard component to handle video ads and add proper type checking
interface AdCardProps {
  ad: Ad | AnonymousAd
  onDelete: () => void
  onDownload: () => void
  isVideo?: boolean
  canDownload?: boolean
  isCheckingDownloadPermission?: boolean
}

function AdCard({
  ad,
  onDelete,
  onDownload,
  isVideo = false,
  canDownload = true,
  isCheckingDownloadPermission = false,
}: AdCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showAdCopy, setShowAdCopy] = useState(false)

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
            </div>
          </div>
        </div>
      </CardContent>

      {showDeleteConfirm && (
        <AlertDialog>
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

function AdCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="ml-auto h-5 w-12" />
            </div>
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-20 w-20 rounded-md" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface EmptyStateProps {
  title: string
  description: string
  action: React.ReactNode
}

function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="p-10 flex items-center justify-center flex-col space-y-4">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
        {action}
      </CardContent>
    </Card>
  )
}

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

// Helper function to convert aspect ratio string to numeric value for the AspectRatio component
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

import { Skeleton } from "@/components/ui/skeleton"
