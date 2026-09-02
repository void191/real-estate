import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/session';
import { Role, ViewingStatus } from '@prisma/client';
import { broadcastViewingUpdate } from '@/lib/socket-server';
import { isValidTransition, isUserAuthorizedForTransition } from '@/lib/lifecycle';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, errorResponse } = await authenticateRequest(req, [Role.buyer, Role.admin]);
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

    if (!isBuyer && user!.role !== Role.admin) {
      return NextResponse.json({ error: 'Forbidden: You do not own this viewing' }, { status: 403 });
    }

    if (!isValidTransition(viewing.status, ViewingStatus.en_route)) {
      return NextResponse.json(
        { error: `Cannot transition from ${viewing.status} to en_route` },
        { status: 400 }
      );
    }

    if (!isUserAuthorizedForTransition(user!.role, isBuyer, isAgent, viewing.status, ViewingStatus.en_route)) {
      return NextResponse.json(
        { error: 'Forbidden: Not authorized to transition to en_route' },
        { status: 403 }
      );
    }

    const updated = await prisma.viewing.update({
      where: { id },
      data: { status: ViewingStatus.en_route },
      include: {
        listing: true,
        buyer: { select: { id: true, name: true, email: true, phone: true } },
        agent: { select: { id: true, name: true, avatar_url: true, phone: true, email: true } },
      },
    });

    broadcastViewingUpdate(updated);

    return NextResponse.json({ viewing: updated });
  } catch (err) {
    console.error('En-route transition error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
