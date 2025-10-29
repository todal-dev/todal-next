'use client'

import { signOut } from '@/lib/auth/actions'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      const result = await signOut()
      if (result?.error) {
        console.error('Logout error:', result.error)
        setLoading(false)
      } else if (result?.success) {
        // 로그아웃 성공 시 로그인 페이지로 이동
        router.push('/login')
      }
    } catch (error) {
      console.error('Logout error:', error)
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="px-4 py-2 text-sm text-neutral-text-primary hover:bg-neutral-gray-100 rounded-md transition-colors disabled:opacity-50"
    >
      {loading ? '로그아웃 중...' : '로그아웃'}
    </button>
  )
}
