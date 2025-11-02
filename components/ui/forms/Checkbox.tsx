'use client';

import { Check } from 'lucide-react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export function Checkbox({ label, className = '', disabled = false, ...props }: CheckboxProps) {
  return (
    <label className={`inline-flex items-center gap-3 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only peer"
          disabled={disabled}
          {...props}
        />
        <div
          className={`
            w-5 h-5 rounded-xs border
            transition-all duration-normal
            flex items-center justify-center
            ${
              props.checked
                ? 'bg-primary border-primary text-white animate-bounce-in dark:bg-primary-600 dark:border-primary-600'
                : 'border-gray-300 bg-warm-white hover:border-primary dark:bg-dark-ocean-card dark:border-gray-600 dark:hover:border-primary-600'
            }
            ${disabled ? 'bg-gray-50 border-gray-300 dark:bg-gray-800 dark:border-gray-700' : ''}
            peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-primary
            dark:peer-focus-visible:ring-primary-600
          `}
        >
          {props.checked && <Check size={14} strokeWidth={3} />}
        </div>
      </div>
      {label && (
        <span
          className={`text-body ${
            disabled ? 'text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-gray-50'
          }`}
        >
          {label}
        </span>
      )}
    </label>
  );
}
