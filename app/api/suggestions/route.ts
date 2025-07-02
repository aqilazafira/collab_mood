import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/db"

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

    const suggestions = await prisma.suggestion.findMany({
      where: { 
        session: { userId: userId }
      },
      include: {
        session: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const totalSent = suggestions.length;
    const successful = suggestions.filter(s => s.isCompleted).length;
    const pending = suggestions.filter(s => !s.isCompleted).length;
    const declined = 0;

    const stats = {
      totalSent,
      successful,
      pending,
      declined,
      avgResponseTime: "2.3 min",
    };

    return NextResponse.json({ 
      suggestions: suggestions.map(s => ({
        ...s,
        timestamp: s.createdAt.toISOString(),
      })),
      stats 
    })
  } catch (error) {
    console.error("Error fetching suggestions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { sessionId, type, content } = await request.json()

    if (!sessionId || !type || !content) {
      return NextResponse.json(
        { error: "Missing required fields" }, 
        { status: 400 }
      );
    }

    const newSuggestion = await prisma.suggestion.create({
      data: {
        sessionId,
        type,
        content,
        isCompleted: false,
      },
      include: {
        session: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      suggestion: {
        ...newSuggestion,
        timestamp: newSuggestion.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error("Error creating suggestion:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
