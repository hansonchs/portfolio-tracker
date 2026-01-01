import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const accounts = await prisma.account.findMany({
      where: { userId },
      include: {
        _count: {
          select: { positions: true },
        },
      },
      orderBy: {
        name: "asc",
      },
    })
    return NextResponse.json(accounts)
  } catch (error) {
    console.error("Error fetching accounts:", error)
    return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, currency } = body

    if (!name || !currency) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const account = await prisma.account.create({
      data: {
        userId,
        name,
        currency,
      },
    })

    return NextResponse.json(account)
  } catch (error) {
    console.error("Error creating account:", error)
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, cashBalance } = body

    if (!id || cashBalance === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify the account belongs to the user
    const existingAccount = await prisma.account.findUnique({
      where: { id },
    })
    if (!existingAccount || existingAccount.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const account = await prisma.account.update({
      where: { id },
      data: { cashBalance: parseFloat(cashBalance) },
    })

    return NextResponse.json(account)
  } catch (error) {
    console.error("Error updating account:", error)
    return NextResponse.json({ error: "Failed to update account" }, { status: 500 })
  }
}
