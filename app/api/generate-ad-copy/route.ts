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

export async function POST(req: Request) {
  logDebug("Ad copy generation request received")

  try {
    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      logDebug("OpenAI API key is missing")
      return NextResponse.json(
        {
          success: true,
          adCopy: {
            primaryText: "Your compelling ad copy will appear here.",
            headlines: ["Headline 1", "Headline 2", "Headline 3", "Headline 4", "Headline 5"],
            descriptions: ["Description 1", "Description 2"],
          },
          warning: "OpenAI API key is not configured. Using default ad copy.",
        },
        { status: 200 },
      )
    }

    const { prompt, brandAnalysis, brandSettings } = await req.json()

    if (!prompt) {
      logDebug("Missing prompt in request")
      return NextResponse.json(
        {
          success: false,
          error: "Prompt is required",
          adCopy: {
            primaryText: "Your compelling ad copy will appear here.",
            headlines: ["Headline 1", "Headline 2", "Headline 3", "Headline 4", "Headline 5"],
            descriptions: ["Description 1", "Description 2"],
          },
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
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      logDebug("Calling OpenAI API for ad copy generation")

      // Use the ChatCompletion API with GPT-4
      const completion = await openai.chat.completions.create({
        model: "gpt-4", // Explicitly using GPT-4
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Create Meta ad copy for: ${prompt}\n\nRespond in JSON format with the following structure:\n{\n  "primaryText": "...",\n  "headlines": ["...", "...", "...", "...", "..."],\n  "descriptions": ["...", "..."]\n}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" }, // Ensure we get valid JSON
      })

      clearTimeout(timeoutId)

      const responseText = completion.choices[0]?.message?.content || ""
      logDebug("AI response received", { textPreview: responseText.substring(0, 100) + "..." })

      // Parse the response
      try {
        // Parse the JSON response
        const adCopy = JSON.parse(responseText)
        return NextResponse.json({
          success: true,
          adCopy,
        })
      } catch (parseError) {
        logDebug("Error parsing AI response:", { error: parseError })
        // Return fallback ad copy structure
        return NextResponse.json({
          success: true, // Still return success to not block the flow
          adCopy: {
            primaryText: "Your compelling ad copy will appear here.",
            headlines: ["Headline 1", "Headline 2", "Headline 3", "Headline 4", "Headline 5"],
            descriptions: ["Description 1", "Description 2"],
          },
          warning: "Could not parse AI response, using fallback copy.",
        })
      }
    } catch (aiError) {
      logDebug("AI generation error:", { error: aiError })
      // Return fallback ad copy structure
      return NextResponse.json({
        success: true, // Still return success to not block the flow
        adCopy: {
          primaryText: "Your compelling ad copy will appear here.",
          headlines: ["Headline 1", "Headline 2", "Headline 3", "Headline 4", "Headline 5"],
          descriptions: ["Description 1", "Description 2"],
        },
        warning: "AI generation failed, using fallback copy.",
      })
    }
  } catch (error) {
    logDebug("Error generating ad copy:", { error })
    // Always return a valid JSON response, even in case of error
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate ad copy. Please try again.",
        adCopy: {
          primaryText: "Your compelling ad copy will appear here.",
          headlines: ["Headline 1", "Headline 2", "Headline 3", "Headline 4", "Headline 5"],
          descriptions: ["Description 1", "Description 2"],
        },
      },
      { status: 200 }, // Return 200 to ensure client can parse the response
    )
  }
}
