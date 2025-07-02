import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const currentUser = await getSession()
    if (!currentUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = typeof currentUser.id === 'string' ? parseInt(currentUser.id, 10) : currentUser.id;
    if (isNaN(userId)) {
        return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const sessions = await prisma.session.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ sessions })
  } catch (error) {
    console.error("Error fetching sessions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getSession()
    if (!currentUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = typeof currentUser.id === 'string' ? parseInt(currentUser.id, 10) : currentUser.id;
    if (isNaN(userId)) {
        return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const { name, description, duration, participants } = await request.json()

    const participantsArray = Array.isArray(participants)
      ? participants
      : typeof participants === 'string'
      ? participants
          .split("\n")
          .filter((p: string) => p.trim())
          .map((email: string) => ({
            name: email.trim(),
            role: "Student",
            status: "invited",
          }))
      : [];

    const newSession = await prisma.session.create({
      data: {
        name,
        description,
        status: "scheduled",
        startTime: new Date().toISOString(),
        duration,
        participants: participantsArray,
        userId: userId,
      },
    })

    return NextResponse.json({
      success: true,
      session: newSession,
    })
  } catch (error) {
    console.error("Error creating session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
