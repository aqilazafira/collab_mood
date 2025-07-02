import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/db"

interface EmotionEntry {
  id: string;
  timestamp: string;
  emotion: string;
  emotionName: string;
  confidence: number;
}

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

    const userEmotionData = await prisma.emotionData.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        timestamp: "desc",
      },
      take: 20,
    })

    const history: EmotionEntry[] = userEmotionData.map((data) => {
      try {
        const notes = data.notes ? JSON.parse(data.notes) : {}
        const emotions = notes.emotions || []
        const topEmotion = emotions[0] || { emotion: "neutral", name: "Netral", score: 1 }

        return {
          id: data.id,
          timestamp: new Date(data.timestamp).toLocaleTimeString(),
          emotion: topEmotion.emotion,
          emotionName: topEmotion.name,
          confidence: topEmotion.score,
        }
      } catch (error) {
        console.error("Error parsing emotion data:", error)
        return {
          id: data.id,
          timestamp: new Date(data.timestamp).toLocaleTimeString(),
          emotion: "error",
          emotionName: "Error",
          confidence: 0,
        }
      }
    })

    return NextResponse.json({ history })
  } catch (error) {
    console.error("Error fetching emotion history:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
