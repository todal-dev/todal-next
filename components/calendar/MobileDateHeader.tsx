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
    <div className="md:hidden bg-white border-b border-neutral-gray-300 px-3 py-2 flex items-center justify-between sticky top-0 z-20">
      {/* Month/Year Selector */}
      <div className="relative" ref={pickerRef}>
        <button
          onClick={() => setShowMonthPicker(!showMonthPicker)}
          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-neutral-gray-50 active:bg-neutral-gray-100 transition-colors min-h-[40px]"
          aria-label="월 선택"
        >
          <span className="text-base font-semibold text-neutral-text-primary">
            {year}년 {monthName}
          </span>
          <CalendarIcon size={16} className="text-neutral-text-secondary" />
        </button>

        {/* Month Picker Dropdown */}
        {showMonthPicker && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-neutral-gray-300 rounded-lg shadow-lg z-50 min-w-[280px] max-w-[90vw]">
            {/* Year Selector */}
            <div className="px-3 py-2 border-b border-neutral-gray-200">
              <div className="text-xs font-semibold text-neutral-text-secondary mb-2">연도</div>
              <div className="flex gap-1 flex-wrap">
                {yearRange.map((y) => (
                  <button
                    key={y}
                    onClick={() => setSelectedYear(y)}
                    className={`
                      px-2.5 py-1.5 rounded text-xs font-medium transition-all
                      min-h-[36px] touch-manipulation
                      ${
                        selectedYear === y
                          ? 'bg-primary-500 text-white'
                          : 'bg-white text-neutral-text-primary hover:bg-neutral-gray-100 active:bg-neutral-gray-200'
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
              <div className="text-xs font-semibold text-neutral-text-secondary mb-2">월</div>
              <div className="grid grid-cols-3 gap-2">
                {months.map((m) => {
                  const monthLabel = new Date(selectedYear, m, 1).toLocaleString('ko-KR', { month: 'short' });
                  const isCurrentMonth = selectedYear === year && m === month;
                  
                  return (
                    <button
                      key={m}
                      onClick={() => handleMonthSelect(m)}
                      className={`
                        px-3 py-2 rounded text-sm font-medium transition-all
                        min-h-[44px] touch-manipulation
                        ${
                          isCurrentMonth
                            ? 'bg-primary-500 text-white'
                            : 'bg-white text-neutral-text-primary hover:bg-neutral-gray-100 active:bg-neutral-gray-200'
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
          className="p-2 hover:bg-neutral-gray-100 active:bg-neutral-gray-200 rounded-md transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
          aria-label="이전 주"
        >
          <ChevronLeft size={20} className="text-neutral-text-secondary" />
        </button>
        <button
          onClick={onNextWeek}
          className="p-2 hover:bg-neutral-gray-100 active:bg-neutral-gray-200 rounded-md transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
          aria-label="다음 주"
        >
          <ChevronRight size={20} className="text-neutral-text-secondary" />
        </button>
      </div>
    </div>
  );
}

