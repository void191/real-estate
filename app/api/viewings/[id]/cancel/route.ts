import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/session';
import { Role, ViewingStatus } from '@prisma/client';
import { broadcastViewingUpdate } from '@/lib/socket-server';
import { isValidTransition, isUserAuthorizedForTransition } from '@/lib/lifecycle';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, errorResponse } = await authenticateRequest(req, [Role.buyer, Role.agent, Role.admin]);
  if (errorResponse) return errorResponse;

  try {
    const { id } = params;

    const viewing = await prisma.viewing.findUnique({
      where: { id },
      include: {
        listing: true,
        buyer: { select: { id: true, name: true, email: true, phone: true } },
        agent: { select: { id: true, name: true, avatar_url: true, phone: true, email: true } },
      },
    });

    if (!viewing) {
      return NextResponse.json({ error: 'Viewing not found' }, { status: 404 });
    }

    const isBuyer = viewing.buyer_id === user!.id;
    const isAgent = viewing.agent_id === user!.id;

    if (!isBuyer && !isAgent && user!.role !== Role.admin) {
      return NextResponse.json({ error: 'Forbidden: You do not own or manage this viewing' }, { status: 403 });
    }

    if (!isValidTransition(viewing.status, ViewingStatus.cancelled)) {
      return NextResponse.json(
        { error: `Cannot cancel viewing with status ${viewing.status}` },
        { status: 400 }
      );
    }

    if (!isUserAuthorizedForTransition(user!.role, isBuyer, isAgent, viewing.status, ViewingStatus.cancelled)) {
      return NextResponse.json(
        { error: 'Forbidden: Not authorized to cancel this viewing' },
        { status: 403 }
      );
    }

    const updated = await prisma.viewing.update({
      where: { id },
      data: { status: ViewingStatus.cancelled },
      include: {
        listing: true,
        buyer: { select: { id: true, name: true, email: true, phone: true } },
        agent: { select: { id: true, name: true, avatar_url: true, phone: true, email: true } },
      },
    });

    broadcastViewingUpdate(updated);

    return NextResponse.json({ viewing: updated });
  } catch (err) {
    console.error('Cancel viewing error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
