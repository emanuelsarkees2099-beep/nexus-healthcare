import { NextRequest, NextResponse } from 'next/server'

// Proxy does NOT check auth — Supabase stores sessions in localStorage
// which is not accessible server-side without @supabase/ssr.
// Auth protection is handled inside each protected page component instead.

export function proxy(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
