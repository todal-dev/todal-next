'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { DatePicker } from './DatePicker';
import { motion, AnimatePresence } from 'framer-motion';

interface DatePickerInputProps {
  value: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  size?: 'sm' | 'md';
}

export function DatePickerInput({ value, onChange, minDate, maxDate, placeholder, size = 'sm' }: DatePickerInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 날짜 포맷 함수 (YY-MM-DD)
  const formatDate = (date: Date) => {
    const year = String(date.getFullYear()).slice(2); // 2025 -> 25
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleDateChange = (newDate: Date) => {
    onChange(newDate);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Input + Button */}
      <div className="flex gap-2">
        <input
          type="text"
          value={formatDate(value)}
          readOnly
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-neutral-gray-300 rounded-md bg-white text-neutral-text-primary text-sm cursor-default focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="px-3 py-2 border border-neutral-gray-300 rounded-md hover:bg-neutral-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <Calendar size={16} className="text-neutral-text-secondary" />
        </button>
      </div>

      {/* DatePicker Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 z-50 bg-white rounded-lg shadow-xl border border-neutral-gray-300 p-4"
          >
            <DatePicker
              value={value}
              onChange={handleDateChange}
              minDate={minDate}
              maxDate={maxDate}
              size={size}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
