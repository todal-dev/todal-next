'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  size?: 'sm' | 'md';
}

export function DatePicker({ value, onChange, minDate, maxDate, size = 'md' }: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(value.getFullYear(), value.getMonth()));

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  // 날짜 비활성화 체크 함수
  const isDateDisabled = useCallback((date: Date, min?: Date, max?: Date) => {
    if (min && date < min) return true;
    if (max && date > max) return true;
    return false;
  }, []);

  // 달력 데이터 생성
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);

    const days: Array<{
      date: Date;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      isDisabled: boolean;
    }> = [];

    // 이전 달 날짜들
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevLastDay.getDate() - i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isDisabled: isDateDisabled(date, minDate, maxDate),
      });
    }

    // 현재 달 날짜들
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(value);
    selectedDate.setHours(0, 0, 0, 0);

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const dateOnly = new Date(date);
      dateOnly.setHours(0, 0, 0, 0);

      days.push({
        date,
        isCurrentMonth: true,
        isToday: dateOnly.getTime() === today.getTime(),
        isSelected: dateOnly.getTime() === selectedDate.getTime(),
        isDisabled: isDateDisabled(date, minDate, maxDate),
      });
    }

    // 다음 달 날짜들 (6주로 맞추기)
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isDisabled: isDateDisabled(date, minDate, maxDate),
      });
    }

    return days;
  }, [currentMonth, value, minDate, maxDate, isDateDisabled]);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (date: Date, isDisabled: boolean) => {
    if (isDisabled) return;
    onChange(date);
  };

  const isSmall = size === 'sm';

  return (
    <div className="w-full">
      {/* 헤더: 월/년도 + 네비게이션 */}
      <div className={`flex items-center justify-between ${isSmall ? 'mb-2' : 'mb-3'}`}>
        <button
          onClick={handlePrevMonth}
          className={`${isSmall ? 'p-1' : 'p-1.5'} rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
          aria-label="이전 달"
        >
          <ChevronLeft size={isSmall ? 16 : 18} className="text-gray-600 dark:text-gray-400" />
        </button>

        <div className={`${isSmall ? 'text-body-small' : 'text-body'} font-semibold text-gray-900 dark:text-gray-50`}>
          {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
        </div>

        <button
          onClick={handleNextMonth}
          className={`${isSmall ? 'p-1' : 'p-1.5'} rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
          aria-label="다음 달"
        >
          <ChevronRight size={isSmall ? 16 : 18} className="text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className={`grid grid-cols-7 ${isSmall ? 'gap-0.5 mb-1' : 'gap-1 mb-2'}`}>
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={`text-caption font-medium text-center ${isSmall ? 'py-1' : 'py-1.5'} ${
              index === 0 ? 'text-red-500 dark:text-red-400' : index === 6 ? 'text-blue-500 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className={`grid grid-cols-7 ${isSmall ? 'gap-0.5' : 'gap-1'}`}>
        {calendarDays.map((day, index) => {
          const dayOfWeek = index % 7;
          const isSunday = dayOfWeek === 0;
          const isSaturday = dayOfWeek === 6;

          return (
            <motion.button
              key={index}
              onClick={() => handleDateClick(day.date, day.isDisabled)}
              disabled={day.isDisabled}
              whileHover={!day.isDisabled ? { scale: 1.05 } : undefined}
              whileTap={!day.isDisabled ? { scale: 0.95 } : undefined}
              className={`
                relative aspect-square ${isSmall ? 'rounded' : 'rounded-md'} ${isSmall ? 'text-caption' : 'text-body-small'} font-medium transition-colors flex items-center justify-center ${isSmall ? 'min-h-[28px]' : 'min-h-[32px]'}
                ${day.isDisabled ? 'cursor-not-allowed opacity-30' : 'cursor-pointer'}
                ${
                  day.isSelected
                    ? 'bg-primary dark:bg-primary-600 text-white hover:bg-primary-700 dark:hover:bg-primary-700'
                    : day.isToday && day.isCurrentMonth
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary dark:text-primary-100 hover:bg-primary-100 dark:hover:bg-primary-900/40'
                    : day.isCurrentMonth
                    ? isSunday
                      ? 'text-red-500 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      : isSaturday
                      ? 'text-blue-500 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      : 'text-gray-900 dark:text-gray-50 hover:bg-gray-50 dark:hover:bg-gray-700'
                    : 'text-gray-400 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }
              `}
            >
              {day.date.getDate()}
              {day.isToday && day.isCurrentMonth && !day.isSelected && (
                <div className={`absolute ${isSmall ? 'bottom-0.5' : 'bottom-1'} left-1/2 transform -translate-x-1/2 ${isSmall ? 'w-0.5 h-0.5' : 'w-1 h-1'} rounded-full bg-primary dark:bg-primary-100`} />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
