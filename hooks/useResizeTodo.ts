import { useState, RefObject } from 'react';
import { timeToMinutes } from '@/utils/calendarUtils';
import type { Todo } from '@/types/calendar';

interface UseResizeTodoProps {
  hourHeight: number;
  gridScrollRef: RefObject<HTMLDivElement | null>;
  onEditTodo?: (id: string, updates: Partial<Todo>) => void;
}

export interface ResizingTodoState {
  id: string;
  type: 'top' | 'bottom';
  originalStartTime: string;
  originalEndTime: string;
  currentStartTime: string;
  currentEndTime: string;
}

/**
 * Todo block resize functionality
 * Handles top and bottom resize with 15-minute snapping
 */
export function useResizeTodo({ hourHeight, gridScrollRef, onEditTodo }: UseResizeTodoProps) {
  const [resizingTodo, setResizingTodo] = useState<ResizingTodoState | null>(null);

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

  return {
    resizingTodo,
    handleResizeStart,
  };
}
