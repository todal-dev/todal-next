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
    <div className="w-80 bg-white border-r border-[#E5E7EB] flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-[#E5E7EB]">
        <h2 className="text-xl font-semibold text-[#111827]">카테고리</h2>
        <p className="text-sm text-[#9CA3AF] mt-1">업무별 할일 분석</p>
      </div>

      {/* Category List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {/* 전체 보기 */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectCategory(null)}
          className={`w-full text-left p-4 rounded-lg transition-all ${
            selectedCategoryId === null
              ? 'bg-[#E8F5EE] border-2 border-[#2D9F6B]'
              : 'bg-[#FAFAFA] border border-[#E5E7EB] hover:bg-[#F5F5F5]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
              <span className={`font-medium ${
                selectedCategoryId === null ? 'text-[#111827]' : 'text-[#4B5563]'
              }`}>
                전체
              </span>
            </div>
            <span className="text-sm text-[#9CA3AF]">
              {allCount.completed}/{allCount.total}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
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
              className={`w-full text-left p-4 rounded-lg transition-all ${
                isSelected
                  ? 'bg-[#E8F5EE] border-2 border-[#2D9F6B]'
                  : 'bg-white border border-[#E5E7EB] hover:bg-[#FAFAFA]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className={`font-medium ${
                    isSelected ? 'text-[#111827]' : 'text-[#4B5563]'
                  }`}>
                    {category.name}
                  </span>
                </div>
                <span className="text-sm text-[#9CA3AF]">
                  {count.completed}/{count.total}
                </span>
              </div>
              
              {/* Progress Bar */}
              {count.total > 0 && (
                <div className="mb-2">
                  <div className="h-1.5 bg-[#F5F5F5] rounded-full overflow-hidden">
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

              <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
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

