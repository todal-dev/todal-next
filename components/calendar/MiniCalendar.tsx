'use client';

import { useHolidays } from '@/hooks/data/useHolidays';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface TodoIndicator {
  completed: number;
  total: number;
  byCategory?: Array<{
    categoryId: string;
    name: string;
    color: string;
    total: number;
    completed: number;
  }>;
}

interface MiniCalendarProps {
  onDateSelect?: (date: Date) => void;
  todosByDate?: Record<string, TodoIndicator>;
}

export function MiniCalendar({ onDateSelect, todosByDate = {} }: MiniCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownYear, setDropdownYear] = useState(new Date().getFullYear());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 공휴일 데이터 로드
  const { isHoliday } = useHolidays();

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleSelectDate = (day: number) => {
    const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(selected);
    onDateSelect?.(selected);
  };

  const handleSelectMonth = (month: number) => {
    setCurrentDate(new Date(dropdownYear, month, 1));
    setIsDropdownOpen(false);
  };

  const handleSelectYear = (year: number) => {
    setDropdownYear(year);
  };

  const getDateKey = (day: number) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const date = String(day).padStart(2, '0');
    return `${year}-${month}-${date}`;
  };

  const getTodoIndicators = (day: number) => {
    const todos = todosByDate[getDateKey(day)];
    if (!todos || todos.total === 0) return null;
    
    return todos;
  };

  const checkIsHoliday = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return isHoliday(date);
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleString('ko-KR', { month: 'long' });
  const year = currentDate.getFullYear();

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number | null) => {
    if (!day) return false;
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  const getDayOfWeek = (day: number | null) => {
    if (!day) return -1;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return date.getDay();
  };

  const getDateColor = (day: number | null) => {
    if (!day) return 'text-gray-300 dark:text-gray-700';
    
    const dayOfWeek = getDayOfWeek(day);
    const holiday = checkIsHoliday(day);

    // 일요일 또는 공휴일: 빨간색
    if (dayOfWeek === 0 || holiday) {
      return 'text-status-error dark:text-red-400';
    }

    // 토요일: 파란색
    if (dayOfWeek === 6) {
      return 'text-status-info dark:text-blue-400';
    }

    return 'text-gray-900 dark:text-gray-50';
  };

  // 년월 선택용 변수들
  const currentYear = new Date().getFullYear();
  const yearRange = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="p-1.5 border-b border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800">
      {/* Month/Year Header with Dropdown */}
      <div className="flex items-center justify-between mb-1.5 relative">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-caption font-semibold text-gray-900 dark:text-gray-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-fast cursor-pointer active:bg-gray-100 dark:active:bg-gray-600"
            aria-label="년월 선택"
          >
            <span>{year}년 {monthName}</span>
            <Calendar size={14} className="text-gray-600 dark:text-gray-400" />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 min-w-max animate-slide-up">
              {/* Year Selector */}
              <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-600">
                <div className="text-caption font-semibold text-gray-400 dark:text-gray-500 mb-2">연도</div>
                <div className="flex gap-1 flex-wrap">
                  {yearRange.map((y) => (
                    <button
                      key={y}
                      onClick={() => handleSelectYear(y)}
                      className={`
                        px-2 py-1 rounded text-caption font-medium transition-all duration-fast
                        ${
                          dropdownYear === y
                            ? 'bg-primary text-white dark:bg-primary-600'
                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer'
                        }
                      `}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              {/* Month Selector */}
              <div className="px-3 py-2">
                <div className="text-caption font-semibold text-gray-400 dark:text-gray-500 mb-2">월</div>
                <div className="grid grid-cols-3 gap-1">
                  {months.map((m) => {
                    const monthLabel = new Date(dropdownYear, m, 1).toLocaleString('ko-KR', { month: 'short' });
                    return (
                      <button
                        key={m}
                        onClick={() => handleSelectMonth(m)}
                        className={`
                          px-2 py-1.5 rounded text-caption font-medium transition-all duration-fast
                          ${
                            dropdownYear === currentDate.getFullYear() && m === currentDate.getMonth()
                              ? 'bg-primary text-white dark:bg-primary-600'
                              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer'
                          }
                        `}
                      >
                        {monthLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Arrows */}
        <div className="flex gap-0.5">
          <button
            onClick={handlePrevMonth}
            className="p-0.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-all duration-fast cursor-pointer active:bg-gray-100 dark:active:bg-gray-600"
            aria-label="이전 달"
          >
            <ChevronLeft size={14} className="text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-0.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-all duration-fast cursor-pointer active:bg-gray-100 dark:active:bg-gray-600"
            aria-label="다음 달"
          >
            <ChevronRight size={14} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-0.5">
        {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
          <div
            key={day}
            className={`text-caption font-semibold text-center h-3.5 ${
              index === 0 ? 'text-status-error dark:text-red-400' : index === 6 ? 'text-status-info dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day, index) => {
          const todos = getTodoIndicators(day || 0);
          const today = isToday(day);
          const selected = isSelected(day);

          return (
            <button
              key={index}
              onClick={() => day && handleSelectDate(day)}
              disabled={!day}
              className={`
                flex flex-col items-center justify-center rounded transition-all duration-150
                min-h-11 p-0.5
                ${day ? 'cursor-pointer' : 'cursor-default disabled:cursor-default'}
                ${
                  selected
                    ? 'bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 text-white font-semibold'
                    : today && (!todos || todos.completed < todos.total)
                    ? 'bg-primary-100 dark:bg-primary-900/30'
                    : day && todos && todos.completed === todos.total
                    ? 'bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/40 dark:to-primary-800/40 ring-2 ring-primary dark:ring-primary-600 hover:from-primary-200 hover:to-primary-300 dark:hover:from-primary-900/50 dark:hover:to-primary-800/50'
                    : day
                    ? 'hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600'
                    : ''
                }
              `}
            >
              {/* Day Number */}
              <div className={`text-xs font-medium ${selected ? 'text-white' : getDateColor(day)}`}>
                {day}
              </div>

              {/* Todo Indicators */}
              {todos && todos.total > 0 && (
                <div className="flex flex-col items-center justify-center gap-0.5 mt-0.5">
                  {/* Category Color Dots */}
                  <div className="flex gap-0.5 flex-wrap justify-center max-w-full">
                    {todos.byCategory?.map((category, idx) => (
                      <div
                        key={idx}
                        className={`w-1 h-1 rounded-full transition-colors ring-1 ${selected ? 'ring-white' : 'ring-white'}`}
                        style={{ backgroundColor: category.color }}
                      />
                    ))}
                  </div>

                  {/* Completed/Total Count */}
                  <div className={`text-[10px] ${selected ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                    {todos.completed}/{todos.total}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
