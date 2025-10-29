'use client'

import { signOut } from '@/lib/auth/actions'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LogOut } from 'lucide-react'

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
      className="px-3 py-2 text-body-small flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      title="로그아웃"
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-gray-200 dark:border-gray-600 border-t-primary dark:border-t-primary-600 rounded-full animate-spin"></div>
      ) : (
        <LogOut size={16} className="text-gray-400 dark:text-gray-500" />
      )}
      <span className="hidden sm:inline">{loading ? '로그아웃 중' : '로그아웃'}</span>
    </button>
  )
}
