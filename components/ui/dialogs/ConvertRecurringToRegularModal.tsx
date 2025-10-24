'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ConvertRecurringToRegularModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConvertThisOnly: () => void;
  onConvertAll: () => void;
}

export function ConvertRecurringToRegularModal({
  isOpen,
  onClose,
  onConvertThisOnly,
  onConvertAll,
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
          <p className="text-sm text-neutral-text-secondary mb-6">
            반복 할일을 일반 할일로 변환하시겠습니까?
          </p>

          {/* Buttons */}
          <div className="space-y-2">
            <button
              onClick={() => {
                onConvertThisOnly();
                onClose();
              }}
              className="w-full px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors text-left cursor-pointer"
            >
              <div className="font-medium">이 항목만 변환</div>
              <div className="text-sm text-white/80 mt-0.5">
                오늘 날짜만 일반 할일로 분리합니다
              </div>
            </button>

            <button
              onClick={() => {
                onConvertAll();
                onClose();
              }}
              className="w-full px-4 py-3 bg-neutral-gray-100 hover:bg-neutral-gray-200 text-neutral-text-primary rounded-lg transition-colors text-left cursor-pointer"
            >
              <div className="font-medium">모든 반복 항목 변환</div>
              <div className="text-sm text-neutral-text-secondary mt-0.5">
                반복 규칙을 제거하고 일반 할일로 변환합니다
              </div>
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
