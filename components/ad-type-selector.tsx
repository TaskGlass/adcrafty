"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { AdCreator } from "@/components/ad-creator"
import { ImageIcon, Video } from "lucide-react"

export function AdTypeSelector() {
  const [adType, setAdType] = useState("image")

  return (
    <Tabs defaultValue="image" onValueChange={setAdType}>
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="image" className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          <span>Image Ad</span>
        </TabsTrigger>
        <TabsTrigger value="video" className="flex items-center gap-2">
          <Video className="h-4 w-4" />
          <span>Video Ad (Coming Soon)</span>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="image">
        <AdCreator />
      </TabsContent>
      <TabsContent value="video">
        <div className="p-8 text-center">
          <h3 className="text-lg font-medium">Video Ad Creation</h3>
          <p className="text-muted-foreground mt-2">Video ad creation is coming soon! Stay tuned for updates.</p>
        </div>
      </TabsContent>
    </Tabs>
  )
}
