'use client';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  variant?: 'default' | 'underline';
}

export function Input({ error = false, variant = 'default', className = '', ...props }: InputProps) {
  const baseStyles = `
    w-full text-body
    placeholder:text-gray-400 dark:placeholder:text-gray-500
    transition-all duration-normal
    disabled:cursor-not-allowed
  `;

  const variantStyles = {
    default: `
      h-10 px-4 py-3 rounded-md
      bg-white dark:bg-gray-700
      text-gray-900 dark:text-gray-50
      border ${error ? 'border-status-error' : 'border-gray-200 dark:border-gray-600'}
      focus:outline-none focus:ring-2 focus:ring-offset-0
      ${error ? 'focus:ring-status-error' : 'focus:ring-primary focus:border-primary dark:focus:ring-primary-600'}
      disabled:bg-gray-50 disabled:text-gray-400 dark:disabled:bg-gray-800 dark:disabled:text-gray-600
    `,
    underline: `
      px-0 py-2
      bg-transparent
      text-gray-900 dark:text-gray-50
      border-0 border-b ${error ? 'border-b-status-error' : 'border-b-gray-200 dark:border-b-gray-600'}
      focus:outline-none focus:ring-0
      ${error ? 'focus:border-b-status-error' : 'focus:border-b-primary dark:focus:border-b-primary-600'}
      disabled:text-gray-400 dark:disabled:text-gray-600
    `,
  };

  return (
    <input
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    />
  );
}
