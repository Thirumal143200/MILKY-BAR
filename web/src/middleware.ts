import { auth } from '@/lib/auth/config';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { UserRole } from '@milkboy/shared';

/** Route access matrix: maps path prefix to allowed roles */
const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  '/super-admin': ['super_admin'],
  '/admin': ['super_admin', 'admin'],
  '/producer': ['super_admin', 'admin', 'producer'],
  '/consumer': ['super_admin', 'admin', 'consumer'],
  '/lab': ['super_admin', 'admin', 'lab_staff'],
  '/analytics': ['super_admin', 'admin', 'producer', 'lab_staff'],
  '/notifications': ['super_admin', 'admin', 'producer', 'consumer', 'lab_staff'],
  '/settings': ['super_admin', 'admin', 'producer', 'consumer', 'lab_staff'],
};

/** Public paths (no auth required) */
const PUBLIC_PATHS = ['/login', '/forgot-password', '/reset-password', '/verify-mfa'];

export default auth((req: NextRequest & { auth: { user: { role: UserRole } } | null }) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    // Redirect authenticated users away from auth pages
    if (session?.user) {
      return NextResponse.redirect(new URL(getRoleHome(session.user.role), req.url));
    }
    return NextResponse.next();
  }

  // Root redirect
  if (pathname === '/') {
    if (session?.user) {
      return NextResponse.redirect(new URL(getRoleHome(session.user.role), req.url));
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Protected routes: require session
  if (!session?.user) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // RBAC check
  for (const [prefix, allowedRoles] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname.startsWith(prefix)) {
      const userRole = session.user.role as UserRole;
      if (!allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL('/403', req.url));
      }
      break;
    }
  }

  return NextResponse.next();
});

function getRoleHome(role: UserRole): string {
  switch (role) {
    case 'super_admin':
      return '/super-admin';
    case 'admin':
      return '/admin';
    case 'producer':
      return '/producer';
    case 'lab_staff':
      return '/lab';
    case 'consumer':
    default:
      return '/consumer';
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
