import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/session';
import { Role, ViewingStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { errorResponse } = await authenticateRequest(req, [Role.admin]);
  if (errorResponse) return errorResponse;

  try {
    // 1. Viewing Performance metrics
    const allViewings = await prisma.viewing.findMany({
      include: {
        agent: { select: { id: true, name: true } },
      },
    });

    const totalViewings = allViewings.length;
    const requestedCount = allViewings.filter((v: any) => v.status === ViewingStatus.requested).length;
    const acceptedCount = allViewings.filter((v: any) => v.status === ViewingStatus.accepted).length;
    const enRouteCount = allViewings.filter((v: any) => v.status === ViewingStatus.en_route).length;
    const arrivedCount = allViewings.filter((v: any) => v.status === ViewingStatus.arrived).length;
    const completedCount = allViewings.filter((v: any) => v.status === ViewingStatus.completed).length;
    const declinedCount = allViewings.filter((v: any) => v.status === ViewingStatus.declined).length;
    const cancelledCount = allViewings.filter((v: any) => v.status === ViewingStatus.cancelled).length;

    const completionRate = totalViewings > 0 ? Math.round((completedCount / totalViewings) * 100) : 0;
    const activePipelineCount = requestedCount + acceptedCount + enRouteCount + arrivedCount;

    // Response times by agent
    // For viewings that transitioned past 'requested', calculate duration between created_at and updated_at
    const processedViewings = allViewings.filter((v: any) => v.status !== ViewingStatus.requested);
    const agentResponseMap: Record<string, { totalMinutes: number; count: number; name: string }> = {};

    processedViewings.forEach((v: any) => {
      const diffMinutes = Math.max(
        1,
        Math.round((new Date(v.updated_at).getTime() - new Date(v.created_at).getTime()) / (1000 * 60))
      );
      if (!agentResponseMap[v.agent_id]) {
        agentResponseMap[v.agent_id] = { totalMinutes: 0, count: 0, name: v.agent.name };
      }
      agentResponseMap[v.agent_id].totalMinutes += diffMinutes;
      agentResponseMap[v.agent_id].count += 1;
    });

    const agentResponseTimes = Object.entries(agentResponseMap).map(([agent_id, data]) => ({
      agent_id,
      agent_name: data.name,
      avg_response_minutes: Math.round(data.totalMinutes / data.count),
      viewings_responded: data.count,
    }));

    // 2. Listing Performance
    const listings = await prisma.listing.findMany({
      include: {
        agent: { select: { id: true, name: true } },
        _count: {
          select: {
            favorites: true,
            viewings: true,
          },
        },
      },
      orderBy: { favorites: { _count: 'desc' } },
    });

    const listingPerformance = listings.map((l: any) => ({
      id: l.id,
      title: l.title,
      address: l.address,
      price: l.price,
      status: l.status,
      agent_name: l.agent?.name || 'Unassigned',
      favorite_count: l._count?.favorites || 0,
      viewing_count: l._count?.viewings || 0,
    }));

    // 3. Agent Activity
    const agents = await prisma.user.findMany({
      where: { role: Role.agent },
      include: {
        _count: {
          select: {
            listings: true,
            agent_viewings: true,
          },
        },
        agent_viewings: {
          select: { status: true },
        },
      },
    });

    const agentActivity = agents.map((a: any) => {
      const totalAssigned = a._count?.agent_viewings || 0;
      const completed = (a.agent_viewings || []).filter((v: any) => v.status === ViewingStatus.completed).length;
      const accepted = (a.agent_viewings || []).filter((v: any) => v.status === ViewingStatus.accepted || v.status === ViewingStatus.en_route).length;
      const declined = (a.agent_viewings || []).filter((v: any) => v.status === ViewingStatus.declined).length;

      return {
        id: a.id,
        name: a.name,
        email: a.email,
        phone: a.phone,
        avatar_url: a.avatar_url,
        is_active: a.is_active,
        active_listings: a._count.listings,
        total_viewings: totalAssigned,
        completed_viewings: completed,
        accepted_viewings: accepted,
        declined_viewings: declined,
        conversion_rate: totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 0,
      };
    });

    return NextResponse.json({
      viewing_performance: {
        total_viewings: totalViewings,
        requested: requestedCount,
        accepted: acceptedCount,
        en_route: enRouteCount,
        arrived: arrivedCount,
        completed: completedCount,
        declined: declinedCount,
        cancelled: cancelledCount,
        completion_rate_percent: completionRate,
        active_pipeline: activePipelineCount,
        agent_response_times: agentResponseTimes,
      },
      listing_performance: listingPerformance,
      agent_activity: agentActivity,
    });
  } catch (err) {
    console.error('Admin reports fetch error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
