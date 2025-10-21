'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface RecurringEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectThis: () => void;
  onSelectAll: () => void;
  title: string;
}

export function RecurringEventDialog({
  isOpen,
  onClose,
  onSelectThis,
  onSelectAll,
  title,
}: RecurringEventDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-10 z-50"
            onClick={onClose}
          />

          {/* 다이얼로그 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-[60] p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold text-neutral-text-primary mb-4">
              {title}
            </h3>

            <p className="text-sm text-neutral-text-secondary mb-6">
              이 이벤트는 반복 일정입니다. 어떤 항목을 수정하시겠습니까?
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  onSelectThis();
                  onClose();
                }}
                className="w-full px-4 py-3 text-left rounded-lg border border-neutral-gray-300 hover:bg-neutral-gray-50 transition-colors"
              >
                <div className="font-medium text-neutral-text-primary">
                  이 이벤트만
                </div>
                <div className="text-xs text-neutral-text-secondary mt-1">
                  현재 선택한 이벤트만 수정합니다
                </div>
              </button>

              <button
                onClick={() => {
                  onSelectAll();
                  onClose();
                }}
                className="w-full px-4 py-3 text-left rounded-lg border border-neutral-gray-300 hover:bg-neutral-gray-50 transition-colors"
              >
                <div className="font-medium text-neutral-text-primary">
                  모든 이벤트
                </div>
                <div className="text-xs text-neutral-text-secondary mt-1">
                  반복되는 모든 이벤트를 수정합니다
                </div>
              </button>

              <button
                onClick={onClose}
                className="w-full px-4 py-2 text-center rounded-lg bg-neutral-gray-100 hover:bg-neutral-gray-200 text-neutral-text-secondary transition-colors"
              >
                취소
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
