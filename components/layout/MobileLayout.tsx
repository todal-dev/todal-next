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
  const [activeTab, setActiveTab] = useState<'todo' | 'calendar'>('calendar');

  return (
    <div className="md:hidden w-full flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="flex border-b border-neutral-gray-300 bg-white sticky top-0 z-20 shrink-0">
        <button
          onClick={() => setActiveTab('todo')}
          className={`
            flex-1 px-4 py-3.5 text-center font-medium transition-colors text-sm sm:text-base
            border-b-2 min-h-[48px]
            ${
              activeTab === 'todo'
                ? 'border-b-primary-500 text-primary-500'
                : 'border-b-transparent text-neutral-text-secondary active:bg-neutral-gray-50'
            }
          `}
          aria-label="할일 탭"
        >
          할일
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`
            flex-1 px-4 py-3.5 text-center font-medium transition-colors text-sm sm:text-base
            border-b-2 min-h-[48px]
            ${
              activeTab === 'calendar'
                ? 'border-b-primary-500 text-primary-500'
                : 'border-b-transparent text-neutral-text-secondary active:bg-neutral-gray-50'
            }
          `}
          aria-label="캘린더 탭"
        >
          캘린더
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'todo' ? (
          <div className="flex flex-col h-full">
            <div className="shrink-0 border-b border-neutral-gray-300">
              <MiniCalendar onDateSelect={onDateSelect} todosByDate={todosByDate} />
            </div>
            <div className="flex-1 overflow-y-auto -webkit-overflow-scrolling-touch">
              <TodoList />
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <BigCalendar />
          </div>
        )}
      </div>
    </div>
  );
};

// Memoize MobileLayout to prevent unnecessary re-renders
export const MobileLayout = memo(MobileLayoutComponent);
