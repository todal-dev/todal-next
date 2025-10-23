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

  // 시작 날짜를 시간 부분 제거하고 날짜만 비교
  const startDateOnly = new Date(todo.date.getFullYear(), todo.date.getMonth(), todo.date.getDate());

  weekDays.forEach((weekDay) => {
    // Check if this day should have a recurring event
    let shouldInclude = false;

    if (frequency === 'daily') {
      const weekDayOnly = new Date(weekDay.getFullYear(), weekDay.getMonth(), weekDay.getDate());
      const daysDiff = Math.floor(
        (weekDayOnly.getTime() - startDateOnly.getTime()) / (1000 * 60 * 60 * 24)
      );
      shouldInclude = daysDiff >= 0 && daysDiff % interval === 0;
    } else if (frequency === 'weekly') {
      const daysOfWeek = todo.recurrenceRule?.daysOfWeek;
      const dayOfWeekValue = weekDay.getDay() === 0 ? 7 : weekDay.getDay(); // 1=월, ..., 7=일

      if (daysOfWeek && daysOfWeek.length > 0) {
        // daysOfWeek가 지정된 경우: 선택된 요일들에 반복
        if (daysOfWeek.includes(dayOfWeekValue)) {
          // 시작 날짜 이후인지 확인 (날짜만 비교)
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
        // daysOfWeek가 없는 경우: 시작 날짜의 요일만 반복
        const weekDayOnly = new Date(weekDay.getFullYear(), weekDay.getMonth(), weekDay.getDate());
        const weeksDiff = Math.floor(
          (weekDayOnly.getTime() - startDateOnly.getTime()) / (1000 * 60 * 60 * 24 * 7)
        );
        shouldInclude =
          weekDay.getDay() === todo.date.getDay() &&
          weeksDiff >= 0 &&
          weeksDiff % interval === 0;
      }
    } else if (frequency === 'monthly') {
      const weekDayOnly = new Date(weekDay.getFullYear(), weekDay.getMonth(), weekDay.getDate());
      const monthsDiff =
        (weekDayOnly.getFullYear() - startDateOnly.getFullYear()) * 12 +
        (weekDayOnly.getMonth() - startDateOnly.getMonth());
      shouldInclude =
        weekDayOnly.getDate() === startDateOnly.getDate() &&
        monthsDiff >= 0 &&
        monthsDiff % interval === 0;
    }

    // Check end date (inclusive)
    if (endDate) {
      const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      const weekDayOnly = new Date(weekDay.getFullYear(), weekDay.getMonth(), weekDay.getDate());
      if (weekDayOnly > endDateOnly) {
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
