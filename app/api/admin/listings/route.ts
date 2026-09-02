import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/session';
import { Role, ListingStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { errorResponse } = await authenticateRequest(req, [Role.admin]);
  if (errorResponse) return errorResponse;

  try {
    const listings = await prisma.listing.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar_url: true,
            phone: true,
          },
        },
        _count: {
          select: {
            favorites: true,
            viewings: true,
          },
        },
      },
    });

    return NextResponse.json({ listings });
  } catch (err) {
    console.error('Admin listings fetch error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { errorResponse } = await authenticateRequest(req, [Role.admin]);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const {
      title,
      address,
      latitude,
      longitude,
      price,
      bedrooms,
      bathrooms,
      area_sqm,
      description,
      photos,
      agent_id,
      status,
    } = body;

    if (!title || !address || !price || !agent_id) {
      return NextResponse.json(
        { error: 'Title, address, price, and assigned agent are required' },
        { status: 400 }
      );
    }

    // Verify agent exists
    const agent = await prisma.user.findUnique({
      where: { id: agent_id },
    });

    if (!agent || agent.role !== Role.agent) {
      return NextResponse.json(
        { error: 'Invalid agent: Assigned user must exist and have agent role' },
        { status: 400 }
      );
    }

    const listing = await prisma.listing.create({
      data: {
        title: title.trim(),
        address: address.trim(),
        latitude: parseFloat(latitude) || 51.5074,
        longitude: parseFloat(longitude) || -0.1278,
        price: parseInt(price, 10),
        bedrooms: parseInt(bedrooms || 1, 10),
        bathrooms: parseFloat(bathrooms || 1),
        area_sqm: parseInt(area_sqm || 50, 10),
        description: description || '',
        photos: Array.isArray(photos) && photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80'],
        agent_id,
        status: (status as ListingStatus) || ListingStatus.available,
      },
      include: {
        agent: true,
      },
    });

    return NextResponse.json({ listing }, { status: 201 });
  } catch (err) {
    console.error('Admin create listing error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
