'use client';

import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Trash2 } from 'lucide-react';
import { TodoItem } from './TodoItem';
import { TodoInput } from './TodoInput';
import { useState, useEffect } from 'react';

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

interface CategorySectionProps {
  category: Category;
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
  activeDragId?: string | null;
  overId?: string | null;
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
  activeDragId,
  overId,
}: CategorySectionProps) => {
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

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

  return (
    <motion.div
      layout
      transition={{ duration: 0.2 }}
      className="mb-4"
    >
      <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-neutral-gray-100 group relative mb-1">
        <div className="relative color-picker-container">
          <button
            onClick={() => setColorPickerOpen(!colorPickerOpen)}
            className="flex-shrink-0 w-4 h-4 rounded-full hover:ring-2 hover:ring-offset-1 hover:ring-neutral-gray-400 transition-all cursor-pointer"
            style={{ backgroundColor: category.color }}
            title="Change color"
          />

          <AnimatePresence>
            {colorPickerOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 mt-2 p-4 bg-white border border-neutral-gray-300 rounded-lg shadow-lg z-50 min-w-[240px]"
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
                        category.color === color ? 'ring-2 ring-offset-2 ring-neutral-gray-500' : ''
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

        <input
          type="text"
          defaultValue={category.name}
          disabled={category.id === 'cat-etc'}
          className={`flex-1 font-semibold text-sm bg-transparent text-neutral-text-primary focus:outline-none border-0 focus:ring-0 ${
            category.id === 'cat-etc' ? 'cursor-default' : ''
          }`}
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

        <span className="text-xs text-neutral-text-secondary">
          {completedCount}/{totalCount}
        </span>

        {/* "기타" 카테고리는 삭제 불가 */}
        {category.id !== 'cat-etc' && (
          <button
            onClick={() => onDeleteCategory(category.id)}
            className="flex-shrink-0 p-1 hover:bg-red-100 rounded transition-colors text-neutral-text-secondary hover:text-red-600 opacity-0 group-hover:opacity-100"
            title="Delete category"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className="space-y-0.5">
        <SortableContext items={category.items.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {category.items.map((todo, idx) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              level={0}
              categoryId={category.id}
              index={idx}
              siblings={category.items}
              onToggle={onToggleTodo}
              onEdit={onEditTodo}
              onDelete={onDeleteTodo}
              onUpdateTime={onUpdateTodoTime}
              onMove={onMoveTodo}
              onAddTodo={onAddTodo}
              selectedDate={selectedDate}
              isOver={overId === todo.id && activeDragId !== todo.id}
            />
          ))}
        </SortableContext>

        <TodoInput
          categoryId={category.id}
          selectedDate={selectedDate}
          onAddTodo={onAddTodo}
        />
      </div>
    </motion.div>
  );
};

// Memoize CategorySection to prevent unnecessary re-renders
// Custom comparison to check if category items have changed
export const CategorySection = memo(CategorySectionComponent, (prevProps, nextProps) => {
  return (
    prevProps.category.id === nextProps.category.id &&
    prevProps.category.name === nextProps.category.name &&
    prevProps.category.color === nextProps.category.color &&
    prevProps.category.items.length === nextProps.category.items.length &&
    prevProps.category.items.every((item, idx) =>
      item.id === nextProps.category.items[idx]?.id &&
      item.text === nextProps.category.items[idx]?.text &&
      item.completed === nextProps.category.items[idx]?.completed &&
      item.startTime === nextProps.category.items[idx]?.startTime &&
      item.endTime === nextProps.category.items[idx]?.endTime
    ) &&
    prevProps.selectedDate.getTime() === nextProps.selectedDate.getTime() &&
    prevProps.activeDragId === nextProps.activeDragId &&
    prevProps.overId === nextProps.overId
  );
});
