'use client';

import { useHolidays } from '@/hooks/data/useHolidays';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

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

interface MiniWeekCalendarProps {
  onDateSelect?: (date: Date) => void;
  todosByDate?: Record<string, TodoIndicator>;
  selectedDate?: Date;
}

export function MiniWeekCalendar({ onDateSelect, todosByDate = {}, selectedDate: initialSelectedDate }: MiniWeekCalendarProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const date = initialSelectedDate || new Date();
    const day = date.getDay();
    const diff = date.getDate() - day;
    const weekStart = new Date(date);
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  });

  const [selectedDate, setSelectedDate] = useState(initialSelectedDate || new Date());

  // 공휴일 데이터 로드
  const { isHoliday } = useHolidays();

  // selectedDate가 변경되면 현재 주 시작일 업데이트
  useEffect(() => {
    if (initialSelectedDate) {
      const date = new Date(initialSelectedDate);
      const day = date.getDay();
      const diff = date.getDate() - day;
      const weekStart = new Date(date);
      weekStart.setDate(diff);
      weekStart.setHours(0, 0, 0, 0);
      setCurrentWeekStart(weekStart);
      setSelectedDate(initialSelectedDate);
    }
  }, [initialSelectedDate]);

  // 주의 날짜들 생성
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeekStart);
    date.setDate(currentWeekStart.getDate() + i);
    return date;
  });

  const handlePrevWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newWeekStart);
  };

  const handleNextWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newWeekStart);
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  const getDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getTodoIndicators = (date: Date) => {
    return todosByDate[getDateKey(date)];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const getDateColor = (date: Date) => {
    const dayOfWeek = date.getDay();
    const holiday = isHoliday(date);

    if (dayOfWeek === 0 || holiday) {
      return 'text-status-error dark:text-red-400';
    }
    if (dayOfWeek === 6) {
      return 'text-status-info dark:text-blue-400';
    }
    return 'text-gray-900 dark:text-gray-50';
  };

  const formatWeekRange = () => {
    const weekEnd = new Date(weekDays[6]);
    const startMonth = currentWeekStart.getMonth() + 1;
    const endMonth = weekEnd.getMonth() + 1;
    const year = currentWeekStart.getFullYear();

    if (startMonth === endMonth) {
      return `${year}년 ${startMonth}월`;
    }
    return `${year}년 ${startMonth}월 - ${endMonth}월`;
  };

  return (
    <div className="p-2 border-b border-gray-200 dark:border-gray-600 bg-warm-white dark:bg-dark-ocean-panel">
      {/* Header: Week Range + Navigation */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-caption font-semibold text-gray-900 dark:text-gray-50">
          {formatWeekRange()}
        </div>
        <div className="flex gap-0.5">
          <button
            onClick={handlePrevWeek}
            className="p-0.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-all duration-fast cursor-pointer active:bg-gray-100 dark:active:bg-gray-600"
            aria-label="이전 주"
          >
            <ChevronLeft size={14} className="text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={handleNextWeek}
            className="p-0.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-all duration-fast cursor-pointer active:bg-gray-100 dark:active:bg-gray-600"
            aria-label="다음 주"
          >
            <ChevronRight size={14} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((date, index) => {
          const todos = getTodoIndicators(date);
          const today = isToday(date);
          const selected = isSelected(date);
          const dayOfWeek = date.getDay();
          const dayName = ['일', '월', '화', '수', '목', '금', '토'][dayOfWeek];

          return (
            <button
              key={index}
              onClick={() => handleSelectDate(date)}
              className={`
                flex flex-col items-center justify-center rounded transition-all duration-150
                min-h-[60px] p-1
                cursor-pointer
                ${
                  selected
                    ? 'bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 text-white font-semibold'
                    : today && (!todos || todos.completed < todos.total)
                    ? 'bg-primary-100 dark:bg-primary-900/50 ring-2 ring-primary-200 dark:ring-primary-700'
                    : todos && todos.completed === todos.total
                    ? 'bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/40 dark:to-primary-800/40 ring-2 ring-primary dark:ring-primary-600 hover:from-primary-200 hover:to-primary-300 dark:hover:from-primary-900/50 dark:hover:to-primary-800/50'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600'
                }
              `}
            >
              {/* Day Name */}
              <div className={`text-[10px] font-medium mb-0.5 ${
                selected 
                  ? 'text-white/90' 
                  : dayOfWeek === 0 || isHoliday(date)
                  ? 'text-status-error dark:text-red-400'
                  : dayOfWeek === 6
                  ? 'text-status-info dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {dayName}
              </div>
              
              {/* Day Number */}
              <div className={`text-sm font-medium mb-0.5 ${
                selected 
                  ? 'text-white' 
                  : today 
                  ? 'text-primary-700 dark:text-primary-300 font-semibold' 
                  : getDateColor(date)
              }`}>
                {date.getDate()}
              </div>

              {/* Todo Indicators */}
              {todos && todos.total > 0 && (
                <div className="flex flex-col items-center justify-center gap-0.5 mt-0.5">
                  {/* Category Color Dots */}
                  {todos.byCategory && todos.byCategory.length > 0 && (
                    <div className="flex gap-0.5 flex-wrap justify-center max-w-full">
                      {todos.byCategory.slice(0, 3).map((category, idx) => (
                        <div
                          key={idx}
                          className={`w-1.5 h-1.5 rounded-full transition-colors ring-1 ${selected ? 'ring-white' : 'ring-white'}`}
                          style={{ backgroundColor: category.color }}
                        />
                      ))}
                      {todos.byCategory.length > 3 && (
                        <div className={`text-[8px] ${selected ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                          +{todos.byCategory.length - 3}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Completed/Total Count */}
                  <div className={`text-[9px] font-medium ${selected ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>
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

