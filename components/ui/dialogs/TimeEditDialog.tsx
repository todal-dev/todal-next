'use client';

import { useState, useEffect } from 'react';
import { BaseDialog, DialogFooter } from './BaseDialog';
import { TimeInput } from '../calendar/TimeInput';

interface TimeEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (startTime: string, endTime: string) => void;
  currentStartTime?: string;
  currentEndTime?: string;
}

export function TimeEditDialog({
  isOpen,
  onClose,
  onConfirm,
  currentStartTime = '09:00',
  currentEndTime = '10:00',
}: TimeEditDialogProps) {
  const [startTime, setStartTime] = useState(currentStartTime);
  const [endTime, setEndTime] = useState(currentEndTime);

  useEffect(() => {
    if (isOpen) {
      setStartTime(currentStartTime || '09:00');
      setEndTime(currentEndTime || '10:00');
    }
  }, [isOpen, currentStartTime, currentEndTime]);

  const handleConfirm = () => {
    // 시간 유효성 검사
    if (!startTime || !endTime) {
      alert('시작 시간과 종료 시간을 모두 입력해주세요.');
      return;
    }

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    if (endMinutes <= startMinutes) {
      alert('종료 시간은 시작 시간보다 늦어야 합니다.');
      return;
    }

    onConfirm(startTime, endTime);
    onClose();
  };

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      title="시간 편집"
      showCloseButton={true}
      size="sm"
      footer={
        <DialogFooter
          onCancel={onClose}
          onConfirm={handleConfirm}
          confirmText="저장"
        />
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-body-small font-medium text-gray-600 dark:text-gray-400 mb-2">
            시작 시간
          </label>
          <TimeInput
            value={startTime}
            onChange={setStartTime}
            placeholder="09:00"
          />
        </div>

        <div>
          <label className="block text-body-small font-medium text-gray-600 dark:text-gray-400 mb-2">
            종료 시간
          </label>
          <TimeInput
            value={endTime}
            onChange={setEndTime}
            placeholder="10:00"
          />
        </div>
      </div>
    </BaseDialog>
  );
}

