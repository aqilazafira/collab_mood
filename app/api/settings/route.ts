import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = typeof session.id === 'string' ? parseInt(session.id, 10) : session.id;
    if (isNaN(userId)) {
        return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    let userSettings = await prisma.userSettings.findUnique({
      where: { userId },
    })

    if (!userSettings) {
      userSettings = await prisma.userSettings.create({
        data: {
          userId,
          theme: "light",
          notifications: true,
          language: "en",
          workHoursStart: "09:00",
          workHoursEnd: "17:00",
          breakFrequency: 50,
          breakDuration: 10,
        },
      })
    }

    return NextResponse.json({ settings: userSettings })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = typeof session.id === 'string' ? parseInt(session.id, 10) : session.id;
    if (isNaN(userId)) {
        return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const settings = await request.json()

    const updatedSettings = await prisma.userSettings.upsert({
      where: { userId },
      update: settings,
      create: {
        userId,
        ...settings,
      },
    })
    return NextResponse.json({ success: true, settings: updatedSettings })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
