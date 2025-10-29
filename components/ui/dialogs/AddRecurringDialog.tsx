'use client';

import { useState, useEffect } from 'react';
import { BaseDialog, DialogFooter } from './BaseDialog';
import { DatePickerInput } from '../calendar/DatePickerInput';
import { TimeInput } from '../calendar/TimeInput';
import { CategorySelect } from '../forms/CategorySelect';
import { CustomSelect, SelectOption } from '../forms/CustomSelect';

interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  startDate?: Date;
  endDate?: Date;
  count?: number;
  daysOfWeek?: number[];
  monthDay?: number;
  month?: number;
  nthWeekday?: {
    nth: number;
    weekday: number;
  };
  exceptions?: string[];
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
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [interval, setInterval] = useState(1);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5]); // 월-금
  const [startDate, setStartDate] = useState<Date>(selectedDate);
  const [endType, setEndType] = useState<'never' | 'date' | 'count'>('never');
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [count, setCount] = useState(10);
  
  // 월간/연간 고급 옵션
  const [monthlyMode, setMonthlyMode] = useState<'date' | 'weekday'>('date');
  const [nthWeek, setNthWeek] = useState(1); // 1=첫째, 2=둘째, 3=셋째, 4=넷째, -1=마지막
  const [nthWeekday, setNthWeekday] = useState(1); // 1=월, 2=화, ..., 7=일
  const [monthDay, setMonthDay] = useState(1);
  const [yearMonth, setYearMonth] = useState(1);

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
          setEndType('date');
          setEndDate(new Date(editingTodo.recurrenceRule.endDate));
        } else if (editingTodo.recurrenceRule.count) {
          setEndType('count');
          setCount(editingTodo.recurrenceRule.count);
        } else {
          setEndType('never');
        }
        
        // 월간/연간 고급 옵션
        if (editingTodo.recurrenceRule.nthWeekday) {
          setMonthlyMode('weekday');
          setNthWeek(editingTodo.recurrenceRule.nthWeekday.nth);
          setNthWeekday(editingTodo.recurrenceRule.nthWeekday.weekday);
        } else {
          setMonthlyMode('date');
        }
        setMonthDay(editingTodo.recurrenceRule.monthDay || selectedDate.getDate());
        setYearMonth(editingTodo.recurrenceRule.month || (selectedDate.getMonth() + 1));
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
      setEndType('never');
      setEndDate(new Date());
      setCount(10);
      setMonthlyMode('date');
      setNthWeek(1);
      setNthWeekday(1);
      setMonthDay(selectedDate.getDate());
      setYearMonth(selectedDate.getMonth() + 1);
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
      startDate,
      endDate: endType === 'date' ? endDate : undefined,
      count: endType === 'count' ? count : undefined,
      daysOfWeek: frequency === 'weekly' ? daysOfWeek : undefined,
      monthDay: (frequency === 'monthly' && monthlyMode === 'date') || frequency === 'yearly' ? monthDay : undefined,
      month: frequency === 'yearly' ? yearMonth : undefined,
      nthWeekday: (frequency === 'monthly' || frequency === 'yearly') && monthlyMode === 'weekday' 
        ? { nth: nthWeek, weekday: nthWeekday }
        : undefined,
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
        {/* 변환 안내 메시지 (새로 추가할 때만) */}
        {!editingTodo && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
            <p className="text-xs text-blue-800">
              💡 <strong>일반 할일에서 변환 시:</strong> 새로운 반복 할일이 생성되며, 기존 일반 할일은 그대로 유지됩니다.
            </p>
          </div>
        )}
        {/* 할일 제목 */}
        <div>
          <label className="block text-sm font-medium text-[#9CA3AF] mb-1">
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
            className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D9F6B]"
            autoFocus
          />
        </div>

        {/* 카테고리 (반복 카테고리 제외) */}
        <div>
          <label className="block text-sm font-medium text-[#9CA3AF] mb-1">
            카테고리
          </label>
          <CategorySelect
            categories={categories.filter(cat => cat.id !== 'cat-recurring')}
            value={categoryId}
            onChange={setCategoryId}
          />
        </div>

        {/* 시간 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-[#9CA3AF] mb-1">
              시작 시간
            </label>
            <TimeInput
              value={startTime}
              onChange={setStartTime}
              placeholder="09:00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#9CA3AF] mb-1">
              종료 시간
            </label>
            <TimeInput
              value={endTime}
              onChange={setEndTime}
              placeholder="10:00"
            />
          </div>
        </div>

        {/* 반복 주기 */}
        <div>
          <label className="block text-sm font-medium text-[#9CA3AF] mb-1">
            반복 주기
          </label>
          <CustomSelect
            options={[
              { value: 'daily', label: '매일' },
              { value: 'weekly', label: '매주' },
              { value: 'monthly', label: '매월' },
              { value: 'yearly', label: '매년' }
            ] as SelectOption<'daily' | 'weekly' | 'monthly' | 'yearly'>[]}
            value={frequency}
            onChange={(value) => setFrequency(value as 'daily' | 'weekly' | 'monthly' | 'yearly')}
          />
        </div>

        {/* 간격 */}
        <div>
          <label className="block text-sm font-medium text-[#9CA3AF] mb-1">
            간격
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="30"
              value={interval}
              onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
              className="w-20 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D9F6B]"
            />
            <span className="text-sm text-[#9CA3AF]">
              {frequency === 'daily' && '일마다'}
              {frequency === 'weekly' && '주마다'}
              {frequency === 'monthly' && '개월마다'}
              {frequency === 'yearly' && '년마다'}
            </span>
          </div>
        </div>

        {/* 요일 선택 (주간 반복일 때만) */}
        {frequency === 'weekly' && (
          <div>
            <label className="block text-sm font-medium text-[#9CA3AF] mb-2">
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
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#2D9F6B] text-white'
                        : 'bg-[#F5F5F5] text-[#9CA3AF] hover:bg-[#E5E7EB]'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 월간 반복 고급 옵션 */}
        {frequency === 'monthly' && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-[#9CA3AF]">
              반복 방식
            </label>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={monthlyMode === 'date'}
                  onChange={() => setMonthlyMode('date')}
                  className="text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm">매월</span>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={monthDay}
                  onChange={(e) => setMonthDay(parseInt(e.target.value) || 1)}
                  disabled={monthlyMode !== 'date'}
                  className="w-16 px-2 py-1 border border-[#E5E7EB] rounded-lg text-sm disabled:bg-[#F5F5F5]"
                />
                <span className="text-sm">일</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={monthlyMode === 'weekday'}
                  onChange={() => setMonthlyMode('weekday')}
                  className="text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm">매월</span>
                <select
                  value={nthWeek}
                  onChange={(e) => setNthWeek(parseInt(e.target.value))}
                  disabled={monthlyMode !== 'weekday'}
                  className="px-2 py-1 border border-[#E5E7EB] rounded-lg text-sm disabled:bg-[#F5F5F5]"
                >
                  <option value={1}>첫째주</option>
                  <option value={2}>둘째주</option>
                  <option value={3}>셋째주</option>
                  <option value={4}>넷째주</option>
                  <option value={-1}>마지막주</option>
                </select>
                <select
                  value={nthWeekday}
                  onChange={(e) => setNthWeekday(parseInt(e.target.value))}
                  disabled={monthlyMode !== 'weekday'}
                  className="px-2 py-1 border border-[#E5E7EB] rounded-lg text-sm disabled:bg-[#F5F5F5]"
                >
                  {dayNames.map((day, index) => (
                    <option key={index + 1} value={index + 1}>{day}요일</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        )}

        {/* 연간 반복 옵션 */}
        {frequency === 'yearly' && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-[#9CA3AF]">
              반복 날짜
            </label>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#9CA3AF] mb-1">월</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={yearMonth}
                  onChange={(e) => setYearMonth(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D9F6B]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#9CA3AF] mb-1">일</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={monthDay}
                  onChange={(e) => setMonthDay(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D9F6B]"
                />
              </div>
            </div>

            <div className="text-xs text-[#9CA3AF]">
              예: 매년 {yearMonth}월 {monthDay}일
            </div>
          </div>
        )}

        {/* 시작 날짜 */}
        <div>
          <label className="block text-sm font-medium text-[#9CA3AF] mb-2">
            시작 날짜
          </label>
          <DatePickerInput
            value={startDate}
            onChange={setStartDate}
          />
        </div>

        {/* 종료 조건 */}
        <div>
          <label className="block text-sm font-medium text-[#9CA3AF] mb-2">
            종료 조건
          </label>
          
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={endType === 'never'}
                onChange={() => setEndType('never')}
                className="text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm">종료 안함</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={endType === 'date'}
                onChange={() => setEndType('date')}
                className="text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm">날짜 지정</span>
              {endType === 'date' && (
                <div className="ml-2">
                  <DatePickerInput
                    value={endDate}
                    onChange={setEndDate}
                    minDate={startDate}
                  />
                </div>
              )}
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={endType === 'count'}
                onChange={() => setEndType('count')}
                className="text-primary-500 focus:ring-primary-500"
              />
              <input
                type="number"
                min="1"
                max="100"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                disabled={endType !== 'count'}
                className="w-16 px-2 py-1 border border-[#E5E7EB] rounded-lg text-sm disabled:bg-[#F5F5F5] mx-2"
              />
              <span className="text-sm">회 반복 후 종료</span>
            </label>
          </div>
        </div>
      </div>
    </BaseDialog>
  );
}
