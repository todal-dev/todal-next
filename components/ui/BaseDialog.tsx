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
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
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
            className="fixed inset-0 bg-black/30"
            style={{ zIndex }}
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-full mx-4 ${sizeClasses[size]} ${className}`}
            style={{ zIndex: zIndex + 10 }}
          >
            {/* Header */}
            <div className={`flex items-center justify-between px-6 py-4 ${showHeaderBorder ? 'border-b border-neutral-gray-300' : ''}`}>
              <h2 className="text-lg font-semibold text-neutral-text-primary">
                {title}
              </h2>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-1 rounded hover:bg-neutral-gray-100 transition-colors"
                >
                  <X size={20} className="text-neutral-text-secondary" />
                </button>
              )}
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className={`flex items-center justify-end gap-2 px-6 py-4 ${showFooterBorder ? 'border-t border-neutral-gray-300' : ''}`}>
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
        className="px-4 py-2 text-sm font-medium text-neutral-text-secondary hover:bg-neutral-gray-100 rounded-md transition-colors"
      >
        {cancelText}
      </button>
      <button
        onClick={onConfirm}
        disabled={confirmDisabled}
        className="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
      >
        {confirmText}
      </button>
    </>
  );
}
