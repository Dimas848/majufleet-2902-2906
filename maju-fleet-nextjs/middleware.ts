import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. UBAH KE HURUF KECIL: Mencegah bypass dengan mengetik /dAsHboArd-aDmiN
  const path = request.nextUrl.pathname.toLowerCase();

  const hasUserSession = request.cookies.has('session_user_id');
  const hasAdminSession = request.cookies.has('admin_session_id');

  // 2. PROTEKSI DASHBOARD ADMIN (Diperiksa PERTAMA KALI)
  // Menangkap semua rute yang berawalan /dashboard-admin
  if (path.startsWith('/dashboard-admin')) {
    if (!hasAdminSession) {
      // Walaupun dia punya UserSession (Customer), jika tidak punya AdminSession, TENDANG!
      return NextResponse.redirect(new URL('/?auth=admin_required', request.url));
    }
  }
  
  // 3. PROTEKSI DASHBOARD CUSTOMER 
  // Diletakkan pakai "else if", karena rute ini menangkap /dashboard
  // Kalau tidak pakai else if, /dashboard-admin bisa tidak sengaja terdeteksi sebagai rute /dashboard
  else if (path === '/dashboard' || path.startsWith('/dashboard/')) {
    if (!hasUserSession) {
      // Jika tidak login sebagai customer, tendang!
      return NextResponse.redirect(new URL('/?auth=customer_required', request.url));
    }
  }

  return NextResponse.next();
}

// ✅ MATCH CONFIGURATION
export const config = {
  matcher: [
    // Rute utama
    '/dashboard',
    '/dashboard/:path*', 
    '/Dashboard-Admin',
    '/Dashboard-Admin/:path*',
    // Tambahkan variasi lowercase untuk menangkap bypass di tingkat matcher Next.js
    '/dashboard-admin',
    '/dashboard-admin/:path*'
  ],
};