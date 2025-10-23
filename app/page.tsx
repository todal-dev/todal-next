'use client';

import { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { DesktopLayout } from '@/components/layout/DesktopLayout';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useTodos } from '@/hooks/useTodos';
import { useCategories } from '@/hooks/useCategories';
import { TodoProvider } from '@/contexts/TodoContext';
import { CategoryProvider } from '@/contexts/CategoryContext';
import type { Todo } from '@/types/calendar';

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

// Sample todos data
const INITIAL_TODOS: Todo[] = [
  {
    id: '1',
    text: '프로젝트 기획',
    completed: false,
    date: new Date(2025, 9, 14),
    categoryId: 'cat1',
    startTime: '09:00',
    endTime: '11:00',
    subtasks: [
      { id: '1-1', text: '요구사항 정리', completed: true, date: new Date(2025, 9, 14), categoryId: 'cat1', subtasks: [] },
      { id: '1-2', text: '일정 계획', completed: false, date: new Date(2025, 9, 14), categoryId: 'cat1', subtasks: [] },
    ]
  },
  { id: '2', text: '디자인 시스템', completed: true, date: new Date(2025, 9, 14), categoryId: 'cat3', startTime: '14:00', endTime: '16:00', subtasks: [] },
  {
    id: '3',
    text: '프론트엔드 개발',
    completed: false,
    date: new Date(2025, 9, 15),
    categoryId: 'cat1',
    startTime: '10:00',
    endTime: '13:00',
    subtasks: [
      { id: '3-1', text: '컴포넌트 구조 설계', completed: false, date: new Date(2025, 9, 15), categoryId: 'cat1', subtasks: [] },
      { id: '3-2', text: 'UI 구현', completed: false, date: new Date(2025, 9, 15), categoryId: 'cat1', subtasks: [] },
    ]
  },
  { id: '4', text: 'API 연동', completed: false, date: new Date(2025, 9, 15), categoryId: 'cat1', startTime: '14:00', endTime: '17:00', subtasks: [] },
  { id: '5', text: '테스트', completed: true, date: new Date(2025, 9, 15), categoryId: 'cat3', subtasks: [] },
  { id: '6', text: '배포 준비', completed: false, date: new Date(2025, 9, 16), categoryId: 'cat1', subtasks: [] },
  { id: '7', text: '문서 작성', completed: true, date: new Date(2025, 9, 17), categoryId: 'cat2', subtasks: [] },
  { id: '8', text: '회의', completed: false, date: new Date(2025, 9, 17), categoryId: 'cat1', startTime: '15:00', endTime: '16:00', subtasks: [] },
];

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Todo state and handlers
  const {
    todos,
    setTodos,
    handleAddTodo,
    handleDeleteTodo,
    handleToggleTodo,
    handleEditTodo,
    handleUpdateTodoTime,
    handleUpdateTodoDateTime,
    handleUpdateTodo,
    handleMoveTodo,
    handleMoveTodoToDate,
    handleAddRecurring,
    handleEditRecurring,
    handleDeleteRecurring,
    handleAddTodoFromCalendar,
    handleToggleRecurringInstance,
    handleSkipRecurringInstance,
    handleDeleteRecurringAfter,
  } = useTodos(INITIAL_TODOS);

  // Category state and handlers
  const {
    categories,
    handleAddCategory,
    handleEditCategory,
    handleChangeColor,
    handleDeleteCategory,
  } = useCategories(undefined, todos);

  // Group todos by date (for mini calendar)
  const todosByDate = useMemo(() => {
    const grouped: Record<string, TodoByDate> = {};

    // 미니 캘린더에서 사용할 날짜 범위 생성 (현재 날짜 기준 ±2개월)
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth() - 2, 1);
    const endDate = new Date(today.getFullYear(), today.getMonth() + 3, 0);

    const allDates: Date[] = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      allDates.push(new Date(d));
    }

    // 할일 확장 (반복 일정 포함)
    const expandedTodos: Todo[] = [];
    todos.forEach((todo) => {
      if (todo.recurrenceRule) {
        // 반복 일정 확장
        const generated: Todo[] = [];
        for (const date of allDates) {
          const events = require('@/utils/recurringUtils').generateRecurringEvents(todo, [date]);
          events.forEach((event: Todo) => {
            const dateKey = require('@/utils/calendarUtils').formatDateKey(event.date);
            const isCompleted = todo.completedDates?.includes(dateKey) || false;
            generated.push({
              ...event,
              completed: isCompleted
            });
          });
        }
        expandedTodos.push(...generated);
      } else {
        // 일반 할일만 추가
        expandedTodos.push(todo);
      }
    });

    // Only process top-level todos (don't count subtasks)
    expandedTodos.forEach((todo) => {
      const year = todo.date.getFullYear();
      const month = String(todo.date.getMonth() + 1).padStart(2, '0');
      const day = String(todo.date.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;

      if (!grouped[dateKey]) {
        grouped[dateKey] = { completed: 0, total: 0, byCategory: [] };
      }

      grouped[dateKey].total += 1;
      if (todo.completed) {
        grouped[dateKey].completed += 1;
      }

      // Add category information
      const category = categories.find(c => c.id === todo.categoryId);
      if (category) {
        const existingCat = grouped[dateKey].byCategory.find(c => c.categoryId === todo.categoryId);
        if (existingCat) {
          existingCat.total += 1;
          if (todo.completed) existingCat.completed += 1;
        } else {
          grouped[dateKey].byCategory.push({
            categoryId: todo.categoryId,
            name: category.name,
            color: category.color,
            total: 1,
            completed: todo.completed ? 1 : 0,
          });
        }
      }
    });

    return grouped;
  }, [todos, categories]);

  // Memoize category deletion handler
  const handleDeleteCategoryWithTodos = useCallback((id: string) => {
    handleDeleteCategory(id, () => {
      // Delete all todos with this category
      setTodos(todos.filter(todo => todo.categoryId !== id));
    });
  }, [handleDeleteCategory, todos, setTodos]);

  // Memoize recurring handler wrapper
  const handleAddRecurringWrapper = useCallback((
    text: string,
    startTime: string,
    endTime: string,
    recurrenceRule: any,
    categoryId: string
  ) => {
    handleAddRecurring(text, startTime, endTime, recurrenceRule, selectedDate, categoryId);
  }, [handleAddRecurring, selectedDate]);

  // Create context values
  const todoContextValue = useMemo(
    () => ({
      todos,
      selectedDate,
      onDateSelect: setSelectedDate,
      onAddTodo: handleAddTodo,
      onDeleteTodo: handleDeleteTodo,
      onToggleTodo: handleToggleTodo,
      onEditTodo: handleEditTodo,
      onUpdateTodoTime: handleUpdateTodoTime,
      onMoveTodo: handleMoveTodo,
      onUpdateTodoDateTime: handleUpdateTodoDateTime,
      onAddTodoFromCalendar: handleAddTodoFromCalendar,
      onUpdateTodo: handleUpdateTodo,
      onMoveTodoToDate: handleMoveTodoToDate,
      onToggleRecurringInstance: handleToggleRecurringInstance,
      onSkipRecurringInstance: handleSkipRecurringInstance,
      onDeleteRecurringAfter: handleDeleteRecurringAfter,
    }),
    [
      todos,
      selectedDate,
      handleAddTodo,
      handleDeleteTodo,
      handleToggleTodo,
      handleEditTodo,
      handleUpdateTodoTime,
      handleMoveTodo,
      handleUpdateTodoDateTime,
      handleAddTodoFromCalendar,
      handleUpdateTodo,
      handleMoveTodoToDate,
      handleToggleRecurringInstance,
      handleSkipRecurringInstance,
      handleDeleteRecurringAfter,
    ]
  );

  const categoryContextValue = useMemo(
    () => ({
      categories,
      onAddCategory: handleAddCategory,
      onEditCategory: handleEditCategory,
      onChangeColor: handleChangeColor,
      onDeleteCategory: handleDeleteCategoryWithTodos,
      onAddRecurring: handleAddRecurringWrapper,
      onEditRecurring: handleEditRecurring,
      onDeleteRecurring: handleDeleteRecurring,
    }),
    [
      categories,
      handleAddCategory,
      handleEditCategory,
      handleChangeColor,
      handleDeleteCategoryWithTodos,
      handleAddRecurringWrapper,
      handleEditRecurring,
      handleDeleteRecurring,
    ]
  );

  return (
    <TodoProvider value={todoContextValue}>
      <CategoryProvider value={categoryContextValue}>
        <div className="flex flex-col h-screen bg-white">
          {/* Header */}
          <header className="border-b border-neutral-gray-300 bg-white h-12 px-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="Todal Logo" width={90} height={90} />
            </div>
            <div className="flex gap-2">
              {/* Settings/profile buttons can be added later */}
            </div>
          </header>

          {/* Main Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Desktop Layout */}
            <DesktopLayout todosByDate={todosByDate} />

            {/* Mobile Layout */}
            <MobileLayout todosByDate={todosByDate} />
          </div>
        </div>
      </CategoryProvider>
    </TodoProvider>
  );
}
