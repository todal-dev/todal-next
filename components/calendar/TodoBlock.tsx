import { Repeat, Check } from 'lucide-react';
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

export function TodoBlock({
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
}: TodoBlockProps) {
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
  const isRecurring = !!todo.recurrenceId;

  return (
    <div
      draggable={false}
      onDragStart={(e) => {
        e.preventDefault();
      }}
      onContextMenu={(e) => handleContextMenu(e, todo.id)}
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
      className="absolute py-1 pr-2 pl-1.5 rounded text-xs overflow-visible cursor-move hover:brightness-95 transition-all group select-none"
      style={{
        ...style,
        backgroundColor: category?.color || '#3B82F6',
        borderLeft: `4px solid rgba(255, 255, 255, 0.5)`,
        color: 'white',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        zIndex: isResizing ? 20 : 10,
        opacity: isDraggingThis ? 0.3 : (isPastEvent && !todo.completed) ? 0.5 : 1,
      }}
      title={`${todo.text} (${displayStartTime} - ${displayEndTime})`}
    >
      {/* Top resize handle */}
      <div
        className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background: 'linear-gradient(to top, transparent, rgba(0,0,0,0.2))',
        }}
        onMouseDown={(e) => handleResizeStart(e, todo.id, 'top', todo.startTime!, todo.endTime!)}
      />

      {/* Checkbox - Top Right */}
      <div
        className="absolute top-1 right-1 z-10"
        onClick={(e) => {
          e.stopPropagation();
          handleToggleCompletion(todo.id);
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div
          className="w-4 h-4 rounded border-2 border-white flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors"
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
        <div className="flex items-center gap-1 pr-6">
          {isRecurring && <Repeat size={12} className="flex-shrink-0" />}
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
              className="flex-1 rounded px-2 py-0.5 font-semibold outline-none border-2 min-w-0 placeholder-white/70"
              autoFocus
            />
          ) : (
            <div
              className="font-semibold cursor-text hover:underline break-words"
              onDoubleClick={(e) => {
                e.stopPropagation();
                startEdit(todo.id, todo.text);
              }}
            >
              {todo.text || '(제목 없음)'}
            </div>
          )}
        </div>
        <div className="text-xs opacity-90">
          {displayStartTime} - {displayEndTime}
        </div>
      </div>

      {/* Bottom resize handle */}
      <div
        className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.2))',
        }}
        onMouseDown={(e) => handleResizeStart(e, todo.id, 'bottom', todo.startTime!, todo.endTime!)}
      />
    </div>
  );
}
