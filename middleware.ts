import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Server-side middleware for admin route protection.
 *
 * Checks for the presence of a Supabase auth cookie before allowing access
 * to /admin/* routes. This is defense-in-depth — the primary protection
 * comes from Supabase RLS policies at the database level.
 *
 * Note: The project uses @supabase/supabase-js which stores sessions in
 * localStorage by default. For full server-side session validation,
 * consider migrating to @supabase/ssr in the future.
 */

// Extract Supabase project ref from URL for cookie name matching
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const PROJECT_REF = SUPABASE_URL.match(/https:\/\/([^.]+)\./)?.[1] || '';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes
  if (pathname.startsWith('/admin')) {
    // Look for any Supabase auth-related cookie
    const hasAuthCookie = request.cookies.getAll().some(
      (cookie) =>
        cookie.name.includes('auth-token') ||
        cookie.name.includes(`sb-${PROJECT_REF}`) ||
        cookie.name.includes('supabase')
    );

    // If no auth cookie found, redirect to profile/login page
    if (!hasAuthCookie) {
      const loginUrl = new URL('/profile', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
