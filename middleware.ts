import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from './lib/auth';

// Daftar path yang tidak memerlukan autentikasi
const publicPaths = [
  '/',
  '/login', 
  '/register', 
  '/api/auth/login', 
  '/api/auth/register',
  '/api/auth/logout'
];

// Daftar path API yang memerlukan autentikasi
const protectedApiPaths = [
  '/api/dashboard',
  '/api/sessions',
  '/api/emotion',
  '/api/suggestions',
  '/api/reports'
];

// Fungsi untuk mengecek apakah path termasuk dalam daftar yang dilindungi
function isProtectedPath(path: string): boolean {
  // Jika path adalah path yang dilindungi
  if (protectedApiPaths.some(p => path.startsWith(p))) {
    return true;
  }
  
  // Jika path tidak termasuk path publik, maka dianggap dilindungi
  return !publicPaths.some(p => 
    path === p || 
    path.startsWith(`${p}/`) ||
    path === '/api/auth/me' && p === '/api/auth/'
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware untuk file statis
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/public/')
  ) {
    return NextResponse.next();
  }

  // Skip middleware untuk path publik
  if (publicPaths.some(p => 
    pathname === p || 
    pathname.startsWith(`${p}/`)
  )) {
    return NextResponse.next();
  }

  try {
    // Cek session
    const session = await getSession();
    
    // Jika tidak ada session dan mencoba mengakses halaman yang membutuhkan autentikasi
    if (!session && isProtectedPath(pathname)) {
      // Jika ini adalah API request, kembalikan 401
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      
      // Redirect ke halaman login untuk halaman biasa
      const loginUrl = new URL('/login', request.url);
      // Simpan URL asal untuk redirect setelah login
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Tambahkan header untuk mencegah caching halaman yang dilindungi
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    
    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
};
