'use client';

import { useState, useEffect } from 'react';
import { BaseDialog, DialogFooter } from './BaseDialog';
import { DatePickerInput } from './DatePickerInput';
import { CategorySelect } from './CategorySelect';
import { CustomSelect, SelectOption } from './CustomSelect';

interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
  startDate?: Date;
  endDate?: Date;
  daysOfWeek?: number[];
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface AddRecurringDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    text: string,
    startTime: string,
    endTime: string,
    recurrenceRule: RecurrenceRule,
    categoryId: string
  ) => void;
  selectedDate: Date;
  categories: Category[];
  editingTodo?: {
    id: string;
    text: string;
    startTime?: string;
    endTime?: string;
    recurrenceRule?: RecurrenceRule;
    categoryId?: string;
  };
}

export function AddRecurringDialog({
  isOpen,
  onClose,
  onConfirm,
  selectedDate,
  categories,
  editingTodo,
}: AddRecurringDialogProps) {
  const [text, setText] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [categoryId, setCategoryId] = useState('cat-etc');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [interval, setInterval] = useState(1);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5]); // 월-금
  const [startDate, setStartDate] = useState<Date>(selectedDate);
  const [hasEndDate, setHasEndDate] = useState(false);
  const [endDate, setEndDate] = useState<Date>(new Date());

  // 편집 모드일 때 초기값 설정
  useEffect(() => {
    if (editingTodo) {
      setText(editingTodo.text);
      setStartTime(editingTodo.startTime || '09:00');
      setEndTime(editingTodo.endTime || '10:00');
      setCategoryId(editingTodo.categoryId || 'cat-etc');
      if (editingTodo.recurrenceRule) {
        setFrequency(editingTodo.recurrenceRule.frequency);
        setInterval(editingTodo.recurrenceRule.interval);
        setDaysOfWeek(editingTodo.recurrenceRule.daysOfWeek || [1, 2, 3, 4, 5]);
        if (editingTodo.recurrenceRule.startDate) {
          setStartDate(new Date(editingTodo.recurrenceRule.startDate));
        } else {
          setStartDate(selectedDate);
        }
        if (editingTodo.recurrenceRule.endDate) {
          setHasEndDate(true);
          setEndDate(new Date(editingTodo.recurrenceRule.endDate));
        } else {
          setEndDate(new Date());
        }
      }
    } else {
      setText('');
      setStartTime('09:00');
      setEndTime('10:00');
      setCategoryId('cat-etc');
      setFrequency('daily');
      setInterval(1);
      setDaysOfWeek([1, 2, 3, 4, 5]);
      setStartDate(selectedDate);
      setHasEndDate(false);
      setEndDate(new Date());
    }
  }, [editingTodo, isOpen, selectedDate]);

  const handleConfirm = () => {
    if (!text.trim()) {
      alert('할일 제목을 입력해주세요.');
      return;
    }

    const recurrenceRule: RecurrenceRule = {
      frequency,
      interval,
      daysOfWeek: frequency === 'weekly' ? daysOfWeek : undefined,
      startDate,
      endDate: hasEndDate ? endDate : undefined,
    };

    onConfirm(text.trim(), startTime, endTime, recurrenceRule, categoryId);
    onClose();
  };

  const toggleDayOfWeek = (day: number) => {
    setDaysOfWeek(prev => {
      if (prev.includes(day)) {
        return prev.filter(d => d !== day);
      } else {
        return [...prev, day].sort();
      }
    });
  };

  const dayNames = ['월', '화', '수', '목', '금', '토', '일'];

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      title={editingTodo ? '반복 일정 편집' : '반복 일정 추가'}
      showCloseButton={true}
      size="md"
      footer={
        <DialogFooter
          onCancel={onClose}
          onConfirm={handleConfirm}
          confirmText={editingTodo ? '수정' : '추가'}
        />
      }
    >
      <div className="space-y-4">
        {/* 할일 제목 */}
        <div>
          <label className="block text-sm font-medium text-neutral-text-secondary mb-1">
            할일 제목
          </label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleConfirm();
              }
            }}
            placeholder="예: 아침 운동"
            className="w-full px-3 py-2 border border-neutral-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            autoFocus
          />
        </div>

        {/* 카테고리 */}
        <div>
          <label className="block text-sm font-medium text-neutral-text-secondary mb-1">
            카테고리
          </label>
          <CategorySelect
            categories={categories}
            value={categoryId}
            onChange={setCategoryId}
          />
        </div>

        {/* 시간 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-neutral-text-secondary mb-1">
              시작 시간
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-text-secondary mb-1">
              종료 시간
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* 반복 주기 */}
        <div>
          <label className="block text-sm font-medium text-neutral-text-secondary mb-1">
            반복 주기
          </label>
          <CustomSelect
            options={[
              { value: 'daily', label: '매일' },
              { value: 'weekly', label: '매주' },
              { value: 'monthly', label: '매월' }
            ] as SelectOption<'daily' | 'weekly' | 'monthly'>[]}
            value={frequency}
            onChange={(value) => setFrequency(value as 'daily' | 'weekly' | 'monthly')}
          />
        </div>

        {/* 간격 */}
        <div>
          <label className="block text-sm font-medium text-neutral-text-secondary mb-1">
            간격
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="30"
              value={interval}
              onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
              className="w-20 px-3 py-2 border border-neutral-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <span className="text-sm text-neutral-text-secondary">
              {frequency === 'daily' && '일마다'}
              {frequency === 'weekly' && '주마다'}
              {frequency === 'monthly' && '개월마다'}
            </span>
          </div>
        </div>

        {/* 요일 선택 (주간 반복일 때만) */}
        {frequency === 'weekly' && (
          <div>
            <label className="block text-sm font-medium text-neutral-text-secondary mb-2">
              반복 요일
            </label>
            <div className="flex gap-2">
              {dayNames.map((day, index) => {
                const dayValue = index + 1;
                const isSelected = daysOfWeek.includes(dayValue);
                return (
                  <button
                    key={dayValue}
                    onClick={() => toggleDayOfWeek(dayValue)}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-primary-500 text-white'
                        : 'bg-neutral-gray-100 text-neutral-text-secondary hover:bg-neutral-gray-200'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 시작 날짜 */}
        <div>
          <label className="block text-sm font-medium text-neutral-text-secondary mb-2">
            시작 날짜
          </label>
          <DatePickerInput
            value={startDate}
            onChange={setStartDate}
          />
        </div>

        {/* 종료 날짜 */}
        <div>
          <label className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={hasEndDate}
              onChange={(e) => setHasEndDate(e.target.checked)}
              className="rounded border-neutral-gray-300 text-primary-500 focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-neutral-text-secondary">
              종료 날짜 설정
            </span>
          </label>
          {hasEndDate && (
            <DatePickerInput
              value={endDate}
              onChange={setEndDate}
              minDate={startDate}
            />
          )}
        </div>
      </div>
    </BaseDialog>
  );
}
