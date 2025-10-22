import { memo } from 'react';
import { MiniCalendar } from '@/components/calendar/MiniCalendar';
import { BigCalendar } from '@/components/calendar/WeekCalendar';
import { TodoList } from '@/components/todo/TodoList';
import { useTodoContext } from '@/contexts/TodoContext';

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

const DesktopLayoutComponent = ({ todosByDate }: DesktopLayoutProps) => {
  // Get values from contexts
  const { onDateSelect } = useTodoContext();
  return (
    <div className="hidden md:flex w-full">
      {/* Left Panel - Mini Calendar + Todo List */}
      <div className="flex-[2] border-r border-neutral-gray-300 flex flex-col bg-white">
        {/* Mini Calendar */}
        <div className="shrink-0">
          <MiniCalendar onDateSelect={onDateSelect} todosByDate={todosByDate} />
        </div>

        {/* Todo List */}
        <div className="flex-1 overflow-y-auto border-t border-neutral-gray-300">
          <TodoList />
        </div>
      </div>

      {/* Right Panel - Big Calendar */}
      <div className="flex-[3] overflow-hidden flex flex-col">
        <BigCalendar />
      </div>
    </div>
  );
};

// Memoize DesktopLayout to prevent unnecessary re-renders
export const DesktopLayout = memo(DesktopLayoutComponent);
