import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/session';
import { Role, ViewingStatus } from '@prisma/client';
import { broadcastViewingUpdate } from '@/lib/socket-server';
import { isValidTransition, isUserAuthorizedForTransition } from '@/lib/lifecycle';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, errorResponse } = await authenticateRequest(req, [Role.agent, Role.admin]);
  if (errorResponse) return errorResponse;

  try {
    const { id } = params;
    const body = await req.json();
    const { status: targetStatus, proposed_time, notes } = body;

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

    // Strict ownership: must be the assigned agent or admin
    if (viewing.agent_id !== user!.id && user!.role !== Role.admin) {
      return NextResponse.json(
        { error: 'Forbidden: You are not the assigned agent for this viewing' },
        { status: 403 }
      );
    }

    // Handle propose new time without immediate status change or keeping it requested
    if (proposed_time) {
      const newTime = new Date(proposed_time);
      if (isNaN(newTime.getTime())) {
        return NextResponse.json({ error: 'Invalid proposed_time format' }, { status: 400 });
      }

      const updated = await prisma.viewing.update({
        where: { id },
        data: {
          requested_time: newTime,
          notes: notes ? (viewing.notes ? `${viewing.notes}\n[Agent proposed time]: ${notes}` : `[Agent proposed time]: ${notes}`) : viewing.notes,
        },
        include: {
          listing: true,
          buyer: { select: { id: true, name: true, email: true, phone: true } },
          agent: { select: { id: true, name: true, avatar_url: true, phone: true, email: true } },
        },
      });

      broadcastViewingUpdate(updated);
      return NextResponse.json({ viewing: updated });
    }

    if (!targetStatus) {
      return NextResponse.json({ error: 'status or proposed_time is required' }, { status: 400 });
    }

    // Validate lifecycle transition
    if (!isValidTransition(viewing.status, targetStatus as ViewingStatus)) {
      return NextResponse.json(
        { error: `Invalid transition: Cannot change status from ${viewing.status} to ${targetStatus}` },
        { status: 400 }
      );
    }

    const isBuyer = viewing.buyer_id === user!.id;
    const isAgent = viewing.agent_id === user!.id;

    if (!isUserAuthorizedForTransition(user!.role, isBuyer, isAgent, viewing.status, targetStatus as ViewingStatus)) {
      return NextResponse.json(
        { error: `Forbidden: Agent not authorized to perform transition to ${targetStatus}` },
        { status: 403 }
      );
    }

    const updateData: any = { status: targetStatus };
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const updated = await prisma.viewing.update({
      where: { id },
      data: updateData,
      include: {
        listing: true,
        buyer: { select: { id: true, name: true, email: true, phone: true } },
        agent: { select: { id: true, name: true, avatar_url: true, phone: true, email: true } },
      },
    });

    broadcastViewingUpdate(updated);
    return NextResponse.json({ viewing: updated });
  } catch (err) {
    console.error('Agent status update error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
