'use client';

import { useState, useMemo } from 'react';
import { CategorySidebar } from './CategorySidebar';
import { CategoryTodoList } from './CategoryTodoList';
import { CategoryTimeline } from './CategoryTimeline';
import { CategoryAnalytics } from './CategoryAnalytics';
import type { Category, Todo } from '@/types/calendar';

interface DashboardLayoutProps {
  categories: Category[];
  todos: Todo[];
}

export function DashboardLayout({ categories, todos }: DashboardLayoutProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // 카테고리별 카운트 계산
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, { total: number; completed: number; hours: number }>();

    todos.forEach(todo => {
      if (!todo.categoryId) return;

      const current = counts.get(todo.categoryId) || { total: 0, completed: 0, hours: 0 };
      current.total += 1;
      if (todo.completed) current.completed += 1;

      // 시간 계산
      if (todo.startTime && todo.endTime) {
        const [startHour, startMin] = todo.startTime.split(':').map(Number);
        const [endHour, endMin] = todo.endTime.split(':').map(Number);
        const duration = ((endHour * 60 + endMin) - (startHour * 60 + startMin)) / 60;
        current.hours += duration;
      }

      counts.set(todo.categoryId, current);
    });

    return counts;
  }, [todos]);

  // 선택된 카테고리의 할일 필터링
  const filteredTodos = useMemo(() => {
    if (selectedCategoryId === null) {
      return todos;
    }
    return todos.filter(t => t.categoryId === selectedCategoryId);
  }, [todos, selectedCategoryId]);

  // 선택된 카테고리 정보
  const selectedCategory = useMemo(() => {
    if (selectedCategoryId === null) {
      return { name: '전체 할일', color: '#6366F1' };
    }
    const category = categories.find(c => c.id === selectedCategoryId);
    return category || { name: '미분류', color: '#gray' };
  }, [categories, selectedCategoryId]);

  return (
    <div className="flex h-full bg-[#FAFAFA]">
      {/* Left Sidebar - Categories */}
      <CategorySidebar
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
        categoryCounts={categoryCounts}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-semibold text-[#111827]">
              {selectedCategory.name}
            </h1>
            <p className="text-sm text-[#9CA3AF] mt-1">
              {filteredTodos.length}개의 할일
            </p>
          </div>

          {/* Analytics */}
          <CategoryAnalytics 
            todos={filteredTodos}
            categoryColor={selectedCategory.color}
          />

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Todo List */}
            <CategoryTodoList
              todos={filteredTodos}
              categoryName={selectedCategory.name}
              categoryColor={selectedCategory.color}
            />

            {/* Timeline */}
            <CategoryTimeline
              todos={filteredTodos}
              categoryColor={selectedCategory.color}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

