import { NextResponse } from "next/server"

// Enhanced logging function
function logDebug(message: string, data?: any) {
  console.log(`[FALLBACK DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : "")
}

// This is a fallback route that returns placeholder images when the OpenAI API fails
export async function POST(req: Request) {
  logDebug("Fallback image generation request received")

  try {
    const body = await req.json()
    logDebug("Request body parsed", body)

    const { aspectRatio, prompt } = body

    // Create a placeholder image URL based on the aspect ratio
    let width = 800
    let height = 800

    // Check if it's a Google ad size format (e.g., "300x250")
    if (/^\d+x\d+$/.test(aspectRatio)) {
      const [w, h] = aspectRatio.split("x").map(Number)
      width = w
      height = h
    } else {
      // For standard aspect ratios
      switch (aspectRatio) {
        case "1:1":
          width = 800
          height = 800
          break
        case "4:5":
          width = 800
          height = 1000
          break
        case "9:16":
          width = 800
          height = 1422
          break
        case "16:9":
          width = 1422
          height = 800
          break
        case "1.91:1":
          width = 1528
          height = 800
          break
      }
    }

    const placeholderText = prompt
      ? `Sample Ad - Based on: ${prompt.substring(0, 30)}...`
      : "Sample Ad - OpenAI API Unavailable"

    const placeholderUrl = `/placeholder.svg?height=${height}&width=${width}&text=${encodeURIComponent(placeholderText)}`

    logDebug("Generated fallback image", { placeholderUrl })

    return NextResponse.json({
      success: true,
      imageUrl: placeholderUrl,
      aspectRatio,
      isFallback: true,
    })
  } catch (error) {
    logDebug("Error in fallback route", { error })

    // Even if everything fails, return a basic placeholder
    return NextResponse.json({
      success: true,
      imageUrl: "/placeholder.svg?height=800&width=800&text=Sample+Ad",
      aspectRatio: "1:1",
      isFallback: true,
    })
  }
}
