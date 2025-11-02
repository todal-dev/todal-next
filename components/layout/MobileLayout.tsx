import { useState, memo, useEffect, useRef } from 'react';
import { MiniCalendar } from '@/components/calendar/MiniCalendar';
import { MiniWeekCalendar } from '@/components/calendar/MiniWeekCalendar';
import { BigCalendar } from '@/components/calendar/WeekCalendar';
import { TodoList } from '@/components/todo/TodoList';
import { useTodoContext } from '@/contexts/TodoContext';
import { motion, AnimatePresence } from 'framer-motion';

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
  const { onDateSelect, selectedDate } = useTodoContext();
  const [activeTab, setActiveTab] = useState<'todo' | 'calendar'>('calendar');
  const [calendarViewMode, setCalendarViewMode] = useState<'month' | 'week'>('month');
  const todoListRef = useRef<HTMLDivElement>(null);
  const scrollThreshold = 100; // 스크롤 임계값 (px)
  const scrollThresholdBack = 50; // 다시 월로 돌아갈 때의 임계값 (히스테리시스)

  // 스크롤 감지 및 캘린더 뷰 모드 변경 (throttle 적용)
  useEffect(() => {
    if (activeTab !== 'todo') return;

    const scrollContainer = todoListRef.current;
    if (!scrollContainer) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollTop = scrollContainer.scrollTop;
          if (scrollTop > scrollThreshold && calendarViewMode === 'month') {
            setCalendarViewMode('week');
          } else if (scrollTop <= scrollThresholdBack && calendarViewMode === 'week') {
            setCalendarViewMode('month');
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [activeTab, calendarViewMode, scrollThreshold, scrollThresholdBack]);

  // 탭 변경 시 캘린더 뷰 모드 초기화
  useEffect(() => {
    if (activeTab === 'todo') {
      // 탭 변경 시 스크롤 위치에 따라 뷰 모드 설정
      const scrollContainer = todoListRef.current;
      if (scrollContainer) {
        const scrollTop = scrollContainer.scrollTop;
        setCalendarViewMode(scrollTop > scrollThreshold ? 'week' : 'month');
      }
    }
  }, [activeTab]);

  return (
    <div className="md:hidden w-full flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-600 bg-warm-white dark:bg-dark-ocean-panel sticky top-0 z-20 shrink-0 transition-colors">
        <button
          onClick={() => setActiveTab('todo')}
          className={`
            flex-1 px-4 py-3.5 text-center font-medium transition-colors text-body sm:text-h3
            border-b-2 min-h-[48px]
            ${
              activeTab === 'todo'
                ? 'border-b-primary dark:border-b-primary-600 text-primary dark:text-primary-100'
                : 'border-b-transparent text-gray-400 dark:text-gray-500 active:bg-gray-50 dark:active:bg-gray-700'
            }
          `}
          aria-label="할일 탭"
        >
          할일
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`
            flex-1 px-4 py-3.5 text-center font-medium transition-colors text-body sm:text-h3
            border-b-2 min-h-[48px]
            ${
              activeTab === 'calendar'
                ? 'border-b-primary dark:border-b-primary-600 text-primary dark:text-primary-100'
                : 'border-b-transparent text-gray-400 dark:text-gray-500 active:bg-gray-50 dark:active:bg-gray-700'
            }
          `}
          aria-label="캘린더 탭"
        >
          캘린더
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden bg-warm-white dark:bg-dark-ocean-panel transition-colors">
        {activeTab === 'todo' ? (
          <div className="flex flex-col h-full">
            {/* Calendar Section with Animation */}
            <div className="shrink-0 border-b border-gray-200 dark:border-gray-600 overflow-hidden">
              <AnimatePresence mode="wait">
                {calendarViewMode === 'month' ? (
                  <motion.div
                    key="month"
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                  >
                    <MiniCalendar onDateSelect={onDateSelect} todosByDate={todosByDate} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="week"
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                  >
                    <MiniWeekCalendar 
                      onDateSelect={onDateSelect} 
                      todosByDate={todosByDate} 
                      selectedDate={selectedDate}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* Todo List with Scroll Detection */}
            <div 
              ref={todoListRef}
              className="flex-1 overflow-y-auto -webkit-overflow-scrolling-touch todo-list-scroll"
            >
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
