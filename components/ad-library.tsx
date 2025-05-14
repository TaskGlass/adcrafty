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
import { useRouter } from "next/navigation"
import { AdCard } from "@/components/ad-card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ImageIcon,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Grid3X3,
  Grid2X2,
  LayoutList,
  Share2,
  ShoppingBag,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AdDetailModal } from "@/components/ad-detail-modal"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"

export default function AdLibrary() {
  const { user, isAnonymous, subscription } = useAuth()
  const [ads, setAds] = useState<any[]>([])
  const [filteredAds, setFilteredAds] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [canDownload, setCanDownload] = useState(true)
  const [isCheckingDownloadPermission, setIsCheckingDownloadPermission] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "compact" | "list">("grid")
  const [selectedAd, setSelectedAd] = useState<any | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()

  const fetchAds = async (showLoading = true) => {
    if (showLoading) setIsLoading(true)
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
        description: "Failed to load your content. Please try again.",
        variant: "destructive",
      })
    } finally {
      if (showLoading) setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const refreshAds = () => {
    setIsRefreshing(true)
    fetchAds(false)
  }

  useEffect(() => {
    fetchAds()
  }, [user, isAnonymous])

  useEffect(() => {
    // Filter ads based on search query, selected filter, and selected type
    let result = [...ads]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter((ad) => ad.title.toLowerCase().includes(query) || ad.prompt.toLowerCase().includes(query))
    }

    if (selectedFilter) {
      result = result.filter((ad) => ad.aspectRatio === selectedFilter)
    }

    if (selectedType) {
      result = result.filter((ad) => ad.contentType === selectedType)
    }

    setFilteredAds(result)
  }, [searchQuery, selectedFilter, selectedType, ads])

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
          title: "Item deleted",
          description: "The item has been successfully deleted.",
        })
      }
    } catch (error) {
      console.error("Error deleting item:", error)
      toast({
        title: "Error",
        description: "Failed to delete the item. Please try again.",
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

  const handleViewDetails = (ad: any) => {
    setSelectedAd(ad)
    setIsDetailModalOpen(true)
  }

  // Get unique aspect ratios for filtering
  const aspectRatios = [...new Set(ads.map((ad) => ad.aspectRatio))].filter(Boolean)

  // Content type options
  const contentTypes = [
    { id: "static-image-ad", label: "Static Image Ad", icon: <ImageIcon className="h-4 w-4 mr-2" /> },
    { id: "social-media-creative", label: "Social Media Creative", icon: <Share2 className="h-4 w-4 mr-2" /> },
    { id: "stock-photo", label: "Stock Photo", icon: <ImageIcon className="h-4 w-4 mr-2" /> },
    { id: "product-photo", label: "Product Photo", icon: <ShoppingBag className="h-4 w-4 mr-2" /> },
  ]

  // Function to get the content type label
  const getContentTypeLabel = (type: string) => {
    const contentType = contentTypes.find((ct) => ct.id === type)
    return contentType ? contentType.label : "Unknown Type"
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="default" className="flex items-center gap-2" onClick={() => router.push("/dashboard")}>
            <Plus className="h-4 w-4" />
            <span>Create New</span>
          </Button>
          <Button variant="outline" size="icon" onClick={refreshAds} disabled={isRefreshing} className="relative">
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">{selectedFilter || "Filter"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter by aspect ratio</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setSelectedFilter(null)}>All aspect ratios</DropdownMenuItem>
                {aspectRatios.map((ratio) => (
                  <DropdownMenuItem key={ratio} onClick={() => setSelectedFilter(ratio as string)}>
                    {ratio}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                {viewMode === "grid" && <Grid3X3 className="h-4 w-4" />}
                {viewMode === "compact" && <Grid2X2 className="h-4 w-4" />}
                {viewMode === "list" && <LayoutList className="h-4 w-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setViewMode("grid")}>
                <Grid3X3 className="h-4 w-4 mr-2" />
                Grid View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewMode("compact")}>
                <Grid2X2 className="h-4 w-4 mr-2" />
                Compact View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewMode("list")}>
                <LayoutList className="h-4 w-4 mr-2" />
                List View
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Badge
          variant={selectedType === null ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setSelectedType(null)}
        >
          All Types
        </Badge>
        {contentTypes.map((type) => (
          <Badge
            key={type.id}
            variant={selectedType === type.id ? "default" : "outline"}
            className="cursor-pointer flex items-center"
            onClick={() => setSelectedType(type.id)}
          >
            {type.icon}
            {type.label}
          </Badge>
        ))}
      </div>

      {isLoading ? (
        <div
          className={`grid gap-4 ${
            viewMode === "grid"
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              : viewMode === "compact"
                ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                : "grid-cols-1"
          }`}
        >
          {Array.from({ length: viewMode === "grid" ? 6 : viewMode === "compact" ? 8 : 4 }).map((_, i) => (
            <AdCardSkeleton key={i} viewMode={viewMode} />
          ))}
        </div>
      ) : filteredAds.length > 0 ? (
        <AnimatePresence>
          <motion.div
            className={`grid gap-4 ${
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                : viewMode === "compact"
                  ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                  : "grid-cols-1"
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {filteredAds.map((ad) => (
              <motion.div
                key={ad.id || `anonymous-${ad.title}`}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <AdCard
                  ad={ad}
                  onDelete={() => handleDelete(ad.id || "")}
                  onDownload={handleDownload}
                  onViewDetails={() => handleViewDetails(ad)}
                  canDownload={canDownload}
                  isCheckingDownloadPermission={isCheckingDownloadPermission}
                  viewMode={viewMode}
                  contentTypeLabel={getContentTypeLabel(ad.contentType || "static-image-ad")}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      ) : (
        <EmptyState
          title="Your library is empty"
          description="Create your first content to see it here."
          action={<Button onClick={() => router.push("/dashboard")}>Create New</Button>}
        />
      )}

      {selectedAd && (
        <AdDetailModal
          ad={selectedAd}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          onDownload={handleDownload}
          contentTypeLabel={getContentTypeLabel(selectedAd.contentType || "static-image-ad")}
        />
      )}
    </div>
  )
}

function AdCardSkeleton({ viewMode = "grid" }: { viewMode?: "grid" | "compact" | "list" }) {
  if (viewMode === "compact") {
    return (
      <Card className="overflow-hidden">
        <div className="aspect-square bg-muted animate-pulse"></div>
        <CardContent className="p-3">
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 w-1/2" />
        </CardContent>
      </Card>
    )
  }

  if (viewMode === "list") {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-md flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Default grid view
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="ml-auto h-5 w-12" />
            </div>
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="aspect-square rounded-md" />
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
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
