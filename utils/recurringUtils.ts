import type { Todo } from '@/types/calendar';

/**
 * 반복 규칙에 따라 주어진 주간에 해당하는 반복 이벤트들을 생성
 * @param todo 반복 규칙이 있는 할일
 * @param weekDays 주간 날짜 배열 (일요일~토요일)
 * @returns 생성된 반복 이벤트 배열
 */
export function generateRecurringEvents(todo: Todo, weekDays: Date[]): Todo[] {
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
      const daysOfWeek = todo.recurrenceRule?.daysOfWeek;
      const dayOfWeekValue = weekDay.getDay() === 0 ? 7 : weekDay.getDay(); // 1=월, ..., 7=일

      if (daysOfWeek && daysOfWeek.length > 0) {
        // daysOfWeek가 지정된 경우: 선택된 요일들에 반복
        if (daysOfWeek.includes(dayOfWeekValue)) {
          // 시작 날짜 이후인지 확인 (날짜만 비교)
          const startDateOnly = new Date(todo.date.getFullYear(), todo.date.getMonth(), todo.date.getDate());
          const weekDayOnly = new Date(weekDay.getFullYear(), weekDay.getMonth(), weekDay.getDate());

          if (weekDayOnly >= startDateOnly) {
            // interval 확인 (주 단위)
            const daysDiff = Math.floor(
              (weekDayOnly.getTime() - startDateOnly.getTime()) / (1000 * 60 * 60 * 24)
            );
            const weeksDiff = Math.floor(daysDiff / 7);
            shouldInclude = weeksDiff % interval === 0;
          }
        }
      } else {
        // daysOfWeek가 없는 경우: 시작 날짜의 요일만 반복 (기존 로직)
        const weeksDiff = Math.floor(
          (weekDay.getTime() - todo.date.getTime()) / (1000 * 60 * 60 * 24 * 7)
        );
        shouldInclude =
          weekDay.getDay() === todo.date.getDay() &&
          weeksDiff >= 0 &&
          weeksDiff % interval === 0;
      }
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
}
