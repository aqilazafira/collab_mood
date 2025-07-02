import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import type { NextRequest } from "next/server"
import { getSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const userId = session.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update last login time
    await prisma.user.update({
      where: { id: userId },
      data: { lastLogin: new Date() },
    })

    const activeSessions = await prisma.session.findMany({
      where: { status: "active" },
    })

    const activeParticipants = activeSessions.reduce((total, session) => {
      if (Array.isArray(session.participants)) {
        return total + session.participants.length
      }
      return total
    }, 0)

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
    const emotionData = await prisma.emotionData.findMany({
      where: {
        timestamp: {
          gte: tenMinutesAgo,
        },
      },
      orderBy: { timestamp: "desc" },
      take: 10,
    })

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const avgEmotions = await prisma.emotionData.aggregate({
      where: {
        timestamp: {
          gt: oneHourAgo,
        },
      },
      _avg: {
        valence: true,
        arousal: true,
      },
    })

    const suggestionsGiven = await prisma.suggestion.count({
      where: {
        isCompleted: false,
      },
    })

    return NextResponse.json({
      activeParticipants,
      sessionDuration: activeSessions.length > 0 ? "1h 23m" : "0m", // This is still hardcoded
      avgValence: Number((avgEmotions._avg.valence || 0).toFixed(2)),
      avgArousal: Number((avgEmotions._avg.arousal || 0).toFixed(2)),
      suggestionsGiven,
      emotionData: emotionData.reverse().map((data: any) => ({
        time: new Date(data.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        valence: data.valence,
        arousal: data.arousal,
      })),
    })
  } catch (error) {
    console.error("Dashboard stats API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
