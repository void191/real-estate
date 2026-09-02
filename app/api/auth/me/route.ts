import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { user, errorResponse } = await authenticateRequest(req);
  if (errorResponse) {
    return errorResponse;
  }

  return NextResponse.json({
    user: {
      id: user!.id,
      name: user!.name,
      email: user!.email,
      role: user!.role,
      phone: user!.phone,
      avatar_url: user!.avatar_url,
    },
  });
}
