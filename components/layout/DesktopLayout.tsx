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
          {/* Top Section - Mini Calendar + Recurring Section (6:4 ratio) */}
          <div className="shrink-0 flex border-b border-neutral-gray-300">
            {/* Mini Calendar - 60% */}
            <div className="flex-[6] border-r border-neutral-gray-300">
              <MiniCalendar onDateSelect={onDateSelect} todosByDate={todosByDate} />
            </div>

            {/* Recurring Section - 40% */}
            <div className="flex-[4] overflow-y-auto p-3">
              <RecurringSection
                todos={todos}
                selectedDate={selectedDate}
                onToggleRecurringInstance={handleToggleRecurringInstance}
                onAddRecurring={handleAddRecurring}
                onEditRecurring={handleEditRecurringClick}
                onDeleteRecurring={handleDeleteRecurringClick}
              />
            </div>
          </div>

          {/* Bottom Section - Todo List (당일 할일만) */}
          <div className="flex-1 overflow-y-auto">
            <TodoList showRecurringSection={false} />
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
