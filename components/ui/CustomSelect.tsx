'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption<T = string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

interface CustomSelectProps<T = string> {
  options: SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  placeholder?: string;
}

export function CustomSelect<T = string>({
  options,
  value,
  onChange,
  className = '',
  placeholder = '선택하세요'
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

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

  const handleSelect = (optionValue: T) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-neutral-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white flex items-center justify-between hover:bg-neutral-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {selectedOption?.icon}
          <span className="text-neutral-text-primary">
            {selectedOption?.label || placeholder}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-neutral-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {options.map((option, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`w-full px-3 py-2 flex items-center gap-2 hover:bg-neutral-gray-50 transition-colors text-left ${
                option.value === value ? 'bg-primary-50' : ''
              }`}
            >
              {option.icon}
              <span className="text-neutral-text-primary">
                {option.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
