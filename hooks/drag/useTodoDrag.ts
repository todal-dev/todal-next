import { useState, RefObject } from 'react';
import { timeToMinutes } from '@/utils/calendarUtils';
import type { Todo } from '@/types/calendar';
import { isRecurringInstance } from '@/utils/recurringUtils';

interface UseTodoDragProps {
  hourHeight: number;
  gridScrollRef: RefObject<HTMLDivElement | null>;
  weekDays: Date[];
  onUpdateTodoDateTime?: (id: string, date: Date, startTime: string, endTime: string) => void;
  onEditTodo?: (id: string, updates: Partial<Todo>) => void;
  onPendingRecurringEdit?: (
    todoId: string,
    date: Date,
    startTime: string,
    endTime: string,
    originalDate: Date,
    originalStartTime: string,
    originalEndTime: string,
    type: 'drag' | 'resize'
  ) => void;
}

export interface DraggingTodoState {
  id: string;
  originalDate: Date;
  originalStartTime: string;
  originalEndTime: string;
  currentDate: Date;
  currentStartTime: string;
  currentEndTime: string;
  offsetY: number;
}

/**
 * Todo block drag functionality
 * Allows moving todos to different days and times
 */
export function useTodoDrag({
  hourHeight,
  gridScrollRef,
  weekDays,
  onUpdateTodoDateTime,
  onEditTodo,
  onPendingRecurringEdit,
}: UseTodoDragProps) {
  const [draggingTodo, setDraggingTodo] = useState<DraggingTodoState | null>(null);

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

    // Use requestAnimationFrame to throttle state updates for instant, smooth dragging
    let animationFrameId: number | null = null;
    let pendingUpdate = false;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!gridContainer) return;

      // If we already have a pending update, skip this mousemove event
      if (pendingUpdate) return;

      pendingUpdate = true;

      // Schedule update on next animation frame for smooth 60fps dragging
      animationFrameId = requestAnimationFrame(() => {
        pendingUpdate = false;

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
      });
    };

    const handleMouseUp = () => {
      // Cancel any pending animation frame
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }

      // Check if this is a recurring instance
      const isRecurring = isRecurringInstance(todoId);
      
      if (isRecurring && onPendingRecurringEdit) {
        // Show modal for recurring events - 상태를 유지하여 모달이 열려있을 때도 새 위치 표시
        onPendingRecurringEdit(
          todoId,
          currentDate,
          currentStartTime,
          currentEndTime,
          todoDate,
          startTime,
          endTime,
          'drag'
        );
        // 모달이 열려있을 때는 상태를 유지 (모달에서 취소/저장 시 초기화)
        // setDraggingTodo(null) 호출하지 않음
      } else {
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
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // 외부에서 상태를 초기화할 수 있도록 함수 제공
  const clearDraggingState = () => {
    setDraggingTodo(null);
  };

  return {
    draggingTodo,
    handleTodoDragStart,
    clearDraggingState,
  };
}
