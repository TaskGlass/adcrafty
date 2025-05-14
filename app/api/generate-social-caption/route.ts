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
  logDebug("Social caption generation request received")

  try {
    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      logDebug("OpenAI API key is missing")
      return NextResponse.json(
        {
          success: true,
          caption: "Check out our latest update! #brand #social #trending",
          warning: "OpenAI API key is not configured. Using default caption.",
        },
        { status: 200 },
      )
    }

    const { prompt, brandAnalysis, brandSettings, generateHashtags } = await req.json()

    if (!prompt) {
      logDebug("Missing prompt in request")
      return NextResponse.json(
        {
          success: false,
          error: "Prompt is required",
          caption: "Check out our latest update! #brand #social",
        },
        { status: 200 },
      )
    }

    // Construct a system prompt that includes brand information if available
    let systemPrompt = "You are an expert social media copywriter specializing in engaging captions."

    if (brandAnalysis || brandSettings) {
      systemPrompt += " You will create captions that match the brand's voice and style."

      if (brandAnalysis) {
        systemPrompt += `\nBrand information: ${brandAnalysis.title || ""} - ${brandAnalysis.description || ""}`
      }

      if (brandSettings?.brandTone) {
        systemPrompt += `\nBrand tone: ${brandSettings.brandTone}`
      }
    }

    systemPrompt += "\nCreate a compelling social media caption that is engaging and shareable."

    if (generateHashtags) {
      systemPrompt += "\nInclude 3-5 relevant hashtags at the end of the caption."
    }

    try {
      // Generate the caption with timeout handling
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      logDebug("Calling OpenAI API for social caption generation")

      // Use the ChatCompletion API
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Create a social media caption for: ${prompt}\n\n${generateHashtags ? "Include 3-5 relevant hashtags." : "Do not include hashtags."}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      })

      clearTimeout(timeoutId)

      const responseText = completion.choices[0]?.message?.content || ""
      logDebug("AI response received", { textPreview: responseText.substring(0, 100) + "..." })

      return NextResponse.json({
        success: true,
        caption: responseText,
      })
    } catch (aiError) {
      logDebug("AI generation error:", { error: aiError })
      // Return fallback caption
      return NextResponse.json({
        success: true, // Still return success to not block the flow
        caption: "Check out our latest update! #brand #social #trending",
        warning: "AI generation failed, using fallback caption.",
      })
    }
  } catch (error) {
    logDebug("Error generating social caption:", { error })
    // Always return a valid JSON response, even in case of error
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate social caption. Please try again.",
        caption: "Check out our latest update! #brand #social",
      },
      { status: 200 }, // Return 200 to ensure client can parse the response
    )
  }
}
