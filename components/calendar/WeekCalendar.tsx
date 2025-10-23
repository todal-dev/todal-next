'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { RecurringEventDialog } from '@/components/ui/RecurringEventDialog';
import { ContextMenu } from '@/components/ui/ContextMenu';
import { SimpleContextMenu } from '@/components/ui/SimpleContextMenu';
import { DeleteRecurringModal } from '@/components/ui/DeleteRecurringModal';
import { CategoryChangeDialog } from '@/components/ui/CategoryChangeDialog';
import { DateMoveDialog } from '@/components/ui/DateMoveDialog';
import { DuplicateDialog } from '@/components/ui/DuplicateDialog';
import { AddRecurringDialog } from '@/components/ui/AddRecurringDialog';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import type { Todo } from '@/types/calendar';
import { getWeekDays, formatDateKey } from '@/utils/calendarUtils';
import { generateRecurringEvents } from '@/utils/recurringUtils';
import { useCalendarDrag } from '@/hooks/useCalendarDrag';
import { useCalendarFilters } from '@/hooks/useCalendarFilters';
import { useHourHeight } from '@/hooks/useHourHeight';
import { useInlineEdit } from '@/hooks/useInlineEdit';
import { useDialogs } from '@/hooks/useDialogs';
import { useResizeTodo } from '@/hooks/useResizeTodo';
import { useTodoDrag } from '@/hooks/useTodoDrag';
import { useContextMenu } from '@/hooks/useContextMenu';
import { useTodoContext } from '@/contexts/TodoContext';
import { useCategoryContext } from '@/contexts/CategoryContext';

export function BigCalendar() {
  // Get values from contexts
  const {
    selectedDate,
    todos,
    onUpdateTodoDateTime,
    onAddTodoFromCalendar: onAddTodo,
    onUpdateTodo: onEditTodo,
    onDeleteTodo,
    onMoveTodoToDate: onMoveTodo,
    onToggleRecurringInstance,
    onSkipRecurringInstance,
    onDeleteRecurringAfter,
  } = useTodoContext();

  const { categories, onEditRecurring } = useCategoryContext();
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const date = new Date(selectedDate);
    const day = date.getDay();
    const diff = date.getDate() - day;
    return new Date(date.setDate(diff));
  });

  // Recurring context menu and modal states
  const [recurringContextMenu, setRecurringContextMenu] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    todoId: string;
  }>({ isOpen: false, x: 0, y: 0, todoId: '' });

  const [deleteRecurringModalOpen, setDeleteRecurringModalOpen] = useState(false);
  const [editRecurringDialogOpen, setEditRecurringDialogOpen] = useState(false);
  const [selectedRecurringTodoId, setSelectedRecurringTodoId] = useState<string>('');

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

  // Context menu with all handlers
  const {
    contextMenu,
    handleContextMenu: handleNormalContextMenu,
    closeContextMenu,
    handleConfirmDuplicate,
    handleDuplicate,
    handleDelete,
    handleMove,
    handleChangeCategory,
    handleRename,
    handleSetRecurrence,
  } = useContextMenu({
    todos,
    onAddTodo,
    onDeleteTodo,
    onMoveTodo,
    openCategoryDialog,
    openDateDialog,
    openDuplicateDialog,
    openRecurringDialog,
    startEdit,
    finishEdit: handleFinishEdit,
  });

  // Override handleContextMenu to check for recurring events
  const handleContextMenu = useCallback((e: React.MouseEvent, todoId: string) => {
    // Check if it's a recurring event (generated ID pattern: recurring-timestamp-ISODate)
    const isRecurringEvent = todoId.startsWith('recurring-') && todoId.split('-').length > 2;

    if (isRecurringEvent) {
      // Open recurring context menu
      e.preventDefault();
      e.stopPropagation();
      handleFinishEdit();

      setRecurringContextMenu({
        isOpen: true,
        x: e.clientX,
        y: e.clientY,
        todoId,
      });
    } else {
      // Use normal context menu
      handleNormalContextMenu(e, todoId);
    }
  }, [handleNormalContextMenu, handleFinishEdit]);

  // Recurring context menu handlers
  const closeRecurringContextMenu = useCallback(() => {
    setRecurringContextMenu({ ...recurringContextMenu, isOpen: false });
  }, [recurringContextMenu]);

  const handleEditRecurringClick = useCallback(() => {
    const todoId = recurringContextMenu.todoId;
    // Extract original recurring ID
    if (todoId.startsWith('recurring-') && todoId.split('-').length > 2) {
      const parts = todoId.split('-');
      const recurringId = `${parts[0]}-${parts[1]}`;

      setSelectedRecurringTodoId(recurringId);
      setEditRecurringDialogOpen(true);
      closeRecurringContextMenu();
    }
  }, [recurringContextMenu.todoId, closeRecurringContextMenu]);

  const handleDeleteRecurringClick = useCallback(() => {
    const todoId = recurringContextMenu.todoId;
    // Extract original recurring ID and date
    if (todoId.startsWith('recurring-') && todoId.split('-').length > 2) {
      const parts = todoId.split('-');
      const recurringId = `${parts[0]}-${parts[1]}`;

      setSelectedRecurringTodoId(recurringId);
      setDeleteRecurringModalOpen(true);
      closeRecurringContextMenu();
    }
  }, [recurringContextMenu.todoId, closeRecurringContextMenu]);

  const handleSkipRecurringInstanceAction = useCallback(() => {
    const todoId = selectedRecurringTodoId;
    // Get the date from recurring context menu todoId
    const fullTodoId = recurringContextMenu.todoId;
    if (fullTodoId.startsWith('recurring-') && fullTodoId.split('-').length > 2) {
      const parts = fullTodoId.split('-');
      const recurringId = `${parts[0]}-${parts[1]}`;
      const isoDatePart = fullTodoId.substring(recurringId.length + 1);
      const eventDate = new Date(isoDatePart);

      onSkipRecurringInstance(todoId, eventDate);
    }
  }, [selectedRecurringTodoId, recurringContextMenu.todoId, onSkipRecurringInstance]);

  const handleDeleteRecurringAfterAction = useCallback(() => {
    const todoId = selectedRecurringTodoId;
    // Get the date from recurring context menu todoId
    const fullTodoId = recurringContextMenu.todoId;
    if (fullTodoId.startsWith('recurring-') && fullTodoId.split('-').length > 2) {
      const parts = fullTodoId.split('-');
      const recurringId = `${parts[0]}-${parts[1]}`;
      const isoDatePart = fullTodoId.substring(recurringId.length + 1);
      const eventDate = new Date(isoDatePart);

      onDeleteRecurringAfter(todoId, eventDate);
    }
  }, [selectedRecurringTodoId, recurringContextMenu.todoId, onDeleteRecurringAfter]);

  const handleDeleteAllRecurring = useCallback(() => {
    onDeleteTodo(selectedRecurringTodoId);
  }, [selectedRecurringTodoId, onDeleteTodo]);

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
  }, [showCategoryFilter, showCompletionFilter, setShowCategoryFilter, setShowCompletionFilter]);

  // Memoize handlers to prevent unnecessary re-renders
  const handlePrevWeek = useCallback(() => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  }, [currentWeekStart]);

  const handleNextWeek = useCallback(() => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  }, [currentWeekStart]);

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
        // 반복 이벤트 생성
        const generatedEvents = generateRecurringEvents(todo, weekDays);
        // 각 생성된 이벤트에 completedDates 기반으로 completed 설정
        generatedEvents.forEach(event => {
          const isCompleted = todo.completedDates?.includes(formatDateKey(event.date)) || false;
          allTodos.push({
            ...event,
            completed: isCompleted
          });
        });
      } else {
        // 일반 할일만 추가
        allTodos.push(todo);
      }
    });

    weekDays.forEach((day) => {
      const dateKey = formatDateKey(day);
      grouped[dateKey] = allTodos.filter((todo) => {
        const todoDateKey = formatDateKey(todo.date);
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

  // Memoize dialog handlers
  const handleConfirmMove = useCallback((newDate: Date) => {
    onMoveTodo?.(dateDialog.todoId, newDate);
  }, [onMoveTodo, dateDialog.todoId]);

  const handleConfirmCategoryChange = useCallback((categoryId: string) => {
    onEditTodo?.(categoryDialog.todoId, { categoryId });
  }, [onEditTodo, categoryDialog.todoId]);

  const handleConfirmDuplicateAction = useCallback(() => {
    handleConfirmDuplicate(duplicateDialog.todoId);
  }, [handleConfirmDuplicate, duplicateDialog.todoId]);

  // Memoize toggle completion handler
  const handleToggleCompletion = useCallback((todoId: string) => {
    // 반복 일정에서 생성된 이벤트인지 확인 (ID 패턴: recurring-timestamp-ISODate)
    if (todoId.startsWith('recurring-') && todoId.split('-').length > 2) {
      // 생성된 반복 이벤트 - 원본 ID 추출
      const parts = todoId.split('-');
      const recurringId = `${parts[0]}-${parts[1]}`; // "recurring-timestamp" 형태

      // 원본 할일 찾기
      const originalTodo = todos.find(t => t.id === recurringId);
      if (!originalTodo) return;

      // 해당 날짜 찾기
      const isoDatePart = todoId.substring(recurringId.length + 1);
      const eventDate = new Date(isoDatePart);

      // completedDates 토글
      onToggleRecurringInstance?.(recurringId, eventDate);
    } else {
      // 일반 할일
      const todo = todos.find(t => t.id === todoId);
      if (!todo) return;
      onEditTodo?.(todoId, { completed: !todo.completed });
    }
  }, [todos, onEditTodo, onToggleRecurringInstance]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Calendar Header */}
      <CalendarHeader
        year={year}
        monthName={monthName}
        categories={categories}
        selectedCategories={selectedCategories}
        completionFilter={completionFilter}
        showCategoryFilter={showCategoryFilter}
        showCompletionFilter={showCompletionFilter}
        setShowCategoryFilter={setShowCategoryFilter}
        setShowCompletionFilter={setShowCompletionFilter}
        handleCategoryToggle={handleCategoryToggle}
        handleCompletionFilterChange={handleCompletionFilterChange}
        handlePrevWeek={handlePrevWeek}
        handleNextWeek={handleNextWeek}
      />

      {/* Calendar Grid */}
      <CalendarGrid
        weekDays={weekDays}
        weekTodos={weekTodos}
        todos={todos}
        categories={categories}
        hourHeight={hourHeight}
        hours={hours}
        dayNames={dayNames}
        currentTime={currentTime}
        gridScrollRef={gridScrollRef}
        creatingEvent={creatingEvent}
        handleCalendarDragStart={handleCalendarDragStart}
        handleCalendarDragMove={handleCalendarDragMove}
        handleCalendarDragEnd={handleCalendarDragEnd}
        onUpdateTodoDateTime={onUpdateTodoDateTime}
        draggingTodo={draggingTodo}
        resizingTodo={resizingTodo}
        editingTodoId={editingTodoId}
        editingText={editingText}
        setEditingText={setEditingText}
        setPendingEditId={setPendingEditId}
        startEdit={startEdit}
        handleFinishEdit={handleFinishEdit}
        cancelEdit={cancelEdit}
        handleToggleCompletion={handleToggleCompletion}
        handleContextMenu={handleContextMenu}
        handleTodoDragStart={handleTodoDragStart}
        handleResizeStart={handleResizeStart}
      />

      {/* Context Menu */}
      <ContextMenu
        isOpen={contextMenu.isOpen}
        x={contextMenu.x}
        y={contextMenu.y}
        onClose={closeContextMenu}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        onMove={handleMove}
        onChangeCategory={handleChangeCategory}
        onRename={handleRename}
        onSetRecurrence={handleSetRecurrence}
      />

      {/* Recurring Context Menu - Only Edit and Delete */}
      <SimpleContextMenu
        isOpen={recurringContextMenu.isOpen}
        x={recurringContextMenu.x}
        y={recurringContextMenu.y}
        onClose={closeRecurringContextMenu}
        onEdit={handleEditRecurringClick}
        onDelete={handleDeleteRecurringClick}
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
        onConfirm={handleConfirmDuplicateAction}
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
          const todoId = recurringDialog.todoId;
          if (recurringDialog.action === 'delete') {
            // 생성된 반복 이벤트인 경우 원본 ID 추출
            if (todoId.startsWith('recurring-') && todoId.split('-').length > 2) {
              const parts = todoId.split('-');
              const recurringId = `${parts[0]}-${parts[1]}`;
              onDeleteTodo?.(recurringId);
            } else {
              onDeleteTodo?.(todoId);
            }
          }
          closeRecurringDialog();
        }}
      />

      {/* Delete Recurring Modal */}
      <DeleteRecurringModal
        isOpen={deleteRecurringModalOpen}
        onClose={() => setDeleteRecurringModalOpen(false)}
        onSkipInstance={handleSkipRecurringInstanceAction}
        onDeleteAfter={handleDeleteRecurringAfterAction}
        onDeleteAll={handleDeleteAllRecurring}
      />

      {/* Edit Recurring Dialog */}
      <AddRecurringDialog
        isOpen={editRecurringDialogOpen}
        onClose={() => {
          setEditRecurringDialogOpen(false);
          setSelectedRecurringTodoId('');
        }}
        onConfirm={(text, startTime, endTime, recurrenceRule, categoryId) => {
          if (selectedRecurringTodoId) {
            onEditRecurring?.(selectedRecurringTodoId, text, startTime, endTime, recurrenceRule, categoryId);
          }
          setEditRecurringDialogOpen(false);
          setSelectedRecurringTodoId('');
        }}
        selectedDate={selectedDate}
        categories={categories}
        editingTodo={selectedRecurringTodoId ? (() => {
          const todo = todos.find(t => t.id === selectedRecurringTodoId);
          if (todo) {
            return {
              id: todo.id,
              text: todo.text,
              startTime: todo.startTime,
              endTime: todo.endTime,
              recurrenceRule: todo.recurrenceRule,
              categoryId: todo.categoryId,
            };
          }
          return undefined;
        })() : undefined}
      />
    </div>
  );
}
