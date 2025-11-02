'use client';

import { BaseDialog } from './BaseDialog';
import { Calendar, CalendarCheck, RotateCcw } from 'lucide-react';

interface RecurringEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditThis: () => void;
  onEditThisAndFuture: () => void;
  onEditAll: () => void;
}

export function RecurringEditModal({
  isOpen,
  onClose,
  onEditThis,
  onEditThisAndFuture,
  onEditAll,
}: RecurringEditModalProps) {
  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      title="반복 일정 수정"
      size="md"
      showHeaderBorder={true}
      showFooterBorder={false}
    >
      <div className="space-y-3">
        <p className="text-body-small text-gray-600 dark:text-gray-400 mb-4">
          수정 범위를 선택하세요
        </p>

        {/* 이 일정만 수정 */}
        <button
          onClick={() => {
            onEditThis();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-md border border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-500 dark:hover:border-blue-600 transition-all text-left group"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
            <Calendar size={20} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <div className="text-body-small font-medium text-gray-900 dark:text-gray-50">
              이 일정만 수정
            </div>
            <div className="text-caption text-gray-400 dark:text-gray-500 mt-0.5">
              오늘 날짜만 수정하고 반복 일정은 유지됩니다
            </div>
          </div>
        </button>

        {/* 이 일정 및 향후 일정 수정 */}
        <button
          onClick={() => {
            onEditThisAndFuture();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-md border border-gray-200 dark:border-gray-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-500 dark:hover:border-orange-600 transition-all text-left group"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center group-hover:bg-orange-100 dark:group-hover:bg-orange-900/50 transition-colors">
            <CalendarCheck size={20} className="text-orange-600 dark:text-orange-400" />
          </div>
          <div className="flex-1">
            <div className="text-body-small font-medium text-gray-900 dark:text-gray-50">
              이 일정 및 향후 일정 수정
            </div>
            <div className="text-caption text-gray-400 dark:text-gray-500 mt-0.5">
              오늘부터 미래의 모든 반복 일정이 수정됩니다
            </div>
          </div>
        </button>

        {/* 모든 일정 수정 */}
        <button
          onClick={() => {
            onEditAll();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-md border border-gray-200 dark:border-gray-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-500 dark:hover:border-purple-600 transition-all text-left group"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50 transition-colors">
            <RotateCcw size={20} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <div className="text-body-small font-medium text-gray-900 dark:text-gray-50">
              모든 일정 수정
            </div>
            <div className="text-caption text-gray-400 dark:text-gray-500 mt-0.5">
              과거와 미래의 모든 반복 일정이 수정됩니다
            </div>
          </div>
        </button>
      </div>
    </BaseDialog>
  );
}
