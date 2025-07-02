import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/db"

interface TimelineData {
  time: string;
  valence: number;
  arousal: number;
  event: string | null;
}

interface EmotionPeak {
  time: string;
  type: string;
  description: string;
  suggestion: string;
  status: string;
}

function safeJsonParse<T = any>(str: string | null): T | null {
  if (!str) return null;
  try {
    return JSON.parse(str) as T;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return null;
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = typeof session.id === 'string' ? parseInt(session.id, 10) : session.id;
    if (isNaN(userId)) {
        return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const userSessions = await prisma.session.findMany({
        where: { userId },
        include: {
            emotions: {
                orderBy: { timestamp: 'asc' },
            },
            suggestions: {
                orderBy: { createdAt: 'desc' },
            },
        },
        orderBy: { startTime: 'desc' },
    });

    if (userSessions.length === 0) {
      return NextResponse.json({
        timelineData: [],
        emotionPeaks: [],
        stats: {
          highestValence: 0,
          lowestValence: 0,
          peakArousal: 0,
          totalSuggestions: 0,
          successfulSuggestions: 0,
          pendingSuggestions: 0,
        },
      });
    }

    const allEmotionData = userSessions.flatMap(s => s.emotions);

    const timelineData: TimelineData[] = allEmotionData.map((data) => {
      const notes = safeJsonParse<{event?: string}>(data.notes) || {};
      return {
        time: new Date(data.timestamp).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        valence: data.valence,
        arousal: data.arousal,
        event: notes.event || null,
      };
    });

    const emotionPeaks: EmotionPeak[] = allEmotionData
      .filter((data) => {
        const notes = safeJsonParse<{event?: string}>(data.notes);
        return notes?.event;
      })
      .map((data) => {
        const notes = safeJsonParse<{event?: string}>(data.notes) || {};
        const timeStr = new Date(data.timestamp).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
        
        const isConflict = notes.event === "conflict_detected";
        return {
          time: timeStr,
          type: isConflict ? "Conflict Detected" : "Stress Peak",
          description: isConflict
            ? "High arousal, low valence detected across multiple participants"
            : "Elevated stress levels detected",
          suggestion: isConflict ? "Take a 5-minute break" : "Try a mindfulness exercise",
          status: Math.random() > 0.5 ? "resolved" : "active",
        };
      });

    const allSuggestions = userSessions.flatMap(s => s.suggestions);
    const totalSuggestions = allSuggestions.length;
    const successfulSuggestions = allSuggestions.filter(s => s.isCompleted).length;
    const pendingSuggestions = totalSuggestions - successfulSuggestions;

    const stats = {
      highestValence: allEmotionData.length > 0 
        ? Math.max(...allEmotionData.map(d => d.valence)) 
        : 0,
      lowestValence: allEmotionData.length > 0 
        ? Math.min(...allEmotionData.map(d => d.valence)) 
        : 0,
      peakArousal: allEmotionData.length > 0 
        ? Math.max(...allEmotionData.map(d => d.arousal)) 
        : 0,
      totalSuggestions,
      successfulSuggestions,
      pendingSuggestions,
    };

    return NextResponse.json({
      timelineData,
      emotionPeaks,
      stats,
    })
  } catch (error) {
    console.error("Error fetching timeline data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
