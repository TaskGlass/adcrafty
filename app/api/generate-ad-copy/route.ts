import { NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function POST(req: Request) {
  try {
    const { prompt, brandAnalysis, brandSettings } = await req.json()

    if (!prompt) {
      return NextResponse.json({ success: false, error: "Prompt is required" }, { status: 400 })
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

      const { text } = await generateText({
        model: openai("gpt-4o"),
        system: systemPrompt,
        prompt: `Create Meta ad copy for: ${prompt}\n\nRespond in JSON format with the following structure:\n{\n  "primaryText": "...",\n  "headlines": ["...", "...", "...", "...", "..."],\n  "descriptions": ["...", "..."]\n}`,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

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
          // If we can't extract JSON, return a fallback structure
          return NextResponse.json({
            success: true,
            adCopy: {
              primaryText: "Your compelling ad copy will appear here.",
              headlines: ["Headline 1", "Headline 2", "Headline 3", "Headline 4", "Headline 5"],
              descriptions: ["Description 1", "Description 2"],
            },
            warning: "Could not parse AI response, using fallback copy.",
          })
        }
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError)
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
      console.error("AI generation error:", aiError)
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
    console.error("Error generating ad copy:", error)
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
