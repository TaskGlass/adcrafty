"use client"

import { CardContent } from "@/components/ui/card"
import { Card } from "@/components/ui/card"
import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { getUserAds, deleteAd } from "@/lib/ad-service"
import { getAnonymousAds, deleteAnonymousAd } from "@/lib/anonymous-storage"
import { toast } from "@/components/ui/use-toast"
import { canUserDownload, trackDownload, trackAnonymousDownload } from "@/lib/usage-service"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { AdCard } from "@/components/ad-card"
import { Skeleton } from "@/components/ui/skeleton"
import { ImageIcon, Video } from "lucide-react"

export default function AdLibrary() {
  const { user, isAnonymous, subscription } = useAuth()
  const [ads, setAds] = useState<any[]>([])
  const [filteredAds, setFilteredAds] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
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

  const handleDownload = async (ad: any, size?: string) => {
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

      // If a specific size is requested, we would normally resize the image
      // For now, we'll just open the original image but in a real implementation
      // you would call a resize API endpoint
      if (size) {
        // In a real implementation, you would call a resize API
        // For now, we'll just show a toast and open the original
        toast({
          title: `Downloading ${size}`,
          description:
            "The image will be downloaded in the original size. In a production environment, this would be resized.",
        })
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
                    onDownload={handleDownload}
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
                    onDownload={handleDownload}
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
