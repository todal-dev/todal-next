'use client';

import { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { Checkbox } from '@/components/ui/forms/Checkbox';
import { getDraggableStyle } from '@/utils/dragUtils';
import { TimePicker } from '@/components/ui/calendar/TimePicker';
import { Clock, Trash2, Calendar, Edit2 } from 'lucide-react';
import { useState } from 'react';

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

interface TodoItemProps {
  todo: Todo;
  level?: number;
  categoryId: string;
  index: number;
  siblings: Todo[];
  parentId?: string;
  onToggle: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onUpdateTime?: (id: string, startTime?: string, endTime?: string) => void;
  onMove?: (todoId: string, newCategoryId: string, newParentId?: string, newIndex?: number) => void;
  onAddTodo: (text: string, categoryId: string, date: Date, parentId?: string) => void;
  selectedDate: Date;
  activeDragId?: string | null;
  overTodoId?: string | null;
  categories?: Category[];
}

const TodoItemComponent = ({
  todo,
  level = 0,
  categoryId,
  index,
  siblings,
  parentId,
  onToggle,
  onEdit,
  onDelete,
  onUpdateTime,
  onMove,
  onAddTodo,
  selectedDate,
  activeDragId = null,
  overTodoId = null,
  categories = [],
}: TodoItemProps) => {
  const [editingTime, setEditingTime] = useState(false);

  // 반복 카테고리일 때 원래 카테고리 정보 찾기
  const isRecurringCategory = categoryId === 'cat-recurring';
  const originalCategory = isRecurringCategory
    ? categories.find(cat => cat.id === todo.categoryId)
    : null;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: todo.id,
    data: {
      type: 'todo',
      id: todo.id,
      categoryId,
      parentId,
      index,
    },
  });

  // 카테고리처럼 공간은 유지하되 투명하게 (밀림 효과를 위해)
  const style = getDraggableStyle(transform, transition, isDragging, 0, false);

  const hasTime = todo.startTime && todo.endTime;

  return (
    <div style={{ paddingLeft: `${level * 24}px` }}>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-neutral-gray-50 transition-colors group cursor-grab active:cursor-grabbing"
      >
        <div
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="cursor-default"
        >
          <Checkbox
            checked={todo.completed}
            onChange={() => onToggle(todo.id)}
            className="flex-shrink-0"
          />
        </div>

        <input
          type="text"
          defaultValue={todo.text}
          size={Math.max(todo.text.length, 10)}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className={`text-sm bg-transparent focus:outline-none border-0 focus:ring-0 cursor-text min-w-[100px] max-w-[400px] ${
            todo.completed
              ? 'line-through text-neutral-text-secondary'
              : 'text-neutral-text-primary'
          }`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              const currentText = e.currentTarget.value.trim();

              if (currentText) {
                // 텍스트가 있으면 저장
                if (currentText !== todo.text) {
                  onEdit(todo.id, currentText);
                }

                // currentElement를 먼저 저장
                const currentElement = e.currentTarget as HTMLElement;
                const currentCategory = currentElement.closest('[class*="space-y"]');

                // blur하여 현재 input 정리
                e.currentTarget.blur();

                // TodoInput의 "Add todo" 버튼 찾아서 클릭
                setTimeout(() => {
                  const allButtons = Array.from(document.querySelectorAll('button'));
                  const addTodoButtons = allButtons.filter(btn =>
                    btn.textContent?.includes('Add todo')
                  );

                  // 현재 카테고리의 Add todo 버튼 찾기 (가장 가까운)
                  if (addTodoButtons.length > 0 && currentCategory) {
                    for (const btn of addTodoButtons) {
                      if (currentCategory.contains(btn)) {
                        (btn as HTMLButtonElement).click();
                        break;
                      }
                    }
                  }
                }, 100);
              }
              // 비어있으면 아무것도 안 함
            } else if (e.key === 'Tab' && !e.shiftKey) {
              e.preventDefault();
              const currentText = e.currentTarget.value.trim();

              if (currentText && currentText !== todo.text) {
                onEdit(todo.id, currentText);
              }

              if (index > 0 && onMove) {
                const prevTodo = siblings[index - 1];
                onMove(todo.id, categoryId, prevTodo.id, 0);
              }
            } else if (e.key === 'Tab' && e.shiftKey) {
              e.preventDefault();

              if (parentId && onMove) {
                const currentText = e.currentTarget.value.trim();

                if (currentText && currentText !== todo.text) {
                  onEdit(todo.id, currentText);
                }

                onMove(todo.id, categoryId, undefined, index);
              }
            } else if (e.key === 'Backspace' && e.currentTarget.value === '') {
              e.preventDefault();
              onDelete(todo.id);
              if (index > 0) {
                const prevTodo = siblings[index - 1];
                setTimeout(() => {
                  const inputs = document.querySelectorAll('input[type="text"]');
                  inputs.forEach((input) => {
                    if ((input as HTMLInputElement).defaultValue === prevTodo.text) {
                      (input as HTMLInputElement).focus();
                    }
                  });
                }, 0);
              }
            }
          }}
          onBlur={(e) => {
            const newText = e.currentTarget.value.trim();
            if (newText && newText !== todo.text) {
              onEdit(todo.id, newText);
            } else if (!newText) {
              onDelete(todo.id);
            }
          }}
        />

        <div className="ml-auto flex items-center gap-2 flex-shrink-0">
          {/* 반복 카테고리일 때는 카테고리 이름 표시 */}
          {isRecurringCategory && originalCategory ? (
            <span
              className="text-xs px-2 py-0.5 rounded"
              style={{
                backgroundColor: `${originalCategory.color}20`,
                color: originalCategory.color,
              }}
            >
              {originalCategory.name}
            </span>
          ) : editingTime ? (
            <div
              className="flex items-center gap-1"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <TimePicker
                value={todo.startTime}
                onChange={(time) => {
                  onUpdateTime?.(todo.id, time, todo.endTime);
                }}
                placeholder="start"
              />
              <span className="text-xs text-neutral-text-secondary">-</span>
              <TimePicker
                value={todo.endTime}
                onChange={(time) => {
                  onUpdateTime?.(todo.id, todo.startTime, time);
                }}
                placeholder="end"
              />
              <button
                onClick={() => setEditingTime(false)}
                className="text-xs px-2 py-1 bg-primary-500 text-white rounded hover:bg-primary-600 cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {hasTime ? (
                <button
                  onClick={() => setEditingTime(true)}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  className="text-xs text-neutral-text-tertiary hover:text-primary-500 flex items-center gap-1 cursor-pointer"
                >
                  <Clock size={12} />
                  <span>
                    {todo.startTime}-{todo.endTime}
                  </span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setEditingTime(true);
                      onUpdateTime?.(todo.id, '09:00', '10:00');
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    className="text-xs text-neutral-text-tertiary hover:text-primary-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Clock size={12} />
                    <span>시간 설정</span>
                  </button>

                  {/* Calendar drag handle - next to time button */}
                  <div
                    draggable={true}
                    onDragStart={(e) => {
                      e.stopPropagation();
                      const dragData = {
                        id: todo.id,
                        text: todo.text,
                        startTime: todo.startTime,
                        endTime: todo.endTime,
                        categoryId,
                      };
                      e.dataTransfer.setData('text/plain', JSON.stringify(dragData));
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-move text-neutral-text-tertiary hover:text-primary-500 p-1"
                    title="캘린더로 드래그"
                  >
                    <Calendar size={14} />
                  </div>
                </>
              )}
            </>
          )}

          {/* 반복 카테고리일 때만 편집 버튼 표시 */}
          {categoryId === 'cat-recurring' && (
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(todo.id, todo.text);
              }}
              className="p-1 hover:bg-primary-100 rounded transition-colors text-neutral-text-secondary hover:text-primary-500 opacity-0 group-hover:opacity-100 cursor-pointer"
              title="반복 일정 편집"
            >
              <Edit2 size={14} />
            </button>
          )}

          <button
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(todo.id);
            }}
            className="p-1 hover:bg-red-100 rounded transition-colors text-neutral-text-secondary hover:text-red-600 opacity-0 group-hover:opacity-100 cursor-pointer"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {todo.subtasks && todo.subtasks.length > 0 && (
        <div>
          {todo.subtasks.map((subtask, idx) => (
            <TodoItem
              key={subtask.id}
              todo={subtask}
              level={level + 1}
              categoryId={categoryId}
              index={idx}
              siblings={todo.subtasks!}
              parentId={todo.id}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              onUpdateTime={onUpdateTime}
              onMove={onMove}
              onAddTodo={onAddTodo}
              selectedDate={selectedDate}
              activeDragId={activeDragId}
              overTodoId={overTodoId}
              categories={categories}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Memoize TodoItem to prevent unnecessary re-renders
export const TodoItem = memo(TodoItemComponent, (prevProps, nextProps) => {
  return (
    prevProps.todo.id === nextProps.todo.id &&
    prevProps.todo.text === nextProps.todo.text &&
    prevProps.todo.completed === nextProps.todo.completed &&
    prevProps.todo.categoryId === nextProps.todo.categoryId &&
    prevProps.todo.startTime === nextProps.todo.startTime &&
    prevProps.todo.endTime === nextProps.todo.endTime &&
    prevProps.todo.subtasks?.length === nextProps.todo.subtasks?.length &&
    prevProps.level === nextProps.level &&
    prevProps.categoryId === nextProps.categoryId &&
    prevProps.index === nextProps.index &&
    prevProps.siblings.length === nextProps.siblings.length &&
    prevProps.parentId === nextProps.parentId &&
    prevProps.activeDragId === nextProps.activeDragId &&
    prevProps.overTodoId === nextProps.overTodoId
  );
});
