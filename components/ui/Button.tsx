'use client';

import { ReactNode } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
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
    'inline-flex items-center justify-center font-medium rounded-md transition-all duration-normal active:scale-95';

  const variantStyles = {
    primary:
      'bg-primary-500 text-white hover:bg-primary-700 active:bg-primary-700 disabled:bg-neutral-gray-300 disabled:text-neutral-text-tertiary disabled:cursor-not-allowed',
    secondary:
      'bg-neutral-gray-50 text-neutral-text-primary border border-neutral-gray-300 hover:bg-neutral-gray-100 active:bg-neutral-gray-100 active:border-primary-500 disabled:bg-neutral-gray-50 disabled:text-neutral-text-tertiary disabled:cursor-not-allowed',
    ghost:
      'bg-transparent text-secondary hover:bg-neutral-gray-50 active:text-primary-500 disabled:text-neutral-text-tertiary disabled:cursor-not-allowed',
  };

  const sizeStyles = {
    sm: 'px-3 py-2 text-caption h-8',
    md: 'px-5 py-3 text-body h-10',
    lg: 'px-6 py-4 text-body h-12',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled}
      {...props}
    />
  );
}
