import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getRateLimiter } from './lib/rate-limit';

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rate Limiting on API routes (excluding auth endpoints)
  if (pathname.startsWith('/api') && !pathname.startsWith('/api/auth')) {
    try {
      const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
      // For a real production app, you might fetch the global setting limit dynamically
      // Here we default to 1000 req / minute
      const ratelimit = getRateLimiter(1000);
      const { success, limit, reset, remaining } = await ratelimit.limit(`ratelimit_${ip}`);

      if (!success) {
        return new NextResponse(
          JSON.stringify({ error: "Too Many Requests. Rate limit exceeded." }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': remaining.toString(),
              'X-RateLimit-Reset': reset.toString(),
            },
          }
        );
      }
    } catch (e) {
      // If Redis is not configured properly, continue to avoid breaking the app completely
      console.error("Rate limit error (Redis might not be configured):", e);
    }
  }
  
  const protectedRoutes = ['/dashboard', '/owner', '/crm', '/portal', '/superadmin', '/book', '/m', '/f', '/shared'];
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
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

  // Subdomain routing if deployed with wildcard DNS
  // This allows tenant.crmos.com to load tenant-specific data if needed later
  const host = req.headers.get('host') || '';
  const isRootDomain = host === process.env.NEXT_PUBLIC_APP_DOMAIN || host.startsWith('localhost:');
  if (!isRootDomain && pathname === '/') {
    // A future enhancement could rewrite based on the subdomain
    // const tenantDomain = host.split('.')[0];
    // return NextResponse.rewrite(new URL(`/${tenantDomain}`, req.url));
  }

  return NextResponse.next();
}

// Specify the paths that should trigger this middleware
export const config = {
  matcher: ['/dashboard/:path*', '/owner/:path*', '/crm/:path*', '/portal/:path*', '/superadmin/:path*', '/book/:path*', '/m/:path*', '/f/:path*', '/shared/:path*', '/api/:path*'],
};
