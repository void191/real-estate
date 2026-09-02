import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/session';
import { Role, ListingStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { errorResponse } = await authenticateRequest(req, [Role.admin]);
  if (errorResponse) return errorResponse;

  try {
    const { id } = params;
    const body = await req.json();

    const existing = await prisma.listing.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (body.agent_id) {
      const agent = await prisma.user.findUnique({ where: { id: body.agent_id } });
      if (!agent || agent.role !== Role.agent) {
        return NextResponse.json({ error: 'Assigned user must be an active agent' }, { status: 400 });
      }
    }

    const data: any = {};
    if (body.title !== undefined) data.title = body.title.trim();
    if (body.address !== undefined) data.address = body.address.trim();
    if (body.latitude !== undefined) data.latitude = parseFloat(body.latitude);
    if (body.longitude !== undefined) data.longitude = parseFloat(body.longitude);
    if (body.price !== undefined) data.price = parseInt(body.price, 10);
    if (body.bedrooms !== undefined) data.bedrooms = parseInt(body.bedrooms, 10);
    if (body.bathrooms !== undefined) data.bathrooms = parseFloat(body.bathrooms);
    if (body.area_sqm !== undefined) data.area_sqm = parseInt(body.area_sqm, 10);
    if (body.description !== undefined) data.description = body.description;
    if (body.photos !== undefined) data.photos = body.photos;
    if (body.agent_id !== undefined) data.agent_id = body.agent_id;
    if (body.status !== undefined) data.status = body.status as ListingStatus;

    const listing = await prisma.listing.update({
      where: { id },
      data,
      include: {
        agent: true,
      },
    });

    return NextResponse.json({ listing });
  } catch (err) {
    console.error('Admin update listing error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { errorResponse } = await authenticateRequest(req, [Role.admin]);
  if (errorResponse) return errorResponse;

  try {
    const { id } = params;
    await prisma.listing.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Listing removed' });
  } catch (err) {
    console.error('Admin delete listing error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
