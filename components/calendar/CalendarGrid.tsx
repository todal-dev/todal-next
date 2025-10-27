import { useMemo, memo } from 'react';
import type { Todo, Category } from '@/types/calendar';
import { getTodoBlockStyle, roundToQuarterHour } from '@/utils/calendarUtils';
import { calculateEventLayout } from '@/utils/eventLayoutUtils';
import { TodoBlock } from './TodoBlock';

interface CalendarGridProps {
  weekDays: Date[];
  weekTodos: Record<string, Todo[]>;
  todos: Todo[];
  categories: Category[];
  hourHeight: number;
  hours: number[];
  dayNames: string[];
  currentTime: Date;
  gridScrollRef: React.RefObject<HTMLDivElement | null>;
  creatingEvent: { date: Date; startTime: string; endTime: string; isEditing?: boolean } | null;
  editingEventText: string;
  setEditingEventText: (text: string) => void;
  handleCalendarDragStart: (date: Date, hour: number, e: React.MouseEvent) => void;
  handleCalendarDragMove: (date: Date, hour: number, e: React.MouseEvent) => void;
  handleCalendarDragEnd: () => void;
  handleConfirmCreate: () => void;
  handleCancelCreate: () => void;
  onUpdateTodoDateTime?: (id: string, date: Date, startTime?: string, endTime?: string) => void;
  draggingTodo: { id: string; currentDate: Date; currentStartTime: string; currentEndTime: string } | null;
  resizingTodo: { id: string; currentStartTime: string; currentEndTime: string } | null;
  editingTodoId: string | null;
  editingText: string;
  setEditingText: (text: string) => void;
  setPendingEditId: (id: string) => void;
  startEdit: (id: string, text: string) => void;
  handleFinishEdit: () => void;
  cancelEdit: () => void;
  handleToggleCompletion: (todoId: string) => void;
  handleContextMenu: (e: React.MouseEvent, todoId: string) => void;
  handleTodoDragStart: (e: React.MouseEvent, todoId: string, date: Date, startTime: string, endTime: string) => void;
  handleResizeStart: (e: React.MouseEvent, todoId: string, direction: 'top' | 'bottom', startTime: string, endTime: string) => void;
}

const CalendarGridComponent = ({
  weekDays,
  weekTodos,
  todos,
  categories,
  hourHeight,
  hours,
  dayNames,
  currentTime,
  gridScrollRef,
  creatingEvent,
  editingEventText,
  setEditingEventText,
  handleCalendarDragStart,
  handleCalendarDragMove,
  handleCalendarDragEnd,
  handleConfirmCreate,
  handleCancelCreate,
  onUpdateTodoDateTime,
  draggingTodo,
  resizingTodo,
  editingTodoId,
  editingText,
  setEditingText,
  setPendingEditId,
  startEdit,
  handleFinishEdit,
  cancelEdit,
  handleToggleCompletion,
  handleContextMenu,
  handleTodoDragStart,
  handleResizeStart,
}: CalendarGridProps) => {
  // Pre-calculate event layouts for all days to avoid recalculation on every render
  const allEventLayouts = useMemo(() => {
    const layouts: Record<string, Record<string, { width: number; left: number }>> = {};
    weekDays.forEach((date) => {
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const dayTodos = weekTodos[dateKey] || [];
      layouts[dateKey] = calculateEventLayout(dayTodos);
    });
    return layouts;
  }, [weekDays, weekTodos]);

  return (
    <div ref={gridScrollRef} className="flex-1 overflow-auto calendar-grid">
      {/* Week Days Header - Fixed at top */}
      <div className="sticky top-0 z-20 bg-white border-b border-neutral-gray-300">
        <div className="flex min-w-full">
          <div className="w-16 bg-neutral-gray-50 border-r border-neutral-gray-300 shrink-0 sticky left-0 z-30" />
          <div className="flex flex-1">
            {weekDays.map((date, index) => {
              const isToday =
                date.getDate() === new Date().getDate() &&
                date.getMonth() === new Date().getMonth() &&
                date.getFullYear() === new Date().getFullYear();

              return (
                <div
                  key={index}
                  className={`flex-1 min-w-[100px] text-center py-3 border-r border-neutral-gray-300 ${
                    isToday ? 'bg-primary-50' : ''
                  }`}
                >
                  <div className="text-xs text-neutral-text-secondary font-medium">
                    {dayNames[date.getDay()]}
                  </div>
                  <div
                    className={`text-lg font-semibold ${
                      isToday ? 'text-primary-500' : 'text-neutral-text-primary'
                    }`}
                  >
                    {date.getDate()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Time Grid */}
      <div className="flex min-w-full" style={{ height: `${hourHeight * 24}px` }}>
        {/* Time Column */}
        <div className="w-16 bg-neutral-gray-50 border-r border-neutral-gray-300 shrink-0 sticky left-0 z-10">
          {hours.map((hour) => (
            <div
              key={hour}
              className="border-b border-neutral-gray-200 text-xs text-neutral-text-secondary pt-1 text-center font-medium bg-neutral-gray-50"
              style={{ height: `${hourHeight}px` }}
            >
              {String(hour).padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="flex flex-1">
          {weekDays.map((date, dayIndex) => {
            const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const dayTodos = weekTodos[dateKey] || [];

            // Use pre-calculated layout for better performance
            const eventLayout = allEventLayouts[dateKey] || {};

            const isToday =
              date.getDate() === currentTime.getDate() &&
              date.getMonth() === currentTime.getMonth() &&
              date.getFullYear() === currentTime.getFullYear();

            const isDraggingOverThisDay = draggingTodo &&
              draggingTodo.currentDate.toDateString() === date.toDateString();

            return (
              <div
                key={dayIndex}
                className={`flex-1 border-r border-neutral-gray-300 min-w-[100px] relative calendar-day-column transition-colors ${
                  isDraggingOverThisDay ? 'bg-primary-50' : ''
                }`}
              >
                {/* Time Grid Background */}
                {hours.map((hour) => (
                  <div
                    key={`${dayIndex}-${hour}`}
                    data-hour={hour}
                    className="border-b border-neutral-gray-200 hover:bg-neutral-gray-50 transition-colors cursor-pointer"
                    style={{ height: `${hourHeight}px` }}
                    onMouseDown={(e) => handleCalendarDragStart(date, hour, e)}
                    onMouseMove={(e) => handleCalendarDragMove(date, hour, e)}
                    onMouseUp={() => handleCalendarDragEnd()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add('bg-primary-100');
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove('bg-primary-100');
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('bg-primary-100');

                      try {
                        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
                        const todoId = data.id;

                        // Preserve existing time if available, otherwise calculate new time
                        let startTime = data.startTime;
                        let endTime = data.endTime;

                        if (!startTime || !endTime) {
                          // Calculate drop time only if no existing time
                          const rect = e.currentTarget.getBoundingClientRect();
                          const y = e.clientY - rect.top;
                          const minuteOffset = Math.round((y / hourHeight) * 60);
                          const roundedMinute = roundToQuarterHour(minuteOffset);

                          let startHour = hour;
                          let startMinute = roundedMinute;

                          if (roundedMinute === 0 && minuteOffset > 45) {
                            startHour = hour + 1;
                            startMinute = 0;
                          }

                          startTime = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`;

                          // Default 1 hour duration
                          const endTotalMinutes = startHour * 60 + startMinute + 60;
                          const endHour = Math.floor(endTotalMinutes / 60);
                          const endMinute = endTotalMinutes % 60;
                          endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
                        }

                        onUpdateTodoDateTime?.(todoId, date, startTime, endTime);
                      } catch (error) {
                        console.error('드롭 처리 중 오류:', error);
                      }
                    }}
                  />
                ))}

                {/* Current time indicator */}
                {isToday && (() => {
                  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
                  const topPosition = (currentMinutes / 60) * hourHeight;

                  return (
                    <div
                      className="absolute left-0 right-0 flex items-center pointer-events-none"
                      style={{ top: `${topPosition}px`, zIndex: 20 }}
                    >
                      <div className="w-2 h-2 bg-red-500 rounded-full -ml-1" />
                      <div className="flex-1 h-0.5 bg-red-500" />
                    </div>
                  );
                })()}

                {/* Creating event preview - Google Calendar style */}
                {creatingEvent &&
                  creatingEvent.date.toDateString() === date.toDateString() &&
                  (() => {
                    const style = getTodoBlockStyle(creatingEvent.startTime, creatingEvent.endTime, hourHeight);
                    // Use the color of the category that will be assigned (cat-etc)
                    const defaultCategory = categories.find((c) => c.id === 'cat-etc');
                    const previewColor = defaultCategory?.color || '#9CA3AF';

                    // 편집 모드일 때
                    if (creatingEvent.isEditing) {
                      return (
                        <div
                          className="calendar-creating-event absolute py-1 pr-2 pl-1.5 rounded text-xs overflow-visible"
                          style={{
                            ...style,
                            zIndex: 25,
                            backgroundColor: previewColor,
                            borderLeft: '4px solid rgba(255, 255, 255, 0.6)',
                            color: 'white',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                          }}
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            value={editingEventText}
                            onChange={(e) => setEditingEventText(e.target.value)}
                            onKeyDown={(e) => {
                              e.stopPropagation();
                              if (e.key === 'Enter') {
                                handleConfirmCreate();
                              } else if (e.key === 'Escape') {
                                handleCancelCreate();
                              }
                            }}
                            onBlur={handleConfirmCreate}
                            placeholder="제목 입력"
                            style={{
                              color: 'white',
                              backgroundColor: 'rgba(255, 255, 255, 0.2)',
                              borderColor: 'rgba(255, 255, 255, 0.5)',
                            }}
                            className="w-full rounded px-2 py-0.5 font-semibold outline-none border-2 placeholder-white/70"
                            autoFocus
                          />
                          <div className="text-xs opacity-80 mt-1">
                            {creatingEvent.startTime} - {creatingEvent.endTime}
                          </div>
                        </div>
                      );
                    }

                    // 드래그 중일 때 (미리보기)
                    return (
                      <div
                        className="absolute py-1 pr-2 pl-1.5 rounded text-xs overflow-hidden pointer-events-none"
                        style={{
                          ...style,
                          zIndex: 15,
                          backgroundColor: previewColor,
                          borderLeft: '4px dashed rgba(255, 255, 255, 0.6)',
                          color: 'white',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                        }}
                      >
                        <div className="font-semibold">새 일정</div>
                        <div className="text-xs opacity-80">
                          {creatingEvent.startTime} - {creatingEvent.endTime}
                        </div>
                      </div>
                    );
                  })()}

                {/* Dragging preview - show on target date */}
                {draggingTodo &&
                  draggingTodo.currentDate.toDateString() === date.toDateString() &&
                  (() => {
                    const todo = todos.find(t => t.id === draggingTodo.id);
                    if (!todo) return null;

                    const category = categories.find((c) => c.id === todo.categoryId);
                    const style = getTodoBlockStyle(draggingTodo.currentStartTime, draggingTodo.currentEndTime, hourHeight);

                    return (
                      <div
                        className="absolute py-1 pr-2 pl-1.5 rounded text-xs overflow-visible pointer-events-none"
                        style={{
                          ...style,
                          backgroundColor: category?.color || '#3B82F6',
                          borderLeft: `4px dashed rgba(255, 255, 255, 0.6)`,
                          color: 'white',
                          zIndex: 25,
                          opacity: 0.9,
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        }}
                      >
                        <div className="font-semibold break-words">{todo.text || '(제목 없음)'}</div>
                        <div className="text-xs opacity-80">
                          {draggingTodo.currentStartTime} - {draggingTodo.currentEndTime}
                        </div>
                      </div>
                    );
                  })()}

                {/* Todo Blocks */}
                {dayTodos.map((todo) => {
                  const category = categories.find((c) => c.id === todo.categoryId);
                  const layout = eventLayout[todo.id] || { width: 100, left: 0 };

                  return (
                    <TodoBlock
                      key={todo.id}
                      todo={todo}
                      category={category}
                      date={date}
                      hourHeight={hourHeight}
                      layout={layout}
                      currentTime={currentTime}
                      editingTodoId={editingTodoId}
                      editingText={editingText}
                      setEditingText={setEditingText}
                      startEdit={startEdit}
                      handleFinishEdit={handleFinishEdit}
                      cancelEdit={cancelEdit}
                      handleToggleCompletion={handleToggleCompletion}
                      handleContextMenu={handleContextMenu}
                      handleTodoDragStart={handleTodoDragStart}
                      handleResizeStart={handleResizeStart}
                      resizingTodo={resizingTodo}
                      draggingTodo={draggingTodo}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Memoize CalendarGrid to prevent unnecessary re-renders
// This is important as it renders the entire calendar grid with many TodoBlocks
export const CalendarGrid = memo(CalendarGridComponent);
