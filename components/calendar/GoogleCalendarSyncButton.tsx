'use client'

import { useState, useEffect, useRef } from 'react'
import { syncGoogleCalendarToTodal, exportTodosToGoogleCalendar } from '@/lib/google/calendar'

export function GoogleCalendarSyncButton() {
  const [syncing, setSyncing] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  const handleImport = async () => {
    setSyncing(true)
    setMessage(null)
    setShowMenu(false)

    try {
      const result = await syncGoogleCalendarToTodal()

      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else if (result.success > 0) {
        setMessage({ type: 'success', text: `${result.success}개의 일정을 가져왔습니다!` })
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        setMessage({ type: 'success', text: '새로운 일정이 없습니다.' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '가져오기 실패' })
    } finally {
      setSyncing(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleExport = async () => {
    setSyncing(true)
    setMessage(null)
    setShowMenu(false)

    try {
      const result = await exportTodosToGoogleCalendar()

      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else if (result.success > 0) {
        setMessage({ type: 'success', text: `${result.success}개의 할일을 내보냈습니다!` })
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        setMessage({ type: 'success', text: '내보낼 할일이 없습니다.' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || '내보내기 실패' })
    } finally {
      setSyncing(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={syncing}
        className="px-4 py-2 text-sm flex items-center gap-2 text-neutral-text-primary hover:bg-neutral-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="구글 캘린더 동기화"
      >
        <span className="text-lg">📅</span>
        <span>{syncing ? '동기화 중...' : '캘린더 동기화'}</span>
      </button>

      {/* Dropdown Menu */}
      {showMenu && !syncing && (
        <div className="absolute top-full right-0 mt-2 bg-white border border-neutral-gray-300 rounded-lg shadow-lg py-1 min-w-[200px] z-10">
          <button
            onClick={handleImport}
            className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-gray-50 flex items-center gap-2"
          >
            <span>⬇️</span>
            <span>Google에서 가져오기</span>
          </button>
          <button
            onClick={handleExport}
            className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-gray-50 flex items-center gap-2"
          >
            <span>⬆️</span>
            <span>Google에 내보내기</span>
          </button>
        </div>
      )}

      {/* Toast Message */}
      {message && (
        <div
          className={`absolute top-full right-0 mt-2 px-4 py-2 rounded-lg shadow-lg text-sm whitespace-nowrap z-20 ${
            message.type === 'success'
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  )
}
