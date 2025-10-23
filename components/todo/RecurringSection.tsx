'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Repeat, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Checkbox } from '@/components/ui/Checkbox';

interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
  startDate?: Date;
  endDate?: Date;
  daysOfWeek?: number[]; // 1=월, 2=화, ..., 7=일
}

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  date: Date;
  categoryId: string;
  subtasks?: Todo[];
  parentId?: string;
  startTime?: string;
  endTime?: string;
  recurrenceRule?: RecurrenceRule;
  recurrenceId?: string;
  excludeDates?: Date[];
  isFromRecurring?: boolean;
  originalRecurringId?: string;
}

interface RecurringSectionProps {
  todos: Todo[];
  selectedDate: Date;
  onToggleRecurringInstance: (recurringId: string) => void;
  onAddRecurring: () => void;
  onEditRecurring: (id: string) => void;
  onDeleteRecurring: (id: string) => void;
}

export function RecurringSection({
  todos,
  selectedDate,
  onToggleRecurringInstance,
  onAddRecurring,
  onEditRecurring,
  onDeleteRecurring,
}: RecurringSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // 반복 일정만 필터링 (원본만, recurrenceId가 없는 것)
  // 그리고 선택된 날짜가 시작일 이후이고 종료일 이전인 것만
  const recurringTodos = todos.filter(todo => {
    if (!todo.recurrenceRule || todo.recurrenceId) return false;

    // 시작일 체크: 시작일이 있으면 선택된 날짜가 시작일 이후여야 함
    if (todo.recurrenceRule.startDate) {
      const startDate = new Date(todo.recurrenceRule.startDate);
      startDate.setHours(0, 0, 0, 0);
      const selected = new Date(selectedDate);
      selected.setHours(0, 0, 0, 0);

      if (selected < startDate) return false;
    }

    // 종료일 체크: 종료일이 있으면 선택된 날짜가 종료일 이전이어야 함
    if (todo.recurrenceRule.endDate) {
      const endDate = new Date(todo.recurrenceRule.endDate);
      endDate.setHours(0, 0, 0, 0);
      const selected = new Date(selectedDate);
      selected.setHours(0, 0, 0, 0);

      if (selected > endDate) return false;
    }

    return true;
  });

  // 완료 카운트 계산: recurringTodos 중 오늘 분리된 할일이 있고 완료된 것
  const completedCount = recurringTodos.filter(recurringTodo => {
    const todaySeparated = todos.find(
      t => t.isFromRecurring &&
      t.originalRecurringId === recurringTodo.id &&
      t.date.getFullYear() === selectedDate.getFullYear() &&
      t.date.getMonth() === selectedDate.getMonth() &&
      t.date.getDate() === selectedDate.getDate()
    );
    return todaySeparated?.completed;
  }).length;

  const totalCount = recurringTodos.length;

  // 반복 주기 텍스트 생성
  const getRecurrenceText = (rule: RecurrenceRule): string => {
    const { frequency, interval, daysOfWeek } = rule;

    if (frequency === 'daily') {
      return interval === 1 ? '매일' : `${interval}일마다`;
    } else if (frequency === 'weekly') {
      if (daysOfWeek && daysOfWeek.length > 0) {
        const dayNames = ['월', '화', '수', '목', '금', '토', '일'];
        const selectedDays = daysOfWeek.map(d => dayNames[d - 1]).join(', ');
        return interval === 1 ? `매주 ${selectedDays}` : `${interval}주마다 ${selectedDays}`;
      }
      return interval === 1 ? '매주' : `${interval}주마다`;
    } else if (frequency === 'monthly') {
      return interval === 1 ? '매월' : `${interval}개월마다`;
    }
    return '';
  };

  // 반복 일정이 없어도 항상 섹션 표시

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-neutral-gray-300 bg-neutral-gray-50 overflow-hidden"
    >
      {/* Header */}
      <div className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-neutral-gray-100 transition-colors">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 flex-1"
        >
          {isExpanded ? (
            <ChevronDown size={18} className="text-neutral-text-secondary" />
          ) : (
            <ChevronRight size={18} className="text-neutral-text-secondary" />
          )}
          <Repeat size={16} className="text-primary-500" />
          <span className="font-semibold text-sm text-neutral-text-primary">
            반복 일정
          </span>
          {totalCount > 0 && (
            <span className="text-xs text-neutral-text-secondary">
              ({completedCount}/{totalCount})
            </span>
          )}
        </button>
        <button
          onClick={onAddRecurring}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-primary-50 text-primary-500 transition-colors"
        >
          <Plus size={14} />
          <span className="text-xs font-medium">추가</span>
        </button>
      </div>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-neutral-gray-200"
          >
            <div className="px-3 py-2 space-y-1">
              {/* 반복 일정 템플릿 목록 */}
              {recurringTodos.map((todo) => {
                // 오늘 날짜의 분리된 할일 찾기
                const todaySeparated = todos.find(
                  t => t.isFromRecurring &&
                  t.originalRecurringId === todo.id &&
                  t.date.getFullYear() === selectedDate.getFullYear() &&
                  t.date.getMonth() === selectedDate.getMonth() &&
                  t.date.getDate() === selectedDate.getDate()
                );

                return (
                  <div
                    key={todo.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white transition-colors group"
                  >
                    <Checkbox
                      checked={todaySeparated?.completed || false}
                      onChange={() => onToggleRecurringInstance(todo.id)}
                      className="flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm ${
                        todaySeparated?.completed
                          ? 'line-through text-neutral-text-secondary'
                          : 'text-neutral-text-primary'
                      }`}>
                        {todo.text}
                      </div>
                      {todo.startTime && todo.endTime && (
                        <div className="text-xs text-neutral-text-tertiary">
                          {todo.startTime} - {todo.endTime}
                        </div>
                      )}
                      {todo.recurrenceRule && (
                        <div className="text-xs text-primary-500">
                          {getRecurrenceText(todo.recurrenceRule)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditRecurring(todo.id)}
                        className="p-1 rounded hover:bg-neutral-gray-100 text-neutral-text-secondary hover:text-primary-500 transition-colors"
                        title="편집"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteRecurring(todo.id)}
                        className="p-1 rounded hover:bg-neutral-gray-100 text-neutral-text-secondary hover:text-red-500 transition-colors"
                        title="삭제"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
