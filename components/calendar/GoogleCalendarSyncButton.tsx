'use client'

import { useState, useEffect, useRef } from 'react'
import { Calendar, Download, Upload } from 'lucide-react'
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
    return undefined
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
        className="px-3 py-2 text-body-small flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        title="구글 캘린더 동기화"
      >
        {syncing ? (
          <div className="w-4 h-4 border-2 border-gray-200 dark:border-gray-600 border-t-primary dark:border-t-primary-600 rounded-full animate-spin"></div>
        ) : (
          <Calendar size={16} className="text-gray-400 dark:text-gray-500" />
        )}
        <span className="hidden sm:inline">{syncing ? '동기화 중' : '구글 캘린더'}</span>
      </button>

      {/* Dropdown Menu */}
      {showMenu && !syncing && (
        <div className="absolute top-full right-0 mt-2 bg-warm-white dark:bg-dark-ocean-card border border-gray-200 dark:border-gray-600 rounded-md shadow-lg overflow-hidden min-w-[180px] z-[100] animate-slide-up">
          <button
            onClick={handleImport}
            className="w-full px-4 py-3 text-left text-body-small hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-3 transition-colors cursor-pointer text-gray-900 dark:text-gray-50"
          >
            <Download size={16} className="text-primary dark:text-primary-light" />
            <span>가져오기</span>
          </button>
          <div className="border-t border-gray-100 dark:border-gray-600"></div>
          <button
            onClick={handleExport}
            className="w-full px-4 py-3 text-left text-body-small hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-3 transition-colors cursor-pointer text-gray-900 dark:text-gray-50"
          >
            <Upload size={16} className="text-primary dark:text-primary-light" />
            <span>내보내기</span>
          </button>
        </div>
      )}

      {/* Toast Message */}
      {message && (
        <div
          className={`absolute top-full right-0 mt-2 px-4 py-2 rounded-md shadow-lg text-body-small whitespace-nowrap z-[110] animate-slide-up ${
            message.type === 'success'
              ? 'bg-primary-light dark:bg-primary-900/30 text-primary-dark dark:text-primary-light border border-primary dark:border-primary-600'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  )
}
