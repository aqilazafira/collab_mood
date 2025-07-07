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

    const session = await getSession();
    // Pastikan session.id adalah number valid
    let userId: number | null = null;
    if (session && typeof session.id === 'number') {
      userId = session.id;
    } else if (session && typeof session.id === 'string' && /^\d+$/.test(session.id)) {
      userId = parseInt(session.id, 10);
    }
    if (!userId || isNaN(userId)) {
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
        userId,
        valence: topEmotion.score,
        arousal: Math.random(),
        notes: JSON.stringify({
          emotions: detectionResult,
          detectedEmotion: topEmotion.emotion
        })
      }
    });

    // Ambil riwayat deteksi emosi untuk sesi & user ini
    const historyRaw = await prisma.emotionData.findMany({
      where: { sessionId, userId },
      orderBy: { timestamp: 'desc' },
    });

    // Entry pertama history = hasil deteksi terbaru
    const topEmotionName = emotions.find(e => e.id === topEmotion.emotion)?.name || "Tidak diketahui";
    const history = [
      {
        id: savedEmotion.id,
        timestamp: savedEmotion.timestamp.toLocaleTimeString(),
        emotion: topEmotion.emotion,
        emotionName: topEmotionName,
        confidence: topEmotion.score,
      },
      ...historyRaw
        .filter(item => item.id !== savedEmotion.id)
        .map((item) => {
          let detected: any = null;
          let detectedEmotion: string | null = null;
          try {
            detected = item.notes ? JSON.parse(item.notes) : null;
            detectedEmotion = detected?.detectedEmotion;
          } catch {}
          if (!detectedEmotion || !emotions.find(e => e.id === detectedEmotion)) {
            if (detected?.emotions && Array.isArray(detected.emotions)) {
              const top = detected.emotions.reduce((a: any, b: any) => (a.score > b.score ? a : b), detected.emotions[0]);
              detectedEmotion = top?.emotion;
            } else if (typeof item.valence === 'number') {
              // fallback: cari emosi dengan valence terdekat dari list emosi
              // (asumsi: valence tinggi = happy, rendah = sad, dst)
              // mapping kasar: happy > surprised > neutral > sad > angry
              if (item.valence >= 0.7) detectedEmotion = 'happy';
              else if (item.valence >= 0.5) detectedEmotion = 'surprised';
              else if (item.valence >= 0.3) detectedEmotion = 'neutral';
              else if (item.valence >= 0.15) detectedEmotion = 'sad';
              else detectedEmotion = 'angry';
            }
          }
          const emotionName = emotions.find(e => e.id === detectedEmotion)?.name || "Tidak diketahui";
          return {
            id: item.id,
            timestamp: item.timestamp.toLocaleTimeString(),
            emotion: detectedEmotion || null,
            emotionName,
            confidence: item.valence,
          };
        })
    ];

    return NextResponse.json({
      detectionResult,
      history,
    });
  } catch (error) {
    console.error('Error in emotion detection:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
