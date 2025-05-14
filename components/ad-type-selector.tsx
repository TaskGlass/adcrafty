"use client"

import { useState } from "react"
import { AdCreator } from "@/components/ad-creator"

export function AdTypeSelector() {
  const [adType, setAdType] = useState("image")

  return (
    <div>
      <AdCreator />
    </div>
  )
}
