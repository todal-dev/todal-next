'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface Category {
  id: string;
  name: string;
  color: string;
}

interface CategoryChangeDialogProps {
  isOpen: boolean;
  currentCategoryId: string;
  categories: Category[];
  onClose: () => void;
  onConfirm: (categoryId: string) => void;
}

export function CategoryChangeDialog({
  isOpen,
  currentCategoryId,
  categories,
  onClose,
  onConfirm,
}: CategoryChangeDialogProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState(currentCategoryId);

  useEffect(() => {
    if (isOpen) {
      setSelectedCategoryId(currentCategoryId);
    }
  }, [isOpen, currentCategoryId]);

  const handleSubmit = () => {
    onConfirm(selectedCategoryId);
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
              카테고리 변경
            </h3>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategoryId(category.id)}
                  className={`w-full px-4 py-3 text-left rounded-lg border transition-colors flex items-center gap-3 ${
                    selectedCategoryId === category.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-gray-300 hover:bg-neutral-gray-50'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-medium text-neutral-text-primary">
                    {category.name}
                  </span>
                  {selectedCategoryId === category.id && (
                    <svg
                      className="w-5 h-5 ml-auto text-primary-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              ))}
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
