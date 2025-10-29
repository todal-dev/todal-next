'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ReactNode } from 'react';

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
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-warm-white dark:bg-dark-ocean-card rounded-lg sm:rounded-xl shadow-xl w-full mx-4 max-h-[90vh] overflow-y-auto ${sizeClasses[size]} ${className}`}
            style={{ zIndex: zIndex + 10 }}
          >
            {/* Header */}
            <div className={`flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 ${showHeaderBorder ? 'border-b border-gray-200 dark:border-gray-600' : ''}`}>
              <h2 className="text-h3 text-gray-900 dark:text-gray-50">
                {title}
              </h2>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 active:bg-gray-200 dark:active:bg-gray-500 transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center touch-manipulation"
                  aria-label="닫기"
                >
                  <X size={20} className="text-gray-600 dark:text-gray-400" />
                </button>
              )}
            </div>

            {/* Content */}
            <div className="px-4 sm:px-6 py-4">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className={`flex items-center justify-end gap-2 px-4 sm:px-6 py-3 sm:py-4 ${showFooterBorder ? 'border-t border-gray-200 dark:border-gray-600' : ''}`}>
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
        className="px-4 py-2.5 text-body-small font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 active:bg-gray-200 dark:active:bg-gray-500 rounded-md transition-colors cursor-pointer min-h-[44px] touch-manipulation"
      >
        {cancelText}
      </button>
      <button
        onClick={onConfirm}
        disabled={confirmDisabled}
        className="px-4 py-2.5 text-body-small font-medium text-white bg-primary dark:bg-primary-600 hover:bg-primary-dark dark:hover:bg-primary-700 active:bg-primary-700 dark:active:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer min-h-[44px] touch-manipulation"
      >
        {confirmText}
      </button>
    </>
  );
}
