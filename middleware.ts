import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/scan/:path*',
    '/api/ghost-mode/:path*',
    '/api/interview/:path*',
    '/api/jd-decoder/:path*',
    '/api/jd/:path*',
    '/api/user/:path*',
  ],
}