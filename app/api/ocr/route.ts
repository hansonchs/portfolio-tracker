import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

interface ExtractedPosition {
  ticker: string
  quantity: number
  avgCost: number
  type: "stock" | "option"
  market: "HK" | "US"
  strike?: number
  expiry?: string
  optionType?: "call" | "put"
}

interface OCRResult {
  platform: string
  currency: string
  positions: ExtractedPosition[]
}

export async function POST(request: NextRequest) {
  try {
    const { imageData, apiKey: clientApiKey } = await request.json()

    if (!imageData) {
      return NextResponse.json({ error: "No image data provided" }, { status: 400 })
    }

    // Use client-provided key from localStorage, or fall back to env variable
    const apiKey = clientApiKey || process.env.OPENROUTER_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured. Please add it in Settings." },
        { status: 401 }
      )
    }

    // Initialize OpenAI client with OpenRouter
    const openai = new OpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "Portfolio Tracker",
      },
    })

    // Call OpenRouter with a vision model (using cheaper model)
    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini", // Cheaper vision model that works well
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Extract all stock and option positions from this broker screenshot.

Return a JSON object with this structure:
{
  "platform": "broker name (e.g., Futu, WeBull, Tiger)",
  "currency": "HKD or USD",
  "positions": [
    {
      "ticker": "symbol",
      "quantity": number,
      "avgCost": number,
      "type": "stock or option",
      "market": "HK or US",
      "strike": number (for options only),
      "expiry": "YYYY-MM-DD" (for options only),
      "optionType": "call or put" (for options only)
    }
  ]
}

IMPORTANT:
- For HK stocks, market should be "HK"
- For US stocks, market should be "US"
- Tickers should be uppercase (e.g., AAPL, 00700)
- Dates should be in YYYY-MM-DD format
- If an option shows negative quantity, treat quantity as positive and set the type accordingly
- Return ONLY the JSON, no explanation`,
            },
            {
              type: "image_url",
              image_url: {
                url: imageData,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    })

    const content = response.choices[0]?.message?.content || "{}"

    // Parse the JSON response
    let result: OCRResult
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error("No JSON found in response")
      }
      result = JSON.parse(jsonMatch[0])
    } catch (parseError) {
      console.error("Failed to parse OCR response:", content)
      return NextResponse.json(
        { error: "Failed to parse OCR response", raw: content },
        { status: 500 }
      )
    }

    // Validate the result
    if (!result.positions || !Array.isArray(result.positions)) {
      return NextResponse.json(
        { error: "Invalid OCR response: no positions found", raw: content },
        { status: 500 }
      )
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("OCR error:", error)
    return NextResponse.json(
      { error: "OCR processing failed", details: error.message },
      { status: 500 }
    )
  }
}
