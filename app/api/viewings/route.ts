import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/session';
import { Role, ViewingStatus } from '@prisma/client';
import { broadcastViewingUpdate } from '@/lib/socket-server';

export async function POST(req: NextRequest) {
  const { user, errorResponse } = await authenticateRequest(req, [Role.buyer]);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { listing_id, requested_time, notes } = body;

    if (!listing_id || !requested_time) {
      return NextResponse.json(
        { error: 'listing_id and requested_time are required' },
        { status: 400 }
      );
    }

    const requestedDate = new Date(requested_time);
    if (isNaN(requestedDate.getTime())) {
      return NextResponse.json({ error: 'Invalid requested_time format' }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listing_id },
      include: { agent: true },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (!listing.agent_id) {
      return NextResponse.json({ error: 'Listing does not have an assigned agent' }, { status: 400 });
    }

    const viewing = await prisma.viewing.create({
      data: {
        listing_id: listing.id,
        buyer_id: user!.id,
        agent_id: listing.agent_id,
        requested_time: requestedDate,
        status: ViewingStatus.requested,
        notes: notes ? notes.trim() : null,
      },
      include: {
        listing: true,
        agent: {
          select: {
            id: true,
            name: true,
            avatar_url: true,
            phone: true,
            email: true,
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // Real-time broadcast to agent room and buyer room
    broadcastViewingUpdate(viewing);

    return NextResponse.json({ viewing }, { status: 201 });
  } catch (err) {
    console.error('Create viewing error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
