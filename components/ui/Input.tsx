'use client';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ error = false, className = '', ...props }: InputProps) {
  return (
    <input
      className={`
        w-full px-0 py-2 text-body
        bg-transparent text-neutral-text-primary
        border-b border-b-neutral-gray-300
        placeholder:text-neutral-text-tertiary
        transition-all duration-normal
        focus:outline-none focus:border-b-primary-500
        ${error && 'border-b-status-error focus:border-b-status-error'}
        disabled:bg-neutral-gray-50 disabled:text-neutral-text-tertiary disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    />
  );
}
