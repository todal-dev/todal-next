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
  currentTime?: Date; // optional로 변경 (현재 주가 아닐 때는 undefined)
  selectedDate?: Date; // 선택된 날짜
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
  startEdit: (id: string, text: string) => void;
  handleFinishEdit: () => void;
  cancelEdit: () => void;
  handleToggleCompletion: (todoId: string) => void;
  handleContextMenu: (e: React.MouseEvent, todoId: string) => void;
  handleTodoDragStart: (e: React.MouseEvent, todoId: string, date: Date, startTime: string, endTime: string) => void;
  handleResizeStart: (e: React.MouseEvent, todoId: string, direction: 'top' | 'bottom', startTime: string, endTime: string) => void;
  isHoliday: (date: Date) => boolean;
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
  selectedDate,
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
  startEdit,
  handleFinishEdit,
  cancelEdit,
  handleToggleCompletion,
  handleContextMenu,
  handleTodoDragStart,
  handleResizeStart,
  isHoliday,
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
    <div ref={gridScrollRef} className="flex-1 overflow-y-auto overflow-x-hidden calendar-grid touch-pan-y scrollbar-hide-mobile">
      {/* Week Days Header - Fixed at top */}
      <div className="sticky top-0 z-20 bg-warm-white dark:bg-dark-ocean-panel border-b border-gray-200 dark:border-gray-600 transition-colors">
        <div className="flex w-full">
          <div className="w-12 sm:w-14 md:w-18 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-600 shrink-0 sticky left-0 z-30" />
          <div className="flex flex-1">
            {weekDays.map((date, index) => {
              const isToday =
                date.getDate() === new Date().getDate() &&
                date.getMonth() === new Date().getMonth() &&
                date.getFullYear() === new Date().getFullYear();
              
              const isSelected =
                selectedDate &&
                date.getDate() === selectedDate.getDate() &&
                date.getMonth() === selectedDate.getMonth() &&
                date.getFullYear() === selectedDate.getFullYear();
              
              const isSunday = date.getDay() === 0;
              const isSaturday = date.getDay() === 6;
              const holiday = isHoliday(date);

              return (
                <div
                  key={index}
                  className={`flex-1 text-center py-1.5 sm:py-2 md:py-3 border-r border-gray-200 dark:border-gray-600 flex flex-col items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600'
                      : isToday
                      ? 'bg-primary-100 dark:bg-primary-900/50 ring-2 ring-inset ring-primary-200 dark:ring-primary-700'
                      : ''
                  }`}
                >
                  <div 
                    className={`text-[9px] sm:text-[11px] md:text-caption font-medium mb-0.5 ${
                      isSelected
                        ? 'text-white'
                        : isToday
                        ? 'text-primary-700 dark:text-primary-300'
                        : isSunday || holiday 
                        ? 'text-red-500 dark:text-red-400' 
                        : isSaturday 
                        ? 'text-blue-500 dark:text-blue-400' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {dayNames[date.getDay()]}
                  </div>
                  <div className="text-xs sm:text-sm md:text-h3 font-semibold">
                    <div
                      className={`${
                        isSelected
                          ? 'text-white'
                          : isToday 
                          ? 'text-primary-700 dark:text-primary-300' 
                          : isSunday || holiday
                          ? 'text-red-500 dark:text-red-400'
                          : isSaturday
                          ? 'text-blue-500 dark:text-blue-400'
                          : 'text-gray-900 dark:text-gray-50'
                      }`}
                    >
                      {date.getDate()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Time Grid */}
      <div className="flex w-full" style={{ height: `${hourHeight * 24}px` }}>
        {/* Time Column */}
        <div className="w-12 sm:w-14 md:w-18 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-600 shrink-0 sticky left-0 z-10 transition-colors">
          {hours.map((hour) => {
            // 모든 화면 크기에서 "오전/오후" 형식 사용 (0시는 제외)
            const displayTime = hour === 0 ? ''
              : hour < 12 ? `오전 ${hour}시`
              : hour === 12 ? '오후 12시'
              : `오후 ${hour - 12}시`;

            // 현재 시간이 있는 시간대의 구분선 숨기기 (구글 캘린더 스타일)
            const isCurrentTimeHour = currentTime && currentTime.getHours() === hour;
            const shouldHideBorder = isCurrentTimeHour;

            return (
              <div
                key={hour}
                className={`text-[8px] sm:text-[10px] md:text-caption text-gray-600 dark:text-gray-400 px-0.5 text-center font-medium bg-gray-50 dark:bg-gray-900 leading-none flex items-start justify-center relative ${shouldHideBorder ? '' : 'border-b border-gray-200 dark:border-gray-700'}`}
                style={{ height: `${hourHeight}px` }}
              >
                <span className="relative z-10 bg-gray-50 dark:bg-gray-900 px-0.5" style={{ marginTop: '-3px', lineHeight: '1', transform: 'translateY(-2px)' }}>{displayTime}</span>
              </div>
            );
          })}
        </div>

        {/* Days Grid */}
        <div className="flex flex-1">
          {weekDays.map((date, dayIndex) => {
            const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const dayTodos = weekTodos[dateKey] || [];

            // Use pre-calculated layout for better performance
            const eventLayout = allEventLayouts[dateKey] || {};

            const isToday = currentTime &&
              date.getDate() === currentTime.getDate() &&
              date.getMonth() === currentTime.getMonth() &&
              date.getFullYear() === currentTime.getFullYear();

            const isSelected =
              selectedDate &&
              date.getDate() === selectedDate.getDate() &&
              date.getMonth() === selectedDate.getMonth() &&
              date.getFullYear() === selectedDate.getFullYear();

            const isDraggingOverThisDay = draggingTodo &&
              draggingTodo.currentDate.toDateString() === date.toDateString();

            return (
              <div
                key={dayIndex}
                className={`flex-1 border-r border-gray-200 dark:border-gray-600 relative calendar-day-column transition-colors ${
                  isDraggingOverThisDay ? 'bg-primary-50 dark:bg-primary-900/30' : ''
                }`}
              >
                {/* Time Grid Background */}
                {hours.map((hour) => {
                  // 현재 시간이 있는 시간대의 구분선 숨기기 (구글 캘린더 스타일)
                  const isCurrentTimeHour = isToday && currentTime && currentTime.getHours() === hour;
                  const shouldHideBorder = isCurrentTimeHour;
                  
                  return (
                  <div
                    key={`${dayIndex}-${hour}`}
                    data-hour={hour}
                    className={`${shouldHideBorder ? '' : 'border-b border-gray-100 dark:border-gray-700'} hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer`}
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
                  );
                })}

                {/* Current time indicator */}
                {isToday && currentTime && (() => {
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
