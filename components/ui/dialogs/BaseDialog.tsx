'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ReactNode } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface BaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  showCloseButton?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  zIndex?: number;
  showHeaderBorder?: boolean;
  showFooterBorder?: boolean;
}

export function BaseDialog({
  isOpen,
  onClose,
  title,
  children,
  footer,
  showCloseButton = false,
  size = 'md',
  className = '',
  zIndex = 50,
  showHeaderBorder = true,
  showFooterBorder = true,
}: BaseDialogProps) {
  const { theme } = useTheme();
  const sizeClasses = {
    sm: 'max-w-[calc(100%-2rem)] sm:max-w-sm',
    md: 'max-w-[calc(100%-2rem)] sm:max-w-md',
    lg: 'max-w-[calc(100%-2rem)] sm:max-w-lg',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm"
            style={{ zIndex }}
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ 
              duration: 0.25, 
              ease: [0.4, 0, 0.2, 1] // cubic-bezier from design guide
            }}
            className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-dark-ocean-card rounded-2xl shadow-2xl w-full mx-4 max-h-[90vh] overflow-y-auto ${sizeClasses[size]} ${className}`}
            style={{ 
              zIndex: zIndex + 10,
              backgroundColor: theme === 'dark' ? '#374151' : undefined
            }}
          >
            {/* Header */}
            <div className={`flex items-center justify-between px-5 sm:px-7 py-4 sm:py-5 ${showHeaderBorder ? 'border-b border-gray-200 dark:border-gray-600' : ''}`}>
              <h2 className="text-h3 font-semibold text-gray-900 dark:text-gray-50">
                {title}
              </h2>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation hover:scale-105 active:scale-95"
                  aria-label="닫기"
                >
                  <X size={20} className="text-gray-500 dark:text-gray-400" />
                </button>
              )}
            </div>

            {/* Content */}
            <div className="px-5 sm:px-7 py-5">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className={`flex items-center justify-end gap-3 px-5 sm:px-7 py-4 sm:py-5 ${showFooterBorder ? 'border-t border-gray-200 dark:border-gray-600' : ''}`}>
                {footer}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface DialogFooterProps {
  onCancel: () => void;
  onConfirm: () => void;
  cancelText?: string;
  confirmText?: string;
  confirmDisabled?: boolean;
}

export function DialogFooter({
  onCancel,
  onConfirm,
  cancelText = '취소',
  confirmText = '확인',
  confirmDisabled = false,
}: DialogFooterProps) {
  return (
    <>
      <button
        onClick={onCancel}
        className="px-5 py-3 text-body font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 active:bg-gray-300 dark:active:bg-gray-500 rounded-xl transition-all cursor-pointer min-h-[48px] touch-manipulation hover:scale-[1.02] active:scale-[0.98] border-2 border-gray-200 dark:border-gray-600"
      >
        {cancelText}
      </button>
      <button
        onClick={onConfirm}
        disabled={confirmDisabled}
        className="px-6 py-3 text-body font-semibold text-white bg-primary-700 dark:bg-primary-600 hover:bg-primary-700 dark:hover:bg-primary-700 active:bg-primary-800 dark:active:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer min-h-[48px] touch-manipulation shadow-md hover:shadow-lg"
      >
        {confirmText}
      </button>
    </>
  );
}
