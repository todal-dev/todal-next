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
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 px-3 sm:px-6 py-3 sm:py-4 border-b border-neutral-gray-300">
      <div className="flex items-center justify-between w-full sm:w-auto gap-2">
        <h2 className="text-base sm:text-lg font-semibold text-neutral-text-primary whitespace-nowrap">
          {year}년 {monthName}
        </h2>

        {/* Week Navigation - Mobile: Next to title */}
        <div className="flex gap-1 sm:hidden">
          <button
            onClick={handlePrevWeek}
            className="p-1.5 hover:bg-neutral-gray-100 active:bg-neutral-gray-200 rounded-md transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
            aria-label="이전 주"
          >
            <ChevronLeft size={18} className="text-neutral-text-secondary" />
          </button>
          <button
            onClick={handleNextWeek}
            className="p-1.5 hover:bg-neutral-gray-100 active:bg-neutral-gray-200 rounded-md transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
            aria-label="다음 주"
          >
            <ChevronRight size={18} className="text-neutral-text-secondary" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
        {/* Category Filter */}
        <div className="relative filter-dropdown-container">
          <button
            onClick={() => {
              setShowCategoryFilter(!showCategoryFilter);
              setShowCompletionFilter(false);
            }}
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-neutral-gray-300 rounded-md hover:bg-neutral-gray-50 active:bg-neutral-gray-100 transition-colors min-h-[36px]"
          >
            <Filter size={14} className="text-neutral-text-secondary sm:w-4 sm:h-4" />
            <span className="text-neutral-text-primary hidden xs:inline">카테고리</span>
            {selectedCategories.length > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-primary-500 text-white rounded-full">
                {selectedCategories.length}
              </span>
            )}
            <ChevronDown size={14} className="text-neutral-text-secondary sm:w-4 sm:h-4 hidden sm:inline" />
          </button>

          {showCategoryFilter && (
            <div className="absolute top-full mt-1 right-0 bg-white border border-neutral-gray-300 rounded-md shadow-lg z-50 min-w-[180px] sm:min-w-[200px] max-w-[90vw]">
              <div className="py-1 max-h-[60vh] overflow-y-auto">
                {categories.filter(cat => cat.id !== 'cat-recurring').map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryToggle(category.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-neutral-gray-50 active:bg-neutral-gray-100 transition-colors text-left min-h-[44px]"
                  >
                    <div
                      className="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0"
                      style={{
                        borderColor: category.color,
                        backgroundColor: selectedCategories.includes(category.id) ? category.color : 'transparent'
                      }}
                    >
                      {selectedCategories.includes(category.id) && (
                        <Check size={12} className="text-white" />
                      )}
                    </div>
                    <span className="text-sm text-neutral-text-primary truncate">{category.name}</span>
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
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-neutral-gray-300 rounded-md hover:bg-neutral-gray-50 active:bg-neutral-gray-100 transition-colors min-h-[36px]"
          >
            <span className="text-neutral-text-primary">
              {completionFilter === 'all' ? '전체' : completionFilter === 'completed' ? '완료' : '미완료'}
            </span>
            <ChevronDown size={14} className="text-neutral-text-secondary sm:w-4 sm:h-4" />
          </button>

          {showCompletionFilter && (
            <div className="absolute top-full mt-1 right-0 bg-white border border-neutral-gray-300 rounded-md shadow-lg z-50 min-w-[100px] sm:min-w-[120px]">
              <div className="py-1">
                <button
                  onClick={() => handleCompletionFilterChange('all')}
                  className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-neutral-gray-50 active:bg-neutral-gray-100 transition-colors text-left min-h-[44px] ${
                    completionFilter === 'all' ? 'bg-primary-50' : ''
                  }`}
                >
                  <span className="text-sm text-neutral-text-primary">전체</span>
                </button>
                <button
                  onClick={() => handleCompletionFilterChange('completed')}
                  className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-neutral-gray-50 active:bg-neutral-gray-100 transition-colors text-left min-h-[44px] ${
                    completionFilter === 'completed' ? 'bg-primary-50' : ''
                  }`}
                >
                  <span className="text-sm text-neutral-text-primary">완료</span>
                </button>
                <button
                  onClick={() => handleCompletionFilterChange('incomplete')}
                  className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-neutral-gray-50 active:bg-neutral-gray-100 transition-colors text-left min-h-[44px] ${
                    completionFilter === 'incomplete' ? 'bg-primary-50' : ''
                  }`}
                >
                  <span className="text-sm text-neutral-text-primary">미완료</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Week Navigation - Desktop */}
        <div className="hidden sm:flex gap-2">
          <button
            onClick={handlePrevWeek}
            className="p-2 hover:bg-neutral-gray-100 active:bg-neutral-gray-200 rounded-md transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="이전 주"
          >
            <ChevronLeft size={20} className="text-neutral-text-secondary" />
          </button>
          <button
            onClick={handleNextWeek}
            className="p-2 hover:bg-neutral-gray-100 active:bg-neutral-gray-200 rounded-md transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
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
