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
          className="flex-1 h-10 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 text-body-small cursor-default focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-600"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="h-10 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-600 bg-white dark:bg-gray-800"
        >
          <Calendar size={16} className="text-gray-600 dark:text-gray-400" />
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
            className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-gray-700 rounded-md shadow-xl border border-gray-200 dark:border-gray-600 p-4"
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
