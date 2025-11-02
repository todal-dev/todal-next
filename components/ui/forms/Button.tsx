'use client';

import { ReactNode } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-md transition-all duration-normal touch-manipulation hover:scale-[1.02] active:scale-[0.98] cursor-pointer';

  const variantStyles = {
    primary:
      'bg-primary text-white hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-700 dark:disabled:text-gray-500',
    secondary:
      'bg-gray-100 text-gray-900 border border-gray-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-50 dark:border-gray-600 dark:hover:bg-gray-600 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-800 dark:disabled:text-gray-600',
    ghost:
      'bg-transparent text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed dark:disabled:text-gray-600',
    danger:
      'bg-status-error text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-700 dark:disabled:text-gray-500',
  };

  const sizeStyles = {
    sm: 'h-9 px-4 text-body-small min-h-[36px]',
    md: 'h-10 px-5 text-body min-h-[44px]',
    lg: 'h-12 px-6 text-body min-h-[48px]',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled}
      {...props}
    />
  );
}
