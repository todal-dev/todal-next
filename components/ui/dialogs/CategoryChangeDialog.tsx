'use client';

import { useState, useEffect } from 'react';
import { BaseDialog, DialogFooter } from './BaseDialog';

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
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      title="카테고리 변경"
      zIndex={60}
      showHeaderBorder={false}
      showFooterBorder={false}
      footer={
        <DialogFooter
          onCancel={onClose}
          onConfirm={handleSubmit}
        />
      }
    >
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {categories.filter(cat => cat.id !== 'cat-recurring' && cat.name !== 'Google Calendar').map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategoryId(category.id)}
            className={`w-full px-4 py-3 text-left rounded-md border transition-colors flex items-center gap-3 ${
              selectedCategoryId === category.id
                ? 'border-primary dark:border-primary-600 bg-primary-50 dark:bg-primary-900/30'
                : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: category.color }}
            />
            <span className="font-medium text-gray-900 dark:text-gray-50">
              {category.name}
            </span>
            {selectedCategoryId === category.id && (
              <svg
                className="w-5 h-5 ml-auto text-primary dark:text-primary-100"
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
    </BaseDialog>
  );
}
