'use client';

import { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function TimeInput({ value, onChange, placeholder = '00:00' }: TimeInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hourScrollRef = useRef<HTMLDivElement>(null);
  const minuteScrollRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  // 현재 시간 파싱 (초 제거)
  const currentHour = value ? (() => {
    const parts = value.split(':');
    return parseInt(parts[0]) || 9;
  })() : 9;
  const currentMinute = value ? (() => {
    const parts = value.split(':');
    return parseInt(parts[1]) || 0;
  })() : 0;

  // value가 변경되면 inputValue 업데이트 (초 제거)
  useEffect(() => {
    if (value) {
      // HH:mm:ss 형식에서 초 제거
      const parts = value.split(':');
      if (parts.length >= 2) {
        setInputValue(`${parts[0]}:${parts[1]}`);
      } else {
        setInputValue(value);
      }
    } else {
      setInputValue('');
    }
  }, [value]);

  // 타임피커가 열릴 때 현재 선택된 시간 위치로 스크롤 (상단에 보이도록)
  useEffect(() => {
    if (isOpen) {
      // 약간의 지연을 두어 DOM이 렌더링된 후 스크롤
      setTimeout(() => {
        // 현재 시간이 있는 버튼 찾기
        const hourButton = hourScrollRef.current?.querySelector(`[data-hour="${currentHour}"]`) as HTMLElement;
        const minuteButton = minuteScrollRef.current?.querySelector(`[data-minute="${currentMinute}"]`) as HTMLElement;
        
        if (hourButton && hourScrollRef.current) {
          const scrollContainer = hourScrollRef.current;
          // 첫 번째 버튼의 높이 측정
          const firstButton = scrollContainer.querySelector('button') as HTMLElement;
          if (firstButton) {
            const buttonHeight = firstButton.offsetHeight;
            // 현재 시간의 인덱스만큼 스크롤
            scrollContainer.scrollTop = currentHour * buttonHeight;
          }
        }
        if (minuteButton && minuteScrollRef.current) {
          const scrollContainer = minuteScrollRef.current;
          // 첫 번째 버튼의 높이 측정
          const firstButton = scrollContainer.querySelector('button') as HTMLElement;
          if (firstButton) {
            const buttonHeight = firstButton.offsetHeight;
            // 현재 분의 인덱스 찾기 (0, 15, 30, 45 중에서)
            const minuteIndex = minutes.indexOf(currentMinute);
            if (minuteIndex !== -1) {
              scrollContainer.scrollTop = minuteIndex * buttonHeight;
            }
          }
        }
      }, 50);
    }
  }, [isOpen, currentHour, currentMinute]);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 15, 30, 45];

  const handleTimeSelect = (hour: number, minute: number) => {
    const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    setInputValue(timeString);
    onChange(timeString);
    setIsOpen(false);
  };

  const handleInputBlur = () => {
    // blur는 외부 클릭 감지로 처리되므로 여기서는 아무것도 하지 않음
    // 타임피커 컨테이너 내부 클릭 시에는 blur가 발생하지 않도록 함
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onBlur={handleInputBlur}
          onClick={() => setIsOpen(true)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full h-10 pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md text-body bg-warm-white dark:bg-dark-ocean-panel text-gray-900 dark:text-gray-50 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-600 transition-all cursor-pointer"
          readOnly
        />
        <Clock 
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" 
        />
      </div>

      {isOpen && (
        <div 
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-ocean-card border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-50 overflow-hidden animate-slide-up"
          style={{
            backgroundColor: theme === 'dark' ? '#374151' : undefined
          }}
        >
          <div className="grid grid-cols-2">
            {/* Hours */}
            <div className="border-r border-gray-200 dark:border-gray-600">
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600">
                <span className="text-caption font-medium text-gray-600 dark:text-gray-400">시</span>
              </div>
              <div ref={hourScrollRef} className="max-h-48 overflow-y-auto">
                {hours.map((hour) => (
                  <button
                    key={hour}
                    data-hour={hour}
                    type="button"
                    onClick={() => handleTimeSelect(hour, currentMinute)}
                    className={`w-full px-3 py-2 text-body-small text-left transition-colors ${
                      currentHour === hour
                        ? 'bg-primary-50 dark:bg-primary-700 text-primary dark:text-primary-100 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    {String(hour).padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>

            {/* Minutes */}
            <div>
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600">
                <span className="text-caption font-medium text-gray-600 dark:text-gray-400">분</span>
              </div>
              <div ref={minuteScrollRef} className="max-h-48 overflow-y-auto">
                {minutes.map((minute) => (
                  <button
                    key={minute}
                    data-minute={minute}
                    type="button"
                    onClick={() => handleTimeSelect(currentHour, minute)}
                    className={`w-full px-3 py-2 text-body-small text-left transition-colors ${
                      currentMinute === minute
                        ? 'bg-primary-50 dark:bg-primary-700 text-primary dark:text-primary-100 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    {String(minute).padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

