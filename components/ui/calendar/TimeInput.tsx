'use client';

import { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';

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

  // value가 변경되면 inputValue 업데이트
  useEffect(() => {
    setInputValue(value);
  }, [value]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // HH:MM 형식 검증
    if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(newValue)) {
      onChange(newValue);
    }
  };

  const handleInputBlur = () => {
    // 입력값이 유효하지 않으면 기존 값으로 복구
    if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(inputValue)) {
      setInputValue(value);
    }
  };

  const currentHour = value ? parseInt(value.split(':')[0]) : 9;
  const currentMinute = value ? parseInt(value.split(':')[1]) : 0;

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full h-10 pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md text-body bg-warm-white dark:bg-dark-ocean-panel text-gray-900 dark:text-gray-50 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-600 transition-all"
        />
        <Clock 
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" 
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-warm-white dark:bg-dark-ocean-card border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-50 overflow-hidden animate-slide-up">
          <div className="grid grid-cols-2">
            {/* Hours */}
            <div className="border-r border-gray-200 dark:border-gray-600">
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600">
                <span className="text-caption font-medium text-gray-600 dark:text-gray-400">시</span>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {hours.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => handleTimeSelect(hour, currentMinute)}
                    className={`w-full px-3 py-2 text-body-small text-left transition-colors ${
                      currentHour === hour
                        ? 'bg-primary-light dark:bg-primary-700 text-primary dark:text-primary-light font-medium'
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
              <div>
                {minutes.map((minute) => (
                  <button
                    key={minute}
                    type="button"
                    onClick={() => handleTimeSelect(currentHour, minute)}
                    className={`w-full px-3 py-2 text-body-small text-left transition-colors ${
                      currentMinute === minute
                        ? 'bg-primary-light dark:bg-primary-700 text-primary dark:text-primary-light font-medium'
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

