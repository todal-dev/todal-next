import { memo, useState } from 'react';
import { Repeat, Check, ListTodo } from 'lucide-react';
import type { Todo, Category } from '@/types/calendar';
import { getTodoBlockStyle } from '@/utils/calendarUtils';

interface TodoBlockProps {
  todo: Todo;
  category: Category | undefined;
  date: Date;
  hourHeight: number;
  layout: { width: number; left: number };
  currentTime: Date;
  editingTodoId: string | null;
  editingText: string;
  setEditingText: (text: string) => void;
  startEdit: (id: string, text: string) => void;
  handleFinishEdit: () => void;
  cancelEdit: () => void;
  handleToggleCompletion: (todoId: string) => void;
  handleContextMenu: (e: React.MouseEvent, todoId: string) => void;
  handleTodoDragStart: (e: React.MouseEvent, todoId: string, date: Date, startTime: string, endTime: string) => void;
  handleResizeStart: (e: React.MouseEvent, todoId: string, direction: 'top' | 'bottom', startTime: string, endTime: string) => void;
  resizingTodo: { id: string; currentStartTime: string; currentEndTime: string } | null;
  draggingTodo: { id: string; currentDate: Date; currentStartTime: string; currentEndTime: string } | null;
}

const TodoBlockComponent = ({
  todo,
  category,
  date,
  hourHeight,
  layout,
  currentTime,
  editingTodoId,
  editingText,
  setEditingText,
  startEdit,
  handleFinishEdit,
  cancelEdit,
  handleToggleCompletion,
  handleContextMenu,
  handleTodoDragStart,
  handleResizeStart,
  resizingTodo,
  draggingTodo,
}: TodoBlockProps) => {
  // 시간에서 초를 제거하는 헬퍼 함수 (HH:mm:ss -> HH:mm)
  const formatTimeWithoutSeconds = (time: string): string => {
    // HH:mm:ss 또는 HH:mm 형식을 HH:mm으로 변환
    const parts = time.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return time;
  };

  const isResizing = resizingTodo?.id === todo.id;
  const isDraggingThis = draggingTodo?.id === todo.id;

  // Hide original todo when dragging to different date
  const isDraggingToOtherDate = isDraggingThis &&
    draggingTodo.currentDate.toDateString() !== date.toDateString();

  if (isDraggingToOtherDate) {
    return null; // Don't render on original date when dragging to another date
  }

  let displayStartTime = todo.startTime!;
  let displayEndTime = todo.endTime!;

  if (isResizing) {
    displayStartTime = resizingTodo.currentStartTime;
    displayEndTime = resizingTodo.currentEndTime;
  }

  // Check if event is in the past (end time is before current time)
  const isPastEvent = (() => {
    const [endHour, endMinute] = displayEndTime.split(':').map(Number);
    const eventEndDate = new Date(todo.date);
    eventEndDate.setHours(endHour, endMinute, 0, 0);
    return eventEndDate < currentTime;
  })();

  const style = getTodoBlockStyle(displayStartTime, displayEndTime, hourHeight, layout.width, layout.left);
  // 반복 이벤트인지 확인 (ID 패턴: recurring-timestamp-ISODate)
  const isRecurring = todo.id.startsWith('recurring-') && todo.id.split('-').length > 2;

  // 하위 항목 개수 계산
  const subtaskCount = todo.subtasks?.length || 0;
  const hasSubtasks = subtaskCount > 0;
  const [showSubtasks, setShowSubtasks] = useState(false);

  return (
    <div
      draggable={false}
      onDragStart={(e) => {
        e.preventDefault();
      }}
      onContextMenu={(e) => handleContextMenu(e, todo.id)}
      onMouseEnter={() => hasSubtasks && setShowSubtasks(true)}
      onMouseLeave={() => setShowSubtasks(false)}
       onMouseDown={(e) => {
         // Always stop propagation to prevent grid drag from starting
         e.stopPropagation();
 
         // Finish any pending edit before interacting with this todo
         if (editingTodoId && editingTodoId !== todo.id) {
           handleFinishEdit();
           // Don't start drag when finishing an edit, just let the click happen
           return;
         }
 
         // Only start drag if not clicking on resize handles or input
         const target = e.target as HTMLElement;
         if (!target.classList.contains('cursor-ns-resize') &&
             target.tagName !== 'INPUT') {
           handleTodoDragStart(e, todo.id, todo.date, todo.startTime!, todo.endTime!);
         }
       }}
       onClick={(e) => {
         // 모바일에서 클릭으로 완료 토글 (체크박스가 없으므로)
         if (window.innerWidth < 640) {
           const target = e.target as HTMLElement;
           // 입력 중이 아니고, 리사이즈 핸들도 아닐 때만
           if (target.tagName !== 'INPUT' && !target.classList.contains('cursor-ns-resize')) {
             e.stopPropagation();
             handleToggleCompletion(todo.id);
           }
         }
       }}
      className={`absolute py-1.5 sm:py-1 px-1.5 sm:pr-2 sm:pl-1.5 rounded text-xs overflow-visible cursor-move hover:brightness-95 active:brightness-90 group select-none touch-manipulation ${
        todo.completed ? 'opacity-60' : ''
      }`}
      style={{
        ...style,
        backgroundColor: category?.color || '#3B82F6',
        borderLeft: `3px solid rgba(255, 255, 255, 0.6)`,
        color: 'white',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        zIndex: isResizing ? 20 : 10,
        opacity: isDraggingThis ? 0.3 : (isPastEvent && !todo.completed) ? 0.5 : 1,
        minHeight: '32px', // Minimum touch target size on mobile
        textDecoration: todo.completed ? 'line-through' : 'none',
      }}
      title={`${todo.text} (${formatTimeWithoutSeconds(displayStartTime)} - ${formatTimeWithoutSeconds(displayEndTime)})`}
    >
      {/* Top resize handle */}
      <div
        className="absolute top-0 left-0 right-0 h-3 sm:h-2 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity touch-manipulation"
        style={{
          background: 'linear-gradient(to top, transparent, rgba(0,0,0,0.2))',
        }}
        onMouseDown={(e) => handleResizeStart(e, todo.id, 'top', todo.startTime!, todo.endTime!)}
        onTouchStart={(e) => {
          e.stopPropagation();
          const touch = e.touches[0];
          const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY,
            bubbles: true,
          });
          handleResizeStart(mouseEvent as any, todo.id, 'top', todo.startTime!, todo.endTime!);
        }}
      />

      {/* Checkbox - Desktop only (Top Right) */}
      <div
        className="absolute top-1 right-1 z-10 hidden sm:block"
        onClick={(e) => {
          e.stopPropagation();
          handleToggleCompletion(todo.id);
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <div
          className="w-4 h-4 rounded border-2 border-white flex items-center justify-center cursor-pointer hover:bg-white/20 active:bg-white/30 transition-colors touch-manipulation"
          style={{
            backgroundColor: todo.completed ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
          }}
        >
          {todo.completed && (
            <Check size={12} style={{ color: category?.color || '#3B82F6' }} strokeWidth={3} />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="relative">
        <div className="flex items-center gap-0.5 sm:gap-1 pr-0 sm:pr-6">
          {isRecurring && <Repeat size={10} className="flex-shrink-0 sm:w-3 sm:h-3" />}
          {editingTodoId === todo.id ? (
            <input
              type="text"
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              onBlur={handleFinishEdit}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Enter') handleFinishEdit();
                if (e.key === 'Escape') cancelEdit();
              }}
              style={{
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderColor: 'rgba(255, 255, 255, 0.5)',
              }}
              className="flex-1 rounded px-1 sm:px-2 py-0.5 text-[10px] sm:text-xs font-semibold outline-none border-2 min-w-0 placeholder-white/70"
              autoFocus
            />
          ) : (
            <div
              className="text-[10px] sm:text-xs font-semibold cursor-text break-words line-clamp-2 leading-tight"
              onDoubleClick={(e) => {
                e.stopPropagation();
                startEdit(todo.id, todo.text);
              }}
            >
              {todo.text || '(제목 없음)'}
            </div>
          )}
        </div>
        {/* 시간 표시 - 데스크톱만 */}
        <div className="text-[10px] sm:text-xs opacity-90 hidden sm:block mt-0.5">
          {formatTimeWithoutSeconds(displayStartTime)} - {formatTimeWithoutSeconds(displayEndTime)}
        </div>
        {/* 하위 항목 뱃지 - 더 작게 */}
        {hasSubtasks && (
          <div className="text-[9px] sm:text-[10px] opacity-90 mt-0.5 hidden sm:block">
            <span className="flex items-center gap-0.5 bg-white/20 px-1 py-0.5 rounded inline-flex">
              <ListTodo size={8} className="sm:w-2.5 sm:h-2.5" />
              <span className="font-medium">{subtaskCount}</span>
            </span>
          </div>
        )}
      </div>

      {/* Bottom resize handle */}
      <div
        className="absolute bottom-0 left-0 right-0 h-3 sm:h-2 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity touch-manipulation"
        style={{
          background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.2))',
        }}
        onMouseDown={(e) => handleResizeStart(e, todo.id, 'bottom', todo.startTime!, todo.endTime!)}
        onTouchStart={(e) => {
          e.stopPropagation();
          const touch = e.touches[0];
          const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY,
            bubbles: true,
          });
          handleResizeStart(mouseEvent as any, todo.id, 'bottom', todo.startTime!, todo.endTime!);
        }}
      />

      {/* 하위 항목 툴팁 */}
      {showSubtasks && hasSubtasks && (
        <div
          className="absolute left-0 top-full mt-1 z-50 bg-white dark:bg-gray-700 shadow-lg rounded-md border border-gray-200 dark:border-gray-600 p-2 min-w-[200px] max-w-[300px] animate-slide-up"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="text-caption font-semibold text-gray-400 dark:text-gray-500 mb-1 px-1">
            하위 항목 ({subtaskCount})
          </div>
          <div className="space-y-1">
            {todo.subtasks?.map((subtask) => (
              <div
                key={subtask.id}
                className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <div
                  className="w-3 h-3 rounded border-2 flex items-center justify-center flex-shrink-0"
                  style={{
                    borderColor: category?.color || '#3B82F6',
                    backgroundColor: subtask.completed ? (category?.color || '#3B82F6') : 'transparent',
                  }}
                >
                  {subtask.completed && (
                    <Check size={8} className="text-white" strokeWidth={3} />
                  )}
                </div>
                <span
                  className={`text-caption ${
                    subtask.completed
                      ? 'line-through text-gray-400 dark:text-gray-500'
                      : 'text-gray-900 dark:text-gray-50'
                  }`}
                >
                  {subtask.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Memoize TodoBlock to prevent unnecessary re-renders
export const TodoBlock = memo(TodoBlockComponent, (prevProps, nextProps) => {
  // Only re-render if these critical props change
  return (
    prevProps.todo.id === nextProps.todo.id &&
    prevProps.todo.text === nextProps.todo.text &&
    prevProps.todo.completed === nextProps.todo.completed &&
    prevProps.todo.startTime === nextProps.todo.startTime &&
    prevProps.todo.endTime === nextProps.todo.endTime &&
    prevProps.hourHeight === nextProps.hourHeight &&
    prevProps.layout.width === nextProps.layout.width &&
    prevProps.layout.left === nextProps.layout.left &&
    prevProps.category?.color === nextProps.category?.color &&
    prevProps.editingTodoId === nextProps.editingTodoId &&
    prevProps.editingText === nextProps.editingText &&
    prevProps.resizingTodo?.id === nextProps.resizingTodo?.id &&
    prevProps.resizingTodo?.currentStartTime === nextProps.resizingTodo?.currentStartTime &&
    prevProps.resizingTodo?.currentEndTime === nextProps.resizingTodo?.currentEndTime &&
    prevProps.draggingTodo?.id === nextProps.draggingTodo?.id &&
    prevProps.draggingTodo?.currentDate.toDateString() === nextProps.draggingTodo?.currentDate.toDateString()
  );
});
