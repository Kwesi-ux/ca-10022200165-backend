import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set in environment variables');
}

// Define paths that don't require authentication
const publicPaths = ['/auth/signin', '/auth/signup'];

// Define admin paths that require admin privileges
const adminPaths = ['/admin'];

// Define paths that are always accessible
const alwaysAllowedPaths = ['/api/auth/signin', '/api/auth/session'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get the frontend origin from the request or use default
  const frontendOrigin = request.headers.get('origin') || 'http://localhost:3001';
  
  // Handle CORS for API routes
  if (pathname.startsWith('/api')) {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': frontendOrigin,
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Max-Age': '86400',
        },
      });
    }
    
    // Add CORS headers to the response
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', frontendOrigin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
    return response;
  }
  
  // Skip middleware for API routes and static files
  if (pathname.startsWith('/_next') || 
      pathname.includes('.') ||
      alwaysAllowedPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Get the auth token from cookies
  const token = request.cookies.get('token')?.value;
  
  // Check if the path is public
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // Check if the path requires admin privileges
  const isAdminPath = adminPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // If it's a public path, allow access
  if (isPublicPath) {
    // If user is logged in and tries to access auth pages, redirect to products
    if (token && (pathname.startsWith('/auth/signin') || pathname.startsWith('/auth/signup'))) {
      return NextResponse.redirect(new URL('/products', request.url));
    }
    return NextResponse.next();
  }

  // If no token and not a public path, redirect to signin
  if (!token) {
    const url = new URL('/auth/signin', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  try {
    // Verify the token using jose
    const { payload } = await jose.jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    ) as { payload: { id: string; isAdmin: boolean } };
    
    // If it's an admin path but user is not an admin, redirect to home
    if (isAdminPath && !payload.isAdmin) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Add user info to the request headers for API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.id);
    requestHeaders.set('x-is-admin', String(payload.isAdmin));

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Authentication error:', error);
    // If token is invalid, clear the cookie and redirect to signin
    const response = NextResponse.redirect(new URL('/auth/signin', request.url));
    response.cookies.delete('token');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
