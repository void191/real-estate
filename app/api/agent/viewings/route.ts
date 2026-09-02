import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/session';
import { Role, ViewingStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  const { user, errorResponse } = await authenticateRequest(req, [Role.agent, Role.admin]);
  if (errorResponse) return errorResponse;

  try {
    // If agent, strictly filter by their own agent_id
    // If admin, can view all
    const whereClause = user!.role === Role.agent ? { agent_id: user!.id } : {};

    const viewings = await prisma.viewing.findMany({
      where: whereClause,
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
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
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
        location_pings: {
          orderBy: { recorded_at: 'desc' },
          take: 1, // latest location ping if available
        },
      },
    });

    // Partition into the required queue columns: Requested | Accepted | En Route | Completed
    const requested = viewings.filter((v) => v.status === ViewingStatus.requested);
    const accepted = viewings.filter((v) => v.status === ViewingStatus.accepted);
    const en_route = viewings.filter((v) => v.status === ViewingStatus.en_route || v.status === ViewingStatus.arrived);
    const completed = viewings.filter((v) => v.status === ViewingStatus.completed || v.status === ViewingStatus.declined || v.status === ViewingStatus.cancelled);

    return NextResponse.json({
      all: viewings,
      requested,
      accepted,
      en_route,
      completed,
    });
  } catch (err) {
    console.error('Agent viewings fetch error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
