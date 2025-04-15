import { NextResponse } from "next/server"
import OpenAI from "openai"

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "OpenAI API key is not configured",
          imageUrl: `/placeholder.svg?height=800&width=800&text=${encodeURIComponent("API key not configured")}`,
        },
        { status: 200 },
      )
    }

    // Parse request body
    const body = await req.json().catch(() => null)
    if (!body || !body.prompt || !body.aspectRatio) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request. Missing prompt or aspectRatio.",
          imageUrl: `/placeholder.svg?height=800&width=800&text=${encodeURIComponent("Invalid request")}`,
        },
        { status: 200 },
      )
    }

    const { prompt, aspectRatio, brandAnalysis } = body

    // Generate image with proper error handling
    try {
      // Use the OpenAI client directly instead of the AI SDK
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: enhancePrompt(prompt, aspectRatio, brandAnalysis),
        n: 1,
        size: getImageSize(aspectRatio),
      })

      // Extract the image URL from the response
      const imageUrl = response.data[0]?.url

      if (!imageUrl) {
        throw new Error("No image URL returned from OpenAI")
      }

      return NextResponse.json({
        success: true,
        imageUrl,
        aspectRatio,
      })
    } catch (imageError: any) {
      console.error("OpenAI API error:", imageError)

      // Return a valid JSON response with error details
      return NextResponse.json(
        {
          success: false,
          error: imageError.message || "Failed to generate image with OpenAI",
          imageUrl: `/placeholder.svg?height=800&width=800&text=${encodeURIComponent("Image generation failed")}`,
        },
        { status: 200 },
      )
    }
  } catch (error: any) {
    console.error("Server error:", error)

    // Always return a valid JSON response even for unexpected errors
    return NextResponse.json(
      {
        success: false,
        error: "Server error occurred",
        imageUrl: `/placeholder.svg?height=800&width=800&text=${encodeURIComponent("Server error")}`,
      },
      { status: 200 },
    )
  }
}

// Helper function to determine image size based on aspect ratio
function getImageSize(aspectRatio: string): "1024x1024" | "1792x1024" | "1024x1792" {
  switch (aspectRatio) {
    case "1:1":
      return "1024x1024"
    case "16:9":
    case "1.91:1":
      return "1792x1024"
    case "4:5":
    case "9:16":
      return "1024x1792"
    default:
      return "1024x1024"
  }
}

// Helper function to enhance the prompt for better ad generation
function enhancePrompt(prompt: string, aspectRatio: string, brandAnalysis?: any) {
  let enhancedPrompt = `Create a professional advertising image for digital marketing with the following details: ${prompt}. 
  The image should be high quality, visually appealing, and suitable for a ${aspectRatio} aspect ratio advertisement.
  Make it look like a professional advertisement that would appear on social media platforms.
  Ensure the composition works well for this specific aspect ratio.`

  // If brand analysis is provided, incorporate it into the prompt
  if (brandAnalysis) {
    enhancedPrompt += `\n\nThis ad is for a brand with the following characteristics:
    - Brand name/website: ${brandAnalysis.title || brandAnalysis.url}
    - Brand description: ${brandAnalysis.description}
    - Brand keywords: ${brandAnalysis.keywords}
    - Brand messaging: ${brandAnalysis.headings?.h1 || ""} ${brandAnalysis.headings?.h2 || ""}
    
    Please incorporate these brand elements into the ad design. Use a style, color scheme, and tone that matches the brand's identity.
    If the brand has specific colors (${brandAnalysis.potentialColors?.join(", ") || "not specified"}), try to incorporate them.
    The ad should feel like it belongs to this brand's existing marketing materials.`
  }

  return enhancedPrompt
}
