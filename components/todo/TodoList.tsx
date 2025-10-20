'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { CategorySection } from './CategorySection';
import { Checkbox } from '@/components/ui/Checkbox';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  date: Date;
  categoryId: string;
  subtasks?: Todo[];
  parentId?: string;
  startTime?: string;
  endTime?: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface TodoListProps {
  selectedDate?: Date;
  todos: Todo[];
  categories: Category[];
  onAddTodo: (text: string, categoryId: string, date: Date, parentId?: string, startTime?: string, endTime?: string) => void;
  onDeleteTodo: (id: string) => void;
  onToggleTodo: (id: string) => void;
  onEditTodo: (id: string, text: string) => void;
  onUpdateTodoTime?: (id: string, startTime?: string, endTime?: string) => void;
  onAddCategory: (name: string, color: string) => void;
  onEditCategory: (id: string, name: string) => void;
  onChangeColor: (id: string, color: string) => void;
  onDeleteCategory: (id: string) => void;
  onMoveTodo?: (todoId: string, newCategoryId: string, newParentId?: string, newIndex?: number) => void;
}

export function TodoList({
  selectedDate = new Date(),
  todos,
  categories,
  onAddTodo,
  onDeleteTodo,
  onToggleTodo,
  onEditTodo,
  onUpdateTodoTime,
  onAddCategory,
  onEditCategory,
  onChangeColor,
  onDeleteCategory,
  onMoveTodo,
}: TodoListProps) {
  const [addingNewCategory, setAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3B82F6');
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // 색상 팔레트
  const colorPalette = [
    '#3B82F6', '#A855F7', '#2D9F6B', '#EF4444', '#F59E0B',
    '#10B981', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
  ];

  // 선택된 날짜의 할일만 필터링
  const filteredTodos = todos.filter(todo => {
    return todo.date.getFullYear() === selectedDate.getFullYear() &&
           todo.date.getMonth() === selectedDate.getMonth() &&
           todo.date.getDate() === selectedDate.getDate();
  });

  // 카테고리별로 그룹화
  const todosByCategory = categories.map(cat => ({
    ...cat,
    items: filteredTodos.filter(todo => todo.categoryId === cat.id),
  }));

  // 드래그 중인 Todo 찾기
  const findTodo = (id: string, todoList: Todo[]): Todo | null => {
    for (const todo of todoList) {
      if (todo.id === id) return todo;
      if (todo.subtasks) {
        const found = findTodo(id, todo.subtasks);
        if (found) return found;
      }
    }
    return null;
  };

  const activeTodo = activeDragId ? findTodo(activeDragId, filteredTodos) : null;

  // 드래그 시작
  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  // 드래그 종료
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over || !onMoveTodo) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData || !overData) return;

    onMoveTodo(
      activeId,
      overData.categoryId,
      overData.parentId,
      overData.index
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col gap-2 p-5 h-full overflow-y-auto">
        {/* Header */}
        <div className="mb-2">
          <h1 className="text-lg font-semibold text-neutral-text-primary">
            {selectedDate.toLocaleString('ko-KR', { month: 'long', day: 'numeric' })}의 할일
          </h1>
        </div>

        {/* Categories */}
        <AnimatePresence>
          {todosByCategory.map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              selectedDate={selectedDate}
              onToggleTodo={onToggleTodo}
              onEditTodo={onEditTodo}
              onDeleteTodo={onDeleteTodo}
              onUpdateTodoTime={onUpdateTodoTime}
              onMoveTodo={onMoveTodo}
              onAddTodo={onAddTodo}
              onEditCategory={onEditCategory}
              onChangeColor={onChangeColor}
              onDeleteCategory={onDeleteCategory}
            />
          ))}
        </AnimatePresence>

        {/* Add New Category */}
        {addingNewCategory ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-neutral-gray-100"
          >
            <div
              className="flex-shrink-0 w-4 h-4 rounded-full cursor-pointer"
              style={{ backgroundColor: newCategoryColor }}
              onClick={() => {
                const currentIndex = colorPalette.indexOf(newCategoryColor);
                const nextIndex = (currentIndex + 1) % colorPalette.length;
                setNewCategoryColor(colorPalette[nextIndex]);
              }}
              title="색상 변경 (클릭)"
            />

            <input
              ref={(el) => el?.focus()}
              type="text"
              placeholder="카테고리 이름"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const name = newCategoryName.trim();
                  if (name) {
                    onAddCategory(name, newCategoryColor);
                    setNewCategoryName('');
                    setNewCategoryColor('#3B82F6');
                    setAddingNewCategory(false);
                  }
                } else if (e.key === 'Escape') {
                  setNewCategoryName('');
                  setNewCategoryColor('#3B82F6');
                  setAddingNewCategory(false);
                }
              }}
              onBlur={() => {
                setTimeout(() => {
                  setNewCategoryName('');
                  setNewCategoryColor('#3B82F6');
                  setAddingNewCategory(false);
                }, 150);
              }}
              className="flex-1 font-semibold text-sm bg-transparent text-neutral-text-primary focus:outline-none border-0 focus:ring-0"
            />
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            onClick={() => setAddingNewCategory(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-neutral-gray-50 transition-colors text-neutral-text-tertiary hover:text-primary-500"
          >
            <Plus size={16} />
            <span className="text-sm font-medium">카테고리 추가</span>
          </motion.button>
        )}
      </div>

      {/* DragOverlay */}
      <DragOverlay>
        {activeTodo ? (
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: 1.05 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white shadow-lg border border-neutral-gray-300"
          >
            <Checkbox checked={activeTodo.completed} onChange={() => {}} className="flex-shrink-0" />
            <span className={`text-sm ${activeTodo.completed ? 'line-through text-neutral-text-secondary' : 'text-neutral-text-primary'}`}>
              {activeTodo.text}
            </span>
          </motion.div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
