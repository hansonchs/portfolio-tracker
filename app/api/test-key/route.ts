import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json()

    if (!apiKey) {
      return NextResponse.json({ error: "No API key provided" }, { status: 400 })
    }

    // Test the API key with a minimal request to OpenRouter
    const openai = new OpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
    })

    // Make a simple models list request to verify the key works
    await openai.models.list()

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("API key test error:", error)

    if (error?.status === 401) {
      return NextResponse.json(
        { error: "Invalid API key. Please check your key and try again." },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: error?.message || "Failed to verify API key" },
      { status: 500 }
    )
  }
}
