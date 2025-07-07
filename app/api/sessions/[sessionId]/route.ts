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
