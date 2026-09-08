import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { ListingStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!, 10) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!, 10) : undefined;
    const minBeds = searchParams.get('minBeds') ? parseInt(searchParams.get('minBeds')!, 10) : undefined;
    const minArea = searchParams.get('minArea') ? parseInt(searchParams.get('minArea')!, 10) : undefined;

    const currentUser = await getCurrentUser().catch(() => null);

    const where: any = {
      status: ListingStatus.available,
    };

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (minBeds !== undefined) {
      where.bedrooms = { gte: minBeds };
    }

    if (minArea !== undefined) {
      where.area_sqm = { gte: minArea };
    }

    const listings = await prisma.listing.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            avatar_url: true,
            phone: true,
            email: true,
          },
        },
        favorites: currentUser
          ? {
              where: { buyer_id: currentUser.id },
              select: { id: true },
            }
          : false,
      },
    });

    const formatted = listings.map((l: any) => ({
      ...l,
      is_favorite: currentUser ? l.favorites && l.favorites.length > 0 : false,
      favorites: undefined,
    }));

    return NextResponse.json({ listings: formatted });
  } catch (err) {
    console.error('Listings fetch error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
