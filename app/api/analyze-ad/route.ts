import { NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function POST(req: Request) {
  try {
    const { imageUrl, adCopy, prompt, aspectRatio, targetAudience } = await req.json()

    if (!imageUrl && !adCopy && !prompt) {
      return NextResponse.json({ success: false, error: "Missing required data" }, { status: 400 })
    }

    // Construct the analysis prompt
    let analysisPrompt = `Analyze this advertisement and score it on a scale of 0-100 based on its potential effectiveness.`

    if (prompt) {
      analysisPrompt += `\n\nAd description/prompt: ${prompt}`
    }

    if (adCopy) {
      analysisPrompt += `\n\nAd copy:
Primary text: ${adCopy.primaryText || "N/A"}
Headlines: ${adCopy.headlines ? adCopy.headlines.filter((h) => h).join(", ") : "N/A"}
Descriptions: ${adCopy.descriptions ? adCopy.descriptions.filter((d) => d).join(", ") : "N/A"}`
    }

    if (aspectRatio) {
      analysisPrompt += `\n\nAspect ratio: ${aspectRatio}`
    }

    if (targetAudience) {
      analysisPrompt += `\n\nTarget audience: ${targetAudience}`
    }

    if (imageUrl) {
      analysisPrompt += `\n\nImage URL: ${imageUrl}`
    }

    analysisPrompt += `\n\nProvide a detailed analysis with the following:
1. Overall score (0-100)
2. Breakdown of scores in these categories:
   - Visual appeal (0-25): How visually attractive and professional the ad looks
   - Message clarity (0-25): How clear and compelling the message is
   - Brand alignment (0-20): How well it represents the brand identity
   - Call to action (0-15): Effectiveness of the call to action
   - Target audience fit (0-15): How well it appeals to the intended audience
3. Strengths: 2-3 specific strengths of the ad
4. Areas for improvement: 2-3 specific suggestions to improve the ad
5. Performance prediction: Brief prediction of how this ad might perform

Format the response as JSON with the following structure:
{
  "overallScore": number,
  "categoryScores": {
    "visualAppeal": number,
    "messageClarity": number,
    "brandAlignment": number,
    "callToAction": number,
    "targetAudienceFit": number
  },
  "strengths": [string, string, string],
  "improvementAreas": [string, string, string],
  "performancePrediction": string
}`

    try {
      // Generate the analysis with a timeout
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt: analysisPrompt,
        maxTokens: 1000, // Limit token count to avoid timeouts
      })

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
          // If no JSON found, create a fallback response
          return NextResponse.json({
            success: true,
            analysis: {
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
            },
            fallback: true,
            message: "Could not parse AI response, showing estimated analysis",
          })
        }
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError)
        // Return a fallback response with default values
        return NextResponse.json({
          success: true,
          analysis: {
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
          },
          fallback: true,
          message: "Could not parse AI response, showing estimated analysis",
        })
      }
    } catch (aiError) {
      console.error("Error generating analysis with AI:", aiError)
      // Return a fallback response with default values
      return NextResponse.json({
        success: true,
        analysis: {
          overallScore: 65,
          categoryScores: {
            visualAppeal: 16,
            messageClarity: 16,
            brandAlignment: 13,
            callToAction: 10,
            targetAudienceFit: 10,
          },
          strengths: ["The ad appears to have a professional design", "The core message seems to be present"],
          improvementAreas: [
            "Consider refining the visual elements for better engagement",
            "The call to action could be strengthened",
            "More targeted messaging may improve audience response",
          ],
          performancePrediction:
            "This ad may perform at an average level but has potential for improvement with some refinements.",
        },
        fallback: true,
        message: "AI analysis failed, showing estimated analysis",
      })
    }
  } catch (error) {
    console.error("Error analyzing ad:", error)
    // Ensure we always return a valid JSON response
    return NextResponse.json(
      {
        success: false,
        error: "Failed to analyze ad. Please try again.",
      },
      { status: 500 },
    )
  }
}
