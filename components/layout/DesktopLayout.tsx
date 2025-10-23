import { memo, useState } from 'react';
import { MiniCalendar } from '@/components/calendar/MiniCalendar';
import { BigCalendar } from '@/components/calendar/WeekCalendar';
import { TodoList } from '@/components/todo/TodoList';
import { RecurringSection } from '@/components/todo/RecurringSection';
import { AddRecurringDialog } from '@/components/ui/AddRecurringDialog';
import { useTodoContext } from '@/contexts/TodoContext';
import { useCategoryContext } from '@/contexts/CategoryContext';

interface TodoByDateCategory {
  categoryId: string;
  name: string;
  color: string;
  total: number;
  completed: number;
}

interface TodoByDate {
  completed: number;
  total: number;
  byCategory: TodoByDateCategory[];
}

interface DesktopLayoutProps {
  todosByDate: Record<string, TodoByDate>;
}

interface RecurrenceRuleLocal {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
  startDate?: Date;
  endDate?: Date;
  daysOfWeek?: number[];
}

const DesktopLayoutComponent = ({ todosByDate }: DesktopLayoutProps) => {
  // Get values from contexts
  const { onDateSelect, todos, selectedDate, onToggleRecurringInstance } = useTodoContext();
  const { categories, onAddRecurring, onEditRecurring, onDeleteRecurring } = useCategoryContext();

  const [recurringDialogOpen, setRecurringDialogOpen] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState<{
    id: string;
    text: string;
    startTime?: string;
    endTime?: string;
    recurrenceRule?: RecurrenceRuleLocal;
    categoryId?: string;
  } | undefined>(undefined);

  // 반복 일정 핸들러
  const handleAddRecurring = () => {
    setEditingRecurring(undefined);
    setRecurringDialogOpen(true);
  };

  const handleEditRecurringClick = (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      setEditingRecurring({
        id: todo.id,
        text: todo.text,
        startTime: todo.startTime,
        endTime: todo.endTime,
        recurrenceRule: todo.recurrenceRule,
        categoryId: todo.categoryId,
      });
      setRecurringDialogOpen(true);
    }
  };

  const handleConfirmRecurring = (
    text: string,
    startTime: string,
    endTime: string,
    recurrenceRule: RecurrenceRuleLocal,
    categoryId: string
  ) => {
    if (editingRecurring) {
      onEditRecurring?.(editingRecurring.id, text, startTime, endTime, recurrenceRule, categoryId);
    } else {
      onAddRecurring?.(text, startTime, endTime, recurrenceRule, categoryId);
    }
    setRecurringDialogOpen(false);
    setEditingRecurring(undefined);
  };

  const handleDeleteRecurringClick = (id: string) => {
    if (confirm('이 반복 일정을 삭제하시겠습니까?')) {
      onDeleteRecurring?.(id);
    }
  };

  const handleToggleRecurringInstance = (recurringId: string) => {
    onToggleRecurringInstance?.(recurringId, selectedDate);
  };

  return (
    <>
      <div className="hidden md:flex w-full">
        {/* Left Panel - Mini Calendar + Recurring Section + Todo List (35%) */}
        <div className="flex-[35] border-r border-neutral-gray-300 flex flex-col bg-white">
          {/* Mini Calendar */}
          <div className="shrink-0 border-b border-neutral-gray-300">
            <MiniCalendar onDateSelect={onDateSelect} todosByDate={todosByDate} />
          </div>

          {/* 오늘 할일 제목 */}
          <div className="flex-shrink-0 px-5 pt-5 pb-3 border-b border-neutral-gray-300">
            <h1 className="text-lg font-semibold text-neutral-text-primary">
              {selectedDate.toLocaleString('ko-KR', { month: 'long', day: 'numeric' })}의 할일
            </h1>
          </div>

          {/* Recurring Section + Todo List */}
          <div className="flex-1 overflow-y-auto">
            {/* Recurring Section */}
            <div className="px-5 pt-2 pb-3">
              <RecurringSection
                todos={todos}
                selectedDate={selectedDate}
                categories={categories}
                onToggleRecurringInstance={handleToggleRecurringInstance}
                onAddRecurring={handleAddRecurring}
                onEditRecurring={handleEditRecurringClick}
                onDeleteRecurring={handleDeleteRecurringClick}
              />
            </div>

            {/* Todo List (당일 할일만) */}
            <TodoList showRecurringSection={false} hideTitle={true} />
          </div>
        </div>

        {/* Right Panel - Big Calendar (65%) */}
        <div className="flex-[65] overflow-hidden flex flex-col">
          <BigCalendar />
        </div>
      </div>

      {/* Add Recurring Dialog */}
      <AddRecurringDialog
        isOpen={recurringDialogOpen}
        onClose={() => {
          setRecurringDialogOpen(false);
          setEditingRecurring(undefined);
        }}
        onConfirm={handleConfirmRecurring}
        selectedDate={selectedDate}
        categories={categories}
        editingTodo={editingRecurring}
      />
    </>
  );
};

// Memoize DesktopLayout to prevent unnecessary re-renders
export const DesktopLayout = memo(DesktopLayoutComponent);
