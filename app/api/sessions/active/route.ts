import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await requireAuth();
    if (!session?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    // Cari sesi aktif berdasarkan status
    const activeSession = await prisma.session.findFirst({
      where: {
        userId: session.id,
        status: "active", // ganti jika status aktif Anda berbeda
      },
      orderBy: {
        startTime: 'desc',
      },
    });
    if (!activeSession) {
      return NextResponse.json({ message: 'No active session' }, { status: 404 });
    }
    return NextResponse.json({ sessionId: activeSession.id });
  } catch (err) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
}
