'use client';

import { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Trash2, Plus, Repeat } from 'lucide-react';
import { getDraggableStyle } from '@/utils/dragUtils';
import { TodoItem } from './TodoItem';
import { TodoInput } from './TodoInput';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DeleteCategoryDialog } from '@/components/ui/dialogs/DeleteCategoryDialog';

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
  items: Todo[];
}

interface SimplifiedCategory {
  id: string;
  name: string;
  color: string;
}

interface CategorySectionProps {
  category: Category;
  categoryIndex: number;
  selectedDate: Date;
  onToggleTodo: (id: string) => void;
  onEditTodo: (id: string, text: string) => void;
  onDeleteTodo: (id: string) => void;
  onUpdateTodoTime?: (id: string, startTime?: string, endTime?: string) => void;
  onMoveTodo?: (todoId: string, newCategoryId: string, newParentId?: string, newIndex?: number) => void;
  onAddTodo: (text: string, categoryId: string, date: Date, parentId?: string) => void;
  onEditCategory: (id: string, name: string) => void;
  onChangeColor: (id: string, color: string) => void;
  onDeleteCategory: (id: string) => void;
  onAddRecurring?: () => void;
  onEditRecurring?: (id: string) => void;
  onDeleteRecurring?: (id: string) => void;
  isDraggingTodoFromOtherCategory?: boolean;
  activeDragId?: string | null;
  overTodoId?: string | null;
  categories?: SimplifiedCategory[];
}

const colorPalette = [
  '#3B82F6',
  '#A855F7',
  '#2D9F6B',
  '#EF4444',
  '#F59E0B',
  '#10B981',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#84CC16',
];

const CategorySectionComponent = ({
  category,
  categoryIndex,
  selectedDate,
  onToggleTodo,
  onEditTodo,
  onDeleteTodo,
  onUpdateTodoTime,
  onMoveTodo,
  onAddTodo,
  onEditCategory,
  onChangeColor,
  onDeleteCategory,
  onAddRecurring,
  onEditRecurring,
  onDeleteRecurring,
  isDraggingTodoFromOtherCategory = false,
  activeDragId = null,
  overTodoId = null,
  categories = [],
}: CategorySectionProps) => {
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Make category draggable (except "반복" and "기타")
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: category.id,
    data: {
      type: 'category',
      id: category.id,
      index: categoryIndex,
    },
    disabled: category.id === 'cat-recurring' || category.id === 'cat-etc',
  });

  const style = getDraggableStyle(transform, transition, isDragging);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (colorPickerOpen && !target.closest('.color-picker-container')) {
        setColorPickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [colorPickerOpen]);

  const completedCount = category.items.filter((t) => t.completed).length;
  const totalCount = category.items.length;

  // Get all todo IDs for this category
  const todoIds = category.items.map(item => item.id);

  return (
    <div ref={setNodeRef} style={style}>
      <div className="mb-4">
        <div
          {...attributes}
          {...listeners}
          className={`flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 group relative mb-1 transition-colors ${
            category.id !== 'cat-recurring' && category.id !== 'cat-etc' ? 'cursor-grab active:cursor-grabbing' : ''
          }`}
          suppressHydrationWarning
        >
          {/* 반복 카테고리는 아이콘만 표시, 나머지는 색상 버튼 */}
          {category.id === 'cat-recurring' ? (
            <div className="flex-shrink-0">
              <Repeat size={16} className="text-primary dark:text-primary-light" />
            </div>
          ) : (
            <div
              className="relative color-picker-container"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setColorPickerOpen(!colorPickerOpen)}
                className="flex-shrink-0 w-4 h-4 rounded-full hover:ring-2 hover:ring-offset-1 hover:ring-gray-400 dark:hover:ring-gray-500 transition-all cursor-pointer"
                style={{ backgroundColor: category.color }}
                title="색상 변경"
              />

              <AnimatePresence>
                {colorPickerOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 p-4 bg-warm-white dark:bg-dark-ocean-card border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-50 min-w-[240px]"
                  >
                    <div className="grid grid-cols-5 gap-4">
                      {colorPalette.map((color) => (
                        <button
                          key={color}
                          onClick={() => {
                            onChangeColor(category.id, color);
                            setColorPickerOpen(false);
                          }}
                          className={`w-7 h-7 rounded-full hover:scale-110 transition-transform ${
                            category.color === color ? 'ring-2 ring-offset-2 ring-gray-500 dark:ring-gray-400' : ''
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <input
            type="text"
            defaultValue={category.name}
            disabled={category.id === 'cat-recurring' || category.id === 'cat-etc'}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className={`font-semibold text-body-small bg-transparent text-gray-900 dark:text-gray-50 focus:outline-none border-0 focus:ring-0 cursor-text ${
              category.id === 'cat-recurring' || category.id === 'cat-etc' ? 'cursor-default' : ''
            }`}
            size={Math.max(category.name.length, 5)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur();
              }
            }}
            onBlur={(e) => {
              const newName = e.currentTarget.value.trim();
              if (newName && newName !== category.name) {
                onEditCategory(category.id, newName);
              } else if (!newName) {
                e.currentTarget.value = category.name;
              }
            }}
          />

          <div className="flex-1" />

          <span className="text-caption text-gray-400 dark:text-gray-500">
            {completedCount}/{totalCount}
          </span>

          {/* 할일 추가 버튼 */}
          <button
            onClick={() => {
              if (category.id === 'cat-recurring' && onAddRecurring) {
                onAddRecurring();
              } else {
                setIsAddingTodo(true);
              }
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="flex-shrink-0 p-1 hover:bg-primary-light dark:hover:bg-primary-700 rounded transition-colors text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary-light cursor-pointer"
            title="할일 추가"
          >
            <Plus size={16} />
          </button>

          {/* "반복"과 "기타" 카테고리는 삭제 불가 */}
          {category.id !== 'cat-recurring' && category.id !== 'cat-etc' && (
            <button
              onClick={() => setDeleteDialogOpen(true)}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="flex-shrink-0 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 cursor-pointer"
              title="카테고리 삭제"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>

        {/* SortableContext for todos in this category */}
        <SortableContext items={todoIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-0.5">
            {category.items.map((todo, idx) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                level={0}
                categoryId={category.id}
                index={idx}
                siblings={category.items}
                onToggle={onToggleTodo}
                onEdit={category.id === 'cat-recurring' && onEditRecurring ?
                  (id: string) => onEditRecurring(id) :
                  onEditTodo
                }
                onDelete={category.id === 'cat-recurring' && onDeleteRecurring ?
                  (id: string) => onDeleteRecurring(id) :
                  onDeleteTodo
                }
                onUpdateTime={onUpdateTodoTime}
                onMove={onMoveTodo}
                onAddTodo={onAddTodo}
                selectedDate={selectedDate}
                activeDragId={activeDragId}
                overTodoId={overTodoId}
                categories={categories}
              />
            ))}

            {/* Placeholder for empty category when dragging from another category */}
            {isDraggingTodoFromOtherCategory && category.items.length === 0 && (
              <div className="px-3 py-1.5 rounded-md">
                <div className="h-5" />
              </div>
            )}

            {/* 반복 카테고리는 TodoInput 사용 안함 (모달 사용) */}
            {category.id !== 'cat-recurring' && (
              <TodoInput
                categoryId={category.id}
                selectedDate={selectedDate}
                onAddTodo={onAddTodo}
                hideButton={true}
                isAdding={isAddingTodo}
                onIsAddingChange={setIsAddingTodo}
              />
            )}
          </div>
        </SortableContext>
      </div>

      {/* Delete Category Confirmation Dialog */}
      <DeleteCategoryDialog
        isOpen={deleteDialogOpen}
        categoryName={category.name}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={() => onDeleteCategory(category.id)}
      />
    </div>
  );
};

// Memoize CategorySection to prevent unnecessary re-renders
export const CategorySection = memo(CategorySectionComponent, (prevProps, nextProps) => {
  return (
    prevProps.category.id === nextProps.category.id &&
    prevProps.category.name === nextProps.category.name &&
    prevProps.category.color === nextProps.category.color &&
    prevProps.categoryIndex === nextProps.categoryIndex &&
    prevProps.category.items.length === nextProps.category.items.length &&
    prevProps.category.items.every((item, idx) => {
      const nextItem = nextProps.category.items[idx];
      return (
        item.id === nextItem?.id &&
        item.text === nextItem?.text &&
        item.completed === nextItem?.completed &&
        item.categoryId === nextItem?.categoryId &&
        item.startTime === nextItem?.startTime &&
        item.endTime === nextItem?.endTime &&
        item.subtasks?.length === nextItem?.subtasks?.length  // subtasks 변경 감지!
      );
    }) &&
    prevProps.selectedDate.getTime() === nextProps.selectedDate.getTime() &&
    prevProps.isDraggingTodoFromOtherCategory === nextProps.isDraggingTodoFromOtherCategory &&
    prevProps.activeDragId === nextProps.activeDragId &&
    prevProps.overTodoId === nextProps.overTodoId
  );
});
