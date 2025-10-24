'use client';

import { Check } from 'lucide-react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export function Checkbox({ label, className = '', disabled = false, ...props }: CheckboxProps) {
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only peer"
          disabled={disabled}
          {...props}
        />
        <div
          className={`
            w-5 h-5 rounded-xs border-2
            transition-all duration-normal
            flex items-center justify-center
            ${
              props.checked
                ? 'bg-primary-500 border-primary-500 text-white'
                : 'border-neutral-gray-300 bg-white hover:border-neutral-gray-400'
            }
            ${disabled ? 'bg-neutral-gray-50 border-neutral-gray-300 cursor-not-allowed' : ''}
            peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-primary-500
          `}
        >
          {props.checked && <Check size={16} strokeWidth={3} />}
        </div>
      </div>
      {label && (
        <span
          className={`text-body ${
            disabled ? 'text-neutral-text-tertiary' : 'text-neutral-text-primary'
          }`}
        >
          {label}
        </span>
      )}
    </label>
  );
}
