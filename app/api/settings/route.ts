import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// GET /api/settings - Fetch user settings
export async function GET() {
  try {
    // Get or create default settings (there should only be one row)
    let settings = await prisma.userSettings.findFirst()

    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.userSettings.create({
        data: {
          positionThreshold: 20, // Default 20%
        },
      })
    }

    return NextResponse.json({
      positionThreshold: settings.positionThreshold,
    })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

// POST /api/settings - Update user settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { positionThreshold } = body

    if (positionThreshold === undefined || positionThreshold === null) {
      return NextResponse.json({ error: "Missing positionThreshold" }, { status: 400 })
    }

    // Validate threshold range
    if (positionThreshold < 5 || positionThreshold > 50) {
      return NextResponse.json({ error: "Threshold must be between 5 and 50" }, { status: 400 })
    }

    // Get or create settings
    let settings = await prisma.userSettings.findFirst()

    if (settings) {
      // Update existing
      settings = await prisma.userSettings.update({
        where: { id: settings.id },
        data: { positionThreshold: parseFloat(positionThreshold) },
      })
    } else {
      // Create new
      settings = await prisma.userSettings.create({
        data: { positionThreshold: parseFloat(positionThreshold) },
      })
    }

    return NextResponse.json({
      positionThreshold: settings.positionThreshold,
    })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
