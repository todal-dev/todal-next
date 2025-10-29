import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const origin = requestUrl.origin

  // OAuth 제공자로부터 에러가 반환된 경우
  if (error) {
    logger.error('OAuth provider error', { error, errorDescription })
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error)}`
    )
  }

  // Authorization code가 없는 경우
  if (!code) {
    logger.warn('No authorization code provided in callback')
    return NextResponse.redirect(
      `${origin}/login?error=no_code`
    )
  }

  try {
    const supabase = await createClient()
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      logger.error('Failed to exchange code for session', exchangeError)
      return NextResponse.redirect(
        `${origin}/login?error=auth_failed`
      )
    }

    if (!data.session) {
      logger.warn('No session returned after code exchange')
      return NextResponse.redirect(
        `${origin}/login?error=no_session`
      )
    }

    logger.info('User authenticated successfully', { 
      userId: data.user?.id 
    })

    // Redirect to home page after successful authentication
    return NextResponse.redirect(`${origin}/`)
  } catch (error) {
    logger.error('Unexpected error during authentication', error)
    return NextResponse.redirect(
      `${origin}/login?error=unexpected`
    )
  }
}
