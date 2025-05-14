"use client"
import DashboardHeader from "@/components/dashboard-header"
import DashboardShell from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart2, Sparkles, ImageIcon, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const router = useRouter()

  const handleCreateOption = (type: string) => {
    // Store the selected type in localStorage or session storage
    localStorage.setItem("selectedCreationType", type)
    // Navigate to the ad creator page
    router.push("/dashboard/create")
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text="Create and manage your content" />

      <Card className="mb-8 bg-primary/10 border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-primary" />
            <CardTitle>New: Ad Performance Analyzer</CardTitle>
          </div>
          <CardDescription>
            Our AI now analyzes your ads and provides a performance score out of 100, with detailed feedback to help you
            improve your ads.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Create content or go to your Library to analyze existing items.</span>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-8">
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Using flex and flex-col with justify-between to align buttons */}
            <Card className="cursor-pointer hover:border-primary/50 transition-colors flex flex-col">
              <div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    Static Image Ads
                  </CardTitle>
                  <CardDescription>Create professional static image ads for various platforms</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Perfect for display ads, banners, and print materials</p>
                </CardContent>
              </div>
              <div className="mt-auto p-6 pt-0">
                <Button className="w-full" onClick={() => handleCreateOption("static-image-ad")}>
                  Create Static Ad
                </Button>
              </div>
            </Card>

            <Card className="cursor-pointer hover:border-primary/50 transition-colors flex flex-col">
              <div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-primary" />
                    Social Media Creatives
                  </CardTitle>
                  <CardDescription>Design engaging content for social media platforms</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Optimized for Instagram, Facebook, Twitter, and LinkedIn
                  </p>
                </CardContent>
              </div>
              <div className="mt-auto p-6 pt-0">
                <Button className="w-full" onClick={() => handleCreateOption("social-media-creative")}>
                  Create Social Media Content
                </Button>
              </div>
            </Card>

            <Card className="cursor-pointer hover:border-primary/50 transition-colors flex flex-col">
              <div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    Stock Photos
                  </CardTitle>
                  <CardDescription>Generate custom stock photos for your projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Create unique images that match your brand's style</p>
                </CardContent>
              </div>
              <div className="mt-auto p-6 pt-0">
                <Button className="w-full" onClick={() => handleCreateOption("stock-photo")}>
                  Create Stock Photo
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recently created content and activity</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                You haven't created any content recently. Get started by creating something new!
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>View insights about your content performance</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Analytics will be available once you've created some content.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
