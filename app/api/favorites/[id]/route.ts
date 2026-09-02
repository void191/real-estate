import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/session';
import { Role } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { user, errorResponse } = await authenticateRequest(req, [Role.buyer]);
  if (errorResponse) return errorResponse;

  try {
    const { id } = params;

    // Check if id is favorite_id or listing_id
    const favorite = await prisma.favorite.findFirst({
      where: {
        OR: [
          { id, buyer_id: user!.id },
          { listing_id: id, buyer_id: user!.id },
        ],
      },
    });

    if (!favorite) {
      return NextResponse.json({ error: 'Favorite not found or not owned by user' }, { status: 404 });
    }

    await prisma.favorite.delete({
      where: { id: favorite.id },
    });

    return NextResponse.json({ success: true, message: 'Removed from favorites' });
  } catch (err) {
    console.error('Delete favorite error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
