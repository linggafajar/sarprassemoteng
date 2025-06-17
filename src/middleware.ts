import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtDecode } from 'jwt-decode'

type UserPayload = {
  id: string
  name: string
  email: string
  username: string
  role: string
  exp: number
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  const pathname = request.nextUrl.pathname

  // Kalau tidak ada token
  if (!token) {
    // Kalau ke /login, biarkan
    if (pathname === '/login' || pathname === '/signup') {
      return NextResponse.next()
    }

    // Kalau ke halaman terlindungi, arahkan ke login
    if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
  }

  try {
    const decoded = jwtDecode<UserPayload>(token)

    // Cek expired
    if (decoded.exp * 1000 < Date.now()) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Kalau sudah login, jangan biarkan ke /login
    if (pathname === '/login' || pathname === '/signup') {
      if (decoded.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      if (decoded.role === 'user') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    // Cek akses berdasarkan role
    if (pathname.startsWith('/admin') && decoded.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (pathname.startsWith('/dashboard') && decoded.role !== 'user') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    return NextResponse.next()

  } catch (err) {
    
    return NextResponse.redirect(new URL('/login', request.url))
  }
}
export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/login', '/signup']
}
