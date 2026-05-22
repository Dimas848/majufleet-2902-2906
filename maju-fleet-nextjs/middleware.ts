import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Ambil cookie sesi yang asli dari kodingan login/register kita
  const hasUserSession = request.cookies.has('session_user_id');
  const hasAdminSession = request.cookies.has('admin_session_id');

  // 2. Proteksi Jalur Dashboard CUSTOMER
  if (pathname.startsWith('/Dashboard-User')) {
    if (!hasUserSession) {
      // Jika tidak punya cookie customer, tendang paksa ke halaman login utama
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 3. Proteksi Jalur Dashboard ADMIN
  if (pathname.startsWith('/Dashboard-Admin')) {
    if (!hasAdminSession) {
      // Jika tidak punya cookie admin, tendang paksa ke halaman login utama juga
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// Pastikan matcher menjaga folder Dashboard-User dan Dashboard-Admin yang sesungguhnya
export const config = {
  matcher: [
    '/Dashboard-User/:path*', 
    '/Dashboard-Admin/:path*'
  ],
};