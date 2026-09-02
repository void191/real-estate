import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/session';
import { Role, ViewingStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { errorResponse } = await authenticateRequest(req, [Role.admin]);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get('agent_id');
    const status = searchParams.get('status') as ViewingStatus | null;
    const dateStr = searchParams.get('date');

    const where: any = {};

    if (agentId) {
      where.agent_id = agentId;
    }

    if (status) {
      where.status = status;
    }

    if (dateStr) {
      const targetDate = new Date(dateStr);
      if (!isNaN(targetDate.getTime())) {
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);
        where.requested_time = {
          gte: startOfDay,
          lte: endOfDay,
        };
      }
    }

    const viewings = await prisma.viewing.findMany({
      where,
      orderBy: { requested_time: 'desc' },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            address: true,
            price: true,
            photos: true,
            status: true,
          },
        },
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar_url: true,
            phone: true,
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

    return NextResponse.json({ viewings });
  } catch (err) {
    console.error('Admin viewings fetch error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
