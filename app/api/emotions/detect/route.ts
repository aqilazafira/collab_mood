import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/db"

const emotions = [
  { id: "happy", name: "Bahagia" },
  { id: "sad", name: "Sedih" },
  { id: "angry", name: "Marah" },
  { id: "neutral", name: "Netral" },
  { id: "surprised", name: "Terkejut" },
]

function simulateEmotionDetection() {
  const randomIndex = Math.floor(Math.random() * emotions.length)
  const selectedEmotion = emotions[randomIndex]

  const confidenceScores = emotions.map((emotion) => ({
    emotion: emotion.id,
    name: emotion.name,
    score:
      emotion.id === selectedEmotion.id
        ? Math.random() * 0.4 + 0.6
        : Math.random() * 0.4,
  }))

  return confidenceScores.sort((a, b) => b.score - a.score)
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = typeof session.id === 'string' ? parseInt(session.id, 10) : session.id;
    if (isNaN(userId)) {
        return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    const detectionResult = simulateEmotionDetection();
    const topEmotion = detectionResult[0];
    
    if (!topEmotion) {
      return NextResponse.json(
        { error: 'Failed to detect emotion' },
        { status: 500 }
      );
    }

    const savedEmotion = await prisma.emotionData.create({
      data: {
        sessionId,
        userId: userId,
        valence: topEmotion.score,
        arousal: Math.random(),
        notes: JSON.stringify({
          emotions: detectionResult,
          detectedEmotion: topEmotion.emotion
        })
      }
    });

    return NextResponse.json({
      success: true,
      data: savedEmotion,
    });
  } catch (error) {
    console.error('Error in emotion detection:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
