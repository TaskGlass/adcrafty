import { NextResponse } from "next/server"

// This is a fallback route that returns placeholder images when the OpenAI API fails
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { aspectRatio } = body

    // Create a placeholder image URL based on the aspect ratio
    let width = 800
    let height = 800

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

    const placeholderUrl = `/placeholder.svg?height=${height}&width=${width}&text=${encodeURIComponent(
      "Sample Ad - OpenAI API Unavailable",
    )}`

    return NextResponse.json({
      success: true,
      imageUrl: placeholderUrl,
      aspectRatio,
      isFallback: true,
    })
  } catch (error) {
    console.error("Error in fallback route:", error)
    return NextResponse.json({
      success: false,
      error: "Error in fallback route",
      imageUrl: "/placeholder.svg?height=800&width=800&text=Error",
    })
  }
}
