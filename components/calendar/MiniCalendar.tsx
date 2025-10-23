'use client';

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownYear, setDropdownYear] = useState(new Date().getFullYear());
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 공휴일 데이터 로드
    loadHolidays();
  }, []);

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

  // 년월 선택용 변수들
  const currentYear = new Date().getFullYear();
  const yearRange = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="p-1.5 border-b border-neutral-gray-300">
      {/* Month/Year Header with Dropdown */}
      <div className="flex items-center justify-between mb-1.5 relative">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold text-neutral-text-primary hover:bg-neutral-gray-100 transition-all duration-150 cursor-pointer active:bg-neutral-gray-200"
            aria-label="년월 선택"
          >
            <span>{year}년 {monthName}</span>
            <Calendar size={14} className="text-neutral-text-secondary" />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-neutral-gray-300 rounded-lg shadow-lg z-50 min-w-max">
              {/* Year Selector */}
              <div className="px-3 py-2 border-b border-neutral-gray-200">
                <div className="text-xs font-semibold text-neutral-text-secondary mb-2">연도</div>
                <div className="flex gap-1 flex-wrap">
                  {yearRange.map((y) => (
                    <button
                      key={y}
                      onClick={() => handleSelectYear(y)}
                      className={`
                        px-2 py-1 rounded text-xs font-medium transition-all duration-150
                        ${
                          dropdownYear === y
                            ? 'bg-primary-500 text-white'
                            : 'bg-white text-neutral-text-primary hover:bg-neutral-gray-300 cursor-pointer'
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
                <div className="text-xs font-semibold text-neutral-text-secondary mb-2">월</div>
                <div className="grid grid-cols-3 gap-1">
                  {months.map((m) => {
                    const monthLabel = new Date(dropdownYear, m, 1).toLocaleString('ko-KR', { month: 'short' });
                    return (
                      <button
                        key={m}
                        onClick={() => handleSelectMonth(m)}
                        className={`
                          px-2 py-1.5 rounded text-xs font-medium transition-all duration-150
                          ${
                            dropdownYear === currentDate.getFullYear() && m === currentDate.getMonth()
                              ? 'bg-primary-500 text-white'
                              : 'bg-white text-neutral-text-primary hover:bg-neutral-gray-300 cursor-pointer'
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
            className="p-0.5 hover:bg-neutral-gray-100 rounded transition-all duration-150 cursor-pointer active:bg-neutral-gray-200"
            aria-label="이전 달"
          >
            <ChevronLeft size={14} className="text-neutral-text-secondary" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-0.5 hover:bg-neutral-gray-100 rounded transition-all duration-150 cursor-pointer active:bg-neutral-gray-200"
            aria-label="다음 달"
          >
            <ChevronRight size={14} className="text-neutral-text-secondary" />
          </button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-0.5">
        {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
          <div
            key={day}
            className={`text-xs font-semibold text-center h-3.5 ${
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
                flex flex-col items-center justify-center rounded transition-all duration-150
                min-h-9 p-0.5
                ${day ? 'cursor-pointer' : 'cursor-default disabled:cursor-default'}
                ${
                  selected
                    ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white font-semibold'
                    : today && (!todos || todos.completed < todos.total)
                    ? 'bg-primary-100'
                    : day && todos && todos.completed === todos.total
                    ? 'bg-gradient-to-br from-primary-100 to-primary-200 ring-2 ring-primary-500 hover:from-primary-200 hover:to-primary-300'
                    : day
                    ? 'hover:bg-neutral-gray-100 active:bg-neutral-gray-200'
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
                  <div className={`text-[10px] ${selected ? 'text-white' : 'text-neutral-text-secondary'}`}>
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
