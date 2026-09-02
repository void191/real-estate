import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from './prisma';
import { AUTH_COOKIE_NAME, verifyToken, TokenPayload } from './auth';
import { Role, User } from '@prisma/client';

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user || !user.is_active) {
    return null;
  }

  return user;
}

export async function authenticateRequest(
  req?: NextRequest,
  allowedRoles?: Role[]
): Promise<{ user: User | null; errorResponse: NextResponse | null }> {
  let token: string | undefined;

  if (req) {
    token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
  } else {
    const cookieStore = cookies();
    token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  }

  if (!token) {
    return {
      user: null,
      errorResponse: NextResponse.json({ error: 'Unauthorized: Session required' }, { status: 401 }),
    };
  }

  const payload = verifyToken(token);
  if (!payload) {
    return {
      user: null,
      errorResponse: NextResponse.json({ error: 'Unauthorized: Invalid or expired token' }, { status: 401 }),
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user || !user.is_active) {
    return {
      user: null,
      errorResponse: NextResponse.json({ error: 'Unauthorized: Account inactive or not found' }, { status: 401 }),
    };
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      return {
        user: null,
        errorResponse: NextResponse.json(
          { error: `Forbidden: Requires role ${allowedRoles.join(' or ')}` },
          { status: 403 }
        ),
      };
    }
  }

  return { user, errorResponse: null };
}
