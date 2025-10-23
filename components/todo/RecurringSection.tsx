'use client';

import { Plus, Repeat, Edit2, Trash2 } from 'lucide-react';
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

interface Category {
  id: string;
  name: string;
  color: string;
}

interface RecurringSectionProps {
  todos: Todo[];
  selectedDate: Date;
  categories: Category[];
  onToggleRecurringInstance: (recurringId: string) => void;
  onAddRecurring: () => void;
  onEditRecurring: (id: string) => void;
  onDeleteRecurring: (id: string) => void;
}

export function RecurringSection({
  todos,
  selectedDate,
  categories,
  onToggleRecurringInstance,
  onAddRecurring,
  onEditRecurring,
  onDeleteRecurring,
}: RecurringSectionProps) {

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

  return (
    <div>
      {/* Simple Header */}
      <div className="flex items-center justify-between px-3 mb-1">
        <div className="flex items-center gap-1.5">
          <Repeat size={14} className="text-primary-500" />
          <span className="text-xs font-medium text-neutral-text-secondary">
            반복 일정
          </span>
          {totalCount > 0 && (
            <span className="text-xs text-neutral-text-tertiary">
              {completedCount}/{totalCount}
            </span>
          )}
        </div>
        <button
          onClick={onAddRecurring}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-primary-50 text-primary-500 transition-colors cursor-pointer"
        >
          <Plus size={12} />
          <span className="text-xs font-medium">추가</span>
        </button>
      </div>

      {/* Todo Items */}
      {recurringTodos.length > 0 && (
        <div className="space-y-0.5">
          {recurringTodos.map((todo) => {
          // 오늘 날짜의 분리된 할일 찾기
          const todaySeparated = todos.find(
            t => t.isFromRecurring &&
            t.originalRecurringId === todo.id &&
            t.date.getFullYear() === selectedDate.getFullYear() &&
            t.date.getMonth() === selectedDate.getMonth() &&
            t.date.getDate() === selectedDate.getDate()
          );

          // 해당 할일의 카테고리 색상 찾기
          const category = categories.find(cat => cat.id === todo.categoryId);
          const categoryColor = category?.color || '#3B82F6'; // 기본값은 primary blue

          return (
            <div
              key={todo.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-neutral-gray-50 transition-colors group relative"
            >
              {/* Left accent bar - 카테고리 색상 */}
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 rounded-full"
                style={{ backgroundColor: categoryColor }}
              ></div>

              <Checkbox
                checked={todaySeparated?.completed || false}
                onChange={() => onToggleRecurringInstance(todo.id)}
                className="flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`text-sm truncate ${
                    todaySeparated?.completed
                      ? 'line-through text-neutral-text-secondary'
                      : 'text-neutral-text-primary'
                  }`}>
                    {todo.text}
                  </span>
                  {todo.recurrenceRule && (
                    <span
                      className="text-xs font-medium flex-shrink-0"
                      style={{ color: categoryColor }}
                    >
                      {getRecurrenceText(todo.recurrenceRule)}
                    </span>
                  )}
                </div>
                {todo.startTime && todo.endTime && (
                  <div className="text-xs text-neutral-text-tertiary mt-0.5">
                    {todo.startTime} - {todo.endTime}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button
                  onClick={() => onEditRecurring(todo.id)}
                  className="p-1 rounded hover:bg-neutral-gray-100 text-neutral-text-secondary hover:text-primary-500 transition-colors"
                  title="편집"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => onDeleteRecurring(todo.id)}
                  className="p-1 rounded hover:bg-red-100 text-neutral-text-secondary hover:text-red-500 transition-colors"
                  title="삭제"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
}
