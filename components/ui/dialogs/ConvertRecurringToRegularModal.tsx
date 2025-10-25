'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ConvertRecurringToRegularModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConvertThisOnly: () => void;
}

export function ConvertRecurringToRegularModal({
  isOpen,
  onClose,
  onConvertThisOnly,
}: ConvertRecurringToRegularModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/30"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.15 }}
          className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-text-primary">
              일반 할일로 변환
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-neutral-gray-100 rounded transition-colors"
            >
              <X size={20} className="text-neutral-text-secondary" />
            </button>
          </div>

          {/* Description */}
          <div className="mb-6">
            <p className="text-sm text-neutral-text-secondary mb-2">
              이 반복 할일을 일반 카테고리로 이동하시겠습니까?
            </p>
            <p className="text-xs text-neutral-text-tertiary bg-neutral-gray-50 p-3 rounded-md">
              💡 선택한 날짜의 항목만 일반 할일로 변환되며, 다른 날짜의 반복 일정은 그대로 유지됩니다.
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-2">
            <button
              onClick={() => {
                onConvertThisOnly();
                onClose();
              }}
              className="w-full px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors cursor-pointer font-medium"
            >
              일반 할일로 변환
            </button>

            <button
              onClick={onClose}
              className="w-full px-4 py-2 hover:bg-neutral-gray-100 text-neutral-text-secondary rounded-lg transition-colors cursor-pointer"
            >
              취소
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
