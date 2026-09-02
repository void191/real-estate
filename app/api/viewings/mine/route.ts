import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/session';
import { Role, ViewingStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { user, errorResponse } = await authenticateRequest(req, [Role.buyer]);
  if (errorResponse) return errorResponse;

  try {
    const viewings = await prisma.viewing.findMany({
      where: { buyer_id: user!.id },
      orderBy: { requested_time: 'asc' },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            address: true,
            price: true,
            photos: true,
            bedrooms: true,
            bathrooms: true,
            area_sqm: true,
            latitude: true,
            longitude: true,
          },
        },
        agent: {
          select: {
            id: true,
            name: true,
            avatar_url: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    const now = new Date();

    const upcoming = viewings.filter(
      (v) =>
        v.status === ViewingStatus.requested ||
        v.status === ViewingStatus.accepted ||
        v.status === ViewingStatus.en_route ||
        v.status === ViewingStatus.arrived
    );

    const past = viewings.filter(
      (v) =>
        v.status === ViewingStatus.completed ||
        v.status === ViewingStatus.declined ||
        v.status === ViewingStatus.cancelled
    );

    return NextResponse.json({
      all: viewings,
      upcoming,
      past,
    });
  } catch (err) {
    console.error('Fetch buyer viewings error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
