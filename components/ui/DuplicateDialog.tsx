'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface DuplicateDialogProps {
  isOpen: boolean;
  todoName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DuplicateDialog({ isOpen, todoName, onClose, onConfirm }: DuplicateDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-[60] p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold text-neutral-text-primary mb-4">
              일정 복제
            </h3>

            <p className="text-neutral-text-secondary mb-6">
              <span className="font-medium text-neutral-text-primary">"{todoName}"</span>을(를) 복제하시겠습니까?
            </p>

            <div className="bg-neutral-gray-50 rounded-lg p-3 mb-6">
              <div className="text-sm text-neutral-text-secondary">
                복제된 일정은 같은 날짜와 시간에 생성됩니다.
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-neutral-gray-100 hover:bg-neutral-gray-200 text-neutral-text-secondary transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white transition-colors"
              >
                복제
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
