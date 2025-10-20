'use client';

import { useState, useMemo } from 'react';
import { MiniCalendar } from '@/components/layout/CalendarPlaceholder';
import { BigCalendar } from '@/components/layout/Header';
import { TodoList } from '@/components/todo/TodoList';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  date: Date;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

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

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'todo' | 'calendar'>('todo');

  // 카테고리
  const [categories] = useState<Category[]>([
    { id: 'cat1', name: '업무', color: '#3B82F6' },
    { id: 'cat2', name: '개인', color: '#A855F7' },
    { id: 'cat3', name: '학습', color: '#2D9F6B' },
  ]);

  // 샘플 투두 데이터
  const [todos, setTodos] = useState<Todo[]>([
    { id: '1', text: '프로젝트 기획', completed: false, date: new Date(2025, 9, 14), categoryId: 'cat1' },
    { id: '2', text: '디자인 시스템', completed: true, date: new Date(2025, 9, 14), categoryId: 'cat3' },
    { id: '3', text: '프론트엔드 개발', completed: false, date: new Date(2025, 9, 15), categoryId: 'cat1' },
    { id: '4', text: 'API 연동', completed: false, date: new Date(2025, 9, 15), categoryId: 'cat1' },
    { id: '5', text: '테스트', completed: true, date: new Date(2025, 9, 15), categoryId: 'cat3' },
    { id: '6', text: '배포 준비', completed: false, date: new Date(2025, 9, 16), categoryId: 'cat1' },
    { id: '7', text: '문서 작성', completed: true, date: new Date(2025, 9, 17), categoryId: 'cat2' },
    { id: '8', text: '회의', completed: false, date: new Date(2025, 9, 17), categoryId: 'cat1' },
  ]);

  // 날짜별 투두 그룹화 (카테고리별)
  const todosByDate = useMemo(() => {
    const grouped: Record<string, TodoByDate> = {};
    
    todos.forEach((todo) => {
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

      // 카테고리별 정보 추가
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

  // 할일 추가
  const handleAddTodo = (text: string, categoryId: string, date: Date) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      text,
      completed: false,
      date,
      categoryId,
    };
    setTodos([...todos, newTodo]);
  };

  // 할일 삭제
  const handleDeleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  // 할일 완료 토글
  const handleToggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  // 할일 수정
  const handleEditTodo = (id: string, text: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, text } : todo
    ));
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="border-b border-neutral-gray-300 bg-white h-12 px-5 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-neutral-text-primary">Todal</h1>
        <div className="flex gap-2">
          {/* 설정/프로필 버튼은 나중에 추가 */}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop: 좌우 분할 */}
        <div className="hidden md:flex w-full">
          {/* Left Panel - Mini Calendar + Todo List */}
          <div className="flex-[2] border-r border-neutral-gray-300 flex flex-col bg-white">
            {/* Mini Calendar */}
            <div className="flex-[2.5] overflow-y-auto">
              <MiniCalendar onDateSelect={setSelectedDate} todosByDate={todosByDate} />
            </div>

            {/* Todo List */}
            <div className="flex-[7.5] overflow-y-auto border-t border-neutral-gray-300">
              <TodoList 
                selectedDate={selectedDate} 
                todos={todos} 
                categories={categories} 
                onAddTodo={handleAddTodo} 
                onDeleteTodo={handleDeleteTodo} 
                onToggleTodo={handleToggleTodo} 
                onEditTodo={handleEditTodo} 
              />
            </div>
          </div>

          {/* Right Panel - Big Calendar */}
          <div className="flex-[3] overflow-hidden flex flex-col">
            <BigCalendar selectedDate={selectedDate} />
          </div>
        </div>

        {/* Mobile/Tablet: Tab Navigation */}
        <div className="md:hidden w-full flex flex-col">
          {/* Tab Navigation */}
          <div className="flex border-b border-neutral-gray-300">
            <button
              onClick={() => setActiveTab('todo')}
              className={`
                flex-1 px-4 py-3 text-center font-medium transition-colors
                border-b-2
                ${
                  activeTab === 'todo'
                    ? 'border-b-primary-500 text-primary-500'
                    : 'border-b-transparent text-neutral-text-secondary hover:text-neutral-text-primary'
                }
              `}
            >
              할일
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`
                flex-1 px-4 py-3 text-center font-medium transition-colors
                border-b-2
                ${
                  activeTab === 'calendar'
                    ? 'border-b-primary-500 text-primary-500'
                    : 'border-b-transparent text-neutral-text-secondary hover:text-neutral-text-primary'
                }
              `}
            >
              캘린더
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'todo' ? (
              <div className="flex flex-col h-full">
                <div className="flex-[2.5] overflow-y-auto">
                  <MiniCalendar onDateSelect={setSelectedDate} todosByDate={todosByDate} />
                </div>
                <div className="flex-[7.5] overflow-y-auto border-t border-neutral-gray-300">
                  <TodoList 
                    selectedDate={selectedDate} 
                    todos={todos} 
                    categories={categories} 
                    onAddTodo={handleAddTodo} 
                    onDeleteTodo={handleDeleteTodo} 
                    onToggleTodo={handleToggleTodo} 
                    onEditTodo={handleEditTodo} 
                  />
                </div>
              </div>
            ) : (
              <BigCalendar selectedDate={selectedDate} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
