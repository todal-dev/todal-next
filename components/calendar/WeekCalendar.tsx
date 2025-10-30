'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { RecurringEventDialog } from '@/components/ui/dialogs/RecurringEventDialog';
import { ContextMenu } from '@/components/ui/menus/ContextMenu';
import { SimpleContextMenu } from '@/components/ui/menus/SimpleContextMenu';
import { DeleteRecurringModal } from '@/components/ui/dialogs/DeleteRecurringModal';
import { CategoryChangeDialog } from '@/components/ui/dialogs/CategoryChangeDialog';
import { DateMoveDialog } from '@/components/ui/dialogs/DateMoveDialog';
import { DuplicateDialog } from '@/components/ui/dialogs/DuplicateDialog';
import { AddRecurringDialog } from '@/components/ui/dialogs/AddRecurringDialog';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { MobileDateHeader } from '@/components/calendar/MobileDateHeader';
import type { Todo } from '@/types/calendar';
import { getWeekDays, formatDateKey } from '@/utils/calendarUtils';
import { generateRecurringEvents } from '@/utils/recurringUtils';
import { useCalendarDrag } from '@/hooks/drag/useCalendarDrag';
import { useCalendarFilters } from '@/hooks/ui/useCalendarFilters';
import { useHourHeight } from '@/hooks/ui/useHourHeight';
import { useInlineEdit } from '@/hooks/state/useInlineEdit';
import { useDialogs } from '@/hooks/state/useDialogs';
import { useResizeTodo } from '@/hooks/drag/useResizeTodo';
import { useTodoDrag } from '@/hooks/drag/useTodoDrag';
import { useContextMenu } from '@/hooks/state/useContextMenu';
import { useTodoContext } from '@/contexts/TodoContext';
import { useCategoryContext } from '@/contexts/CategoryContext';
import { useHolidays } from '@/hooks/data/useHolidays';

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
  const { isHoliday } = useHolidays();
  
  // 모바일 FAB 다이얼로그
  const [showMobileFAB, setShowMobileFAB] = useState(false);
  
  // 모바일 화면 감지
  useEffect(() => {
    const checkMobile = () => {
      setShowMobileFAB(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
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
  const [selectedRecurringDate, setSelectedRecurringDate] = useState<Date | null>(null);

  // Hour height with localStorage and zoom functionality
  const hourHeight = useHourHeight();

  // Current time tracking (업데이트 최적화 - 현재 시간 라인이 표시될 때만)
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCurrentWeek, setIsCurrentWeek] = useState(false);

  useEffect(() => {
    // 현재 주인지 확인
    const today = new Date();
    const weekStart = new Date(currentWeekStart);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    const isCurrent = today >= weekStart && today < weekEnd;
    setIsCurrentWeek(isCurrent);
    
    // 현재 주일 때만 타이머 시작
    if (!isCurrent) return;
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [currentWeekStart]); // currentWeekStart 변경 시 재확인

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
      const isoDatePart = todoId.substring(recurringId.length + 1);
      const eventDate = new Date(isoDatePart);

      setSelectedRecurringTodoId(recurringId);
      setSelectedRecurringDate(eventDate);
      setDeleteRecurringModalOpen(true);
      closeRecurringContextMenu();
    }
  }, [recurringContextMenu.todoId, closeRecurringContextMenu]);

  const handleSkipRecurringInstanceAction = useCallback(() => {
    if (selectedRecurringTodoId && selectedRecurringDate) {
      onSkipRecurringInstance(selectedRecurringTodoId, selectedRecurringDate);
      setDeleteRecurringModalOpen(false);
      setSelectedRecurringTodoId('');
      setSelectedRecurringDate(null);
    }
  }, [selectedRecurringTodoId, selectedRecurringDate, onSkipRecurringInstance]);

  const handleDeleteRecurringAfterAction = useCallback(() => {
    if (selectedRecurringTodoId && selectedRecurringDate) {
      onDeleteRecurringAfter(selectedRecurringTodoId, selectedRecurringDate);
      setDeleteRecurringModalOpen(false);
      setSelectedRecurringTodoId('');
      setSelectedRecurringDate(null);
    }
  }, [selectedRecurringTodoId, selectedRecurringDate, onDeleteRecurringAfter]);

  const handleDeleteAllRecurring = useCallback(() => {
    if (selectedRecurringTodoId) {
      onDeleteTodo(selectedRecurringTodoId);
      setDeleteRecurringModalOpen(false);
      setSelectedRecurringTodoId('');
      setSelectedRecurringDate(null);
    }
  }, [selectedRecurringTodoId, onDeleteTodo]);

  // Calendar drag hook (event creation)
  const { 
    creatingEvent, 
    editingEventText,
    setEditingEventText,
    handleDragStart: handleCalendarDragStart, 
    handleDragMove: handleCalendarDragMove, 
    handleDragEnd: handleCalendarDragEnd,
    handleConfirmCreate,
    handleCancelCreate,
  } = useCalendarDrag({
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

        // 하위 항목은 캘린더에 표시하지 않음 (부모 항목만 표시)
        if (todo.parentId) {
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

      const newCompletedState = !todo.completed;

      // 부모 할일 완료 처리
      onEditTodo?.(todoId, { completed: newCompletedState });

      // 하위 항목도 함께 완료 처리
      const toggleSubtasks = (subtasks?: typeof todos) => {
        if (!subtasks || subtasks.length === 0) return;

        subtasks.forEach(subtask => {
          onEditTodo?.(subtask.id, { completed: newCompletedState });
          // 재귀적으로 하위의 하위 항목도 처리
          if (subtask.subtasks && subtask.subtasks.length > 0) {
            toggleSubtasks(subtask.subtasks);
          }
        });
      };

      toggleSubtasks(todo.subtasks);
    }
  }, [todos, onEditTodo, onToggleRecurringInstance]);

  // FAB 클릭 핸들러 - 새 일정 추가
  const [showQuickAddDialog, setShowQuickAddDialog] = useState(false);
  
  const handleFABClick = () => {
    setShowQuickAddDialog(true);
  };

  return (
    <div className="flex flex-col h-full bg-warm-white dark:bg-dark-ocean-panel relative transition-colors">
      {/* Mobile Date Header - Mobile only */}
      <MobileDateHeader
        currentWeekStart={currentWeekStart}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        onDateSelect={(date) => setCurrentWeekStart(date)}
      />

      {/* Calendar Header - Desktop only */}
      <div className="hidden md:block">
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
      </div>

      {/* Calendar Grid */}
      <CalendarGrid
        weekDays={weekDays}
        weekTodos={weekTodos}
        todos={todos}
        categories={categories}
        hourHeight={hourHeight}
        hours={hours}
        dayNames={dayNames}
        currentTime={isCurrentWeek ? currentTime : undefined}
        gridScrollRef={gridScrollRef}
        creatingEvent={creatingEvent}
        editingEventText={editingEventText}
        setEditingEventText={setEditingEventText}
        handleCalendarDragStart={handleCalendarDragStart}
        handleCalendarDragMove={handleCalendarDragMove}
        handleCalendarDragEnd={handleCalendarDragEnd}
        handleConfirmCreate={handleConfirmCreate}
        handleCancelCreate={handleCancelCreate}
        onUpdateTodoDateTime={onUpdateTodoDateTime}
        draggingTodo={draggingTodo}
        resizingTodo={resizingTodo}
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
        isHoliday={isHoliday}
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
        onClose={() => {
          setDeleteRecurringModalOpen(false);
          setSelectedRecurringTodoId('');
          setSelectedRecurringDate(null);
        }}
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

      {/* Mobile FAB - Only show on mobile */}
      {showMobileFAB && (
        <FloatingActionButton 
          onClick={handleFABClick}
          label="새 일정 추가"
        />
      )}

      {/* Quick Add Dialog for Mobile FAB */}
      <AddRecurringDialog
        isOpen={showQuickAddDialog}
        onClose={() => setShowQuickAddDialog(false)}
        onConfirm={(text, startTime, endTime, recurrenceRule, categoryId) => {
          // 일반 일정 추가
          onAddTodo?.({
            text,
            date: selectedDate,
            startTime,
            endTime,
            categoryId,
            completed: false,
            subtasks: [],
            recurrenceRule: recurrenceRule?.frequency ? recurrenceRule : undefined,
          });
          setShowQuickAddDialog(false);
        }}
        selectedDate={selectedDate}
        categories={categories}
      />
    </div>
  );
}
