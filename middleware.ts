import { NextRequest, NextResponse } from 'next/server'

// Define protected routes that require authentication
const protectedRoutes = ['/account', '/orders', '/wishlist']
const authRoutes = ['/login', '/register', '/forgot-password']

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  
  // Get the user session from cookies
  const sessionCookie = request.cookies.get('session')
  
  // If accessing a protected route without being logged in
  if (isProtectedRoute && (!sessionCookie || !sessionCookie.value)) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(redirectUrl)
  }
  
  // If accessing login/register while logged in, redirect to account
  if (isAuthRoute && sessionCookie?.value) {
    return NextResponse.redirect(new URL('/account', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
} 