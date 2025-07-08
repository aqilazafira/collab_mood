import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    const { status } = await req.json();
    if (!status || !['completed', 'declined', 'active'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    // isCompleted true jika status completed, false jika declined/active
    const isCompleted = status === 'completed';
    const updated = await prisma.suggestion.update({
      where: { id },
      data: { isCompleted },
    });
    return NextResponse.json({ suggestion: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update suggestion' }, { status: 500 });
  }
}
