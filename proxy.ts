import { NextRequest, NextResponse } from 'next/server'
import { verifySession, COOKIE_NAME } from '@/lib/auth'

const PUBLIC_PATHS = ['/login', '/api/auth/login']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublic = PUBLIC_PATHS.some(p => pathname.endsWith(p))
  if (isPublic) return NextResponse.next()

  if (pathname.includes('/api/') && !pathname.includes('/api/auth/logout')) {
    const token = request.cookies.get(COOKIE_NAME)?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const session = await verifySession(token)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.next()
  }

  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  const session = await verifySession(token)
  if (!session) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    const response = NextResponse.redirect(url)
    response.cookies.delete(COOKIE_NAME)
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg).*)'],
}
