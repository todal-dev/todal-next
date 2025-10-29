'use client';

import { motion } from 'framer-motion';
import type { Category } from '@/types/calendar';

interface CategorySidebarProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  categoryCounts: Map<string, { total: number; completed: number; hours: number }>;
}

export function CategorySidebar({ 
  categories, 
  selectedCategoryId, 
  onSelectCategory,
  categoryCounts 
}: CategorySidebarProps) {
  const allCount = Array.from(categoryCounts.values()).reduce(
    (acc, c) => ({ 
      total: acc.total + c.total, 
      completed: acc.completed + c.completed,
      hours: acc.hours + c.hours
    }), 
    { total: 0, completed: 0, hours: 0 }
  );

  return (
    <div className="w-80 bg-warm-white dark:bg-dark-ocean-panel border-r border-gray-200 dark:border-gray-600 flex flex-col h-full transition-colors">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-600">
        <h2 className="text-h2 text-gray-900 dark:text-gray-50">카테고리</h2>
        <p className="text-body-small text-gray-400 dark:text-gray-500 mt-1">업무별 할일 분석</p>
      </div>

      {/* Category List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {/* 전체 보기 */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectCategory(null)}
          className={`w-full text-left p-4 rounded-md transition-all ${
            selectedCategoryId === null
              ? 'bg-primary-50 dark:bg-primary-900/30 border-2 border-primary dark:border-primary-600'
              : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
              <span className={`font-medium ${
                selectedCategoryId === null ? 'text-gray-900 dark:text-gray-50' : 'text-gray-600 dark:text-gray-400'
              }`}>
                전체
              </span>
            </div>
            <span className="text-body-small text-gray-400 dark:text-gray-500">
              {allCount.completed}/{allCount.total}
            </span>
          </div>
          <div className="flex items-center gap-2 text-caption text-gray-400 dark:text-gray-500">
            <span>완료율 {allCount.total > 0 ? Math.round((allCount.completed / allCount.total) * 100) : 0}%</span>
            {allCount.hours > 0 && (
              <>
                <span>•</span>
                <span>{allCount.hours.toFixed(1)}h</span>
              </>
            )}
          </div>
        </motion.button>

        {/* 카테고리별 */}
        {categories.map((category) => {
          const count = categoryCounts.get(category.id) || { total: 0, completed: 0, hours: 0 };
          const isSelected = selectedCategoryId === category.id;

          return (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectCategory(category.id)}
              className={`w-full text-left p-4 rounded-md transition-all ${
                isSelected
                  ? 'bg-primary-50 dark:bg-primary-900/30 border-2 border-primary dark:border-primary-600'
                  : 'bg-warm-white dark:bg-dark-ocean-card border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className={`font-medium ${
                    isSelected ? 'text-gray-900 dark:text-gray-50' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {category.name}
                  </span>
                </div>
                <span className="text-body-small text-gray-400 dark:text-gray-500">
                  {count.completed}/{count.total}
                </span>
              </div>
              
              {/* Progress Bar */}
              {count.total > 0 && (
                <div className="mb-2">
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(count.completed / count.total) * 100}%`,
                        backgroundColor: category.color,
                      }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-caption text-gray-400 dark:text-gray-500">
                <span>완료율 {count.total > 0 ? Math.round((count.completed / count.total) * 100) : 0}%</span>
                {count.hours > 0 && (
                  <>
                    <span>•</span>
                    <span>{count.hours.toFixed(1)}h</span>
                  </>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

