'use client';

import { Clock } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface TimePickerProps {
  value?: string;
  onChange: (time: string) => void;
  placeholder?: string;
}

export function TimePicker({ value, onChange, placeholder = '시간 선택' }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState<number>(9);
  const [selectedMinute, setSelectedMinute] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // value가 변경되면 selectedHour와 selectedMinute 업데이트
  useEffect(() => {
    if (value) {
      const [hour, minute] = value.split(':').map(Number);
      setSelectedHour(hour);
      setSelectedMinute(minute);
    }
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
    setSelectedHour(hour);
    setSelectedMinute(minute);
    const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    onChange(timeString);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 text-xs border border-neutral-gray-300 rounded hover:bg-neutral-gray-100 transition-colors"
      >
        <Clock size={12} className="text-neutral-text-secondary" />
        <span className="text-neutral-text-primary">
          {value || placeholder}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-neutral-gray-300 rounded-lg shadow-lg z-50 p-3">
          <div className="flex gap-3">
            {/* Hours */}
            <div className="flex flex-col">
              <div className="text-xs font-semibold text-neutral-text-secondary mb-2 text-center">시</div>
              <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                {hours.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => handleTimeSelect(hour, selectedMinute)}
                    className={`px-3 py-1 text-xs rounded transition-colors ${
                      selectedHour === hour
                        ? 'bg-primary-500 text-white'
                        : 'bg-white text-neutral-text-primary hover:bg-neutral-gray-100'
                    }`}
                  >
                    {String(hour).padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>

            {/* Minutes */}
            <div className="flex flex-col">
              <div className="text-xs font-semibold text-neutral-text-secondary mb-2 text-center">분</div>
              <div className="flex flex-col gap-1">
                {minutes.map((minute) => (
                  <button
                    key={minute}
                    type="button"
                    onClick={() => handleTimeSelect(selectedHour, minute)}
                    className={`px-3 py-1 text-xs rounded transition-colors ${
                      selectedMinute === minute
                        ? 'bg-primary-500 text-white'
                        : 'bg-white text-neutral-text-primary hover:bg-neutral-gray-100'
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
