'use client';

import { Plus, Repeat, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Checkbox } from '@/components/ui/Checkbox';
import { DeleteRecurringModal } from '@/components/ui/DeleteRecurringModal';
import { formatDateKey } from '@/utils/calendarUtils';
import type { Todo, Category, RecurrenceRule } from '@/types/calendar';

interface RecurringSectionProps {
  todos: Todo[];
  selectedDate: Date;
  categories: Category[];
  onToggleRecurringInstance: (recurringId: string) => void;
  onAddRecurring: () => void;
  onEditRecurring: (id: string) => void;
  onSkipRecurringInstance: (recurringId: string) => void;
  onDeleteRecurringAfter: (recurringId: string) => void;
  onDeleteRecurring: (recurringId: string) => void;
}

interface RecurringTodoItemProps {
  todo: Todo;
  isCompletedToday: boolean;
  categoryColor: string;
  recurrenceText: string;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  index: number;
}

function RecurringTodoItem({
  todo,
  isCompletedToday,
  categoryColor,
  recurrenceText,
  onToggle,
  onEdit,
  onDelete,
  index,
}: RecurringTodoItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: todo.id,
    data: {
      type: 'recurring',
      id: todo.id,
      recurringId: todo.id,
      index,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: 'none',
    visibility: isDragging ? ('hidden' as const) : ('visible' as const),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-neutral-gray-50 transition-colors group relative cursor-grab active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      {/* Left accent bar - 카테고리 색상 */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 rounded-full"
        style={{ backgroundColor: categoryColor }}
      ></div>

      <div
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <Checkbox
          checked={isCompletedToday}
          onChange={onToggle}
          className="flex-shrink-0"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={`text-sm truncate ${
            isCompletedToday
              ? 'line-through text-neutral-text-secondary'
              : 'text-neutral-text-primary'
          }`}>
            {todo.text}
          </span>
          {recurrenceText && (
            <span
              className="text-xs font-medium flex-shrink-0"
              style={{ color: categoryColor }}
            >
              {recurrenceText}
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
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="p-1 rounded hover:bg-neutral-gray-100 text-neutral-text-secondary hover:text-primary-500 transition-colors"
          title="편집"
        >
          <Edit2 size={13} />
        </button>
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 rounded hover:bg-red-100 text-neutral-text-secondary hover:text-red-500 transition-colors cursor-pointer"
          title="삭제"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

export function RecurringSection({
  todos,
  selectedDate,
  categories,
  onToggleRecurringInstance,
  onAddRecurring,
  onEditRecurring,
  onSkipRecurringInstance,
  onDeleteRecurringAfter,
  onDeleteRecurring,
}: RecurringSectionProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTodoId, setSelectedTodoId] = useState<string>('');

  const handleDeleteClick = (todoId: string) => {
    setSelectedTodoId(todoId);
    setDeleteModalOpen(true);
  };

  // 반복 일정만 필터링하고 날짜 범위 체크
  const recurringTodos = todos.filter(todo => {
    if (!todo.recurrenceRule) return false;

    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);

    // 시작일 체크
    if (todo.recurrenceRule.startDate) {
      const startDate = new Date(todo.recurrenceRule.startDate);
      startDate.setHours(0, 0, 0, 0);
      if (selected < startDate) return false;
    }

    // 종료일 체크
    if (todo.recurrenceRule.endDate) {
      const endDate = new Date(todo.recurrenceRule.endDate);
      endDate.setHours(0, 0, 0, 0);
      if (selected > endDate) return false;
    }

    // skippedDates 체크 - 건너뛴 날짜는 표시하지 않음
    const todayString = formatDateKey(selectedDate);
    if (todo.skippedDates?.includes(todayString)) {
      return false;
    }

    return true;
  });

  // 완료 카운트 계산: completedDates에 오늘 날짜가 포함된 것
  const todayString = formatDateKey(selectedDate);
  const completedCount = recurringTodos.filter(todo =>
    todo.completedDates?.includes(todayString)
  ).length;
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
          {recurringTodos.map((todo, index) => (
            <RecurringTodoItem
              key={todo.id}
              todo={todo}
              isCompletedToday={todo.completedDates?.includes(todayString) || false}
              categoryColor={categories.find(cat => cat.id === todo.categoryId)?.color || '#3B82F6'}
              recurrenceText={todo.recurrenceRule ? getRecurrenceText(todo.recurrenceRule) : ''}
              onToggle={() => onToggleRecurringInstance(todo.id)}
              onEdit={() => onEditRecurring(todo.id)}
              onDelete={() => handleDeleteClick(todo.id)}
              index={index}
            />
          ))}
        </div>
      )}

      {/* Delete Modal */}
      <DeleteRecurringModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onSkipInstance={() => onSkipRecurringInstance(selectedTodoId)}
        onDeleteAfter={() => onDeleteRecurringAfter(selectedTodoId)}
        onDeleteAll={() => onDeleteRecurring(selectedTodoId)}
      />
    </div>
  );
}
