import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { MiniCalendar } from '@/components/calendar/MiniCalendar';
import { BigCalendar } from '@/components/calendar/WeekCalendar';
import { TodoList } from '@/components/todo/TodoList';
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

const DesktopLayoutComponent = ({ todosByDate }: DesktopLayoutProps) => {
  // Get values from contexts
  const { onDateSelect, selectedDate } = useTodoContext();
  const { onAddCategory } = useCategoryContext();

  const [addingNewCategory, setAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3B82F6');

  // 색상 팔레트
  const colorPalette = [
    '#3B82F6', '#A855F7', '#2D9F6B', '#EF4444', '#F59E0B',
    '#10B981', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
  ];

  return (
    <>
      <div className="hidden md:flex w-full">
        {/* Left Panel - Mini Calendar + Recurring Section + Todo List (35%) */}
        <div className="flex-[35] border-r border-gray-200 dark:border-gray-600 flex flex-col bg-warm-white dark:bg-dark-ocean-panel transition-colors">
          {/* Mini Calendar */}
          <div className="shrink-0 border-b border-gray-200 dark:border-gray-600">
            <MiniCalendar onDateSelect={onDateSelect} todosByDate={todosByDate} />
          </div>

          {/* 오늘 할일 제목 */}
          <div className="flex-shrink-0 px-5 pt-5 pb-3 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between">
            <h1 className="text-h3 text-gray-900 dark:text-gray-50">
              {selectedDate.toLocaleString('ko-KR', { month: 'long', day: 'numeric' })}의 할일
            </h1>
            {addingNewCategory ? (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-700"
              >
                <div
                  className="flex-shrink-0 w-4 h-4 rounded-full cursor-pointer transition-transform hover:scale-110"
                  style={{ backgroundColor: newCategoryColor }}
                  onClick={() => {
                    const currentIndex = colorPalette.indexOf(newCategoryColor);
                    const nextIndex = (currentIndex + 1) % colorPalette.length;
                    setNewCategoryColor(colorPalette[nextIndex]);
                  }}
                  title="색상 변경 (클릭)"
                />
                <input
                  ref={(el) => el?.focus()}
                  type="text"
                  placeholder="카테고리 이름"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const name = newCategoryName.trim();
                      if (name) {
                        onAddCategory(name, newCategoryColor);
                        setNewCategoryName('');
                        setNewCategoryColor('#3B82F6');
                        setAddingNewCategory(false);
                      }
                    } else if (e.key === 'Escape') {
                      setNewCategoryName('');
                      setNewCategoryColor('#3B82F6');
                      setAddingNewCategory(false);
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      setNewCategoryName('');
                      setNewCategoryColor('#3B82F6');
                      setAddingNewCategory(false);
                    }, 150);
                  }}
                  className="category-title-input w-32 font-semibold text-body-small !bg-transparent text-gray-900 dark:text-gray-50 focus:outline-none border-0 focus:ring-0"
                  style={{ backgroundColor: 'transparent', background: 'transparent' }}
                />
              </motion.div>
            ) : (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
                onClick={() => setAddingNewCategory(true)}
                className="flex items-center gap-1 md:gap-2 px-1.5 py-0.5 md:px-2 md:py-1 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary-100 cursor-pointer"
              >
                <Plus size={12} className="md:w-4 md:h-4" />
                <span className="text-xs md:text-body-small font-medium">카테고리 추가</span>
              </motion.button>
            )}
          </div>

          {/* Todo List (반복 카테고리 포함) */}
          <div className="flex-1 overflow-y-auto">
            <TodoList hideTitle={true} />
          </div>
        </div>

        {/* Right Panel - Big Calendar (65%) */}
        <div className="flex-[65] overflow-hidden flex flex-col">
          <BigCalendar />
        </div>
      </div>
    </>
  );
};

// Memoize DesktopLayout to prevent unnecessary re-renders
export const DesktopLayout = memo(DesktopLayoutComponent);
