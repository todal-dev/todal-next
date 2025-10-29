import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // Update session
  let response = await updateSession(request)

  // Auth check
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(_name: string, _value: string, _options: any) {
          // Cookie setting handled by updateSession
        },
        remove(_name: string, _options: any) {
          // Cookie removal handled by updateSession
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
                     request.nextUrl.pathname.startsWith('/signup')
  const isProtectedPage = request.nextUrl.pathname === '/' ||
                          request.nextUrl.pathname.startsWith('/app')

  // 로그인한 사용자가 로그인/회원가입 페이지 접근 시 메인으로 리다이렉트
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 로그인하지 않은 사용자가 보호된 페이지 접근 시 로그인으로 리다이렉트
  if (!user && isProtectedPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
