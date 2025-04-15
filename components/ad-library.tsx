"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Share2, Trash2, Loader2, LogIn, Search, Filter, Check, X } from "lucide-react"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { useAuth } from "@/context/auth-context"
import { getUserAds, deleteAd, type Ad } from "@/lib/ad-service"
import { getAnonymousAds, deleteAnonymousAd, type AnonymousAd } from "@/lib/anonymous-storage"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function AdLibrary() {
  const { user, isAnonymous } = useAuth()
  const [ads, setAds] = useState<(Ad | AnonymousAd)[]>([])
  const [filteredAds, setFilteredAds] = useState<(Ad | AnonymousAd)[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

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

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="bg-secondary border border-border/40 w-full">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <div className="grid gap-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-bold">Your Ad Library</h2>

                {isAnonymous && (
                  <Link href="/signup">
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign up to save your ads
                    </Button>
                  </Link>
                )}
              </div>

              {/* Search and filter bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search ads..."
                    className="pl-9 bg-background"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Filter className="h-4 w-4" />
                      {selectedFilter ? `Filter: ${selectedFilter}` : "Filter"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSelectedFilter(null)}>All aspect ratios</DropdownMenuItem>
                    {getAspectRatioFilters().map((ratio) => (
                      <DropdownMenuItem key={ratio} onClick={() => setSelectedFilter(ratio)}>
                        {ratio}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredAds.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || selectedFilter
                      ? "No ads match your search criteria."
                      : "You haven't created any ads yet."}
                  </p>
                  {!searchQuery && !selectedFilter && (
                    <Link href="/dashboard">
                      <Button className="bg-primary hover:bg-primary/90">Create Your First Ad</Button>
                    </Link>
                  )}
                  {(searchQuery || selectedFilter) && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("")
                        setSelectedFilter(null)
                      }}
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <AnimatePresence>
                    {filteredAds.map((ad) => (
                      <motion.div
                        key={ad.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        layout
                        className="h-full"
                      >
                        <Card className="overflow-hidden bg-background border border-border/40 h-full flex flex-col">
                          <div className="relative">
                            <AspectRatio ratio={getAspectRatioValue(ad.aspectRatio)}>
                              <img
                                src={ad.imageUrl || "/placeholder.svg"}
                                alt={ad.title}
                                className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                              />
                            </AspectRatio>
                            <div className="absolute top-2 right-2">
                              <span className="bg-black/70 text-white text-xs px-2 py-1 rounded">{ad.aspectRatio}</span>
                            </div>
                          </div>
                          <CardContent className="p-4 flex-1 flex flex-col">
                            <div className="space-y-2 flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium">{ad.title}</h3>
                                  <p className="text-xs text-muted-foreground">
                                    Created on {new Date(ad.createdAt || "").toLocaleDateString()}
                                  </p>
                                </div>
                                {deleteConfirmId === ad.id ? (
                                  <div className="flex gap-1">
                                    <Button
                                      variant="destructive"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => handleDelete(ad.id)}
                                    >
                                      <Check className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => setDeleteConfirmId(null)}
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Button variant="ghost" size="icon" onClick={() => setDeleteConfirmId(ad.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">{ad.prompt}</p>
                            </div>
                            <div className="flex gap-2 pt-4 mt-auto">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => window.open(ad.imageUrl, "_blank")}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </Button>
                              <Button variant="outline" size="sm" className="w-full">
                                <Share2 className="h-3 w-3 mr-1" />
                                Share
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {isAnonymous && filteredAds.length > 0 && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mt-4">
                  <p className="text-sm">
                    <strong>Note:</strong> As a guest user, your ads are stored locally in your browser. To keep them
                    permanently and access them from any device,{" "}
                    <Link href="/signup" className="text-primary hover:underline">
                      create an account
                    </Link>
                    .
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

// Helper function to convert aspect ratio string to numeric value for the AspectRatio component
function getAspectRatioValue(aspectRatio: string): number {
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
