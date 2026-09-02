import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const currentUser = await getCurrentUser().catch(() => null);

    const listing = await prisma.listing.findUnique({
      where: { id },
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

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    const formatted = {
      ...listing,
      is_favorite: currentUser ? listing.favorites && listing.favorites.length > 0 : false,
      favorites: undefined,
    };

    return NextResponse.json({ listing: formatted });
  } catch (err) {
    console.error('Listing detail error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
