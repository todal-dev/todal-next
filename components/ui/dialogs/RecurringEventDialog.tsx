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
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          이 이벤트는 반복 일정입니다. 어떤 항목을 수정하시겠습니까?
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              onSelectThis();
              onClose();
            }}
            className="w-full px-4 py-3 text-left rounded-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="font-medium text-gray-900 dark:text-gray-50">
              이 이벤트만
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              현재 선택한 이벤트만 수정합니다
            </div>
          </button>

          <button
            onClick={() => {
              onSelectAll();
              onClose();
            }}
            className="w-full px-4 py-3 text-left rounded-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="font-medium text-gray-900 dark:text-gray-50">
              모든 이벤트
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              반복되는 모든 이벤트를 수정합니다
            </div>
          </button>

          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-center rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    </BaseDialog>
  );
}
