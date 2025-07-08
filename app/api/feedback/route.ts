import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let userId: number | null = null;
    if (typeof session.id === 'number') {
      userId = session.id;
    } else if (typeof session.id === 'string' && /^\d+$/.test(session.id)) {
      userId = parseInt(session.id, 10);
    }
    if (!userId || isNaN(userId)) {
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

    let userId: number | null = null;
    if (typeof session.id === 'number') {
      userId = session.id;
    } else if (typeof session.id === 'string' && /^\d+$/.test(session.id)) {
      userId = parseInt(session.id, 10);
    }
    if (!userId || isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const { rating, category, comment, sessionId } = await request.json()
    if (!category || !comment || !rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newFeedback = await prisma.feedback.create({
      data: {
        userId,
        category,
        comment,
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
