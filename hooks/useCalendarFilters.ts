import { useState } from 'react';

export function useCalendarFilters() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [completionFilter, setCompletionFilter] = useState<'all' | 'completed' | 'incomplete'>('all');
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [showCompletionFilter, setShowCompletionFilter] = useState(false);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleCompletionFilterChange = (filter: 'all' | 'completed' | 'incomplete') => {
    setCompletionFilter(filter);
    setShowCompletionFilter(false);
  };

  return {
    selectedCategories,
    completionFilter,
    showCategoryFilter,
    setShowCategoryFilter,
    showCompletionFilter,
    setShowCompletionFilter,
    handleCategoryToggle,
    handleCompletionFilterChange,
  };
}
