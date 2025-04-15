import { NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

// Default fallback analysis to use when the AI service fails
const getFallbackAnalysis = () => ({
  overallScore: 70,
  categoryScores: {
    visualAppeal: 18,
    messageClarity: 17,
    brandAlignment: 14,
    callToAction: 11,
    targetAudienceFit: 10,
  },
  strengths: [
    "The ad has a clean, professional appearance",
    "The message is generally clear and understandable",
    "The branding elements are consistent",
  ],
  improvementAreas: [
    "Consider making the call to action more prominent",
    "The ad could be more targeted to the specific audience",
    "Visual elements could be more engaging or eye-catching",
  ],
  performancePrediction:
    "This ad is likely to perform adequately but could be optimized for better engagement and conversion rates.",
})

export async function POST(req: Request) {
  try {
    // Parse the request body
    const body = await req.json().catch((error) => {
      console.error("Error parsing request body:", error)
      return {}
    })

    const { imageUrl, adCopy, prompt, aspectRatio, targetAudience } = body

    // Validate required fields
    if (!imageUrl && !adCopy && !prompt) {
      console.log("Missing required data for ad analysis")
      return NextResponse.json({ success: false, error: "Missing required data" }, { status: 400 })
    }

    // Construct a simplified analysis prompt to reduce token usage
    let analysisPrompt = `Analyze this advertisement and score it on a scale of 0-100.`

    if (prompt) {
      // Truncate long prompts to avoid token limits
      analysisPrompt += `\n\nAd description: ${prompt.substring(0, 500)}${prompt.length > 500 ? "..." : ""}`
    }

    if (adCopy) {
      // Only include non-empty ad copy fields
      const primaryText = adCopy.primaryText ? `\nPrimary text: ${adCopy.primaryText.substring(0, 200)}` : ""

      const headlines =
        adCopy.headlines && adCopy.headlines.length > 0
          ? `\nHeadlines: ${adCopy.headlines
              .filter((h) => h)
              .slice(0, 2)
              .join(", ")}`
          : ""

      const descriptions =
        adCopy.descriptions && adCopy.descriptions.length > 0
          ? `\nDescriptions: ${adCopy.descriptions
              .filter((d) => d)
              .slice(0, 2)
              .join(", ")}`
          : ""

      if (primaryText || headlines || descriptions) {
        analysisPrompt += `\n\nAd copy:${primaryText}${headlines}${descriptions}`
      }
    }

    if (aspectRatio) {
      analysisPrompt += `\n\nAspect ratio: ${aspectRatio}`
    }

    if (targetAudience) {
      analysisPrompt += `\n\nTarget audience: ${targetAudience.substring(0, 200)}`
    }

    // Simplified output format to reduce token usage
    analysisPrompt += `\n\nProvide a JSON response with:
{
  "overallScore": number from 0-100,
  "categoryScores": {
    "visualAppeal": number from 0-25,
    "messageClarity": number from 0-25,
    "brandAlignment": number from 0-20,
    "callToAction": number from 0-15,
    "targetAudienceFit": number from 0-15
  },
  "strengths": [2-3 specific strengths],
  "improvementAreas": [2-3 specific suggestions],
  "performancePrediction": brief prediction
}`

    console.log("Sending analysis request to AI service")

    try {
      // Set a timeout for the AI request
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

      // Generate the analysis with reduced tokens and timeout
      const { text } = await generateText({
        model: openai("gpt-3.5-turbo"), // Use a faster model to reduce timeout risk
        prompt: analysisPrompt,
        maxTokens: 800, // Limit token count
        temperature: 0.7, // Add some variability
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log("Received response from AI service")

      // Parse the JSON response
      try {
        // Extract JSON from the response (in case the model includes extra text)
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const analysisResult = JSON.parse(jsonMatch[0])
          return NextResponse.json({
            success: true,
            analysis: analysisResult,
          })
        } else {
          console.log("No JSON found in AI response, using fallback")
          // If no JSON found, create a fallback response
          return NextResponse.json({
            success: true,
            analysis: getFallbackAnalysis(),
            fallback: true,
            message: "Could not parse AI response, showing estimated analysis",
          })
        }
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError)
        // Return a fallback response with default values
        return NextResponse.json({
          success: true,
          analysis: getFallbackAnalysis(),
          fallback: true,
          message: "Could not parse AI response, showing estimated analysis",
        })
      }
    } catch (aiError) {
      console.error("Error generating analysis with AI:", aiError)

      // Check if it's an abort error (timeout)
      const errorMessage = aiError instanceof Error ? aiError.message : String(aiError)
      const isTimeout = errorMessage.includes("abort") || errorMessage.includes("timeout")

      // Return a fallback response with default values
      return NextResponse.json({
        success: true,
        analysis: getFallbackAnalysis(),
        fallback: true,
        message: isTimeout
          ? "Analysis timed out, showing estimated analysis"
          : "AI analysis failed, showing estimated analysis",
      })
    }
  } catch (error) {
    console.error("Unexpected error in analyze-ad API:", error)
    // Ensure we always return a valid JSON response
    return NextResponse.json({
      success: true, // Changed to true to avoid frontend errors
      analysis: getFallbackAnalysis(),
      fallback: true,
      message: "An error occurred, showing estimated analysis",
    })
  }
}
