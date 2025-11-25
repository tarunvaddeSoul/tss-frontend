import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl

  if (pathname === '/login' || pathname === '/signup') {
    const notFoundUrl = request.nextUrl.clone()
    notFoundUrl.pathname = '/404'
    return NextResponse.rewrite(notFoundUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/login', '/signup'],
}

