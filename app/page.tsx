'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { DesktopLayout } from '@/components/layout/DesktopLayout';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Header } from '@/components/layout/Header';
import { useTodos } from '@/hooks/data/useTodos';
import { useCategories } from '@/hooks/data/useCategories';
import { TodoProvider } from '@/contexts/TodoContext';
import { CategoryProvider } from '@/contexts/CategoryContext';
import { fetchTodos, fetchCategories } from '@/lib/supabase/queries';
import { generateRecurringEvents } from '@/utils/recurringUtils';
import { formatDateKey } from '@/utils/calendarUtils';
import type { Todo, Category } from '@/types/calendar';

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
  const [initialTodos, setInitialTodos] = useState<Todo[]>(INITIAL_TODOS);
  const [initialCategories, setInitialCategories] = useState<Category[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  // Supabase에서 데이터 로드
  useEffect(() => {
    async function loadData() {
      try {
        const [todosData, categoriesData] = await Promise.all([
          fetchTodos(),
          fetchCategories(),
        ]);

        if (todosData.length > 0) {
          setInitialTodos(todosData);
        }
        
        if (categoriesData.length > 0) {
          setInitialCategories(categoriesData);
        }
      } catch (error) {
        // logger는 이미 lib/supabase/queries.ts에서 에러 로깅
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

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
    handleConvertRecurringToRegular,
    handleConvertRegularToRecurring,
    handleConvertRecurringToRegularAll,
  } = useTodos(initialTodos);

  // Category state and handlers
  const {
    categories,
    handleAddCategory,
    handleEditCategory,
    handleChangeColor,
    handleDeleteCategory,
    handleMoveCategory,
  } = useCategories(initialCategories, todos);

  // Group todos by date (for mini calendar) - 최적화됨
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

    // 일반 할일과 반복 할일 분리 처리 (성능 최적화)
    const regularTodos = todos.filter(t => !t.recurrenceRule);
    const recurringTodos = todos.filter(t => t.recurrenceRule);

    // 할일 확장 (반복 일정 포함)
    const expandedTodos: Todo[] = [...regularTodos];

    // 반복 일정만 확장 (정적 import 사용)
    recurringTodos.forEach((todo) => {
      try {
        const generatedEvents = generateRecurringEvents(todo, allDates);
        generatedEvents.forEach((event) => {
          const dateKey = formatDateKey(event.date);
          const isCompleted = todo.completedDates?.includes(dateKey) || false;
          expandedTodos.push({
            ...event,
            completed: isCompleted,
          });
        });
      } catch (error) {
        console.error('반복 일정 생성 중 오류 발생:', error, todo);
        // 에러가 발생한 할일은 건너뛰고 계속 진행
      }
    });

    // 카테고리 Map 생성 (O(n) → O(1) 조회)
    const categoryMap = new Map(categories.map(c => [c.id, c]));

    // Only process top-level todos (don't count subtasks)
    expandedTodos.forEach((todo) => {
      const dateKey = formatDateKey(todo.date);

      if (!grouped[dateKey]) {
        grouped[dateKey] = { completed: 0, total: 0, byCategory: [] };
      }

      grouped[dateKey].total += 1;
      if (todo.completed) {
        grouped[dateKey].completed += 1;
      }

      // Add category information (Map 사용으로 최적화)
      const category = categoryMap.get(todo.categoryId);
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

  // Memoize category deletion handler (todos 의존성 제거로 최적화)
  const handleDeleteCategoryWithTodos = useCallback((id: string) => {
    handleDeleteCategory(id, () => {
      // Delete all todos with this category
      setTodos(prevTodos => prevTodos.filter(todo => todo.categoryId !== id));
    });
  }, [handleDeleteCategory, setTodos]);

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

  // 검색 결과 선택 시 해당 날짜로 이동 및 하이라이트
  const handleSelectSearchResult = useCallback((todo: Todo) => {
    setSelectedDate(todo.date);
    // 선택된 할일을 하이라이트하거나 스크롤하는 로직을 추가할 수 있음
    console.log('Selected todo from search:', todo);
  }, []);

  // Create context values - handlers are memoized with useCallback, so we only need todos and selectedDate
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
      onConvertRecurringToRegular: handleConvertRecurringToRegular,
      onConvertRegularToRecurring: handleConvertRegularToRecurring,
      onConvertRecurringToRegularAll: handleConvertRecurringToRegularAll,
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
      handleConvertRecurringToRegular,
      handleConvertRegularToRecurring,
      handleConvertRecurringToRegularAll,
    ]
  );

  const categoryContextValue = useMemo(
    () => ({
      categories,
      onAddCategory: handleAddCategory,
      onEditCategory: handleEditCategory,
      onChangeColor: handleChangeColor,
      onDeleteCategory: handleDeleteCategoryWithTodos,
      onMoveCategory: handleMoveCategory,
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
      handleMoveCategory,
      handleAddRecurringWrapper,
      handleEditRecurring,
      handleDeleteRecurring,
    ]
  );

  // 로딩 중 표시
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <TodoProvider value={todoContextValue}>
      <CategoryProvider value={categoryContextValue}>
        <div className="flex flex-col h-screen bg-white">
          {/* Header */}
          <Header categories={categories} onSelectTodo={handleSelectSearchResult} />

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
