import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    await requireAuth();
    const { sessionId } = params;
    const { status } = await req.json();
    if (!status) {
      return NextResponse.json({ message: 'Status is required' }, { status: 400 });
    }
    const updated = await prisma.session.update({
      where: { id: sessionId },
      data: { status },
    });

    // Jika status diubah menjadi 'completed', buat SessionReport jika belum ada
    if (status === 'completed') {
      // Cek apakah sudah ada report untuk session ini
      const existingReport = await prisma.sessionReport.findUnique({ where: { sessionId } });
      if (!existingReport) {
        // Ambil data emosi dan saran untuk summary/insights
        const session = await prisma.session.findUnique({
          where: { id: sessionId },
          include: {
            emotions: true,
            suggestions: true,
          },
        });
        // Buat summary sederhana
        const totalEmotions = session?.emotions.length || 0;
        const avgValence = totalEmotions > 0 ? (session!.emotions.reduce((sum, e) => sum + (e.valence || 0), 0) / totalEmotions) : 0;
        const summary = `Session completed. Total emotions: ${totalEmotions}, Avg valence: ${avgValence.toFixed(2)}`;
        const insights = {
          emotions: session?.emotions || [],
          suggestions: session?.suggestions || [],
        };
        await prisma.sessionReport.create({
          data: {
            sessionId,
            summary,
            insights,
          },
        });
      }
    }
    return NextResponse.json({ session: updated });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to update session' }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    await requireAuth();
    const { sessionId } = params;
    const session = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) {
      return NextResponse.json({ message: 'Session not found' }, { status: 404 });
    }
    return NextResponse.json({ session });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to get session' }, { status: 500 });
  }
}
