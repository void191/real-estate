import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/session';
import { hashPassword } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function GET(req: NextRequest) {
  const { errorResponse } = await authenticateRequest(req, [Role.admin]);
  if (errorResponse) return errorResponse;

  try {
    const agents = await prisma.user.findMany({
      where: { role: Role.agent },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar_url: true,
        is_active: true,
        created_at: true,
        _count: {
          select: {
            listings: true,
            agent_viewings: true,
          },
        },
      },
    });

    return NextResponse.json({ agents });
  } catch (err) {
    console.error('Admin agents fetch error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { errorResponse } = await authenticateRequest(req, [Role.admin]);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { name, email, password, phone, avatar_url } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      );
    }

    const password_hash = await hashPassword(password);

    const agent = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password_hash,
        role: Role.agent,
        phone: phone ? phone.trim() : null,
        avatar_url: avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        is_active: true,
      },
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

    return NextResponse.json({ agent }, { status: 201 });
  } catch (err) {
    console.error('Admin create agent error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
