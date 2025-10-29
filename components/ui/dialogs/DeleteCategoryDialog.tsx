'use client';

import { BaseDialog, DialogFooter } from './BaseDialog';

interface DeleteCategoryDialogProps {
  isOpen: boolean;
  categoryName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteCategoryDialog({ isOpen, categoryName, onClose, onConfirm }: DeleteCategoryDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      title="카테고리 삭제"
      zIndex={60}
      showHeaderBorder={false}
      showFooterBorder={false}
      footer={
        <DialogFooter
          onCancel={onClose}
          onConfirm={handleConfirm}
          confirmText="삭제"
        />
      }
    >
      <div>
        <p className="text-body text-gray-600 dark:text-gray-400 mb-4">
          <span className="font-medium text-gray-900 dark:text-gray-50">"{categoryName}"</span> 카테고리를 삭제하시겠습니까?
        </p>

        <div className="bg-red-50 dark:bg-red-900/20 rounded-md p-3 border border-red-200 dark:border-red-800">
          <div className="text-body-small text-red-700 dark:text-red-400">
            카테고리 내의 모든 할일이 "기타" 카테고리로 이동됩니다.
          </div>
        </div>
      </div>
    </BaseDialog>
  );
}
