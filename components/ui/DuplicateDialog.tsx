'use client';

import { BaseDialog, DialogFooter } from './BaseDialog';

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
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      title="일정 복제"
      zIndex={60}
      showHeaderBorder={false}
      showFooterBorder={false}
      footer={
        <DialogFooter
          onCancel={onClose}
          onConfirm={handleConfirm}
          confirmText="복제"
        />
      }
    >
      <div>
        <p className="text-neutral-text-secondary mb-4">
          <span className="font-medium text-neutral-text-primary">"{todoName}"</span>을(를) 복제하시겠습니까?
        </p>

        <div className="bg-neutral-gray-50 rounded-lg p-3">
          <div className="text-sm text-neutral-text-secondary">
            복제된 일정은 같은 날짜와 시간에 생성됩니다.
          </div>
        </div>
      </div>
    </BaseDialog>
  );
}
