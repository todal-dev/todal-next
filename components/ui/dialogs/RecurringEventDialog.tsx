'use client';

import { BaseDialog } from './BaseDialog';

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
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      zIndex={60}
      showHeaderBorder={false}
    >
      <div>
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
      </div>
    </BaseDialog>
  );
}
