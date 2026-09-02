import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/session';
import { hashPassword } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { errorResponse } = await authenticateRequest(req, [Role.admin]);
  if (errorResponse) return errorResponse;

  try {
    const { id } = params;
    const body = await req.json();

    const agent = await prisma.user.findUnique({
      where: { id },
    });

    if (!agent || agent.role !== Role.agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const data: any = {};
    if (body.name !== undefined) data.name = body.name.trim();
    if (body.email !== undefined) data.email = body.email.trim().toLowerCase();
    if (body.phone !== undefined) data.phone = body.phone.trim();
    if (body.avatar_url !== undefined) data.avatar_url = body.avatar_url;
    if (body.is_active !== undefined) data.is_active = Boolean(body.is_active);
    if (body.password) {
      data.password_hash = await hashPassword(body.password);
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatar_url: true,
        is_active: true,
        created_at: true,
      },
    });

    return NextResponse.json({ agent: updated });
  } catch (err) {
    console.error('Admin update agent error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
