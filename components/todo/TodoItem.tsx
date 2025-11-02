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

  // 시간에서 초를 제거하는 헬퍼 함수 (HH:mm:ss -> HH:mm)
  const formatTimeWithoutSeconds = (time?: string): string => {
    if (!time) return '';
    // HH:mm:ss 또는 HH:mm 형식을 HH:mm으로 변환
    const parts = time.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return time;
  };

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

  // 드래그 중 항상 원래 자리의 공간 제거
  const shouldRemoveSpace = isDragging;
  const style = getDraggableStyle(transform, transition, isDragging, 0, shouldRemoveSpace);

  const hasTime = todo.startTime && todo.endTime;

  // 외부 wrapper div에도 공간 제거 스타일 적용
  const wrapperStyle = shouldRemoveSpace
    ? { paddingLeft: `${level * 24}px`, height: 0, minHeight: 0, maxHeight: 0, overflow: 'hidden' as const }
    : { paddingLeft: `${level * 24}px` };

  return (
    <div style={wrapperStyle}>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="flex items-center gap-1.5 md:gap-2 px-2 py-0 md:px-4 md:py-2.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 transition-all duration-normal group cursor-grab active:cursor-grabbing touch-manipulation min-h-[28px] md:min-h-[44px]"
      >
        <div
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="cursor-default flex items-center"
        >
          <Checkbox
            checked={todo.completed}
            onChange={() => onToggle(todo.id)}
            className="flex-shrink-0 leading-none"
          />
        </div>

        <input
          type="text"
          defaultValue={todo.text}
          placeholder="할일 입력..."
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className={`todo-input text-sm md:text-body !bg-transparent focus:outline-none border-0 focus:ring-0 cursor-text w-full min-w-[100px] max-w-full sm:max-w-[400px] overflow-hidden text-ellipsis transition-all leading-none ${
            todo.completed
              ? 'line-through text-gray-400 dark:text-gray-500'
              : 'text-gray-900 dark:text-gray-50'
          }`}
          style={{ backgroundColor: 'transparent', background: 'transparent' }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              const currentText = e.currentTarget.value.trim();

              if (currentText) {
                // 텍스트가 있으면 저장
                if (currentText !== todo.text) {
                  onEdit(todo.id, currentText);
                }

                // 같은 레벨에 새 할일 추가 (parentId를 그대로 전달)
                onAddTodo('', categoryId, selectedDate, parentId);

                // 새로 생성된 input에 자동 포커스 (blur 하지 않음)
                setTimeout(() => {
                  // 가장 최근에 추가된 input을 찾기 (빈 값인 input)
                  const allInputs = Array.from(document.querySelectorAll('input[type="text"]'));
                  const emptyInput = allInputs.find(input =>
                    (input as HTMLInputElement).value === '' &&
                    (input as HTMLInputElement).placeholder === '할일 입력...' &&
                    input !== e.currentTarget
                  );

                  if (emptyInput) {
                    (emptyInput as HTMLInputElement).focus();
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

              if (parentId && onMove) {
                // 하위 항목 → 상위 레벨로 이동
                onMove(todo.id, categoryId, undefined, index);
              } else {
                // 최상위 항목 → 삭제
                onDelete(todo.id);

                // 이전 항목으로 포커스 이동
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

        <div className="ml-auto flex items-center gap-1 md:gap-2 flex-shrink-0">
          {/* 반복 카테고리일 때는 시간과 카테고리 이름 표시 */}
          {isRecurringCategory && originalCategory ? (
            <>
              {/* 시간 표시 */}
              {hasTime && (
                <span className="text-[9px] md:text-caption text-gray-400 dark:text-gray-500">
                  {formatTimeWithoutSeconds(todo.startTime)}-{formatTimeWithoutSeconds(todo.endTime)}
                </span>
              )}
              {/* 카테고리 이름 */}
              <span
                className="text-[9px] md:text-xs px-1 md:px-2 py-0.5 rounded"
                style={{
                  backgroundColor: `${originalCategory.color}20`,
                  color: originalCategory.color,
                }}
              >
                {originalCategory.name}
              </span>
            </>
          ) : parentId ? (
            // 하위 항목일 때는 시간 설정 불가
            null
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
              <span className="text-caption text-gray-400 dark:text-gray-500">-</span>
              <TimePicker
                value={todo.endTime}
                onChange={(time) => {
                  onUpdateTime?.(todo.id, todo.startTime, time);
                }}
                placeholder="end"
              />
              <button
                onClick={() => setEditingTime(false)}
                className="text-caption px-2 py-1 bg-primary text-white rounded-md hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700 transition-colors cursor-pointer"
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
                  className="text-[9px] md:text-caption text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary-100 flex items-center gap-0.5 md:gap-1 cursor-pointer transition-colors"
                >
                  <Clock size={9} className="md:w-3 md:h-3" />
                  <span>
                    {formatTimeWithoutSeconds(todo.startTime)}-{formatTimeWithoutSeconds(todo.endTime)}
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
                    className="text-[9px] md:text-caption text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary-100 flex items-center gap-0.5 md:gap-1 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  >
                    <Clock size={9} className="md:w-3 md:h-3" />
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
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all cursor-move text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary-100 p-0.5 md:p-1"
                    title="캘린더로 드래그"
                  >
                    <Calendar size={11} className="md:w-3.5 md:h-3.5" />
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
              className="p-0.5 md:p-1 hover:bg-primary-50 dark:hover:bg-primary-700 rounded transition-colors text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary-100 opacity-0 group-hover:opacity-100 cursor-pointer"
              title="반복 일정 편집"
            >
              <Edit2 size={11} className="md:w-3.5 md:h-3.5" />
            </button>
          )}

          <button
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(todo.id);
            }}
            className="p-0.5 md:p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 cursor-pointer"
            title="Delete"
          >
            <Trash2 size={11} className="md:w-3.5 md:h-3.5" />
          </button>
        </div>
      </div>

      {!shouldRemoveSpace && todo.subtasks && todo.subtasks.length > 0 && (
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
