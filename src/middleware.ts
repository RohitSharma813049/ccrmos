import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Only protect /dashboard and /owner paths natively
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/owner')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', req.url);
      return NextResponse.redirect(loginUrl);
    }

    // Protect /owner routes for Platform Owners only
    if (pathname.startsWith('/owner') && token.hierarchyLevel !== 1) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return NextResponse.next();
}

// Specify the paths that should trigger this middleware
export const config = {
  matcher: ['/dashboard/:path*', '/owner/:path*'],
};
