"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Trash2, Copy, MoreHorizontal, ExternalLink } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { deleteAd } from "@/lib/ad-service"
import { AdDetailModal } from "@/components/ad-detail-modal"
import { motion } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { format } from "date-fns"

interface AdCardProps {
  id?: string
  title: string
  prompt: string
  imageUrl: string
  aspectRatio: string
  createdAt?: string
  onDelete?: (id: string) => void
  type?: "image" | "video"
  adCopy?: any
  adTone?: string
  adCta?: string
  adOffer?: string
  adPoints?: string[]
}

export function AdCard({
  id,
  title,
  prompt,
  imageUrl,
  aspectRatio,
  createdAt,
  onDelete,
  type = "image",
  adCopy,
  adTone,
  adCta,
  adOffer,
  adPoints,
}: AdCardProps) {
  const [showModal, setShowModal] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${title.replace(/\s+/g, "-").toLowerCase()}-${aspectRatio.replace(":", "x")}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Download started",
        description: "Your ad image is being downloaded.",
      })
    } catch (error) {
      console.error("Error downloading image:", error)
      toast({
        title: "Download failed",
        description: "Failed to download the image. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt)
    toast({
      title: "Prompt copied",
      description: "The ad prompt has been copied to your clipboard.",
    })
  }

  const handleDelete = async () => {
    if (!id) return

    try {
      await deleteAd(id)
      if (onDelete) {
        onDelete(id)
      }
      toast({
        title: "Ad deleted",
        description: "The ad has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting ad:", error)
      toast({
        title: "Delete failed",
        description: "Failed to delete the ad. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleOpenModal = () => {
    setShowModal(true)
  }

  const formattedDate = createdAt ? format(new Date(createdAt), "MMM d, yyyy") : "Recently created"

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.02 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="h-full"
      >
        <Card className="overflow-hidden h-full border border-border/40 hover:border-primary/30 transition-all duration-300 bg-card">
          <CardContent className="p-0 h-full flex flex-col">
            <div className="p-4 pb-2 flex-grow space-y-2">
              <div className="flex justify-between items-start">
                <h3
                  className="font-medium text-lg cursor-pointer hover:text-primary transition-colors duration-200"
                  onClick={handleOpenModal}
                >
                  {title}
                </h3>
                <Badge variant="outline" className="ml-2 text-xs">
                  {aspectRatio}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{prompt}</p>
              <p className="text-xs text-muted-foreground mt-1">{formattedDate}</p>
            </div>

            <div className="relative cursor-pointer group" onClick={handleOpenModal}>
              <div className="aspect-square overflow-hidden bg-muted/30 relative">
                <img
                  src={imageUrl || "/placeholder.svg"}
                  alt={title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center">
                  <Button variant="secondary" size="sm" className="mb-4 bg-background/80 backdrop-blur-sm">
                    View Details
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-3 flex justify-between items-center border-t border-border/30">
              <div className="flex space-x-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDownload}>
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Download</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopyPrompt}>
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy prompt</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy prompt</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleOpenModal}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View details
                  </DropdownMenuItem>
                  {id && onDelete && (
                    <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <AdDetailModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={title}
        prompt={prompt}
        imageUrl={imageUrl}
        aspectRatio={aspectRatio}
        createdAt={createdAt}
        type={type}
        adCopy={adCopy}
        adTone={adTone}
        adCta={adCta}
        adOffer={adOffer}
        adPoints={adPoints}
      />
    </>
  )
}
