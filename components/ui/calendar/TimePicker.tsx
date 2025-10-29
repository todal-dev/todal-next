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
        className="flex items-center gap-1 px-2 py-1 text-caption border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors bg-warm-white dark:bg-dark-ocean-panel"
      >
        <Clock size={12} className="text-gray-600 dark:text-gray-400" />
        <span className="text-gray-900 dark:text-gray-50">
          {value || placeholder}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-warm-white dark:bg-dark-ocean-card border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-50 p-3 animate-slide-up">
          <div className="flex gap-3">
            {/* Hours */}
            <div className="flex flex-col">
              <div className="text-caption font-semibold text-gray-400 dark:text-gray-500 mb-2 text-center">시</div>
              <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                {hours.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => handleTimeSelect(hour, selectedMinute)}
                    className={`px-3 py-1 text-caption rounded transition-colors ${
                      selectedHour === hour
                        ? 'bg-primary dark:bg-primary-600 text-white'
                        : 'bg-warm-white dark:bg-dark-ocean-panel text-gray-900 dark:text-gray-50 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    {String(hour).padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>

            {/* Minutes */}
            <div className="flex flex-col">
              <div className="text-caption font-semibold text-gray-400 dark:text-gray-500 mb-2 text-center">분</div>
              <div className="flex flex-col gap-1">
                {minutes.map((minute) => (
                  <button
                    key={minute}
                    type="button"
                    onClick={() => handleTimeSelect(selectedHour, minute)}
                    className={`px-3 py-1 text-caption rounded transition-colors ${
                      selectedMinute === minute
                        ? 'bg-primary dark:bg-primary-600 text-white'
                        : 'bg-warm-white dark:bg-dark-ocean-panel text-gray-900 dark:text-gray-50 hover:bg-gray-50 dark:hover:bg-gray-600'
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
