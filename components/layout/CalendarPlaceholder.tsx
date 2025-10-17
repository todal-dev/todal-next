'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TodoIndicator {
  completed: number;
  total: number;
}

interface MiniCalendarProps {
  onDateSelect?: (date: Date) => void;
  todosByDate?: Record<string, TodoIndicator>;
}

// 기본 한국 공휴일 (수동 데이터 - API 로드 전 사용)
const DEFAULT_HOLIDAYS = {
  2025: [
    '01-01', // 신정
    '02-10', // 설 연휴
    '02-11', // 설
    '02-12', // 설 연휴
    '03-01', // 삼일절
    '04-05', // 어린이날
    '05-05', // 어린이날
    '05-15', // 부처님 오신 날
    '06-06', // 현충일
    '08-15', // 광복절
    '09-16', // 추석 연휴
    '09-17', // 추석
    '09-18', // 추석 연휴
    '10-03', // 개천절
    '10-09', // 한글날
    '12-25', // 크리스마스
  ],
  2026: [
    '01-01',
    '01-29', '01-30', '01-31',
    '03-01',
    '04-05',
    '05-05',
    '05-25',
    '06-06',
    '08-15',
    '09-04', '09-05', '09-06',
    '10-03',
    '10-09',
    '12-25',
  ],
};

export function MiniCalendar({ onDateSelect, todosByDate = {} }: MiniCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [holidays, setHolidays] = useState<Set<string>>(new Set());

  useEffect(() => {
    // 공휴일 데이터 로드
    loadHolidays();
  }, []);

  const loadHolidays = async () => {
    try {
      const year = new Date().getFullYear();
      const holidaySet = new Set<string>();

      // 기본 공휴일 추가
      if (DEFAULT_HOLIDAYS[year as keyof typeof DEFAULT_HOLIDAYS]) {
        DEFAULT_HOLIDAYS[year as keyof typeof DEFAULT_HOLIDAYS].forEach((date) => {
          holidaySet.add(`${year}-${date}`);
        });
      }

      // 다음 연도도 추가
      const nextYear = year + 1;
      if (DEFAULT_HOLIDAYS[nextYear as keyof typeof DEFAULT_HOLIDAYS]) {
        DEFAULT_HOLIDAYS[nextYear as keyof typeof DEFAULT_HOLIDAYS].forEach((date) => {
          holidaySet.add(`${nextYear}-${date}`);
        });
      }

      setHolidays(holidaySet);

      // 공공 API 시도 (선택사항 - 성공하면 덮어씀)
      try {
        const response = await fetch(
          `https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getHoliDeInfo?solYear=${year}&_type=json&serviceKey=DEMO_KEY`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.response?.body?.items?.item) {
            const items = Array.isArray(data.response.body.items.item) 
              ? data.response.body.items.item 
              : [data.response.body.items.item];
            
            items.forEach((item: any) => {
              if (item.locdate) {
                const dateStr = item.locdate.toString();
                const formatted = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
                holidaySet.add(formatted);
              }
            });
            setHolidays(new Set(holidaySet));
          }
        }
      } catch (error) {
        // API 실패 시 기본 데이터만 사용
        console.log('공휴일 API 로드 실패, 기본 데이터 사용');
      }
    } catch (error) {
      console.error('공휴일 로드 중 오류:', error);
    }
  };

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

  const isHoliday = (day: number) => {
    return holidays.has(getDateKey(day));
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
    if (!day) return 'text-neutral-gray-300';
    
    const dayOfWeek = getDayOfWeek(day);
    const holiday = isHoliday(day);

    // 일요일 또는 공휴일: 빨간색
    if (dayOfWeek === 0 || holiday) {
      return 'text-status-error';
    }

    // 토요일: 파란색
    if (dayOfWeek === 6) {
      return 'text-status-info';
    }

    return 'text-neutral-text-primary';
  };

  return (
    <div className="p-2 border-b border-neutral-gray-300">
      {/* Month Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-semibold text-neutral-text-primary">
          {year}년 {monthName}
        </div>
        <div className="flex gap-0.5">
          <button
            onClick={handlePrevMonth}
            className="p-0.5 hover:bg-neutral-gray-100 rounded transition-colors cursor-pointer"
            aria-label="이전 달"
          >
            <ChevronLeft size={14} className="text-neutral-text-secondary" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-0.5 hover:bg-neutral-gray-100 rounded transition-colors cursor-pointer"
            aria-label="다음 달"
          >
            <ChevronRight size={14} className="text-neutral-text-secondary" />
          </button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
          <div 
            key={day} 
            className={`text-xs font-semibold text-center h-4 ${
              index === 0 ? 'text-status-error' : index === 6 ? 'text-status-info' : 'text-neutral-text-secondary'
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
                flex flex-col items-center justify-center rounded transition-colors
                min-h-12 p-0.5
                ${day ? 'cursor-pointer' : 'cursor-default disabled:cursor-default'}
                ${
                  selected
                    ? 'bg-primary-600 text-white font-semibold'
                    : today
                    ? 'bg-primary-100'
                    : day
                    ? 'hover:bg-neutral-gray-100'
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
                <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center max-w-full">
                  {Array.from({ length: Math.min(todos.total, 2) }).map((_, idx) => {
                    const isCompleted = idx < todos.completed;
                    return (
                      <div
                        key={idx}
                        className={`w-1 h-1 rounded-full transition-colors ${
                          isCompleted
                            ? selected
                              ? 'bg-white/70'
                              : 'bg-primary-500'
                            : selected
                            ? 'bg-white/40'
                            : 'bg-neutral-gray-300'
                        }`}
                      />
                    );
                  })}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
