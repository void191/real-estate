import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE_NAME = 'auth_token';

function decodeJwtPayload(token: string): { userId: string; role: string; email: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith('/admin');
  const isAgentRoute = pathname.startsWith('/agent') && !pathname.startsWith('/agent/login');
  const isBuyerProtectedRoute = pathname.startsWith('/favorites') || pathname.startsWith('/viewings');

  if (!isAdminRoute && !isAgentRoute && !isBuyerProtectedRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    if (isAdminRoute || isAgentRoute) {
      return NextResponse.redirect(new URL('/agent/login', request.url));
    }
    if (isBuyerProtectedRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  const payload = decodeJwtPayload(token!);

  if (!payload) {
    if (isAdminRoute || isAgentRoute) {
      return NextResponse.redirect(new URL('/agent/login', request.url));
    }
    if (isBuyerProtectedRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Role checks
  if (isAdminRoute && payload!.role !== 'admin') {
    if (payload!.role === 'agent') {
      return NextResponse.redirect(new URL('/agent/queue', request.url));
    }
    return NextResponse.redirect(new URL('/agent/login', request.url));
  }

  if (isAgentRoute && payload!.role !== 'agent' && payload!.role !== 'admin') {
    return NextResponse.redirect(new URL('/agent/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/agent/:path*', '/favorites/:path*', '/viewings/:path*'],
};
