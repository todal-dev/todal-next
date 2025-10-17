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
}

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'todo' | 'calendar'>('todo');

  // 샘플 투두 데이터
  const [todos] = useState<Todo[]>([
    { id: '1', text: '프로젝트 기획', completed: false, date: new Date(2025, 9, 14) },
    { id: '2', text: '디자인 시스템', completed: true, date: new Date(2025, 9, 14) },
    { id: '3', text: '프론트엔드 개발', completed: false, date: new Date(2025, 9, 15) },
    { id: '4', text: 'API 연동', completed: false, date: new Date(2025, 9, 15) },
    { id: '5', text: '테스트', completed: true, date: new Date(2025, 9, 15) },
    { id: '6', text: '배포 준비', completed: false, date: new Date(2025, 9, 16) },
    { id: '7', text: '문서 작성', completed: true, date: new Date(2025, 9, 17) },
    { id: '8', text: '회의', completed: false, date: new Date(2025, 9, 17) },
  ]);

  // 날짜별 투두 그룹화
  const todosByDate = useMemo(() => {
    const grouped: Record<string, { completed: number; total: number }> = {};
    
    todos.forEach((todo) => {
      const year = todo.date.getFullYear();
      const month = String(todo.date.getMonth() + 1).padStart(2, '0');
      const day = String(todo.date.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;

      if (!grouped[dateKey]) {
        grouped[dateKey] = { completed: 0, total: 0 };
      }
      
      grouped[dateKey].total += 1;
      if (todo.completed) {
        grouped[dateKey].completed += 1;
      }
    });

    return grouped;
  }, [todos]);

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
              <TodoList selectedDate={selectedDate} />
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
                  <TodoList selectedDate={selectedDate} />
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
