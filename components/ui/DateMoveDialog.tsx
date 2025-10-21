'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface DateMoveDialogProps {
  isOpen: boolean;
  currentDate: Date;
  onClose: () => void;
  onConfirm: (newDate: Date) => void;
}

export function DateMoveDialog({ isOpen, currentDate, onClose, onConfirm }: DateMoveDialogProps) {
  const [dateString, setDateString] = useState('');

  useEffect(() => {
    if (isOpen && currentDate) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      setDateString(`${year}-${month}-${day}`);
    }
  }, [isOpen, currentDate]);

  const handleSubmit = () => {
    if (dateString) {
      const [year, month, day] = dateString.split('-').map(Number);
      const newDate = new Date(year, month - 1, day);
      onConfirm(newDate);
      onClose();
    }
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
              날짜 이동
            </h3>

            <div className="mb-2">
              <label className="text-sm text-neutral-text-secondary mb-2 block">
                새 날짜 선택
              </label>
              <input
                type="date"
                value={dateString}
                onChange={(e) => setDateString(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSubmit();
                  if (e.key === 'Escape') onClose();
                }}
                className="w-full px-3 py-2 border border-neutral-gray-300 rounded-lg focus:outline-none focus:border-primary-500 text-neutral-text-primary"
              />
            </div>

            <div className="flex gap-2 mt-6 justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-neutral-gray-100 hover:bg-neutral-gray-200 text-neutral-text-secondary transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white transition-colors"
              >
                확인
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
