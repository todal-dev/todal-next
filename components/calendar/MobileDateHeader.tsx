'use client';

import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface MobileDateHeaderProps {
  currentWeekStart: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onDateSelect?: (date: Date) => void;
}

export function MobileDateHeader({ 
  currentWeekStart, 
  onPrevWeek, 
  onNextWeek,
  onDateSelect 
}: MobileDateHeaderProps) {
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const year = currentWeekStart.getFullYear();
  const month = currentWeekStart.getMonth();
  const monthName = currentWeekStart.toLocaleString('ko-KR', { month: 'long' });

  // 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowMonthPicker(false);
      }
    }

    if (showMonthPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    return undefined;
  }, [showMonthPicker]);

  // 년월 선택용 변수들
  const currentYear = new Date().getFullYear();
  const yearRange = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  const months = Array.from({ length: 12 }, (_, i) => i);
  const [selectedYear, setSelectedYear] = useState(year);

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(selectedYear, monthIndex, 1);
    // 해당 월의 첫 번째 주 시작일로 이동
    const day = newDate.getDay();
    const diff = newDate.getDate() - day;
    const weekStart = new Date(newDate);
    weekStart.setDate(diff);
    
    if (onDateSelect) {
      onDateSelect(weekStart);
    }
    setShowMonthPicker(false);
  };

  return (
    <div className="md:hidden bg-warm-white dark:bg-dark-ocean-panel border-b border-gray-200 dark:border-gray-600 px-3 py-2 flex items-center justify-between sticky top-0 z-20 transition-colors">
      {/* Month/Year Selector */}
      <div className="relative" ref={pickerRef}>
        <button
          onClick={() => setShowMonthPicker(!showMonthPicker)}
          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 transition-colors min-h-[40px]"
          aria-label="월 선택"
        >
          <span className="text-h3 text-gray-900 dark:text-gray-50">
            {year}년 {monthName}
          </span>
          <CalendarIcon size={16} className="text-gray-600 dark:text-gray-400" />
        </button>

        {/* Month Picker Dropdown */}
        {showMonthPicker && (
          <div className="absolute top-full left-0 mt-1 bg-warm-white dark:bg-dark-ocean-card border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-50 min-w-[280px] max-w-[90vw] animate-slide-up">
            {/* Year Selector */}
            <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-600">
              <div className="text-caption font-semibold text-gray-400 dark:text-gray-500 mb-2">연도</div>
              <div className="flex gap-1 flex-wrap">
                {yearRange.map((y) => (
                  <button
                    key={y}
                    onClick={() => setSelectedYear(y)}
                    className={`
                      px-2.5 py-1.5 rounded text-caption font-medium transition-all
                      min-h-[36px] touch-manipulation
                      ${
                        selectedYear === y
                          ? 'bg-primary dark:bg-primary-600 text-white'
                          : 'bg-warm-white dark:bg-dark-ocean-panel text-gray-900 dark:text-gray-50 hover:bg-gray-100 dark:hover:bg-gray-600 active:bg-gray-200 dark:active:bg-gray-500'
                      }
                    `}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>

            {/* Month Selector */}
            <div className="px-3 py-2 max-h-[50vh] overflow-y-auto">
              <div className="text-caption font-semibold text-gray-400 dark:text-gray-500 mb-2">월</div>
              <div className="grid grid-cols-3 gap-2">
                {months.map((m) => {
                  const monthLabel = new Date(selectedYear, m, 1).toLocaleString('ko-KR', { month: 'short' });
                  const isCurrentMonth = selectedYear === year && m === month;
                  
                  return (
                    <button
                      key={m}
                      onClick={() => handleMonthSelect(m)}
                      className={`
                        px-3 py-2 rounded text-body-small font-medium transition-all
                        min-h-[44px] touch-manipulation
                        ${
                          isCurrentMonth
                            ? 'bg-primary dark:bg-primary-600 text-white'
                            : 'bg-warm-white dark:bg-dark-ocean-panel text-gray-900 dark:text-gray-50 hover:bg-gray-100 dark:hover:bg-gray-600 active:bg-gray-200 dark:active:bg-gray-500'
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

      {/* Week Navigation */}
      <div className="flex gap-1">
        <button
          onClick={onPrevWeek}
          className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 rounded-md transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
          aria-label="이전 주"
        >
          <ChevronLeft size={20} className="text-gray-600 dark:text-gray-400" />
        </button>
        <button
          onClick={onNextWeek}
          className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 rounded-md transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
          aria-label="다음 주"
        >
          <ChevronRight size={20} className="text-gray-600 dark:text-gray-400" />
        </button>
      </div>
    </div>
  );
}

