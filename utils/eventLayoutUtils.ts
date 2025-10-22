import type { Todo } from '@/types/calendar';
import { timeToMinutes } from './calendarUtils';

/**
 * 두 이벤트가 시간적으로 겹치는지 확인
 */
export function eventsOverlap(event1: Todo, event2: Todo): boolean {
  if (!event1.startTime || !event1.endTime || !event2.startTime || !event2.endTime) {
    return false;
  }
  const start1 = timeToMinutes(event1.startTime);
  const end1 = timeToMinutes(event1.endTime);
  const start2 = timeToMinutes(event2.startTime);
  const end2 = timeToMinutes(event2.endTime);

  return start1 < end2 && start2 < end1;
}

/**
 * 겹치는 이벤트들의 레이아웃 계산 (Google Calendar 스타일)
 * 각 이벤트의 width(%)와 left(%) 위치를 반환
 */
export function calculateEventLayout(todos: Todo[]): Record<string, { width: number; left: number }> {
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
}
