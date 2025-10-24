'use client';

import { BaseDialog } from './BaseDialog';
import { SkipForward, CalendarX, X } from 'lucide-react';

interface DeleteRecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkipInstance: () => void;
  onDeleteAfter: () => void;
  onDeleteAll: () => void;
}

export function DeleteRecurringModal({
  isOpen,
  onClose,
  onSkipInstance,
  onDeleteAfter,
  onDeleteAll,
}: DeleteRecurringModalProps) {
  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      title="반복 일정 삭제"
      size="md"
      showHeaderBorder={true}
      showFooterBorder={false}
    >
      <div className="space-y-3">
        <p className="text-sm text-neutral-text-secondary mb-4">
          삭제 방법을 선택하세요
        </p>

        {/* 이 일정만 건너뛰기 */}
        <button
          onClick={() => {
            onSkipInstance();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-neutral-gray-300 hover:bg-neutral-gray-50 hover:border-primary-500 transition-all text-left group"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
            <SkipForward size={20} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-neutral-text-primary">
              이 일정만 건너뛰기
            </div>
            <div className="text-xs text-neutral-text-tertiary mt-0.5">
              오늘 날짜만 건너뛰고 반복 일정은 유지됩니다
            </div>
          </div>
        </button>

        {/* 이 일정 이후 삭제 */}
        <button
          onClick={() => {
            onDeleteAfter();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-neutral-gray-300 hover:bg-orange-50 hover:border-orange-500 transition-all text-left group"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
            <CalendarX size={20} className="text-orange-600" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-neutral-text-primary">
              이 일정 이후 삭제
            </div>
            <div className="text-xs text-neutral-text-tertiary mt-0.5">
              오늘부터 미래의 모든 반복 일정이 삭제됩니다
            </div>
          </div>
        </button>

        {/* 모든 반복 일정 삭제 */}
        <button
          onClick={() => {
            onDeleteAll();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-neutral-gray-300 hover:bg-red-50 hover:border-red-500 transition-all text-left group"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
            <X size={20} className="text-red-600" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-neutral-text-primary">
              모든 반복 일정 삭제
            </div>
            <div className="text-xs text-neutral-text-tertiary mt-0.5">
              과거와 미래의 모든 반복 일정이 영구 삭제됩니다
            </div>
          </div>
        </button>
      </div>
    </BaseDialog>
  );
}
