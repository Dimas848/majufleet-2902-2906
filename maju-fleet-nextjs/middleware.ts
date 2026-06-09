import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Ambil cookie sesi yang asli dari kodingan login/register kita
  const hasUserSession = request.cookies.has('session_user_id');
  const hasAdminSession = request.cookies.has('admin_session_id');

  // 2. Proteksi Jalur Dashboard CUSTOMER/USER (Menggunakan rute /dashboard)
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    if (!hasUserSession) {
      // Jika tidak login, tendang ke halaman utama dan pemicu modal login aktif
      return NextResponse.redirect(new URL('/?auth=customer_required', request.url));
    }
  }

  // 3. Proteksi Jalur Dashboard ADMIN (Tetap /Dashboard-Admin)
  if (pathname === '/Dashboard-Admin' || pathname.startsWith('/Dashboard-Admin/')) {
    if (!hasAdminSession) {
      // Jika tidak login, tendang ke halaman utama dan pemicu modal administrator override aktif
      return NextResponse.redirect(new URL('/?auth=admin_required', request.url));
    }
  }

  return NextResponse.next();
}

// ✅ MATCH CONFIGURATION: Menjaga rute /dashboard dan /Dashboard-Admin secara instan
export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*', 
    '/Dashboard-Admin',
    '/Dashboard-Admin/:path*'
  ],
};