'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface BigCalendarProps {
  selectedDate?: Date;
}

export function BigCalendar({ selectedDate = new Date() }: BigCalendarProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const date = new Date(selectedDate);
    const day = date.getDay();
    const diff = date.getDate() - day;
    return new Date(date.setDate(diff));
  });

  const getWeekDays = (startDate: Date) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const handlePrevWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const weekDays = getWeekDays(currentWeekStart);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const monthName = currentWeekStart.toLocaleString('ko-KR', { month: 'long' });
  const year = currentWeekStart.getFullYear();

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-gray-300">
        <h2 className="text-heading-2 text-neutral-text-primary">
          {year}년 {monthName}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handlePrevWeek}
            className="p-2 hover:bg-neutral-gray-100 rounded-md transition-colors cursor-pointer"
            aria-label="이전 주"
          >
            <ChevronLeft size={20} className="text-neutral-text-secondary" />
          </button>
          <button
            onClick={handleNextWeek}
            className="p-2 hover:bg-neutral-gray-100 rounded-md transition-colors cursor-pointer"
            aria-label="다음 주"
          >
            <ChevronRight size={20} className="text-neutral-text-secondary" />
          </button>
        </div>
      </div>

      {/* Week Days Header */}
      <div className="flex border-b border-neutral-gray-300">
        <div className="w-16 bg-neutral-gray-50 border-r border-neutral-gray-300" />
        {weekDays.map((date, index) => {
          const isToday = 
            date.getDate() === new Date().getDate() &&
            date.getMonth() === new Date().getMonth() &&
            date.getFullYear() === new Date().getFullYear();

          return (
            <div
              key={index}
              className={`flex-1 text-center py-3 border-r border-neutral-gray-300 ${
                isToday ? 'bg-primary-50' : ''
              }`}
            >
              <div className="text-xs text-neutral-text-secondary font-medium">
                {dayNames[date.getDay()]}
              </div>
              <div className={`text-lg font-semibold ${isToday ? 'text-primary-500' : 'text-neutral-text-primary'}`}>
                {date.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time Grid */}
      <div className="flex flex-1 overflow-auto">
        {/* Time Column */}
        <div className="w-16 bg-neutral-gray-50 border-r border-neutral-gray-300 overflow-y-auto">
          {hours.map((hour) => (
            <div
              key={hour}
              className="h-16 border-b border-neutral-gray-200 text-xs text-neutral-text-secondary pt-1 text-center font-medium"
            >
              {String(hour).padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="flex-1 flex">
          {weekDays.map((date, dayIndex) => (
            <div key={dayIndex} className="flex-1 border-r border-neutral-gray-300">
              {hours.map((hour) => (
                <div
                  key={`${dayIndex}-${hour}`}
                  className="h-16 border-b border-neutral-gray-200 hover:bg-neutral-gray-50 transition-colors cursor-pointer"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
