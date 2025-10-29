'use client';

import { useState, useEffect } from 'react';
import { BaseDialog, DialogFooter } from './BaseDialog';
import { DatePicker } from '../calendar/DatePicker';

interface DateMoveDialogProps {
  isOpen: boolean;
  currentDate: Date;
  onClose: () => void;
  onConfirm: (newDate: Date) => void;
}

export function DateMoveDialog({ isOpen, currentDate, onClose, onConfirm }: DateMoveDialogProps) {
  const [selectedDate, setSelectedDate] = useState(currentDate);

  useEffect(() => {
    if (isOpen && currentDate) {
      setSelectedDate(currentDate);
    }
  }, [isOpen, currentDate]);

  const handleSubmit = () => {
    onConfirm(selectedDate);
    onClose();
  };

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      title="날짜 이동"
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
      <div>
        <label className="text-body-small text-gray-400 dark:text-gray-500 mb-3 block">
          새 날짜 선택
        </label>
        <DatePicker
          value={selectedDate}
          onChange={setSelectedDate}
          size="sm"
        />
      </div>
    </BaseDialog>
  );
}
