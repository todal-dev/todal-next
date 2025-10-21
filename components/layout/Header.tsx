'use client';

import { ChevronLeft, ChevronRight, Repeat } from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { RecurringEventDialog } from '@/components/ui/RecurringEventDialog';
import { ContextMenu } from '@/components/ui/ContextMenu';
import { CategoryChangeDialog } from '@/components/ui/CategoryChangeDialog';
import { DateMoveDialog } from '@/components/ui/DateMoveDialog';
import { DuplicateDialog } from '@/components/ui/DuplicateDialog';

interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
  endDate?: Date;
}

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
  recurrenceRule?: RecurrenceRule;
  recurrenceId?: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface BigCalendarProps {
  selectedDate?: Date;
  todos?: Todo[];
  categories?: Category[];
  onUpdateTodoDateTime?: (id: string, date: Date, startTime?: string, endTime?: string) => void;
  onAddTodo?: (todo: Omit<Todo, 'id'>, callback?: (id: string) => void) => void;
  onEditTodo?: (id: string, updates: Partial<Todo>) => void;
  onDeleteTodo?: (id: string) => void;
  onMoveTodo?: (id: string, newDate: Date) => void;
}

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

  // Hour height with localStorage (default 40px, min 33px, max 200px)
  const [hourHeight, setHourHeight] = useState(40);

  // Load from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('calendar-hour-height');
      if (saved) {
        const parsedHeight = parseInt(saved, 10);
        if (!isNaN(parsedHeight)) {
          setHourHeight(Math.max(33, Math.min(200, parsedHeight)));
        }
      }
    }
  }, []);

  // Current time tracking
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Drag state for Google Calendar-style creation
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ date: Date; hour: number; minute: number } | null>(null);
  const [creatingEvent, setCreatingEvent] = useState<{
    date: Date;
    hour: number;
    tempId: string;
    startTime: string;
    endTime: string;
  } | null>(null);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    todoId: string;
  }>({ isOpen: false, x: 0, y: 0, todoId: '' });

  // Dialog states
  const [categoryDialog, setCategoryDialog] = useState<{
    isOpen: boolean;
    todoId: string;
    currentCategoryId: string;
  }>({ isOpen: false, todoId: '', currentCategoryId: '' });

  const [dateDialog, setDateDialog] = useState<{
    isOpen: boolean;
    todoId: string;
    currentDate: Date;
  }>({ isOpen: false, todoId: '', currentDate: new Date() });

  const [duplicateDialog, setDuplicateDialog] = useState<{
    isOpen: boolean;
    todoId: string;
    todoName: string;
  }>({ isOpen: false, todoId: '', todoName: '' });

  const [recurringDialog, setRecurringDialog] = useState<{
    isOpen: boolean;
    todoId: string;
    action: 'edit' | 'delete' | null;
  }>({ isOpen: false, todoId: '', action: null });

  // Inline editing state
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);

  // Resize state
  const [resizingTodo, setResizingTodo] = useState<{
    id: string;
    type: 'top' | 'bottom';
    originalStartTime: string;
    originalEndTime: string;
    currentStartTime: string;
    currentEndTime: string;
  } | null>(null);

  // Dragging todo (for moving to any day)
  const [draggingTodo, setDraggingTodo] = useState<{
    id: string;
    originalDate: Date;
    originalStartTime: string;
    originalEndTime: string;
    currentDate: Date;
    currentStartTime: string;
    currentEndTime: string;
    offsetY: number;
  } | null>(null);

  // Ref for calendar grid
  const gridScrollRef = useRef<HTMLDivElement>(null);

  // Handle pending edit after todo is created
  useEffect(() => {
    if (pendingEditId) {
      const todo = todos.find(t => t.id === pendingEditId);
      if (todo) {
        setEditingTodoId(pendingEditId);
        setEditingText(todo.text || '');
        setPendingEditId(null);
      }
    }
  }, [todos, pendingEditId]);

  // Clean up empty todos when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Don't process if clicking on input or inside editing todo
      if (target.tagName === 'INPUT' || target.closest('input')) {
        return;
      }
      
      if (editingTodoId && editingText.trim() === '') {
        onDeleteTodo?.(editingTodoId);
        setEditingTodoId(null);
        setEditingText('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [editingTodoId, editingText, onDeleteTodo]);

  // Ctrl+Wheel zoom functionality
  useEffect(() => {
    const handleWheel = (e: Event) => {
      const wheelEvent = e as WheelEvent;
      if (wheelEvent.ctrlKey || wheelEvent.metaKey) {
        wheelEvent.preventDefault();

        const target = wheelEvent.target as HTMLElement;
        const calendarGrid = document.querySelector('.calendar-grid');

        if (calendarGrid && calendarGrid.contains(target)) {
          const delta = wheelEvent.deltaY;
          const zoomFactor = delta > 0 ? 0.9 : 1.1;

          setHourHeight((prev) => {
            const newHeight = Math.round(prev * zoomFactor);
            const clampedHeight = Math.max(33, Math.min(200, newHeight));
            localStorage.setItem('calendar-hour-height', clampedHeight.toString());
            return clampedHeight;
          });
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  const getWeekDays = (startDate: Date) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

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

  const weekDays = getWeekDays(currentWeekStart);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const monthName = currentWeekStart.toLocaleString('ko-KR', { month: 'long' });
  const year = currentWeekStart.getFullYear();

  // Helper function: round to 15-minute intervals, never return 60
  const roundToQuarterHour = (minutes: number) => {
    const rounded = Math.round(minutes / 15) * 15;
    return rounded >= 60 ? 0 : rounded;
  };

  // Generate recurring events for the week
  const generateRecurringEvents = (todo: Todo): Todo[] => {
    if (!todo.recurrenceRule) return [todo];

    const events: Todo[] = [];
    const { frequency, interval, endDate } = todo.recurrenceRule;

    weekDays.forEach((weekDay) => {
      // Check if this day should have a recurring event
      let shouldInclude = false;

      if (frequency === 'daily') {
        const daysDiff = Math.floor(
          (weekDay.getTime() - todo.date.getTime()) / (1000 * 60 * 60 * 24)
        );
        shouldInclude = daysDiff >= 0 && daysDiff % interval === 0;
      } else if (frequency === 'weekly') {
        const weeksDiff = Math.floor(
          (weekDay.getTime() - todo.date.getTime()) / (1000 * 60 * 60 * 24 * 7)
        );
        shouldInclude =
          weekDay.getDay() === todo.date.getDay() &&
          weeksDiff >= 0 &&
          weeksDiff % interval === 0;
      } else if (frequency === 'monthly') {
        const monthsDiff =
          (weekDay.getFullYear() - todo.date.getFullYear()) * 12 +
          (weekDay.getMonth() - todo.date.getMonth());
        shouldInclude =
          weekDay.getDate() === todo.date.getDate() &&
          monthsDiff >= 0 &&
          monthsDiff % interval === 0;
      }

      // Check end date (inclusive)
      if (endDate) {
        const endDateEnd = new Date(endDate);
        endDateEnd.setHours(23, 59, 59, 999);
        if (weekDay > endDateEnd) {
          shouldInclude = false;
        }
      }

      if (shouldInclude) {
        events.push({
          ...todo,
          id: `${todo.id}-${weekDay.toISOString()}`,
          date: weekDay,
        });
      }
    });

    return events;
  };

  // Filter and group todos for the week
  const weekTodos = useMemo(() => {
    const grouped: Record<string, Todo[]> = {};

    // Expand recurring events
    const allTodos: Todo[] = [];
    todos.forEach((todo) => {
      if (todo.recurrenceRule) {
        allTodos.push(...generateRecurringEvents(todo));
      } else {
        allTodos.push(todo);
      }
    });

    weekDays.forEach((day) => {
      const dateKey = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
      grouped[dateKey] = allTodos.filter((todo) => {
        const todoDateKey = `${todo.date.getFullYear()}-${String(todo.date.getMonth() + 1).padStart(2, '0')}-${String(todo.date.getDate()).padStart(2, '0')}`;
        return todoDateKey === dateKey && todo.startTime && todo.endTime;
      });
    });

    return grouped;
  }, [todos, weekDays]);

  // Convert time to minutes
  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Check if two events overlap
  const eventsOverlap = (event1: Todo, event2: Todo) => {
    if (!event1.startTime || !event1.endTime || !event2.startTime || !event2.endTime) {
      return false;
    }
    const start1 = timeToMinutes(event1.startTime);
    const end1 = timeToMinutes(event1.endTime);
    const start2 = timeToMinutes(event2.startTime);
    const end2 = timeToMinutes(event2.endTime);

    return start1 < end2 && start2 < end1;
  };

  // Calculate layout for overlapping events (Google Calendar style)
  const calculateEventLayout = (todos: Todo[]) => {
    const layout: Record<string, { width: number; left: number }> = {};

    if (todos.length === 0) return layout;

    // Sort events by start time, then by duration (longer first)
    const sortedTodos = [...todos].sort((a, b) => {
      const aStart = timeToMinutes(a.startTime!);
      const bStart = timeToMinutes(b.startTime!);
      if (aStart !== bStart) return aStart - bStart;

      const aDuration = timeToMinutes(a.endTime!) - aStart;
      const bDuration = timeToMinutes(b.endTime!) - bStart;
      return bDuration - aDuration; // Longer events first
    });

    // Track which column each event is in
    const columns: Todo[][] = [];

    // Assign each event to the leftmost available column
    sortedTodos.forEach((event) => {
      // Find the first column where this event doesn't overlap with any event already in that column
      let placed = false;

      for (let colIndex = 0; colIndex < columns.length; colIndex++) {
        const column = columns[colIndex];

        // Check if event overlaps with any event in this column
        const hasOverlap = column.some((existingEvent) => eventsOverlap(event, existingEvent));

        if (!hasOverlap) {
          // Can place in this column
          column.push(event);
          placed = true;
          break;
        }
      }

      // If no existing column works, create a new column
      if (!placed) {
        columns.push([event]);
      }
    });

    // For each event, find how many columns it spans
    sortedTodos.forEach((event) => {
      // Find which column this event is in
      let eventColumn = 0;
      for (let i = 0; i < columns.length; i++) {
        if (columns[i].some((e) => e.id === event.id)) {
          eventColumn = i;
          break;
        }
      }

      // Find the maximum number of columns among all overlapping events
      let maxColumns = 1;

      // Check all events that overlap with this one
      sortedTodos.forEach((other) => {
        if (eventsOverlap(event, other)) {
          // Count how many columns exist among overlapping events
          const overlappingColumns = new Set<number>();

          sortedTodos.forEach((e) => {
            if (eventsOverlap(event, e) || e.id === event.id) {
              for (let i = 0; i < columns.length; i++) {
                if (columns[i].some((col) => col.id === e.id)) {
                  overlappingColumns.add(i);
                  break;
                }
              }
            }
          });

          maxColumns = Math.max(maxColumns, overlappingColumns.size);
        }
      });

      // Calculate width and position
      const width = 100 / maxColumns;
      const left = eventColumn * width;

      layout[event.id] = { width, left };
    });

    return layout;
  };

  // Calculate todo block position
  const getTodoBlockStyle = (startTime: string, endTime: string, width?: number, left?: number) => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    const duration = endMinutes - startMinutes;

    const top = (startMinutes / 60) * hourHeight;
    const height = (duration / 60) * hourHeight - 2; // 2px gap between blocks

    const style: React.CSSProperties = {
      top: `${top}px`,
      height: `${height}px`
    };

    // Apply width and left if provided (for overlapping events)
    if (width !== undefined && left !== undefined) {
      style.width = `calc(${width}% - 4px)`;
      style.left = `${left}%`;
      style.marginLeft = '2px';
      style.marginRight = '2px';
    } else {
      style.left = '0';
      style.right = '0';
      style.marginLeft = '4px';
      style.marginRight = '4px';
    }

    return style;
  };

  // Handle drag start for creating events
  const handleDragStart = (date: Date, hour: number, e: React.MouseEvent) => {
    e.preventDefault();

    // Finish any pending edit before creating new event
    if (editingTodoId) {
      handleFinishEdit();
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const minuteOffset = Math.floor((y / hourHeight) * 60);
    const roundedMinute = roundToQuarterHour(minuteOffset);

    let startHour = hour;
    let startMinute = roundedMinute;

    // If rounding caused overflow to next hour
    if (roundedMinute === 0 && minuteOffset > 45) {
      startHour = hour + 1;
      startMinute = 0;
    }

    // Ensure we don't go past 23:59
    if (startHour >= 24) {
      startHour = 23;
      startMinute = 45;
    }

    const startTime = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`;

    // Default 1 hour duration
    let endTotalMinutes = startHour * 60 + startMinute + 60;
    if (endTotalMinutes > 24 * 60) {
      endTotalMinutes = 24 * 60;
    }
    const endHour = Math.floor(endTotalMinutes / 60);
    const endMinute = endTotalMinutes % 60;
    const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;

    setIsDragging(true);
    setDragStart({ date, hour: startHour, minute: startMinute });

    // Immediately create the event block
    setCreatingEvent({
      date,
      hour: startHour,
      tempId: `temp-${Date.now()}`,
      startTime,
      endTime,
    });
  };

  const handleDragMove = (date: Date, hour: number, e: React.MouseEvent) => {
    if (!isDragging || !dragStart || !creatingEvent) return;

    // Only allow dragging on the same day
    if (date.toDateString() !== dragStart.date.toDateString()) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const minuteOffset = Math.floor((y / hourHeight) * 60);
    let endMinute = roundToQuarterHour(minuteOffset);
    let endHour = hour;

    // If rounding caused overflow to next hour
    if (endMinute === 0 && minuteOffset > 45) {
      endHour = hour + 1;
      endMinute = 0;
    }

    const endTotalMinutes = endHour * 60 + endMinute;
    const startTotalMinutes = dragStart.hour * 60 + dragStart.minute;

    // Ensure end is after start (minimum 15 minutes)
    if (endTotalMinutes <= startTotalMinutes) {
      return;
    }

    const startTime = `${String(dragStart.hour).padStart(2, '0')}:${String(dragStart.minute).padStart(2, '0')}`;
    const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;

    // Update creating event with new end time for real-time preview
    setCreatingEvent({
      ...creatingEvent,
      startTime,
      endTime,
    });
  };

  const handleDragEnd = () => {
    if (!isDragging || !creatingEvent) return;

    let { startTime, endTime } = creatingEvent;

    // Normalize times to prevent 60 minutes
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const normalizedStartMinute = startMinute >= 60 ? 0 : startMinute;
    const normalizedStartHour = startMinute >= 60 ? startHour + 1 : startHour;

    const normalizedEndMinute = endMinute >= 60 ? 0 : endMinute;
    const normalizedEndHour = endMinute >= 60 ? endHour + 1 : endHour;

    startTime = `${String(normalizedStartHour).padStart(2, '0')}:${String(normalizedStartMinute).padStart(2, '0')}`;
    endTime = `${String(normalizedEndHour).padStart(2, '0')}:${String(normalizedEndMinute).padStart(2, '0')}`;

    // Add the new todo with empty text and automatically enter edit mode
    onAddTodo?.({
      text: '',
      completed: false,
      date: creatingEvent.date,
      categoryId: 'cat-etc',
      startTime,
      endTime,
    }, (newId) => {
      // Set pending edit to trigger edit mode after todo is added
      setPendingEditId(newId);
    });

    setIsDragging(false);
    setDragStart(null);
    setCreatingEvent(null);
  };

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

    setDuplicateDialog({
      isOpen: true,
      todoId: todo.id,
      todoName: todo.text,
    });
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
      setRecurringDialog({
        isOpen: true,
        todoId: todo.id,
        action: 'delete',
      });
    } else {
      onDeleteTodo?.(todo.id);
    }
  };

  const handleMove = () => {
    const todo = todos.find((t) => t.id === contextMenu.todoId);
    if (!todo) return;

    setDateDialog({
      isOpen: true,
      todoId: todo.id,
      currentDate: todo.date,
    });
  };

  const handleConfirmMove = (newDate: Date) => {
    onMoveTodo?.(dateDialog.todoId, newDate);
  };

  const handleChangeCategory = () => {
    const todo = todos.find((t) => t.id === contextMenu.todoId);
    if (!todo) return;

    setCategoryDialog({
      isOpen: true,
      todoId: todo.id,
      currentCategoryId: todo.categoryId,
    });
  };

  const handleConfirmCategoryChange = (categoryId: string) => {
    onEditTodo?.(categoryDialog.todoId, { categoryId });
  };

  const handleRename = () => {
    const todo = todos.find((t) => t.id === contextMenu.todoId);
    if (!todo) return;

    setEditingTodoId(todo.id);
    setEditingText(todo.text);
  };

  const handleSetRecurrence = () => {
    // This would open a recurrence settings dialog
    // For now, just placeholder
    console.log('Set recurrence for', contextMenu.todoId);
  };

  // Inline editing handlers
  const handleFinishEdit = () => {
    if (editingTodoId) {
      const trimmedText = editingText.trim();
      if (trimmedText) {
        // Update todo with new text
        onEditTodo?.(editingTodoId, { text: trimmedText });
      } else {
        // Delete todo if text is empty (like Google Calendar)
        onDeleteTodo?.(editingTodoId);
      }
    }
    setEditingTodoId(null);
    setEditingText('');
  };

  // Resize handlers (top and bottom)
  const handleResizeStart = (
    e: React.MouseEvent,
    todoId: string,
    type: 'top' | 'bottom',
    startTime: string,
    endTime: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    // Use local variables to avoid closure issues
    let currentStartTime = startTime;
    let currentEndTime = endTime;

    // Get the grid container for coordinate calculations
    const gridContainer = gridScrollRef.current;
    if (!gridContainer) return;

    setResizingTodo({
      id: todoId,
      type,
      originalStartTime: startTime,
      originalEndTime: endTime,
      currentStartTime: startTime,
      currentEndTime: endTime,
    });

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!gridContainer) return;

      // Calculate time based on scroll position and mouse Y
      const gridRect = gridContainer.getBoundingClientRect();
      const scrollTop = gridContainer.scrollTop;

      // Mouse Y relative to the visible grid, plus scroll offset
      const relativeY = moveEvent.clientY - gridRect.top + scrollTop;

      // Subtract the header height (approximately 73px based on the code)
      const headerHeight = 73; // Adjust if needed
      const contentY = relativeY - headerHeight;

      if (contentY < 0) return;

      // Calculate total minutes from top of grid
      const totalMinutes = Math.floor((contentY / hourHeight) * 60);

      // Round to 15-minute intervals
      const roundedMinutes = Math.round(totalMinutes / 15) * 15;

      // Convert to hours and minutes
      const hours = Math.floor(roundedMinutes / 60);
      const minutes = roundedMinutes % 60;

      // Clamp to 0-24 hour range
      if (hours < 0 || hours >= 24) return;

      const newTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

      if (type === 'bottom') {
        // Resizing bottom: ensure end time is after start time
        const startMinutes = timeToMinutes(currentStartTime);
        const endMinutes = timeToMinutes(newTime);

        if (endMinutes > startMinutes) {
          currentEndTime = newTime;
          setResizingTodo(prev => prev ? {
            ...prev,
            currentEndTime: newTime,
          } : null);
        }
      } else {
        // Resizing top: ensure start time is before end time
        const startMinutes = timeToMinutes(newTime);
        const endMinutes = timeToMinutes(currentEndTime);

        if (startMinutes < endMinutes) {
          currentStartTime = newTime;
          setResizingTodo(prev => prev ? {
            ...prev,
            currentStartTime: newTime,
          } : null);
        }
      }
    };

    const handleMouseUp = () => {
      // Apply the resize using local variables
      onEditTodo?.(todoId, {
        startTime: currentStartTime,
        endTime: currentEndTime,
      });
      setResizingTodo(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Todo drag move handler (for moving to any day)
  const handleTodoDragStart = (
    e: React.MouseEvent,
    todoId: string,
    todoDate: Date,
    startTime: string,
    endTime: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const offsetY = e.clientY - rect.top;

    // Use local variables to avoid closure issues
    let currentDate = todoDate;
    let currentStartTime = startTime;
    let currentEndTime = endTime;

    // Get the grid container for coordinate calculations
    const gridContainer = gridScrollRef.current;
    if (!gridContainer) return;

    setDraggingTodo({
      id: todoId,
      originalDate: todoDate,
      originalStartTime: startTime,
      originalEndTime: endTime,
      currentDate: todoDate,
      currentStartTime: startTime,
      currentEndTime: endTime,
      offsetY,
    });

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!gridContainer) return;

      // Calculate time based on scroll position and mouse Y
      const gridRect = gridContainer.getBoundingClientRect();
      const scrollTop = gridContainer.scrollTop;

      // Mouse Y relative to the visible grid, plus scroll offset
      const relativeY = moveEvent.clientY - gridRect.top + scrollTop;

      // Subtract the header height
      const headerHeight = 73;
      const contentY = relativeY - headerHeight;

      if (contentY < 0) return;

      // Calculate which day column we're over
      const mouseX = moveEvent.clientX;

      // Find the day column element at this X position
      let targetDate = currentDate;
      const dayElements = document.querySelectorAll('.calendar-day-column');
      dayElements.forEach((element, index) => {
        const dayRect = element.getBoundingClientRect();
        if (mouseX >= dayRect.left && mouseX <= dayRect.right) {
          targetDate = weekDays[index];
        }
      });

      // Subtract the offset where the user clicked within the block
      const adjustedY = contentY - offsetY;

      // Calculate total minutes from top of grid
      const totalMinutes = Math.floor((adjustedY / hourHeight) * 60);

      // Round to 15-minute intervals
      const roundedMinutes = Math.round(totalMinutes / 15) * 15;

      // Calculate duration
      const originalStartMinutes = timeToMinutes(startTime);
      const originalEndMinutes = timeToMinutes(endTime);
      const duration = originalEndMinutes - originalStartMinutes;

      // Calculate new end time
      const newEndMinutes = roundedMinutes + duration;

      // Ensure we don't go past 24:00
      if (roundedMinutes < 0 || newEndMinutes > 24 * 60) return;

      const newStartHour = Math.floor(roundedMinutes / 60);
      const newStartMin = roundedMinutes % 60;
      const newEndHour = Math.floor(newEndMinutes / 60);
      const newEndMin = newEndMinutes % 60;

      const newStartTime = `${String(newStartHour).padStart(2, '0')}:${String(newStartMin).padStart(2, '0')}`;
      const newEndTime = `${String(newEndHour).padStart(2, '0')}:${String(newEndMin).padStart(2, '0')}`;

      currentDate = targetDate;
      currentStartTime = newStartTime;
      currentEndTime = newEndTime;

      setDraggingTodo(prev => prev ? {
        ...prev,
        currentDate: targetDate,
        currentStartTime: newStartTime,
        currentEndTime: newEndTime,
      } : null);
    };

    const handleMouseUp = () => {
      // Apply the move using local variables
      if (currentDate.toDateString() !== todoDate.toDateString()) {
        // Date changed, use onUpdateTodoDateTime to update both date and time
        onUpdateTodoDateTime?.(todoId, currentDate, currentStartTime, currentEndTime);
      } else {
        // Same date, just update time
        onEditTodo?.(todoId, {
          startTime: currentStartTime,
          endTime: currentEndTime,
        });
      }
      setDraggingTodo(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-gray-300">
        <h2 className="text-heading-2 text-neutral-text-primary">
          {year}년 {monthName}
        </h2>
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
                      onMouseDown={(e) => handleDragStart(date, hour, e)}
                      onMouseMove={(e) => handleDragMove(date, hour, e)}
                      onMouseUp={handleDragEnd}
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
                      const style = getTodoBlockStyle(creatingEvent.startTime, creatingEvent.endTime);
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
                      const style = getTodoBlockStyle(draggingTodo.currentStartTime, draggingTodo.currentEndTime);

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

                    // Get layout info for overlapping events
                    const layout = eventLayout[todo.id] || { width: 100, left: 0 };
                    const style = getTodoBlockStyle(displayStartTime, displayEndTime, layout.width, layout.left);
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
                          opacity: isDraggingThis ? 0.3 : 1,
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

                        {/* Content */}
                        <div className="relative">
                          <div className="flex items-center gap-1">
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
                                  if (e.key === 'Escape') {
                                    setEditingTodoId(null);
                                    setEditingText('');
                                  }
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
                                  setEditingTodoId(todo.id);
                                  setEditingText(todo.text);
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
        onClose={() => setCategoryDialog({ ...categoryDialog, isOpen: false })}
        onConfirm={handleConfirmCategoryChange}
      />

      {/* Date Move Dialog */}
      <DateMoveDialog
        isOpen={dateDialog.isOpen}
        currentDate={dateDialog.currentDate}
        onClose={() => setDateDialog({ ...dateDialog, isOpen: false })}
        onConfirm={handleConfirmMove}
      />

      {/* Duplicate Dialog */}
      <DuplicateDialog
        isOpen={duplicateDialog.isOpen}
        todoName={duplicateDialog.todoName}
        onClose={() => setDuplicateDialog({ ...duplicateDialog, isOpen: false })}
        onConfirm={handleConfirmDuplicate}
      />

      {/* Recurring Event Dialog */}
      <RecurringEventDialog
        isOpen={recurringDialog.isOpen}
        title={recurringDialog.action === 'delete' ? '반복 일정 삭제' : '반복 일정 수정'}
        onClose={() => setRecurringDialog({ ...recurringDialog, isOpen: false })}
        onSelectThis={() => {
          const todo = todos.find((t) => t.id === recurringDialog.todoId);
          if (todo && recurringDialog.action === 'delete') {
            onDeleteTodo?.(todo.id);
          }
          setRecurringDialog({ ...recurringDialog, isOpen: false });
        }}
        onSelectAll={() => {
          const todo = todos.find((t) => t.id === recurringDialog.todoId);
          if (todo && todo.recurrenceId && recurringDialog.action === 'delete') {
            onDeleteTodo?.(todo.recurrenceId);
          }
          setRecurringDialog({ ...recurringDialog, isOpen: false });
        }}
      />
    </div>
  );
}

