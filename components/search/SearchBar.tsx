'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { searchTodos } from '@/lib/supabase/queries';
import type { Todo, Category } from '@/types/calendar';

interface SearchBarProps {
  categories: Category[];
  onSelectTodo: (todo: Todo) => void;
}

export function SearchBar({ categories, onSelectTodo }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 검색 실행 (디바운스 포함)
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const searchResults = await searchTodos(query);
        setResults(searchResults);
        setIsOpen(true);
      } catch (error) {
        console.error('검색 중 오류 발생:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms 디바운스

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelectTodo = (todo: Todo) => {
    onSelectTodo(todo);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#9CA3AF';
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || '기타';
  };

  return (
    <div className="relative">
      {/* 검색 입력 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
          placeholder="일정 검색..."
          className="w-full h-10 pl-10 pr-10 py-2 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-600 text-body bg-warm-white dark:bg-dark-ocean-panel text-gray-900 dark:text-gray-50 placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 검색 결과 드롭다운 */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-warm-white dark:bg-dark-ocean-card border border-gray-200 dark:border-gray-600 rounded-md shadow-lg max-h-96 overflow-y-auto z-50 animate-slide-up">
          {isLoading ? (
            <div className="p-4 text-center text-body-small text-gray-400 dark:text-gray-500">
              검색 중...
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-body-small text-gray-400 dark:text-gray-500">
              검색 결과가 없습니다.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-600">
              {results.map((todo) => (
                <button
                  key={todo.id}
                  onClick={() => handleSelectTodo(todo)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* 카테고리 색상 점 */}
                    <div
                      className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                      style={{ backgroundColor: getCategoryColor(todo.categoryId) }}
                    />
                    
                    <div className="flex-1 min-w-0">
                      {/* 할일 제목 */}
                      <div className="text-body-small font-medium text-gray-900 dark:text-gray-50 truncate">
                        {todo.text}
                      </div>
                      
                      {/* 메타 정보 */}
                      <div className="flex items-center gap-2 mt-1 text-caption text-gray-400 dark:text-gray-500">
                        <span className="truncate">{getCategoryName(todo.categoryId)}</span>
                        <span>•</span>
                        <span>{new Date(todo.date).toLocaleDateString('ko-KR', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}</span>
                        {todo.startTime && (
                          <>
                            <span>•</span>
                            <span>{todo.startTime}</span>
                          </>
                        )}
                        {todo.recurrenceRule && (
                          <>
                            <span>•</span>
                            <span className="px-1.5 py-0.5 bg-primary-light dark:bg-primary-700 text-primary dark:text-primary-light rounded">
                              반복
                            </span>
                          </>
                        )}
                        {todo.completed && (
                          <>
                            <span>•</span>
                            <span className="px-1.5 py-0.5 bg-status-success/10 dark:bg-status-success/20 text-status-success dark:text-green-400 rounded">
                              완료
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 외부 클릭 시 닫기 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

