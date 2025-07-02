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

    const userFeedback = await prisma.feedback.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })

    const feedbackStats = await prisma.feedback.aggregate({
      _count: true,
      _avg: {
        rating: true,
      },
    })

    const stats = {
      totalFeedback: feedbackStats._count,
      avgRating: feedbackStats._avg.rating || 0,
      satisfaction: 87, // This is hardcoded
    }

    return NextResponse.json({
      feedback: userFeedback,
      stats: {
        ...stats,
        avgRating: Number(stats.avgRating.toFixed(1)),
      },
    })
  } catch (error) {
    console.error("Error fetching feedback:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
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

    const { rating, content, sessionId } = await request.json()

    const newFeedback = await prisma.feedback.create({
      data: {
        userId,
        content,
        rating: Number(rating),
        sessionId,
      },
    })

    return NextResponse.json({
      success: true,
      feedback: newFeedback,
    })
  } catch (error) {
    console.error("Error creating feedback:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
