"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardHeader from "@/components/dashboard-header"
import DashboardShell from "@/components/dashboard-shell"
import { AdCreator } from "@/components/ad-creator"
import { ImageIcon, Share2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CreatePage() {
  const router = useRouter()
  const [creationType, setCreationType] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [icon, setIcon] = useState<React.ReactNode>(null)

  useEffect(() => {
    // Get the selected creation type from localStorage
    const selectedType = localStorage.getItem("selectedCreationType")
    if (!selectedType) {
      // If no type is selected, redirect back to dashboard
      router.push("/dashboard")
      return
    }

    setCreationType(selectedType)

    // Set title, description, and icon based on the selected type
    switch (selectedType) {
      case "static-image-ad":
        setTitle("Create Static Image Ad")
        setDescription("Design professional static image ads for various platforms")
        setIcon(<ImageIcon className="h-5 w-5 text-primary mr-2" />)
        break
      case "social-media-creative":
        setTitle("Create Social Media Creative")
        setDescription("Design engaging content optimized for social media platforms")
        setIcon(<Share2 className="h-5 w-5 text-primary mr-2" />)
        break
      case "stock-photo":
        setTitle("Create Stock Photo")
        setDescription("Generate custom stock photos for your projects")
        setIcon(<ImageIcon className="h-5 w-5 text-primary mr-2" />)
        break
      default:
        setTitle("Create Content")
        setDescription("Design professional content with AI")
        setIcon(null)
    }
  }, [router])

  return (
    <DashboardShell>
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <DashboardHeader
          heading={
            <div className="flex items-center">
              {icon}
              {title}
            </div>
          }
          text={description}
        />
      </div>

      {creationType && <AdCreator contentType={creationType} />}
    </DashboardShell>
  )
}
