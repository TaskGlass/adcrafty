import { NextResponse } from "next/server"
import OpenAI from "openai"

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Enhanced logging function
function logDebug(message: string, data?: any) {
  console.log(`[DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : "")
}

// Function to enhance the prompt with additional details
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

// Helper function to determine image size based on aspect ratio for gpt-image-1
function getImageSize(aspectRatio: string): { width: number; height: number } {
  // Check if it's a Google ad size format (e.g., "300x250")
  if (/^\d+x\d+$/.test(aspectRatio)) {
    const [w, h] = aspectRatio.split("x").map(Number)
    // Scale to fit within model limits while maintaining aspect ratio
    const maxDimension = Math.max(w, h)
    const scale = 1024 / maxDimension
    return {
      width: Math.round(w * scale),
      height: Math.round(h * scale),
    }
  }

  // For standard aspect ratios
  switch (aspectRatio) {
    case "1:1":
      return { width: 1024, height: 1024 }
    case "16:9":
      return { width: 1792, height: 1024 }
    case "1.91:1":
      return { width: 1792, height: 1024 }
    case "4:5":
      return { width: 1024, height: 1280 }
    case "9:16":
      return { width: 1024, height: 1792 }
    default:
      return { width: 1024, height: 1024 }
  }
}

// Function to generate a fallback image URL
function generateFallbackImageUrl(aspectRatio: string, errorMessage: string): string {
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

  return `/placeholder.svg?height=${height}&width=${width}&text=${encodeURIComponent(`Sample Ad - ${errorMessage}`)}`
}

// Main API handler
export async function POST(req: Request) {
  logDebug("Image generation request received")

  try {
    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      logDebug("OpenAI API key is missing")
      return NextResponse.json(
        {
          success: false,
          error: "OpenAI API key is not configured",
          imageUrl: generateFallbackImageUrl("1:1", "API key not configured"),
        },
        { status: 200 },
      )
    }

    // Parse request body with better error handling
    let body
    try {
      body = await req.json()
      logDebug("Request body parsed", body)
    } catch (parseError) {
      logDebug("Error parsing request body", { error: parseError })
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request format",
          imageUrl: generateFallbackImageUrl("1:1", "Invalid request format"),
        },
        { status: 200 },
      )
    }

    if (!body || !body.prompt || !body.aspectRatio) {
      logDebug("Missing required fields in request", { body })
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request. Missing prompt or aspectRatio.",
          imageUrl: generateFallbackImageUrl("1:1", "Missing required fields"),
        },
        { status: 200 },
      )
    }

    const { prompt, aspectRatio, brandAnalysis, brandSettings, adTone, adCta, adOffer, adPoints } = body

    // Create enhanced prompt
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

    // Get dimensions based on aspect ratio
    const dimensions = getImageSize(aspectRatio)

    logDebug("Enhanced prompt created", {
      promptPreview: enhancedPrompt.substring(0, 100) + "...",
      aspectRatio,
      dimensions,
    })

    try {
      // Set up a timeout for the OpenAI request
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        controller.abort()
        logDebug("Request timed out")
      }, 30000) // 30 second timeout

      // Make the OpenAI API call using the new gpt-image-1 model
      logDebug("Calling OpenAI API with gpt-image-1 model")
      const response = await openai.images.generate({
        model: "gpt-image-1",
        prompt: enhancedPrompt,
        n: 1,
        size: `${dimensions.width}x${dimensions.height}`,
        quality: "hd",
        response_format: "url",
      })

      // Clear the timeout
      clearTimeout(timeoutId)

      // Extract the image URL from the response
      const imageUrl = response.data[0]?.url

      if (!imageUrl) {
        logDebug("No image URL in OpenAI response", { response })
        throw new Error("No image URL returned from OpenAI")
      }

      logDebug("Image generated successfully", { imageUrl: imageUrl.substring(0, 50) + "..." })

      // Return successful response
      return NextResponse.json({
        success: true,
        imageUrl,
        aspectRatio,
      })
    } catch (imageError: any) {
      logDebug("Error generating image with OpenAI", {
        error: imageError.message,
        stack: imageError.stack,
      })

      // Try to use the fallback API if OpenAI fails
      try {
        logDebug("Attempting to use fallback image generation")
        const fallbackResponse = await fetch(new URL("/api/generate/fallback", req.url).toString(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt,
            aspectRatio,
            adTone,
            adCta,
            adOffer,
            adPoints: adPoints?.filter((point: string) => point.trim() !== ""),
          }),
        })

        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json()
          logDebug("Fallback image generated successfully", fallbackData)
          return NextResponse.json(fallbackData)
        } else {
          logDebug("Fallback image generation failed", { status: fallbackResponse.status })
          throw new Error("Both main and fallback image generation failed")
        }
      } catch (fallbackError) {
        logDebug("Error with fallback image generation", { error: fallbackError })

        // Return a valid JSON response with error details and a placeholder image
        return NextResponse.json(
          {
            success: false,
            error: imageError.message || "Failed to generate image",
            imageUrl: generateFallbackImageUrl(aspectRatio, "Image generation failed"),
          },
          { status: 200 },
        )
      }
    }
  } catch (error: any) {
    logDebug("Unexpected server error", {
      error: error.message,
      stack: error.stack,
    })

    // Always return a valid JSON response even for unexpected errors
    return NextResponse.json(
      {
        success: false,
        error: "Server error occurred",
        imageUrl: generateFallbackImageUrl("1:1", "Server error"),
      },
      { status: 200 },
    )
  }
}
