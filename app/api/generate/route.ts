import { NextResponse } from "next/server"
import OpenAI from "openai"

// Initialize the OpenAI client with error handling
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Update the enhancePrompt function to include the new fields
function enhancePrompt(
  prompt: string,
  aspectRatio: string,
  brandAnalysis?: any,
  brandSettings?: any,
  adTone?: string,
  adCta?: string,
  adOffer?: string,
  adPoints?: string[],
) {
  // Check if it's a Google ad size format (e.g., "300x250")
  const isGoogleAdSize = /^\d+x\d+$/.test(aspectRatio)

  let enhancedPrompt = `Create a professional advertising image for digital marketing with the following details: ${prompt}. 
  The image should be high quality, visually appealing, and suitable for ${isGoogleAdSize ? `a Google display ad with dimensions ${aspectRatio} pixels` : `a ${aspectRatio} aspect ratio advertisement`}.
  Make it look like a professional advertisement that would appear on ${isGoogleAdSize ? "Google Display Network" : "social media platforms"}.
  Ensure the composition works well for this specific ${isGoogleAdSize ? "ad size" : "aspect ratio"}.`

  // Add tone information if provided
  if (adTone) {
    enhancedPrompt += `\n\nThe tone of the ad should be ${adTone}.`
  }

  // Add CTA if provided
  if (adCta) {
    enhancedPrompt += `\n\nInclude a clear call-to-action button or text that says "${adCta}".`
  }

  // Add offer if provided
  if (adOffer) {
    enhancedPrompt += `\n\nHighlight this special offer prominently in the ad: "${adOffer}".`
  }

  // Add key points if provided
  if (adPoints && adPoints.length > 0) {
    enhancedPrompt += `\n\nInclude these key points as bullet points or highlighted text in the ad design:`
    adPoints.forEach((point, index) => {
      if (point.trim()) {
        enhancedPrompt += `\n- ${point}`
      }
    })
  }

  // If brand settings are provided, incorporate them into the prompt
  if (brandSettings) {
    enhancedPrompt += `\n\nUse the following brand settings for this ad:
    ${brandSettings.primaryColor ? `- Primary brand color: ${brandSettings.primaryColor}` : ""}
    ${brandSettings.secondaryColor ? `- Secondary brand color: ${brandSettings.secondaryColor}` : ""}
    ${brandSettings.accentColor ? `- Accent color: ${brandSettings.accentColor}` : ""}
    ${brandSettings.brandTone ? `- Brand tone: ${brandSettings.brandTone}` : ""}
    ${brandSettings.brandVoice ? `- Brand voice: ${brandSettings.brandVoice}` : ""}
    `
  }

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

// Update the POST function to extract the new fields from the request body
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

    // Parse request body with better error handling
    let body
    try {
      body = await req.json()
    } catch (parseError) {
      console.error("Error parsing request body:", parseError)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request format",
          imageUrl: `/placeholder.svg?height=800&width=800&text=${encodeURIComponent("Invalid request format")}`,
        },
        { status: 200 },
      )
    }

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

    const { prompt, aspectRatio, brandAnalysis, brandSettings, adTone, adCta, adOffer, adPoints } = body

    // Set up a timeout for the OpenAI request
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    try {
      // Generate image with proper error handling
      const enhancedPrompt = enhancePrompt(
        prompt,
        aspectRatio,
        brandAnalysis,
        brandSettings,
        adTone,
        adCta,
        adOffer,
        adPoints,
      )
      console.log("Sending prompt to OpenAI:", enhancedPrompt.substring(0, 100) + "...")

      // Use the OpenAI client with the abort controller signal
      const response = await openai.images.generate(
        {
          model: "dall-e-3",
          prompt: enhancedPrompt,
          n: 1,
          size: getImageSize(aspectRatio),
        },
        { signal: controller.signal },
      )

      // Clear the timeout since the request completed
      clearTimeout(timeoutId)

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
      // Clear the timeout if there was an error
      clearTimeout(timeoutId)

      console.error("OpenAI API error:", imageError)

      // Check if it's an abort error (timeout)
      if (imageError.name === "AbortError") {
        console.log("Request timed out, using fallback")
        return NextResponse.json(
          {
            success: false,
            error: "Request timed out",
            imageUrl: `/placeholder.svg?height=800&width=800&text=${encodeURIComponent("Request timed out")}`,
          },
          { status: 200 },
        )
      }

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
  // Check if it's a Google ad size format (e.g., "300x250")
  if (/^\d+x\d+$/.test(aspectRatio)) {
    // For Google ad sizes, we'll use square format as DALL-E doesn't support arbitrary dimensions
    return "1024x1024"
  }

  // For standard aspect ratios
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
