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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-600 bg-warm-white dark:bg-dark-ocean-panel transition-colors">
      <div className="flex items-center justify-between w-full sm:w-auto gap-2">
        <h2 className="text-h3 text-gray-900 dark:text-gray-50 whitespace-nowrap">
          {year}년 {monthName}
        </h2>

        {/* Week Navigation - Mobile: Next to title */}
        <div className="flex gap-1 sm:hidden">
          <button
            onClick={handlePrevWeek}
            className="p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 rounded-md transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
            aria-label="이전 주"
          >
            <ChevronLeft size={18} className="text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={handleNextWeek}
            className="p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 rounded-md transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
            aria-label="다음 주"
          >
            <ChevronRight size={18} className="text-gray-600 dark:text-gray-400" />
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
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 text-body-small border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 transition-colors min-h-[36px] bg-warm-white dark:bg-dark-ocean-card"
          >
            <Filter size={14} className="text-gray-600 dark:text-gray-400 sm:w-4 sm:h-4" />
            <span className="text-gray-900 dark:text-gray-50 hidden xs:inline">카테고리</span>
            {selectedCategories.length > 0 && (
              <span className="px-1.5 py-0.5 text-label bg-primary text-white dark:bg-primary-600 rounded-full">
                {selectedCategories.length}
              </span>
            )}
            <ChevronDown size={14} className="text-gray-600 dark:text-gray-400 sm:w-4 sm:h-4 hidden sm:inline" />
          </button>

          {showCategoryFilter && (
            <div className="absolute top-full mt-1 right-0 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-50 min-w-[180px] sm:min-w-[200px] max-w-[90vw] animate-slide-up">
              <div className="py-1 max-h-[60vh] overflow-y-auto">
                {categories.filter(cat => cat.id !== 'cat-recurring').map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryToggle(category.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 active:bg-gray-100 dark:active:bg-gray-500 transition-colors text-left min-h-[44px]"
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
                    <span className="text-body-small text-gray-900 dark:text-gray-50 truncate">{category.name}</span>
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
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 text-body-small border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 transition-colors min-h-[36px] bg-warm-white dark:bg-dark-ocean-card"
          >
            <span className="text-gray-900 dark:text-gray-50">
              {completionFilter === 'all' ? '전체' : completionFilter === 'completed' ? '완료' : '미완료'}
            </span>
            <ChevronDown size={14} className="text-gray-600 dark:text-gray-400 sm:w-4 sm:h-4" />
          </button>

          {showCompletionFilter && (
            <div className="absolute top-full mt-1 right-0 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-50 min-w-[100px] sm:min-w-[120px] animate-slide-up">
              <div className="py-1">
                <button
                  onClick={() => handleCompletionFilterChange('all')}
                  className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 active:bg-gray-100 dark:active:bg-gray-500 transition-colors text-left min-h-[44px] ${
                    completionFilter === 'all' ? 'bg-primary-light dark:bg-primary-700' : ''
                  }`}
                >
                  <span className="text-body-small text-gray-900 dark:text-gray-50">전체</span>
                </button>
                <button
                  onClick={() => handleCompletionFilterChange('completed')}
                  className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 active:bg-gray-100 dark:active:bg-gray-500 transition-colors text-left min-h-[44px] ${
                    completionFilter === 'completed' ? 'bg-primary-light dark:bg-primary-700' : ''
                  }`}
                >
                  <span className="text-body-small text-gray-900 dark:text-gray-50">완료</span>
                </button>
                <button
                  onClick={() => handleCompletionFilterChange('incomplete')}
                  className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 active:bg-gray-100 dark:active:bg-gray-500 transition-colors text-left min-h-[44px] ${
                    completionFilter === 'incomplete' ? 'bg-primary-light dark:bg-primary-700' : ''
                  }`}
                >
                  <span className="text-body-small text-gray-900 dark:text-gray-50">미완료</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Week Navigation - Desktop */}
        <div className="hidden sm:flex gap-2">
          <button
            onClick={handlePrevWeek}
            className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 rounded-md transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="이전 주"
          >
            <ChevronLeft size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={handleNextWeek}
            className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 rounded-md transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="다음 주"
          >
            <ChevronRight size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Memoize CalendarHeader to prevent unnecessary re-renders
export const CalendarHeader = memo(CalendarHeaderComponent);
