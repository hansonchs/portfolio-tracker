import { NextRequest, NextResponse } from "next/server"

// Exchange rates (you can make these dynamic later)
const HKD_TO_USD = 0.128
const USD_TO_HKD = 7.8

async function getYahooFinancePrice(ticker: string): Promise<{ price: number; currency: string } | null> {
  try {
    // Format ticker for Yahoo Finance
    let yahooTicker = ticker.toLowerCase()

    // Add suffix for HK stocks (handle leading zeros)
    if (ticker.match(/^\d{4,5}$/)) {
      // For 5-digit HK stocks (00700), strip to 4 digits (0700)
      // For 4-digit HK stocks (0998), keep as is
      let hkTicker = ticker
      if (ticker.length === 5 && ticker.startsWith('0')) {
        hkTicker = ticker.substring(1) // Remove first zero only
      }
      yahooTicker = `${hkTicker}.HK`
    }

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooTicker}?interval=1d&range=1d`

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    })

    if (!response.ok) {
      console.error(`Yahoo Finance API error for ${ticker}:`, response.status)
      return null
    }

    const data = await response.json()
    const result = data.chart?.result?.[0]

    if (!result) {
      console.error(`No result data for ${ticker}`)
      return null
    }

    // Try multiple price fields
    let price = null
    const meta = result.meta

    // Try various price fields in order of preference
    if (meta) {
      price = meta.regularPrice ||
              meta.regularMarketPrice ||
              meta.previousClose ||
              meta.chartPreviousClose
    }

    // If still no price, try to get from indicators (quote data)
    if (!price && result.indicators?.quote?.[0]?.close) {
      const closes = result.indicators.quote[0].close.filter((c: number | null) => c !== null)
      if (closes.length > 0) {
        price = closes[closes.length - 1]
      }
    }

    if (!price || typeof price !== 'number') {
      console.error(`Invalid price for ${ticker}:`, price)
      return null
    }

    const currency = meta?.currency?.toLowerCase() || "usd"

    return {
      price: parseFloat(price.toFixed(4)),
      currency: currency === "hkd" ? "HKD" : "USD",
    }
  } catch (error) {
    console.error(`Error fetching price for ${ticker}:`, error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { tickers } = await request.json()

    if (!Array.isArray(tickers) || tickers.length === 0) {
      return NextResponse.json({ error: "Invalid tickers" }, { status: 400 })
    }

    const prices: Record<string, { price: number; currency: string }> = {}

    // Fetch prices in parallel with a delay to avoid rate limiting
    const results = await Promise.allSettled(
      tickers.map(async (ticker: string, index) => {
        // Add a small delay for each request to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, index * 100))
        return getYahooFinancePrice(ticker)
      })
    )

    tickers.forEach((ticker: string, index: number) => {
      const result = results[index]
      if (result.status === "fulfilled" && result.value) {
        prices[ticker] = result.value
      }
    })

    return NextResponse.json({ prices })
  } catch (error) {
    console.error("Error fetching prices:", error)
    return NextResponse.json({ error: "Failed to fetch prices" }, { status: 500 })
  }
}
