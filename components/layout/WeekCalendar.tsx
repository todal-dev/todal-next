'use client';

import { ChevronLeft, ChevronRight, Repeat, Check, ChevronDown, Filter } from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { RecurringEventDialog } from '@/components/ui/RecurringEventDialog';
import { ContextMenu } from '@/components/ui/ContextMenu';
import { CategoryChangeDialog } from '@/components/ui/CategoryChangeDialog';
import { DateMoveDialog } from '@/components/ui/DateMoveDialog';
import { DuplicateDialog } from '@/components/ui/DuplicateDialog';
import type { BigCalendarProps, Todo } from '@/types/calendar';
import { getWeekDays, roundToQuarterHour, getTodoBlockStyle } from '@/utils/calendarUtils';
import { calculateEventLayout } from '@/utils/eventLayoutUtils';
import { generateRecurringEvents } from '@/utils/recurringUtils';
import { useCalendarDrag } from '@/hooks/useCalendarDrag';
import { useCalendarFilters } from '@/hooks/useCalendarFilters';
import { useHourHeight } from '@/hooks/useHourHeight';
import { useInlineEdit } from '@/hooks/useInlineEdit';
import { useDialogs } from '@/hooks/useDialogs';
import { useResizeTodo } from '@/hooks/useResizeTodo';
import { useTodoDrag } from '@/hooks/useTodoDrag';

export function BigCalendar({
  selectedDate = new Date(),
  todos = [],
  categories = [],
  onUpdateTodoDateTime,
  onAddTodo,
  onEditTodo,
  onDeleteTodo,
  onMoveTodo,
}: BigCalendarProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const date = new Date(selectedDate);
    const day = date.getDay();
    const diff = date.getDate() - day;
    return new Date(date.setDate(diff));
  });

  // Hour height with localStorage and zoom functionality
  const hourHeight = useHourHeight();

  // Current time tracking
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    todoId: string;
  }>({ isOpen: false, x: 0, y: 0, todoId: '' });

  // Dialog states
  const {
    categoryDialog,
    dateDialog,
    duplicateDialog,
    recurringDialog,
    openCategoryDialog,
    closeCategoryDialog,
    openDateDialog,
    closeDateDialog,
    openDuplicateDialog,
    closeDuplicateDialog,
    openRecurringDialog,
    closeRecurringDialog,
  } = useDialogs();

  // Inline editing state
  const {
    editingTodoId,
    editingText,
    setEditingText,
    setPendingEditId,
    startEdit,
    finishEdit: handleFinishEdit,
    cancelEdit,
  } = useInlineEdit({ todos, onEditTodo, onDeleteTodo });

  // Calendar drag hook (event creation)
  const { creatingEvent, handleDragStart: handleCalendarDragStart, handleDragMove: handleCalendarDragMove, handleDragEnd: handleCalendarDragEnd } = useCalendarDrag({
    hourHeight,
    onAddTodo,
    onFinishEdit: () => {
      handleFinishEdit();
    },
  });

  // Calculate week days
  const weekDays = useMemo(() => getWeekDays(currentWeekStart), [currentWeekStart]);

  // Ref for calendar grid
  const gridScrollRef = useRef<HTMLDivElement>(null);

  // Resize functionality
  const { resizingTodo, handleResizeStart } = useResizeTodo({
    hourHeight,
    gridScrollRef,
    onEditTodo,
  });

  // Todo drag functionality
  const { draggingTodo, handleTodoDragStart } = useTodoDrag({
    hourHeight,
    gridScrollRef,
    weekDays,
    onUpdateTodoDateTime,
    onEditTodo,
  });

  // Filter states
  const {
    selectedCategories,
    completionFilter,
    showCategoryFilter,
    setShowCategoryFilter,
    showCompletionFilter,
    setShowCompletionFilter,
    handleCategoryToggle,
    handleCompletionFilterChange,
  } = useCalendarFilters();

  // Close filter dropdowns when clicking outside
  useEffect(() => {
    if (!showCategoryFilter && !showCompletionFilter) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Check if click is outside filter dropdowns
      if (!target.closest('.filter-dropdown-container')) {
        setShowCategoryFilter(false);
        setShowCompletionFilter(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCategoryFilter, showCompletionFilter]);


  const handlePrevWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const monthName = currentWeekStart.toLocaleString('ko-KR', { month: 'long' });
  const year = currentWeekStart.getFullYear();

  // Filter and group todos for the week
  const weekTodos = useMemo(() => {
    const grouped: Record<string, Todo[]> = {};

    // Expand recurring events
    const allTodos: Todo[] = [];
    todos.forEach((todo) => {
      if (todo.recurrenceRule) {
        allTodos.push(...generateRecurringEvents(todo, weekDays));
      } else {
        allTodos.push(todo);
      }
    });

    weekDays.forEach((day) => {
      const dateKey = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
      grouped[dateKey] = allTodos.filter((todo) => {
        const todoDateKey = `${todo.date.getFullYear()}-${String(todo.date.getMonth() + 1).padStart(2, '0')}-${String(todo.date.getDate()).padStart(2, '0')}`;
        if (todoDateKey !== dateKey || !todo.startTime || !todo.endTime) {
          return false;
        }

        // Apply category filter
        if (selectedCategories.length > 0 && !selectedCategories.includes(todo.categoryId)) {
          return false;
        }

        // Apply completion filter
        if (completionFilter === 'completed' && !todo.completed) {
          return false;
        }
        if (completionFilter === 'incomplete' && todo.completed) {
          return false;
        }

        return true;
      });
    });

    return grouped;
  }, [todos, weekDays, selectedCategories, completionFilter]);


  // Context menu handlers
  const handleContextMenu = (e: React.MouseEvent, todoId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Finish editing before opening context menu
    if (editingTodoId) {
      handleFinishEdit();
    }
    
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      todoId,
    });
  };

  const handleDuplicate = () => {
    const todo = todos.find((t) => t.id === contextMenu.todoId);
    if (!todo) return;

    openDuplicateDialog(todo.id, todo.text);
  };

  const handleConfirmDuplicate = () => {
    const todo = todos.find((t) => t.id === duplicateDialog.todoId);
    if (!todo) return;

    onAddTodo?.({
      text: todo.text,
      completed: false,
      date: todo.date,
      categoryId: todo.categoryId,
      startTime: todo.startTime,
      endTime: todo.endTime,
    });
  };

  const handleDelete = () => {
    const todo = todos.find((t) => t.id === contextMenu.todoId);
    if (!todo) return;

    if (todo.recurrenceId) {
      openRecurringDialog(todo.id, 'delete');
    } else {
      onDeleteTodo?.(todo.id);
    }
  };

  const handleMove = () => {
    const todo = todos.find((t) => t.id === contextMenu.todoId);
    if (!todo) return;

    openDateDialog(todo.id, todo.date);
  };

  const handleConfirmMove = (newDate: Date) => {
    onMoveTodo?.(dateDialog.todoId, newDate);
  };

  const handleChangeCategory = () => {
    const todo = todos.find((t) => t.id === contextMenu.todoId);
    if (!todo) return;

    openCategoryDialog(todo.id, todo.categoryId);
  };

  const handleConfirmCategoryChange = (categoryId: string) => {
    onEditTodo?.(categoryDialog.todoId, { categoryId });
  };

  const handleRename = () => {
    const todo = todos.find((t) => t.id === contextMenu.todoId);
    if (!todo) return;

    startEdit(todo.id, todo.text);
  };

  const handleSetRecurrence = () => {
    // This would open a recurrence settings dialog
    // For now, just placeholder
    console.log('Set recurrence for', contextMenu.todoId);
  };

  // Toggle todo completion
  const handleToggleCompletion = (todoId: string) => {
    const todo = todos.find(t => t.id === todoId);
    if (todo) {
      onEditTodo?.(todoId, { completed: !todo.completed });
    }
  };



  return (
    <div className="flex flex-col h-full bg-white">
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-gray-300">
        <h2 className="text-heading-2 text-neutral-text-primary">
          {year}년 {monthName}
        </h2>
        <div className="flex items-center gap-3">
          {/* Category Filter */}
          <div className="relative filter-dropdown-container">
            <button
              onClick={() => {
                setShowCategoryFilter(!showCategoryFilter);
                setShowCompletionFilter(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-sm border border-neutral-gray-300 rounded-md hover:bg-neutral-gray-50 transition-colors"
            >
              <Filter size={16} className="text-neutral-text-secondary" />
              <span className="text-neutral-text-primary">카테고리</span>
              {selectedCategories.length > 0 && (
                <span className="px-1.5 py-0.5 text-xs bg-primary-500 text-white rounded-full">
                  {selectedCategories.length}
                </span>
              )}
              <ChevronDown size={16} className="text-neutral-text-secondary" />
            </button>

            {showCategoryFilter && (
              <div className="absolute top-full mt-1 right-0 bg-white border border-neutral-gray-300 rounded-md shadow-lg z-50 min-w-[200px]">
                <div className="py-1">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryToggle(category.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-neutral-gray-50 transition-colors text-left"
                    >
                      <div
                        className="w-4 h-4 rounded border-2 flex items-center justify-center"
                        style={{
                          borderColor: category.color,
                          backgroundColor: selectedCategories.includes(category.id) ? category.color : 'transparent'
                        }}
                      >
                        {selectedCategories.includes(category.id) && (
                          <Check size={12} className="text-white" />
                        )}
                      </div>
                      <span className="text-sm text-neutral-text-primary">{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Completion Filter */}
          <div className="relative filter-dropdown-container">
            <button
              onClick={() => {
                setShowCompletionFilter(!showCompletionFilter);
                setShowCategoryFilter(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-sm border border-neutral-gray-300 rounded-md hover:bg-neutral-gray-50 transition-colors"
            >
              <span className="text-neutral-text-primary">
                {completionFilter === 'all' ? '전체' : completionFilter === 'completed' ? '완료' : '미완료'}
              </span>
              <ChevronDown size={16} className="text-neutral-text-secondary" />
            </button>

            {showCompletionFilter && (
              <div className="absolute top-full mt-1 right-0 bg-white border border-neutral-gray-300 rounded-md shadow-lg z-50 min-w-[120px]">
                <div className="py-1">
                  <button
                    onClick={() => handleCompletionFilterChange('all')}
                    className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-neutral-gray-50 transition-colors text-left ${
                      completionFilter === 'all' ? 'bg-primary-50' : ''
                    }`}
                  >
                    <span className="text-sm text-neutral-text-primary">전체</span>
                  </button>
                  <button
                    onClick={() => handleCompletionFilterChange('completed')}
                    className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-neutral-gray-50 transition-colors text-left ${
                      completionFilter === 'completed' ? 'bg-primary-50' : ''
                    }`}
                  >
                    <span className="text-sm text-neutral-text-primary">완료</span>
                  </button>
                  <button
                    onClick={() => handleCompletionFilterChange('incomplete')}
                    className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-neutral-gray-50 transition-colors text-left ${
                      completionFilter === 'incomplete' ? 'bg-primary-50' : ''
                    }`}
                  >
                    <span className="text-sm text-neutral-text-primary">미완료</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Week Navigation */}
          <div className="flex gap-2">
            <button
              onClick={handlePrevWeek}
              className="p-2 hover:bg-neutral-gray-100 rounded-md transition-colors cursor-pointer"
              aria-label="이전 주"
            >
              <ChevronLeft size={20} className="text-neutral-text-secondary" />
            </button>
            <button
              onClick={handleNextWeek}
              className="p-2 hover:bg-neutral-gray-100 rounded-md transition-colors cursor-pointer"
              aria-label="다음 주"
            >
              <ChevronRight size={20} className="text-neutral-text-secondary" />
            </button>
          </div>
        </div>
      </div>

      {/* Combined Calendar Grid with Header */}
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

              // Calculate layout for overlapping events
              const eventLayout = calculateEventLayout(dayTodos);

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
                      onMouseUp={() => handleCalendarDragEnd(setPendingEditId)}
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

                    // Get layout info for overlapping events
                    const layout = eventLayout[todo.id] || { width: 100, left: 0 };
                    const style = getTodoBlockStyle(displayStartTime, displayEndTime, hourHeight, layout.width, layout.left);
                    const isRecurring = !!todo.recurrenceId;

                    return (
                      <div
                        key={todo.id}
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
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Context Menu */}
      <ContextMenu
        isOpen={contextMenu.isOpen}
        x={contextMenu.x}
        y={contextMenu.y}
        onClose={() => setContextMenu({ ...contextMenu, isOpen: false })}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        onMove={handleMove}
        onChangeCategory={handleChangeCategory}
        onRename={handleRename}
        onSetRecurrence={handleSetRecurrence}
      />

      {/* Category Change Dialog */}
      <CategoryChangeDialog
        isOpen={categoryDialog.isOpen}
        currentCategoryId={categoryDialog.currentCategoryId}
        categories={categories}
        onClose={closeCategoryDialog}
        onConfirm={handleConfirmCategoryChange}
      />

      {/* Date Move Dialog */}
      <DateMoveDialog
        isOpen={dateDialog.isOpen}
        currentDate={dateDialog.currentDate}
        onClose={closeDateDialog}
        onConfirm={handleConfirmMove}
      />

      {/* Duplicate Dialog */}
      <DuplicateDialog
        isOpen={duplicateDialog.isOpen}
        todoName={duplicateDialog.todoName}
        onClose={closeDuplicateDialog}
        onConfirm={handleConfirmDuplicate}
      />

      {/* Recurring Event Dialog */}
      <RecurringEventDialog
        isOpen={recurringDialog.isOpen}
        title={recurringDialog.action === 'delete' ? '반복 일정 삭제' : '반복 일정 수정'}
        onClose={closeRecurringDialog}
        onSelectThis={() => {
          const todo = todos.find((t) => t.id === recurringDialog.todoId);
          if (todo && recurringDialog.action === 'delete') {
            onDeleteTodo?.(todo.id);
          }
          closeRecurringDialog();
        }}
        onSelectAll={() => {
          const todo = todos.find((t) => t.id === recurringDialog.todoId);
          if (todo && todo.recurrenceId && recurringDialog.action === 'delete') {
            onDeleteTodo?.(todo.recurrenceId);
          }
          closeRecurringDialog();
        }}
      />
    </div>
  );
}

