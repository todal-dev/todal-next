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
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            style={{ zIndex }}
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg sm:rounded-xl shadow-xl w-full mx-4 max-h-[90vh] overflow-y-auto ${sizeClasses[size]} ${className}`}
            style={{ zIndex: zIndex + 10 }}
          >
            {/* Header */}
            <div className={`flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 ${showHeaderBorder ? 'border-b border-neutral-gray-300' : ''}`}>
              <h2 className="text-base sm:text-lg font-semibold text-neutral-text-primary">
                {title}
              </h2>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-2 rounded hover:bg-neutral-gray-100 active:bg-neutral-gray-200 transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center touch-manipulation"
                  aria-label="닫기"
                >
                  <X size={20} className="text-neutral-text-secondary" />
                </button>
              )}
            </div>

            {/* Content */}
            <div className="px-4 sm:px-6 py-4">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className={`flex items-center justify-end gap-2 px-4 sm:px-6 py-3 sm:py-4 ${showFooterBorder ? 'border-t border-neutral-gray-300' : ''}`}>
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
        className="px-4 py-2.5 text-sm font-medium text-neutral-text-secondary hover:bg-neutral-gray-100 active:bg-neutral-gray-200 rounded-md transition-colors cursor-pointer min-h-[44px] touch-manipulation"
      >
        {cancelText}
      </button>
      <button
        onClick={onConfirm}
        disabled={confirmDisabled}
        className="px-4 py-2.5 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 active:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors cursor-pointer min-h-[44px] touch-manipulation"
      >
        {confirmText}
      </button>
    </>
  );
}
