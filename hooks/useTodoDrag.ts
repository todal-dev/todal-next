import { useState, RefObject } from 'react';
import { timeToMinutes } from '@/utils/calendarUtils';
import type { Todo } from '@/types/calendar';

interface UseTodoDragProps {
  hourHeight: number;
  gridScrollRef: RefObject<HTMLDivElement | null>;
  weekDays: Date[];
  onUpdateTodoDateTime?: (id: string, date: Date, startTime: string, endTime: string) => void;
  onEditTodo?: (id: string, updates: Partial<Todo>) => void;
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

  return {
    draggingTodo,
    handleTodoDragStart,
  };
}
