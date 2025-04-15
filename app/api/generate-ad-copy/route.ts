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

    // Generate the ad copy
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: `Create Meta ad copy for: ${prompt}\n\nRespond in JSON format with the following structure:\n{\n  "primaryText": "...",\n  "headlines": ["...", "...", "...", "...", "..."],\n  "descriptions": ["...", "..."]\n}`,
    })

    // Parse the response
    let adCopy
    try {
      // Extract JSON from the response (in case the model includes extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        adCopy = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("Could not extract JSON from response")
      }
    } catch (error) {
      console.error("Error parsing AI response:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to parse the generated ad copy. Please try again.",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      adCopy,
    })
  } catch (error) {
    console.error("Error generating ad copy:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate ad copy. Please try again.",
      },
      { status: 500 },
    )
  }
}
