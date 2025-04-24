import { NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

// Enhanced logging function
function logDebug(message: string, data?: any) {
  console.log(`[DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : "")
}

// Default fallback ad copy
const fallbackAdCopy = {
  primaryText: "Your compelling ad copy will appear here.",
  headlines: ["Headline 1", "Headline 2", "Headline 3", "Headline 4", "Headline 5"],
  descriptions: ["Description 1", "Description 2"],
}

export async function POST(req: Request) {
  logDebug("Ad copy generation request received")

  // Check for OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    logDebug("OpenAI API key is missing - check your environment variables")
    return NextResponse.json(
      {
        success: true,
        adCopy: fallbackAdCopy,
        warning: "OpenAI API key is not configured. Using default ad copy.",
      },
      { status: 200 },
    )
  } else {
    logDebug("OpenAI API key is present")
  }

  try {
    // Parse request body with better error handling
    let requestData
    try {
      requestData = await req.json()
      logDebug("Request body parsed", requestData)
    } catch (parseError) {
      logDebug("Error parsing request body", { error: parseError })
      return NextResponse.json(
        {
          success: true,
          adCopy: fallbackAdCopy,
          warning: "Invalid request format. Using default ad copy.",
        },
        { status: 200 },
      )
    }

    const { prompt, brandAnalysis, brandSettings } = requestData

    if (!prompt) {
      logDebug("Missing prompt in request")
      return NextResponse.json(
        {
          success: true,
          adCopy: fallbackAdCopy,
          warning: "Prompt is required. Using default ad copy.",
        },
        { status: 200 },
      )
    }

    // Construct a system prompt that includes brand information if available
    let systemPrompt = "You are an expert marketing copywriter specializing in Meta (Facebook) ads."

    if (brandAnalysis || brandSettings) {
      systemPrompt += " You will create ad copy that matches the brand's voice and style."

      if (brandAnalysis) {
        systemPrompt += `\nBrand information: ${brandAnalysis.title || ""} - ${brandAnalysis.description || ""}`
      }

      if (brandSettings?.brandTone) {
        systemPrompt += `\nBrand tone: ${brandSettings.brandTone}`
      }
    }

    systemPrompt +=
      "\nCreate compelling Meta ad copy with the following components:\n1. Primary Text (max 125 characters)\n2. 5 Headlines (max 30 characters each)\n3. 2 Descriptions (max 30 characters each)"

    try {
      // Generate the ad copy with timeout handling
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

      logDebug("Calling AI API for ad copy generation")
      const { text } = await generateText({
        model: openai("gpt-4o"),
        system: systemPrompt,
        prompt: `Create Meta ad copy for: ${prompt}\n\nRespond in JSON format with the following structure:\n{\n  "primaryText": "...",\n  "headlines": ["...", "...", "...", "...", "..."],\n  "descriptions": ["...", "..."]\n}`,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      logDebug("AI response received", { textPreview: text.substring(0, 100) + "..." })

      // Parse the response
      try {
        // Extract JSON from the response (in case the model includes extra text)
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const adCopy = JSON.parse(jsonMatch[0])
          return NextResponse.json({
            success: true,
            adCopy,
          })
        } else {
          logDebug("Could not extract JSON from AI response")
          // If we can't extract JSON, return a fallback structure
          return NextResponse.json({
            success: true,
            adCopy: fallbackAdCopy,
            warning: "Could not parse AI response, using fallback copy.",
          })
        }
      } catch (parseError) {
        logDebug("Error parsing AI response:", { error: parseError })
        // Return fallback ad copy structure
        return NextResponse.json({
          success: true, // Still return success to not block the flow
          adCopy: fallbackAdCopy,
          warning: "Could not parse AI response, using fallback copy.",
        })
      }
    } catch (aiError) {
      logDebug("AI generation error:", { error: aiError })
      // Return fallback ad copy structure
      return NextResponse.json({
        success: true, // Still return success to not block the flow
        adCopy: fallbackAdCopy,
        warning: "AI generation failed, using fallback copy.",
      })
    }
  } catch (error) {
    logDebug("Unexpected server error:", { error })
    // Always return a valid JSON response, even in case of error
    return NextResponse.json(
      {
        success: true,
        adCopy: fallbackAdCopy,
        warning: "Server error occurred. Using default ad copy.",
      },
      { status: 200 }, // Return 200 to ensure client can parse the response
    )
  }
}
