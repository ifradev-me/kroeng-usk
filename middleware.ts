import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for admin route protection.
 *
 * Note: Supabase JS client stores sessions in localStorage (not cookies),
 * so server-side session validation is not possible here.
 * Role-based access control is handled client-side in each admin page,
 * backed by Supabase RLS policies at the database level.
 */

export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
