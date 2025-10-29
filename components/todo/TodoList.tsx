'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { CategorySection } from './CategorySection';
import { Checkbox } from '@/components/ui/forms/Checkbox';
import { AddRecurringDialog } from '@/components/ui/dialogs/AddRecurringDialog';
import { ConvertRecurringToRegularModal } from '@/components/ui/dialogs/ConvertRecurringToRegularModal';
import { DeleteRecurringModal } from '@/components/ui/dialogs/DeleteRecurringModal';
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
  hideTitle?: boolean;
}

export function TodoList({ hideTitle = false }: TodoListProps) {
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
    onConvertRecurringToRegular,
    onConvertRegularToRecurring,
    onSkipRecurringInstance,
    onDeleteRecurringAfter,
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
  const [recurringDialogOpen, setRecurringDialogOpen] = useState(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [overCategoryId, setOverCategoryId] = useState<string | null>(null);
  const [overTodoId, setOverTodoId] = useState<string | null>(null);
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
  const [deleteRecurringModalOpen, setDeleteRecurringModalOpen] = useState(false);
  const [deletingRecurringId, setDeletingRecurringId] = useState<string>('');

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

  // 선택된 날짜의 할일 필터링 (반복 TODO 포함) - useMemo로 최적화
  const filteredTodos = useMemo(() => {
    return todos.filter(todo => {
      // 반복 TODO는 날짜 범위 및 건너뛴 날짜 체크
      if (todo.recurrenceRule) {
        const selected = new Date(selectedDate);
        selected.setHours(0, 0, 0, 0);

        // 시작일 체크
        if (todo.recurrenceRule.startDate) {
          const startDate = new Date(todo.recurrenceRule.startDate);
          startDate.setHours(0, 0, 0, 0);
          if (selected < startDate) return false;
        }

        // 종료일 체크
        if (todo.recurrenceRule.endDate) {
          const endDate = new Date(todo.recurrenceRule.endDate);
          endDate.setHours(0, 0, 0, 0);
          if (selected > endDate) return false;
        }

        // 건너뛴 날짜 체크
        const todayString = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
        if (todo.skippedDates?.includes(todayString)) {
          return false;
        }

        return true;
      }

      // 일반 TODO는 날짜 일치 체크 (시간 무시)
      const todoDate = new Date(todo.date);
      todoDate.setHours(0, 0, 0, 0);
      const selected = new Date(selectedDate);
      selected.setHours(0, 0, 0, 0);
      
      return todoDate.getTime() === selected.getTime();
    });
  }, [todos, selectedDate]);

  // 카테고리별로 그룹화 (반복 TODO는 cat-recurring에 자동 배치) - useMemo로 최적화
  const todosByCategory = useMemo(() => {
    return categories
      .map(cat => ({
        ...cat,
        items: filteredTodos.filter(todo => {
          // 반복 카테고리: recurrenceRule이 있는 TODO만
          if (cat.id === 'cat-recurring') {
            return todo.recurrenceRule !== undefined;
          }
          // 일반 카테고리: recurrenceRule이 없고 categoryId가 일치하는 TODO만
          return !todo.recurrenceRule && todo.categoryId === cat.id;
        }),
      }))
      .sort((a, b) => {
        // 반복 카테고리는 맨 위
        if (a.id === 'cat-recurring') return -1;
        if (b.id === 'cat-recurring') return 1;
        // 기타 카테고리는 맨 아래
        if (a.id === 'cat-etc') return 1;
        if (b.id === 'cat-etc') return -1;
        return 0;
      });
  }, [categories, filteredTodos]);

  // 카테고리 ID 목록
  const categoryIds = categories.map(c => c.id);

  // 드래그 중인 todo의 카테고리 찾기
  const draggedTodoCategoryId = activeDragId
    ? filteredTodos.find(t => t.id === activeDragId)?.categoryId
    : null;

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
        recurrenceRule: todo.recurrenceRule as any,
        categoryId: todo.categoryId,
      });
      setRecurringDialogOpen(true);
    }
  };

  const handleConfirmRecurring = (
    text: string,
    startTime: string,
    endTime: string,
    recurrenceRule: any,
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

  // 반복 일정 삭제 핸들러
  const handleDeleteRecurringClick = (recurringId: string) => {
    setDeletingRecurringId(recurringId);
    setDeleteRecurringModalOpen(true);
  };

  const handleSkipRecurringInstanceAction = () => {
    if (deletingRecurringId) {
      onSkipRecurringInstance?.(deletingRecurringId, selectedDate);
      setDeleteRecurringModalOpen(false);
      setDeletingRecurringId('');
    }
  };

  const handleDeleteRecurringAfterAction = () => {
    if (deletingRecurringId) {
      onDeleteRecurringAfter?.(deletingRecurringId, selectedDate);
      setDeleteRecurringModalOpen(false);
      setDeletingRecurringId('');
    }
  };

  const handleDeleteAllRecurring = () => {
    if (deletingRecurringId) {
      onDeleteTodo(deletingRecurringId);
      setDeleteRecurringModalOpen(false);
      setDeletingRecurringId('');
    }
  };

  // 드래그 시작
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeData = active.data.current;

    // todo 타입만 추적 (카테고리는 제외)
    if (activeData?.type === 'todo') {
      setActiveDragId(active.id as string);
    }
  };

  // 드래그 오버
  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;

    if (!over || !activeDragId) {
      setOverCategoryId(null);
      setOverTodoId(null);
      return;
    }

    const overData = over.data.current;

    // 카테고리 위에 hover 중
    if (overData?.type === 'category') {
      setOverCategoryId(overData.id);
      setOverTodoId(null);
    }
    // todo 위에 hover 중 -> 그 todo의 카테고리
    else if (overData?.type === 'todo') {
      setOverCategoryId(overData.categoryId);
      setOverTodoId(over.id as string);
    }
    else {
      setOverCategoryId(null);
      setOverTodoId(null);
    }
  };

  // 드래그 종료
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, activatorEvent } = event;

    // 상태 초기화
    setActiveDragId(null);
    setOverCategoryId(null);
    setOverTodoId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Shift 키 눌림 감지
    const isShiftPressed = activatorEvent && 'shiftKey' in activatorEvent && activatorEvent.shiftKey;

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

    // Case 2: 반복 카테고리에서 일반 카테고리로 드래그
    if (activeData?.type === 'todo' && activeData?.categoryId === 'cat-recurring' &&
        overData && overData.categoryId !== 'cat-recurring') {
      const targetCategoryId = overData.type === 'category' ? overData.id : overData.categoryId;
      setConvertingRecurring({
        recurringId: activeId,
        categoryId: targetCategoryId,
      });
      setConvertModalOpen(true);
      return;
    }

    // Case 3: 일반 카테고리에서 반복 카테고리로 드래그
    if (activeData?.type === 'todo' && activeData?.categoryId !== 'cat-recurring' &&
        overData && (overData.categoryId === 'cat-recurring' || overData.id === 'cat-recurring')) {
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

    // Case 4: 할일을 카테고리로 이동 (빈 카테고리 포함)
    if (activeData?.type === 'todo' && overData?.type === 'category') {
      const overCategoryId = overData.id;
      if (onMoveTodo) {
        onMoveTodo(activeId, overCategoryId, undefined, 0);
      }
      return;
    }

    // Case 5: 같은 카테고리 내에서 할일 정렬
    if (activeData?.type === 'todo' && overData?.type === 'todo') {
      const activeCategoryId = activeData.categoryId;
      const overCategoryId = overData.categoryId;

      // Shift 키를 누른 채로 드롭하면 over된 todo의 하위 항목으로
      const targetParentId = isShiftPressed ? overId : overData.parentId;

      // 같은 카테고리 내에서 정렬
      if (activeCategoryId === overCategoryId && onMoveTodo) {
        onMoveTodo(activeId, overCategoryId, targetParentId, isShiftPressed ? 0 : overData.index);
      }
      // 다른 카테고리로 이동
      else if (activeCategoryId !== overCategoryId && onMoveTodo) {
        onMoveTodo(activeId, overCategoryId, targetParentId, isShiftPressed ? 0 : overData.index);
      }
      return;
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
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
          {/* Categories (반복 카테고리 포함) */}
          <SortableContext items={categoryIds} strategy={verticalListSortingStrategy}>
            {todosByCategory.map((category, index) => (
              <CategorySection
                key={category.id}
                category={category}
                categoryIndex={index}
                selectedDate={selectedDate}
                onToggleTodo={category.id === 'cat-recurring' ? handleToggleRecurringInstance : onToggleTodo}
                onEditTodo={onEditTodo}
                onDeleteTodo={onDeleteTodo}
                onUpdateTodoTime={onUpdateTodoTime}
                onMoveTodo={onMoveTodo}
                onAddTodo={onAddTodo}
                onEditCategory={onEditCategory}
                onChangeColor={onChangeColor}
                onDeleteCategory={onDeleteCategory}
                onAddRecurring={category.id === 'cat-recurring' ? handleAddRecurring : undefined}
                onEditRecurring={category.id === 'cat-recurring' ? handleEditRecurringClick : undefined}
                onDeleteRecurring={category.id === 'cat-recurring' ? handleDeleteRecurringClick : undefined}
                isDraggingTodoFromOtherCategory={
                  activeDragId !== null &&
                  draggedTodoCategoryId !== null &&
                  draggedTodoCategoryId !== category.id &&
                  overCategoryId === category.id
                }
                activeDragId={activeDragId}
                overTodoId={overTodoId}
                categories={categories}
              />
            ))}
          </SortableContext>
        </div>
      </div>

      {/* DragOverlay - follows cursor */}
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
      />

      {/* Delete Recurring Modal */}
      <DeleteRecurringModal
        isOpen={deleteRecurringModalOpen}
        onClose={() => {
          setDeleteRecurringModalOpen(false);
          setDeletingRecurringId('');
        }}
        onSkipInstance={handleSkipRecurringInstanceAction}
        onDeleteAfter={handleDeleteRecurringAfterAction}
        onDeleteAll={handleDeleteAllRecurring}
      />
    </DndContext>
  );
}
