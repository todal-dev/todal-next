import { useState, memo } from 'react';
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

interface MobileLayoutProps {
  todosByDate: Record<string, TodoByDate>;
}

const MobileLayoutComponent = ({ todosByDate }: MobileLayoutProps) => {
  // Get values from contexts
  const { onDateSelect } = useTodoContext();
  const [activeTab, setActiveTab] = useState<'todo' | 'calendar'>('todo');

  return (
    <div className="md:hidden w-full flex flex-col">
      {/* Tab Navigation */}
      <div className="flex border-b border-neutral-gray-300">
        <button
          onClick={() => setActiveTab('todo')}
          className={`
            flex-1 px-4 py-3 text-center font-medium transition-colors
            border-b-2
            ${
              activeTab === 'todo'
                ? 'border-b-primary-500 text-primary-500'
                : 'border-b-transparent text-neutral-text-secondary hover:text-neutral-text-primary'
            }
          `}
        >
          할일
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`
            flex-1 px-4 py-3 text-center font-medium transition-colors
            border-b-2
            ${
              activeTab === 'calendar'
                ? 'border-b-primary-500 text-primary-500'
                : 'border-b-transparent text-neutral-text-secondary hover:text-neutral-text-primary'
            }
          `}
        >
          캘린더
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'todo' ? (
          <div className="flex flex-col h-full">
            <div className="shrink-0">
              <MiniCalendar onDateSelect={onDateSelect} todosByDate={todosByDate} />
            </div>
            <div className="flex-1 overflow-y-auto border-t border-neutral-gray-300">
              <TodoList />
            </div>
          </div>
        ) : (
          <BigCalendar />
        )}
      </div>
    </div>
  );
};

// Memoize MobileLayout to prevent unnecessary re-renders
export const MobileLayout = memo(MobileLayoutComponent);
