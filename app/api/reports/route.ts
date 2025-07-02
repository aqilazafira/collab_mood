import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getSession } from "@/lib/auth"

interface ReportStats {
  totalSessions: number;
  totalParticipants: number;
  totalDuration: string;
  avgValence: number;
  totalSuggestions: number;
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

    const reports = await prisma.sessionReport.findMany({
      where: {
        session: {
          userId: userId
        }
      },
      include: {
        session: {
          include: {
            emotions: true,
            suggestions: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const totalSessions = reports.length;
    
    const totalParticipants = reports.reduce((sum, report) => {
        if (Array.isArray(report.session.participants)) {
            return sum + report.session.participants.length;
        }
        return sum;
    }, 0);

    const totalDurationMinutes = reports.reduce((sum, report) => {
      if (!report.session?.duration) return sum;
      const [hours, minutes] = report.session.duration.split(':').map(Number);
      return sum + (hours * 60) + (minutes || 0);
    }, 0);

    const allEmotions = reports.flatMap(report => report.session?.emotions || []);
    const totalValence = allEmotions.reduce((sum, e) => sum + (e.valence || 0), 0);
    const avgValence = allEmotions.length > 0 
      ? parseFloat((totalValence / allEmotions.length).toFixed(2))
      : 0;
    
    const totalSuggestions = reports.reduce(
      (sum, report) => sum + (report.session?.suggestions?.length || 0), 
      0
    );

    const hours = Math.floor(totalDurationMinutes / 60);
    const minutes = totalDurationMinutes % 60;
    const totalDuration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    const stats: ReportStats = {
      totalSessions,
      totalParticipants,
      totalDuration,
      avgValence,
      totalSuggestions,
    };


    return NextResponse.json({ reports, stats })
  } catch (error) {
    console.error("Error fetching reports:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
