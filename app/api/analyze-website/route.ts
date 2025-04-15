import { NextResponse } from "next/server"
import { load } from "cheerio"

export async function POST(req: Request) {
  try {
    const { url } = await req.json()

    if (!url) {
      return NextResponse.json(
        {
          success: false,
          error: "URL is required",
        },
        { status: 400 },
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid URL format",
        },
        { status: 400 },
      )
    }

    try {
      // Fetch the website content
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; BrandAnalyzer/1.0; +http://adcreator.ai)",
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch website: ${response.status}`)
      }

      const html = await response.text()

      // Use cheerio to parse the HTML
      const $ = load(html)

      // Extract relevant information
      const title = $("title").text().trim()
      const description = $('meta[name="description"]').attr("content") || ""
      const keywords = $('meta[name="keywords"]').attr("content") || ""

      // Extract main text content (remove scripts, styles, etc.)
      $("script").remove()
      $("style").remove()
      $("noscript").remove()
      $("iframe").remove()

      // Get text from important elements
      const h1Text = $("h1")
        .map((_, el) => $(el).text().trim())
        .get()
        .join(" ")
      const h2Text = $("h2")
        .map((_, el) => $(el).text().trim())
        .get()
        .join(" ")
      const paragraphs = $("p")
        .map((_, el) => $(el).text().trim())
        .get()
        .join(" ")

      // Extract potential brand colors
      const colorRegex =
        /#([0-9a-f]{3}){1,2}\b|rgb$$\s*\d+\s*,\s*\d+\s*,\s*\d+\s*$$|rgba$$\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*$$/gi
      const cssText = $("style").text()
      const inlineStyles = $("[style]")
        .map((_, el) => $(el).attr("style"))
        .get()
        .join(" ")
      const allStyles = cssText + " " + inlineStyles
      const potentialColors = [...new Set(allStyles.match(colorRegex) || [])]

      // Extract logo URL if available
      const logoUrl = $('link[rel="icon"], link[rel="shortcut icon"]').attr("href") || ""

      // Compile the brand analysis
      const brandAnalysis = {
        title,
        description,
        keywords,
        headings: {
          h1: h1Text,
          h2: h2Text,
        },
        mainContent: paragraphs.substring(0, 1000), // Limit to first 1000 chars
        potentialColors: potentialColors.slice(0, 5), // Limit to 5 colors
        logoUrl: logoUrl ? new URL(logoUrl, url).toString() : "",
        url,
      }

      return NextResponse.json({
        success: true,
        brandAnalysis,
      })
    } catch (error: any) {
      console.error("Error analyzing website:", error)
      return NextResponse.json(
        {
          success: false,
          error: error.message || "Failed to analyze website",
        },
        { status: 200 }, // Still return 200 to handle gracefully on client
      )
    }
  } catch (error: any) {
    console.error("Server error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Server error occurred",
      },
      { status: 500 },
    )
  }
}
