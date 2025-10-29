'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useTodos } from '@/hooks/data/useTodos';
import { useCategories } from '@/hooks/data/useCategories';
import { fetchTodos, fetchCategories } from '@/lib/supabase/queries';
import type { Todo, Category } from '@/types/calendar';

// Sample todos data (같은 데이터)
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

export default function DashboardPage() {
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

  // Todo state
  const { todos } = useTodos(initialTodos);

  // Category state
  const { categories } = useCategories(initialCategories, todos);

  // 로딩 중 표시
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gray-200 dark:border-gray-600 border-t-primary dark:border-t-primary-600 rounded-full animate-spin"></div>
          <p className="text-body-small text-gray-400 dark:text-gray-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <Header categories={categories} />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <DashboardLayout categories={categories} todos={todos} />
      </div>
    </div>
  );
}

