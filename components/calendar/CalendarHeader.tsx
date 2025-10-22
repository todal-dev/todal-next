import { memo } from 'react';
import { ChevronLeft, ChevronRight, Check, ChevronDown, Filter } from 'lucide-react';
import type { Category } from '@/types/calendar';

interface CalendarHeaderProps {
  year: number;
  monthName: string;
  categories: Category[];
  selectedCategories: string[];
  completionFilter: 'all' | 'completed' | 'incomplete';
  showCategoryFilter: boolean;
  showCompletionFilter: boolean;
  setShowCategoryFilter: (show: boolean) => void;
  setShowCompletionFilter: (show: boolean) => void;
  handleCategoryToggle: (categoryId: string) => void;
  handleCompletionFilterChange: (filter: 'all' | 'completed' | 'incomplete') => void;
  handlePrevWeek: () => void;
  handleNextWeek: () => void;
}

const CalendarHeaderComponent = ({
  year,
  monthName,
  categories,
  selectedCategories,
  completionFilter,
  showCategoryFilter,
  showCompletionFilter,
  setShowCategoryFilter,
  setShowCompletionFilter,
  handleCategoryToggle,
  handleCompletionFilterChange,
  handlePrevWeek,
  handleNextWeek,
}: CalendarHeaderProps) => {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-gray-300">
      <h2 className="text-heading-2 text-neutral-text-primary">
        {year}년 {monthName}
      </h2>
      <div className="flex items-center gap-3">
        {/* Category Filter */}
        <div className="relative filter-dropdown-container">
          <button
            onClick={() => {
              setShowCategoryFilter(!showCategoryFilter);
              setShowCompletionFilter(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-sm border border-neutral-gray-300 rounded-md hover:bg-neutral-gray-50 transition-colors"
          >
            <Filter size={16} className="text-neutral-text-secondary" />
            <span className="text-neutral-text-primary">카테고리</span>
            {selectedCategories.length > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-primary-500 text-white rounded-full">
                {selectedCategories.length}
              </span>
            )}
            <ChevronDown size={16} className="text-neutral-text-secondary" />
          </button>

          {showCategoryFilter && (
            <div className="absolute top-full mt-1 right-0 bg-white border border-neutral-gray-300 rounded-md shadow-lg z-50 min-w-[200px]">
              <div className="py-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryToggle(category.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-neutral-gray-50 transition-colors text-left"
                  >
                    <div
                      className="w-4 h-4 rounded border-2 flex items-center justify-center"
                      style={{
                        borderColor: category.color,
                        backgroundColor: selectedCategories.includes(category.id) ? category.color : 'transparent'
                      }}
                    >
                      {selectedCategories.includes(category.id) && (
                        <Check size={12} className="text-white" />
                      )}
                    </div>
                    <span className="text-sm text-neutral-text-primary">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Completion Filter */}
        <div className="relative filter-dropdown-container">
          <button
            onClick={() => {
              setShowCompletionFilter(!showCompletionFilter);
              setShowCategoryFilter(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-sm border border-neutral-gray-300 rounded-md hover:bg-neutral-gray-50 transition-colors"
          >
            <span className="text-neutral-text-primary">
              {completionFilter === 'all' ? '전체' : completionFilter === 'completed' ? '완료' : '미완료'}
            </span>
            <ChevronDown size={16} className="text-neutral-text-secondary" />
          </button>

          {showCompletionFilter && (
            <div className="absolute top-full mt-1 right-0 bg-white border border-neutral-gray-300 rounded-md shadow-lg z-50 min-w-[120px]">
              <div className="py-1">
                <button
                  onClick={() => handleCompletionFilterChange('all')}
                  className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-neutral-gray-50 transition-colors text-left ${
                    completionFilter === 'all' ? 'bg-primary-50' : ''
                  }`}
                >
                  <span className="text-sm text-neutral-text-primary">전체</span>
                </button>
                <button
                  onClick={() => handleCompletionFilterChange('completed')}
                  className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-neutral-gray-50 transition-colors text-left ${
                    completionFilter === 'completed' ? 'bg-primary-50' : ''
                  }`}
                >
                  <span className="text-sm text-neutral-text-primary">완료</span>
                </button>
                <button
                  onClick={() => handleCompletionFilterChange('incomplete')}
                  className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-neutral-gray-50 transition-colors text-left ${
                    completionFilter === 'incomplete' ? 'bg-primary-50' : ''
                  }`}
                >
                  <span className="text-sm text-neutral-text-primary">미완료</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Week Navigation */}
        <div className="flex gap-2">
          <button
            onClick={handlePrevWeek}
            className="p-2 hover:bg-neutral-gray-100 rounded-md transition-colors cursor-pointer"
            aria-label="이전 주"
          >
            <ChevronLeft size={20} className="text-neutral-text-secondary" />
          </button>
          <button
            onClick={handleNextWeek}
            className="p-2 hover:bg-neutral-gray-100 rounded-md transition-colors cursor-pointer"
            aria-label="다음 주"
          >
            <ChevronRight size={20} className="text-neutral-text-secondary" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Memoize CalendarHeader to prevent unnecessary re-renders
export const CalendarHeader = memo(CalendarHeaderComponent);
