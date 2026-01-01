import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const positions = await prisma.position.findMany({
      where: { userId },
      include: {
        account: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    return NextResponse.json(positions)
  } catch (error) {
    console.error("Error fetching positions:", error)
    return NextResponse.json({ error: "Failed to fetch positions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { accountId, ticker, type, quantity, avgCost, market, strike, expiry, optionType } = body

    // Validate required fields
    if (!ticker || !type || quantity === undefined || !avgCost || !market) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get or create default account if accountId not provided
    let targetAccountId = accountId
    if (!targetAccountId) {
      // Try to find an existing account named "Portfolio" for this user
      let defaultAccount = await prisma.account.findFirst({
        where: {
          userId,
          name: "Portfolio",
        },
      })

      // If not found, create it
      if (!defaultAccount) {
        defaultAccount = await prisma.account.create({
          data: {
            userId,
            name: "Portfolio",
            currency: "HKD", // Default to HKD
          },
        })
      }
      targetAccountId = defaultAccount.id
    } else {
      // Verify the account belongs to the user
      const account = await prisma.account.findUnique({
        where: { id: targetAccountId },
      })
      if (!account || account.userId !== userId) {
        return NextResponse.json({ error: "Invalid account" }, { status: 403 })
      }
    }

    // Create position
    const position = await prisma.position.create({
      data: {
        userId,
        accountId: targetAccountId,
        ticker: ticker.toUpperCase(),
        type,
        quantity: parseFloat(quantity),
        avgCost: parseFloat(avgCost),
        market,
        strike: strike ? parseFloat(strike) : null,
        expiry: expiry ? new Date(expiry) : null,
        optionType,
      },
      include: {
        account: true,
      },
    })

    return NextResponse.json(position)
  } catch (error) {
    console.error("Error creating position:", error)
    return NextResponse.json({ error: "Failed to create position" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }

    // Verify the position belongs to the user
    const position = await prisma.position.findUnique({
      where: { id },
    })
    if (!position || position.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await prisma.position.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting position:", error)
    return NextResponse.json({ error: "Failed to delete position" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, ticker, quantity, avgCost } = body

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }

    // Verify the position belongs to the user
    const existingPosition = await prisma.position.findUnique({
      where: { id },
    })
    if (!existingPosition || existingPosition.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const position = await prisma.position.update({
      where: { id },
      data: {
        ticker: ticker?.toUpperCase(),
        quantity: quantity !== undefined ? parseFloat(quantity) : undefined,
        avgCost: avgCost !== undefined ? parseFloat(avgCost) : undefined,
      },
      include: {
        account: true,
      },
    })

    return NextResponse.json(position)
  } catch (error) {
    console.error("Error updating position:", error)
    return NextResponse.json({ error: "Failed to update position" }, { status: 500 })
  }
}
