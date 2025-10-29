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
        <p className="text-body text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
          <span className="text-lg mr-1">🔄</span>
          이 이벤트는 반복 일정입니다. 어떤 항목을 수정하시겠습니까?
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              onSelectThis();
              onClose();
            }}
            className="w-full px-5 py-4 text-left rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-primary dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-700/10 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] min-h-[68px]"
          >
            <div className="font-semibold text-body text-gray-900 dark:text-gray-50 mb-1">
              📌 이 이벤트만
            </div>
            <div className="text-body-small text-gray-600 dark:text-gray-400">
              현재 선택한 이벤트만 수정합니다
            </div>
          </button>

          <button
            onClick={() => {
              onSelectAll();
              onClose();
            }}
            className="w-full px-5 py-4 text-left rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-primary dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-700/10 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] min-h-[68px]"
          >
            <div className="font-semibold text-body text-gray-900 dark:text-gray-50 mb-1">
              🔄 모든 이벤트
            </div>
            <div className="text-body-small text-gray-600 dark:text-gray-400">
              반복되는 모든 이벤트를 수정합니다
            </div>
          </button>

          <button
            onClick={onClose}
            className="w-full px-5 py-3 text-center rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] min-h-[48px]"
          >
            취소
          </button>
        </div>
      </div>
    </BaseDialog>
  );
}
