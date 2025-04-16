"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Trash2, Copy, MoreHorizontal, ExternalLink, Eye } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import Image from "next/image"

interface AdCardProps {
  ad: {
    id?: string
    title: string
    prompt: string
    imageUrl: string
    aspectRatio: string
    createdAt?: string
    type?: "image" | "video"
    adCopy?: any
    adTone?: string
    adCta?: string
    adOffer?: string
    adPoints?: string[]
  }
  onDelete?: (id: string) => void
  onDownload?: (ad: any, size?: string) => void
  onViewDetails?: (ad: any) => void
  isVideo?: boolean
  canDownload?: boolean
  isCheckingDownloadPermission?: boolean
  viewMode?: "grid" | "compact" | "list"
}

export function AdCard({
  ad,
  onDelete,
  onDownload,
  onViewDetails,
  isVideo = false,
  canDownload = true,
  isCheckingDownloadPermission = false,
  viewMode = "grid",
}: AdCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleDownload = async () => {
    if (onDownload) {
      onDownload(ad)
    }
  }

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(ad.prompt)
    toast({
      title: "Prompt copied",
      description: "The ad prompt has been copied to your clipboard.",
    })
  }

  const handleDelete = async () => {
    if (!ad.id || !onDelete) return

    onDelete(ad.id)
  }

  const formattedDate = ad.createdAt ? format(new Date(ad.createdAt), "MMM d, yyyy") : "Recently created"

  // Compact view
  if (viewMode === "compact") {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        className="h-full"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <Card className="overflow-hidden h-full border border-border/40 hover:border-primary/30 transition-all duration-300">
          <div
            className="aspect-square relative cursor-pointer overflow-hidden"
            onClick={() => onViewDetails && onViewDetails(ad)}
          >
            <Image
              src={ad.imageUrl || "/placeholder.svg"}
              alt={ad.title}
              fill
              className="object-cover transition-transform duration-500 hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/placeholder.svg"
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-center">
              <Button variant="secondary" size="sm" className="mb-4 bg-background/80 backdrop-blur-sm">
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
            </div>
          </div>
          <CardContent className="p-3">
            <div className="flex justify-between items-start mb-1">
              <h3
                className="font-medium text-sm truncate cursor-pointer hover:text-primary transition-colors duration-200"
                onClick={() => onViewDetails && onViewDetails(ad)}
              >
                {ad.title}
              </h3>
              <Badge variant="outline" className="ml-1 text-xs scale-75 origin-right">
                {ad.aspectRatio}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">{formattedDate}</p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="h-3 w-3" />
                    <span className="sr-only">More options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onViewDetails && onViewDetails(ad)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownload} disabled={!canDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyPrompt}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy prompt
                  </DropdownMenuItem>
                  {ad.id && onDelete && (
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
    )
  }

  // List view
  if (viewMode === "list") {
    return (
      <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }} className="h-full">
        <Card className="overflow-hidden h-full border border-border/40 hover:border-primary/30 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div
                className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0 cursor-pointer"
                onClick={() => onViewDetails && onViewDetails(ad)}
              >
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
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3
                      className="font-medium text-base truncate cursor-pointer hover:text-primary transition-colors duration-200"
                      onClick={() => onViewDetails && onViewDetails(ad)}
                    >
                      {ad.title}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">{ad.prompt}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {ad.aspectRatio}
                      </Badge>
                      <p className="text-xs text-muted-foreground">{formattedDate}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleDownload}
                            disabled={!canDownload}
                          >
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
                    {ad.id && onDelete && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDelete}>
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onViewDetails && onViewDetails(ad)}
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span className="sr-only">View details</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View details</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Default grid view
  return (
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
                onClick={() => onViewDetails && onViewDetails(ad)}
              >
                {ad.title}
              </h3>
              <Badge variant="outline" className="ml-2 text-xs">
                {ad.aspectRatio}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{ad.prompt}</p>
            <p className="text-xs text-muted-foreground mt-1">{formattedDate}</p>
          </div>

          <div className="relative cursor-pointer group" onClick={() => onViewDetails && onViewDetails(ad)}>
            <div className="aspect-square overflow-hidden bg-muted/30 relative">
              <Image
                src={ad.imageUrl || "/placeholder.svg"}
                alt={ad.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg"
                }}
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleDownload}
                      disabled={!canDownload}
                    >
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
                <DropdownMenuItem onClick={() => onViewDetails && onViewDetails(ad)}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View details
                </DropdownMenuItem>
                {ad.id && onDelete && (
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
  )
}
