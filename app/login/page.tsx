'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { signIn } from '@/lib/auth/actions'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'

const ERROR_MESSAGES: Record<string, string> = {
  no_code: '인증 코드가 제공되지 않았습니다. 다시 시도해주세요.',
  auth_failed: '인증에 실패했습니다. 다시 시도해주세요.',
  no_session: '세션을 생성할 수 없습니다. 다시 시도해주세요.',
  unexpected: '예기치 않은 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  invalid_credentials: '이메일 또는 비밀번호가 올바르지 않습니다.',
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showEmailLogin, setShowEmailLogin] = useState(false)

  // URL 쿼리 파라미터에서 에러 확인
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setError(ERROR_MESSAGES[errorParam] || '로그인 중 오류가 발생했습니다.')
    }
  }, [searchParams])

  const handleGoogleLogin = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'https://www.googleapis.com/auth/calendar',
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      setError(error.message)
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // 입력 검증
    if (!email || !email.includes('@')) {
      setError('올바른 이메일 주소를 입력해주세요.')
      setLoading(false)
      return
    }

    if (!password || password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.')
      setLoading(false)
      return
    }

    try {
      const result = await signIn(email, password)
      if (result?.error) {
        // Supabase 에러 메시지를 사용자 친화적으로 변환
        if (result.error.includes('Invalid login credentials')) {
          setError(ERROR_MESSAGES.invalid_credentials)
        } else {
          setError(result.error)
        }
        setLoading(false)
      } else if (result?.success) {
        // 성공하면 홈으로 리다이렉트
        router.push('/')
      }
    } catch (err) {
      const message = err instanceof Error 
        ? err.message 
        : '로그인 중 오류가 발생했습니다.'
      setError(message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-800 transition-colors">
      <div className="w-full max-w-md px-8">
        {/* Logo */}
        <div className="flex justify-center mb-12 animate-fade-in">
          <Image src="/logo.png" alt="Todal Logo" width={140} height={140} priority />
        </div>

        <h1 className="text-h1 font-bold text-center mb-12 text-gray-900 dark:text-gray-50">
          Todal에 오신 것을 환영합니다 🦦
        </h1>

        {error && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-md text-body-small animate-slide-up">
            {error}
          </div>
        )}

        {/* Google Login - Main */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all hover:scale-[1.02] active:scale-[0.98] mb-6 bg-white dark:bg-gray-800"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4"/>
            <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853"/>
            <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z" fill="#FBBC05"/>
            <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.96.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z" fill="#EA4335"/>
          </svg>
          <span className="font-medium text-gray-900 dark:text-gray-50">Google로 계속하기</span>
        </button>

        {/* Divider */}
        {!showEmailLogin && (
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-body-small">
              <button
                onClick={() => setShowEmailLogin(true)}
                className="px-4 bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-50 transition-colors"
              >
                이메일로 로그인
              </button>
            </div>
          </div>
        )}

        {/* Email Login - Secondary */}
        {showEmailLogin && (
          <>
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-caption">
                <span className="px-4 bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500">또는</span>
              </div>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4 animate-slide-up">
              <div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-10 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-600 focus:border-primary dark:focus:border-primary-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  placeholder="이메일"
                  disabled={loading}
                />
              </div>

              <div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-10 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-600 focus:border-primary dark:focus:border-primary-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  placeholder="비밀번호"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary dark:bg-primary-600 text-white py-3 rounded-md hover:bg-primary-dark dark:hover:bg-primary-700 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed font-medium"
              >
                {loading ? '로그인 중...' : '이메일로 로그인'}
              </button>
            </form>
          </>
        )}

        {/* Sign up link */}
        <div className="mt-8 text-center">
          <p className="text-body-small text-gray-600 dark:text-gray-400">
            계정이 없으신가요?{' '}
            <Link href="/signup" className="text-primary dark:text-primary-light hover:text-primary-dark dark:hover:text-primary font-medium transition-colors">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">로딩 중...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
