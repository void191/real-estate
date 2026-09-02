import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/session';
import { Role } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { user, errorResponse } = await authenticateRequest(req, [Role.buyer]);
  if (errorResponse) return errorResponse;

  try {
    const favorites = await prisma.favorite.findMany({
      where: { buyer_id: user!.id },
      include: {
        listing: {
          include: {
            agent: {
              select: {
                id: true,
                name: true,
                avatar_url: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    const listings = favorites.map((f) => ({
      ...f.listing,
      favorite_id: f.id,
      is_favorite: true,
    }));

    return NextResponse.json({ listings });
  } catch (err) {
    console.error('Fetch favorites error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, errorResponse } = await authenticateRequest(req, [Role.buyer]);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { listing_id } = body;

    if (!listing_id) {
      return NextResponse.json({ error: 'listing_id is required' }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listing_id },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    const favorite = await prisma.favorite.upsert({
      where: {
        buyer_id_listing_id: {
          buyer_id: user!.id,
          listing_id,
        },
      },
      update: {},
      create: {
        buyer_id: user!.id,
        listing_id,
      },
    });

    return NextResponse.json({ favorite, success: true }, { status: 201 });
  } catch (err) {
    console.error('Create favorite error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
