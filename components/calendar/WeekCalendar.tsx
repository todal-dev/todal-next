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
import { TimeEditDialog } from '@/components/ui/dialogs/TimeEditDialog';
import { RecurringEditModal } from '@/components/ui/dialogs/RecurringEditModal';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { MobileDateHeader } from '@/components/calendar/MobileDateHeader';
import type { Todo } from '@/types/calendar';
import { getWeekDays, formatDateKey } from '@/utils/calendarUtils';
import { generateRecurringEvents, isRecurringInstance, extractRecurringId } from '@/utils/recurringUtils';
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
    onConvertRegularToRecurring,
    onConvertRecurringToRegular,
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

  // selectedDate가 변경되면 해당 날짜가 속한 주로 이동
  useEffect(() => {
    const date = new Date(selectedDate);
    const day = date.getDay();
    const diff = date.getDate() - day;
    const weekStart = new Date(date);
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);
    
    // 현재 주 시작일과 다를 때만 업데이트 (무한 루프 방지)
    if (weekStart.getTime() !== currentWeekStart.getTime()) {
      setCurrentWeekStart(weekStart);
    }
  }, [selectedDate]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // 반복 일정 편집 모달 상태
  const [recurringEditModalOpen, setRecurringEditModalOpen] = useState(false);
  const [pendingRecurringEdit, setPendingRecurringEdit] = useState<{
    todoId: string;
    date: Date;
    startTime: string;
    endTime: string;
    recurrenceRule: any;
    categoryId: string;
    text: string;
    originalDate: Date;
    originalStartTime: string;
    originalEndTime: string;
    type: 'drag' | 'resize' | 'time-edit' | 'dialog-edit';
  } | null>(null);

  // 시간 편집 다이얼로그 상태
  const [timeEditDialogOpen, setTimeEditDialogOpen] = useState(false);
  const [timeEditTodoId, setTimeEditTodoId] = useState<string | null>(null);

  // 일반 할일을 반복으로 변환하기 위한 상태
  const [convertingToRecurring, setConvertingToRecurring] = useState<{
    todoId: string;
    text: string;
    startTime?: string;
    endTime?: string;
    categoryId?: string;
  } | undefined>(undefined);
  const [convertToRecurringDialogOpen, setConvertToRecurringDialogOpen] = useState(false);

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
    openConvertToRecurringDialog: (todoId: string, text: string, startTime?: string, endTime?: string, categoryId?: string) => {
      setConvertingToRecurring({
        todoId,
        text,
        startTime: startTime || '09:00',
        endTime: endTime || '10:00',
        categoryId: categoryId || 'cat-etc',
      });
      setConvertToRecurringDialogOpen(true);
    },
    startEdit,
    finishEdit: handleFinishEdit,
  });

  // Override handleContextMenu to check for recurring events
  const handleContextMenu = useCallback((e: React.MouseEvent, todoId: string) => {
    // Check if it's a recurring event (UUID-timestamp format)
    const isRecurringEvent = isRecurringInstance(todoId);

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
    // Extract original recurring ID from UUID-timestamp format
    if (isRecurringInstance(todoId)) {
      const recurringId = extractRecurringId(todoId);
      setSelectedRecurringTodoId(recurringId);
      setEditRecurringDialogOpen(true);
      closeRecurringContextMenu();
    }
  }, [recurringContextMenu.todoId, closeRecurringContextMenu]);

  const handleDeleteRecurringClick = useCallback(() => {
    const todoId = recurringContextMenu.todoId;
    // Extract original recurring ID and date from UUID-timestamp format
    if (isRecurringInstance(todoId)) {
      const recurringId = extractRecurringId(todoId);
      // Extract date from timestamp part (after UUID and hyphen)
      const timestampPart = todoId.substring(recurringId.length + 1);
      const eventDate = new Date(timestampPart);

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

  // 처음 렌더링 시 스크롤을 맨 아래로 이동
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (gridScrollRef.current) {
      // 약간의 지연을 두어 DOM이 완전히 렌더링된 후 실행
      timer = setTimeout(() => {
        if (gridScrollRef.current) {
          gridScrollRef.current.scrollTop = gridScrollRef.current.scrollHeight - gridScrollRef.current.clientHeight;
        }
      }, 100);
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, []); // 빈 의존성 배열로 처음 마운트 시에만 실행

  // 반복 일정 편집 처리 핸들러
  const handlePendingRecurringEdit = useCallback((
    todoId: string,
    date: Date,
    startTime: string,
    endTime: string,
    originalDate: Date,
    originalStartTime: string,
    originalEndTime: string,
    type: 'drag' | 'resize'
  ) => {
    setPendingRecurringEdit({
      todoId,
      date,
      startTime,
      endTime,
      originalDate,
      originalStartTime,
      originalEndTime,
      type,
    });
    setRecurringEditModalOpen(true);
  }, []);

  // Resize functionality
  const { resizingTodo, handleResizeStart } = useResizeTodo({
    hourHeight,
    gridScrollRef,
    onEditTodo,
    onPendingRecurringEdit: handlePendingRecurringEdit,
  });

  // Todo drag functionality
  const { draggingTodo, handleTodoDragStart } = useTodoDrag({
    hourHeight,
    gridScrollRef,
    weekDays,
    onUpdateTodoDateTime,
    onEditTodo,
    onPendingRecurringEdit: handlePendingRecurringEdit,
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
    // 반복 일정에서 생성된 이벤트인지 확인 (UUID-timestamp 형식)
    if (isRecurringInstance(todoId)) {
      // 생성된 반복 이벤트 - 원본 ID 추출
      const recurringId = extractRecurringId(todoId);

      // 원본 할일 찾기
      const originalTodo = todos.find(t => t.id === recurringId);
      if (!originalTodo) return;

      // 해당 날짜 찾기
      const timestampPart = todoId.substring(recurringId.length + 1);
      const eventDate = new Date(timestampPart);

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
        selectedDate={selectedDate}
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
        onEditTime={() => {
          const todo = todos.find(t => t.id === contextMenu.todoId);
          if (todo && todo.startTime && todo.endTime) {
            setTimeEditTodoId(contextMenu.todoId);
            setTimeEditDialogOpen(true);
          }
        }}
        showRecurrence={(() => {
          const todo = todos.find(t => t.id === contextMenu.todoId);
          return todo ? !todo.recurrenceRule : true;
        })()}
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
          const todoId = recurringDialog.todoId;
          // 반복 업무 인스턴스인 경우 원본 ID 추출
          const dbId = isRecurringInstance(todoId) ? extractRecurringId(todoId) : todoId;
          const todo = todos.find((t) => t.id === dbId);
          if (todo && recurringDialog.action === 'delete') {
            onDeleteTodo?.(dbId);
          }
          closeRecurringDialog();
        }}
        onSelectAll={() => {
          const todoId = recurringDialog.todoId;
          if (recurringDialog.action === 'delete') {
            // 생성된 반복 이벤트인 경우 원본 ID 추출
            const dbId = isRecurringInstance(todoId) ? extractRecurringId(todoId) : todoId;
            onDeleteTodo?.(dbId);
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
            const todo = todos.find(t => t.id === selectedRecurringTodoId);
            if (todo) {
              // 모달을 먼저 띄움
              setPendingRecurringEdit({
                todoId: selectedRecurringTodoId,
                date: todo.date,
                startTime,
                endTime,
                recurrenceRule,
                categoryId,
                text,
                originalDate: todo.recurrenceRule?.startDate || todo.date,
                originalStartTime: todo.startTime || '09:00',
                originalEndTime: todo.endTime || '10:00',
                type: 'dialog-edit',
              });
              setEditRecurringDialogOpen(false);
              setRecurringEditModalOpen(true);
            } else {
              // 할일을 찾을 수 없으면 바로 업데이트 (fallback)
              onEditRecurring?.(selectedRecurringTodoId, text, startTime, endTime, recurrenceRule, categoryId);
              setEditRecurringDialogOpen(false);
              setSelectedRecurringTodoId('');
            }
          }
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

      {/* Convert Regular to Recurring Dialog */}
      <AddRecurringDialog
        isOpen={convertToRecurringDialogOpen}
        onClose={() => {
          setConvertToRecurringDialogOpen(false);
          setConvertingToRecurring(undefined);
        }}
        onConfirm={(text, startTime, endTime, recurrenceRule, categoryId) => {
          if (convertingToRecurring && onConvertRegularToRecurring) {
            onConvertRegularToRecurring(
              convertingToRecurring.todoId,
              text,
              startTime,
              endTime,
              recurrenceRule,
              categoryId
            );
          }
          setConvertToRecurringDialogOpen(false);
          setConvertingToRecurring(undefined);
        }}
        selectedDate={selectedDate}
        categories={categories}
        editingTodo={convertingToRecurring ? {
          id: convertingToRecurring.todoId,
          text: convertingToRecurring.text,
          startTime: convertingToRecurring.startTime,
          endTime: convertingToRecurring.endTime,
          categoryId: convertingToRecurring.categoryId,
        } : undefined}
      />

      {/* Time Edit Dialog */}
      <TimeEditDialog
        isOpen={timeEditDialogOpen}
        onClose={() => {
          setTimeEditDialogOpen(false);
          setTimeEditTodoId(null);
        }}
        onConfirm={(startTime, endTime) => {
          if (!timeEditTodoId) return;
          
          const todo = todos.find(t => t.id === timeEditTodoId);
          if (!todo) return;

          // 반복 일정인지 확인
          if (isRecurringInstance(timeEditTodoId)) {
            const recurringId = extractRecurringId(timeEditTodoId);
            const timestampPart = timeEditTodoId.substring(recurringId.length + 1);
            const eventDate = new Date(timestampPart);
            
            // 모달 표시
            setPendingRecurringEdit({
              todoId: timeEditTodoId,
              date: todo.date,
              startTime,
              endTime,
              originalDate: eventDate,
              originalStartTime: todo.startTime || '09:00',
              originalEndTime: todo.endTime || '10:00',
              type: 'time-edit',
            });
            setTimeEditDialogOpen(false);
            setTimeEditTodoId(null);
            setRecurringEditModalOpen(true);
          } else {
            // 일반 할일은 바로 업데이트
            onEditTodo?.(timeEditTodoId, { startTime, endTime });
            setTimeEditDialogOpen(false);
            setTimeEditTodoId(null);
          }
        }}
        currentStartTime={timeEditTodoId ? todos.find(t => t.id === timeEditTodoId)?.startTime : undefined}
        currentEndTime={timeEditTodoId ? todos.find(t => t.id === timeEditTodoId)?.endTime : undefined}
      />

      {/* Recurring Edit Modal */}
      <RecurringEditModal
        isOpen={recurringEditModalOpen}
        onClose={() => {
          setRecurringEditModalOpen(false);
          setPendingRecurringEdit(null);
        }}
        onEditThis={() => {
          if (!pendingRecurringEdit) return;
          
          const { todoId, date, startTime, endTime, text, recurrenceRule, categoryId } = pendingRecurringEdit;
          
          // dialog-edit 타입일 때는 todoId가 이미 원본 반복 일정 ID
          const recurringId = pendingRecurringEdit.type === 'dialog-edit' 
            ? todoId 
            : extractRecurringId(todoId);
          
          const originalTodo = todos.find(t => t.id === recurringId);
          if (originalTodo && onEditTodo) {
            // dialog-edit 타입일 때는 selectedDate를 사용
            const eventDate = pendingRecurringEdit.type === 'dialog-edit' 
              ? selectedDate 
              : (() => {
                  const timestampPart = todoId.substring(recurringId.length + 1);
                  return new Date(timestampPart);
                })();
            
            const eventDateKey = formatDateKey(eventDate);
            const modifiedInstances = originalTodo.modifiedInstances || {};
            
            // modifiedInstances에 예외 날짜 정보 추가
            const newModifiedInstances = {
              ...modifiedInstances,
              [eventDateKey]: {
                date: pendingRecurringEdit.type === 'drag' && date.toDateString() !== eventDate.toDateString() ? date : undefined,
                startTime: startTime !== originalTodo.startTime ? startTime : undefined,
                endTime: endTime !== originalTodo.endTime ? endTime : undefined,
              }
            };
            
            // modifiedInstances 업데이트 (반복 일정은 유지)
            // dialog-edit 타입일 때는 텍스트도 업데이트
            const updates: Partial<Todo> = { modifiedInstances: newModifiedInstances };
            if (pendingRecurringEdit.type === 'dialog-edit' && text !== originalTodo.text) {
              updates.text = text;
            }
            onEditTodo(recurringId, updates);
          }
        }}
        onEditThisAndFuture={() => {
          if (!pendingRecurringEdit) return;
          
          const { todoId, date, startTime, endTime, text, recurrenceRule, categoryId, originalDate } = pendingRecurringEdit;
          
          // dialog-edit 타입일 때는 todoId가 이미 원본 반복 일정 ID
          const recurringId = pendingRecurringEdit.type === 'dialog-edit' 
            ? todoId 
            : extractRecurringId(todoId);
          
          // 이 일정 및 향후 일정 수정: 원본 반복 일정의 시작 날짜와 시간 업데이트
          const originalTodo = todos.find(t => t.id === recurringId);
          if (originalTodo && originalTodo.recurrenceRule && onEditRecurring) {
            // dialog-edit 타입일 때는 selectedDate를 사용
            const eventDate = pendingRecurringEdit.type === 'dialog-edit' 
              ? selectedDate 
              : (() => {
                  const timestampPart = todoId.substring(recurringId.length + 1);
                  return new Date(timestampPart);
                })();
            
            // 날짜가 변경된 경우 새로운 시작 날짜로 설정, 아니면 현재 날짜
            const newStartDate = pendingRecurringEdit.type === 'drag' && 
              date.toDateString() !== originalDate.toDateString() 
              ? date 
              : eventDate;
            
            const newRecurrenceRule = {
              ...originalTodo.recurrenceRule,
              ...recurrenceRule, // recurrenceRule도 업데이트
              startDate: newStartDate,
            };
            onEditRecurring(recurringId, text || originalTodo.text, startTime, endTime, newRecurrenceRule, categoryId || originalTodo.categoryId);
          }
        }}
        onEditAll={() => {
          if (!pendingRecurringEdit) return;
          
          const { todoId, date, startTime, endTime, text, recurrenceRule, categoryId } = pendingRecurringEdit;
          
          // dialog-edit 타입일 때는 todoId가 이미 원본 반복 일정 ID
          const recurringId = pendingRecurringEdit.type === 'dialog-edit' 
            ? todoId 
            : extractRecurringId(todoId);

          // 모든 일정 수정: 원본 반복 일정의 시간 정보 업데이트
          const originalTodo = todos.find(t => t.id === recurringId);
          if (originalTodo && originalTodo.recurrenceRule && onEditRecurring) {
            // dialog-edit 타입일 때는 selectedDate를 사용
            const eventDate = pendingRecurringEdit.type === 'dialog-edit' 
              ? selectedDate 
              : (() => {
                  const timestampPart = todoId.substring(recurringId.length + 1);
                  return new Date(timestampPart);
                })();
            
            // 날짜도 변경된 경우 시작 날짜 업데이트
            const newStartDate = pendingRecurringEdit.type === 'drag' && 
              date.toDateString() !== eventDate.toDateString() 
              ? date 
              : (originalTodo.recurrenceRule.startDate || originalTodo.date);
            
            const newRecurrenceRule = {
              ...originalTodo.recurrenceRule,
              ...recurrenceRule, // recurrenceRule도 업데이트
              startDate: newStartDate,
            };
            onEditRecurring(recurringId, text || originalTodo.text, startTime, endTime, newRecurrenceRule, categoryId || originalTodo.categoryId);
          }
        }}
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
