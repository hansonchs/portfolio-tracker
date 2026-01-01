import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"

// GET /api/settings - Fetch user settings
export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get or create default settings for this user
    let settings = await prisma.userSettings.findUnique({
      where: { userId },
    })

    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.userSettings.create({
        data: {
          userId,
          positionThreshold: 20, // Default 20%
          targetAllocations: "{}", // Empty JSON object
        },
      })
    }

    // Parse targetAllocations JSON
    let targetAllocations = {}
    try {
      targetAllocations = JSON.parse(settings.targetAllocations || "{}")
    } catch {
      targetAllocations = {}
    }

    return NextResponse.json({
      positionThreshold: settings.positionThreshold,
      targetAllocations,
    })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

// POST /api/settings - Update user settings
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { positionThreshold, targetAllocations } = body

    // Get or create settings for this user
    let settings = await prisma.userSettings.findUnique({
      where: { userId },
    })

    const updateData: any = {}

    // Handle positionThreshold update
    if (positionThreshold !== undefined && positionThreshold !== null) {
      // Validate threshold range
      if (positionThreshold < 5 || positionThreshold > 50) {
        return NextResponse.json({ error: "Threshold must be between 5 and 50" }, { status: 400 })
      }
      updateData.positionThreshold = parseFloat(positionThreshold)
    }

    // Handle targetAllocations update
    if (targetAllocations !== undefined) {
      // Validate it's an object
      if (typeof targetAllocations !== "object" || targetAllocations === null) {
        return NextResponse.json({ error: "targetAllocations must be an object" }, { status: 400 })
      }
      // Stringify for storage
      updateData.targetAllocations = JSON.stringify(targetAllocations)
    }

    if (settings) {
      // Update existing
      settings = await prisma.userSettings.update({
        where: { userId },
        data: updateData,
      })
    } else {
      // Create new
      settings = await prisma.userSettings.create({
        data: {
          userId,
          positionThreshold: updateData.positionThreshold ?? 20,
          targetAllocations: updateData.targetAllocations ?? "{}",
        },
      })
    }

    // Parse targetAllocations for response
    let parsedTargets = {}
    try {
      parsedTargets = JSON.parse(settings.targetAllocations || "{}")
    } catch {
      parsedTargets = {}
    }

    return NextResponse.json({
      positionThreshold: settings.positionThreshold,
      targetAllocations: parsedTargets,
    })
  } catch (error) {
    console.error("Error updating settings:", error)
    console.error("Error details:", JSON.stringify(error, null, 2))
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
