import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Ambil token dari cookies
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // 2. Jika tidak ada token dan mencoba akses halaman berpelindung, lempar ke login
  if (!token) {
    if (pathname.startsWith('/customer') || pathname.startsWith('/admin') || pathname.startsWith('/seller')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // 3. Decode Token JWT untuk membaca Role (Aman untuk Edge Runtime)
  try {
    const payloadBase64 = token.split('.')[1];
    // Menyesuaikan format Base64 URL-safe dari JWT
    const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const decodedJson = atob(base64);
    const payload = JSON.parse(decodedJson);
    
    // Pastikan payload backend NestJS Anda menyimpan properti "role" (misal: 'CUSTOMER', 'ADMIN')
    const userRole = payload.role; 

    // 4. Aturan Routing berdasarkan Role
    // Jika user mengakses /customer tapi role-nya BUKAN customer
    if (pathname.startsWith('/customer') && userRole !== 'CUSTOMER') {
        if (userRole === 'ADMIN') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        if (userRole === 'SELLER') return NextResponse.redirect(new URL('/seller/dashboard', request.url));
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Jika user mengakses /admin tapi role-nya BUKAN admin
    if (pathname.startsWith('/admin') && userRole !== 'ADMIN') {
        if (userRole === 'CUSTOMER') return NextResponse.redirect(new URL('/customer/dashboard', request.url));
        if (userRole === 'SELLER') return NextResponse.redirect(new URL('/seller/dashboard', request.url));
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Jika Anda punya dashboard seller/toko
    if (pathname.startsWith('/seller') && userRole !== 'SELLER') {
         if (userRole === 'CUSTOMER') return NextResponse.redirect(new URL('/customer/dashboard', request.url));
         if (userRole === 'ADMIN') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
         return NextResponse.redirect(new URL('/', request.url));
    }

  } catch (error) {
    // Jika token rusak atau expired, hapus cookie dan paksa login ulang
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.delete('token');
    return response;
  }

  return NextResponse.next();
}

// 5. Konfigurasi Matcher: Tentukan rute mana saja yang mau diawasi middleware ini
export const config = {
  matcher: [
    '/customer/:path*', 
    '/admin/:path*', 
    '/seller/:path*'
  ],
};