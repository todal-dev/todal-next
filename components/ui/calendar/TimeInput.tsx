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
          className="w-full pl-10 pr-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2D9F6B] transition-all"
        />
        <Clock 
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" 
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E5E7EB] rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="grid grid-cols-2">
            {/* Hours */}
            <div className="border-r border-[#E5E7EB]">
              <div className="px-3 py-2 bg-[#FAFAFA] border-b border-[#E5E7EB]">
                <span className="text-xs font-medium text-[#4B5563]">시</span>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {hours.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => handleTimeSelect(hour, currentMinute)}
                    className={`w-full px-3 py-2 text-sm text-left transition-colors ${
                      currentHour === hour
                        ? 'bg-[#E8F5EE] text-[#2D9F6B] font-medium'
                        : 'text-[#4B5563] hover:bg-[#FAFAFA]'
                    }`}
                  >
                    {String(hour).padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>

            {/* Minutes */}
            <div>
              <div className="px-3 py-2 bg-[#FAFAFA] border-b border-[#E5E7EB]">
                <span className="text-xs font-medium text-[#4B5563]">분</span>
              </div>
              <div>
                {minutes.map((minute) => (
                  <button
                    key={minute}
                    type="button"
                    onClick={() => handleTimeSelect(currentHour, minute)}
                    className={`w-full px-3 py-2 text-sm text-left transition-colors ${
                      currentMinute === minute
                        ? 'bg-[#E8F5EE] text-[#2D9F6B] font-medium'
                        : 'text-[#4B5563] hover:bg-[#FAFAFA]'
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

