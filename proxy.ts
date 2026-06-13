import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

const PROTECTED_PATHS = [
  '/dashboard',
  '/patient',
  '/admin',
  '/settings',
  '/passport',
  '/calendar',
  '/medications',
  '/triage',
  '/chw',
  '/bookmarks',
]

const AUTH_PATHS = ['/login', '/signup']

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Always call getUser() — this also refreshes the session cookie when needed
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))
  const isAuthPage  = AUTH_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))

  // Unauthenticated access to protected route → redirect to /login?next=<path>
  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (user) {
    const role = (user.app_metadata?.user_type ?? '') as string

    // Admin-only routes
    if ((pathname === '/admin' || pathname.startsWith('/admin/')) &&
        role !== 'admin' && role !== 'super_admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    // Authenticated users don't need auth pages — redirect to ?next or dashboard
    if (isAuthPage) {
      const next = request.nextUrl.searchParams.get('next') ?? '/dashboard'
      const url = request.nextUrl.clone()
      url.pathname = next.startsWith('/') ? next : '/dashboard'
      url.search = ''
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
}
