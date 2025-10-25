'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
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
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { CategorySection } from './CategorySection';
import { Checkbox } from '@/components/ui/forms/Checkbox';
import { RecurringSection } from './RecurringSection';
import { AddRecurringDialog } from '@/components/ui/dialogs/AddRecurringDialog';
import { ConvertRecurringToRegularModal } from '@/components/ui/dialogs/ConvertRecurringToRegularModal';
import { useTodoContext } from '@/contexts/TodoContext';
import { useCategoryContext } from '@/contexts/CategoryContext';
import type { Todo } from '@/types/calendar';

interface RecurrenceRuleLocal {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
  startDate?: Date;
  endDate?: Date;
  daysOfWeek?: number[];
}

interface TodoListProps {
  showRecurringSection?: boolean;
  hideTitle?: boolean;
}

export function TodoList({ showRecurringSection = true, hideTitle = false }: TodoListProps) {
  const {
    todos,
    selectedDate,
    onAddTodo,
    onDeleteTodo,
    onToggleTodo,
    onEditTodo,
    onUpdateTodoTime,
    onMoveTodo,
    onToggleRecurringInstance,
    onSkipRecurringInstance,
    onDeleteRecurringAfter,
    onConvertRecurringToRegular,
    onConvertRegularToRecurring,
    onConvertRecurringToRegularAll,
  } = useTodoContext();

  const {
    categories,
    onAddCategory,
    onEditCategory,
    onChangeColor,
    onDeleteCategory,
    onMoveCategory,
    onAddRecurring,
    onEditRecurring,
  } = useCategoryContext();

  const [addingNewCategory, setAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3B82F6');
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [recurringDialogOpen, setRecurringDialogOpen] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState<{
    id: string;
    text: string;
    startTime?: string;
    endTime?: string;
    recurrenceRule?: RecurrenceRuleLocal;
    categoryId?: string;
  } | undefined>(undefined);
  const [convertingToRecurring, setConvertingToRecurring] = useState<{
    todoId: string;
    text: string;
    startTime?: string;
    endTime?: string;
    categoryId: string;
  } | undefined>(undefined);
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [convertingRecurring, setConvertingRecurring] = useState<{
    recurringId: string;
    categoryId: string;
  } | undefined>(undefined);

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
    if (todo.recurrenceRule) return false;
    return todo.date.getFullYear() === selectedDate.getFullYear() &&
           todo.date.getMonth() === selectedDate.getMonth() &&
           todo.date.getDate() === selectedDate.getDate();
  });

  // 카테고리별로 그룹화
  const todosByCategory = categories
    .map(cat => ({
      ...cat,
      items: filteredTodos.filter(todo => todo.categoryId === cat.id),
    }))
    .sort((a, b) => {
      if (a.id === 'cat-etc') return 1;
      if (b.id === 'cat-etc') return -1;
      return 0;
    });

  // 카테고리 ID 목록
  const categoryIds = categories.map(c => c.id);

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

  const activeTodo = activeDragId ? findTodo(activeDragId, todos) : null;

  // 반복 일정 핸들러
  const handleAddRecurring = () => {
    setEditingRecurring(undefined);
    setRecurringDialogOpen(true);
  };

  const handleEditRecurringClick = (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      setEditingRecurring({
        id: todo.id,
        text: todo.text,
        startTime: todo.startTime,
        endTime: todo.endTime,
        recurrenceRule: todo.recurrenceRule,
        categoryId: todo.categoryId,
      });
      setRecurringDialogOpen(true);
    }
  };

  const handleConfirmRecurring = (
    text: string,
    startTime: string,
    endTime: string,
    recurrenceRule: RecurrenceRuleLocal,
    categoryId: string
  ) => {
    if (convertingToRecurring) {
      onConvertRegularToRecurring?.(
        convertingToRecurring.todoId,
        text,
        startTime,
        endTime,
        recurrenceRule,
        categoryId
      );
      setConvertingToRecurring(undefined);
    } else if (editingRecurring) {
      onEditRecurring?.(editingRecurring.id, text, startTime, endTime, recurrenceRule, categoryId);
      setEditingRecurring(undefined);
    } else {
      onAddRecurring?.(text, startTime, endTime, recurrenceRule, categoryId);
    }
    setRecurringDialogOpen(false);
  };

  const handleToggleRecurringInstance = (recurringId: string) => {
    onToggleRecurringInstance?.(recurringId, selectedDate);
  };

  // 드래그 시작
  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  // 드래그 종료
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Case 1: 카테고리 정렬
    if (activeData?.type === 'category' && overData?.type === 'category') {
      if (onMoveCategory) {
        const oldIndex = categories.findIndex(c => c.id === activeId);
        const newIndex = categories.findIndex(c => c.id === overId);
        const etcIndex = categories.findIndex(c => c.id === 'cat-etc');

        if (oldIndex !== -1 && newIndex !== -1) {
          // "기타" 카테고리 아래로는 이동 불가
          if (etcIndex !== -1 && newIndex >= etcIndex) {
            return;
          }
          onMoveCategory(activeId, newIndex);
        }
      }
      return;
    }

    // Case 2: 반복 할일 → 일반 카테고리
    if (activeData?.type === 'recurring' && overData?.type === 'todo') {
      setConvertingRecurring({
        recurringId: activeId,
        categoryId: overData.categoryId,
      });
      setConvertModalOpen(true);
      return;
    }

    // Case 3: 일반 할일 → 반복 할일
    if (activeData?.type === 'todo' && overData?.type === 'recurring') {
      const regularTodo = todos.find(t => t.id === activeId);
      if (regularTodo && !regularTodo.recurrenceRule) {
        setConvertingToRecurring({
          todoId: activeId,
          text: regularTodo.text,
          startTime: regularTodo.startTime || '09:00',
          endTime: regularTodo.endTime || '10:00',
          categoryId: regularTodo.categoryId,
        });
        setRecurringDialogOpen(true);
      }
      return;
    }

    // Case 4: 같은 카테고리 내에서 할일 정렬
    if (activeData?.type === 'todo' && overData?.type === 'todo') {
      const activeCategoryId = activeData.categoryId;
      const overCategoryId = overData.categoryId;

      // 같은 카테고리 내에서 정렬
      if (activeCategoryId === overCategoryId && onMoveTodo) {
        onMoveTodo(activeId, overCategoryId, overData.parentId, overData.index);
      }
      // 다른 카테고리로 이동
      else if (activeCategoryId !== overCategoryId && onMoveTodo) {
        onMoveTodo(activeId, overCategoryId, overData.parentId, overData.index);
      }
      return;
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={`flex flex-col gap-2 ${hideTitle ? 'px-5 pb-5' : 'p-5'}`}>
        {/* Header */}
        {!hideTitle && (
          <div className="flex-shrink-0 flex items-center justify-between">
            <h1 className="text-lg font-semibold text-neutral-text-primary">
              {selectedDate.toLocaleString('ko-KR', { month: 'long', day: 'numeric' })}의 할일
            </h1>
            {addingNewCategory ? (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 px-3 py-1 rounded-md bg-neutral-gray-100"
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
                  className="w-32 font-semibold text-sm bg-transparent text-neutral-text-primary focus:outline-none border-0 focus:ring-0"
                />
              </motion.div>
            ) : (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
                onClick={() => setAddingNewCategory(true)}
                className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-neutral-gray-50 transition-colors text-neutral-text-secondary hover:text-primary-500 cursor-pointer"
              >
                <Plus size={16} />
                <span className="text-sm font-medium">카테고리 추가</span>
              </motion.button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {/* Recurring Section */}
          {showRecurringSection && (
            <div className="flex-shrink-0">
              <RecurringSection
                todos={todos}
                selectedDate={selectedDate}
                categories={categories}
                onToggleRecurringInstance={handleToggleRecurringInstance}
                onAddRecurring={handleAddRecurring}
                onEditRecurring={handleEditRecurringClick}
                onSkipRecurringInstance={(recurringId: string) => onSkipRecurringInstance(recurringId, selectedDate)}
                onDeleteRecurringAfter={(recurringId: string) => onDeleteRecurringAfter(recurringId, selectedDate)}
                onDeleteRecurring={(recurringId: string) => onDeleteTodo(recurringId)}
              />
            </div>
          )}

          {/* Categories */}
          <SortableContext items={categoryIds} strategy={verticalListSortingStrategy}>
            {todosByCategory.map((category, index) => (
              <CategorySection
                key={category.id}
                category={category}
                categoryIndex={index}
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
          </SortableContext>
        </div>
      </div>

      {/* DragOverlay */}
      <DragOverlay>
        {activeTodo ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white shadow-lg border border-neutral-gray-300">
            <Checkbox checked={activeTodo.completed} onChange={() => {}} className="flex-shrink-0" />
            <span className={`text-sm ${activeTodo.completed ? 'line-through text-neutral-text-secondary' : 'text-neutral-text-primary'}`}>
              {activeTodo.text}
            </span>
          </div>
        ) : null}
      </DragOverlay>

      {/* Add Recurring Dialog */}
      <AddRecurringDialog
        isOpen={recurringDialogOpen}
        onClose={() => {
          setRecurringDialogOpen(false);
          setEditingRecurring(undefined);
          setConvertingToRecurring(undefined);
        }}
        onConfirm={handleConfirmRecurring}
        selectedDate={selectedDate}
        categories={categories}
        editingTodo={editingRecurring || (convertingToRecurring ? {
          id: convertingToRecurring.todoId,
          text: convertingToRecurring.text,
          startTime: convertingToRecurring.startTime,
          endTime: convertingToRecurring.endTime,
          categoryId: convertingToRecurring.categoryId,
        } : undefined)}
      />

      {/* Convert Recurring to Regular Modal */}
      <ConvertRecurringToRegularModal
        isOpen={convertModalOpen}
        onClose={() => {
          setConvertModalOpen(false);
          setConvertingRecurring(undefined);
        }}
        onConvertThisOnly={() => {
          if (convertingRecurring && onConvertRecurringToRegular) {
            onConvertRecurringToRegular(
              convertingRecurring.recurringId,
              selectedDate,
              convertingRecurring.categoryId
            );
          }
          setConvertingRecurring(undefined);
        }}
        onConvertAll={() => {
          if (convertingRecurring && onConvertRecurringToRegularAll) {
            onConvertRecurringToRegularAll(
              convertingRecurring.recurringId,
              selectedDate,
              convertingRecurring.categoryId
            );
          }
          setConvertingRecurring(undefined);
        }}
      />
    </DndContext>
  );
}
