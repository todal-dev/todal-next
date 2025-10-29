import type { Todo } from '@/types/calendar';
import { formatDateKey } from './calendarUtils';

/**
 * N번째 요일 계산 (예: 매월 첫째주 월요일)
 */
function getNthWeekdayOfMonth(year: number, month: number, nth: number, weekday: number): number | null {
  // nth: 1=첫째, 2=둘째, 3=셋째, 4=넷째, -1=마지막
  // weekday: 1=월, 2=화, ..., 7=일
  
  const lastDay = new Date(year, month + 1, 0);
  
  if (nth === -1) {
    // 마지막 주 계산
    for (let day = lastDay.getDate(); day >= 1; day--) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();
      if (dayOfWeek === weekday) {
        return day;
      }
    }
  } else {
    // N번째 주 계산
    let count = 0;
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();
      if (dayOfWeek === weekday) {
        count++;
        if (count === nth) {
          return day;
        }
      }
    }
  }
  
  return null;
}

/**
 * 반복 규칙에 따라 주어진 주간에 해당하는 반복 이벤트들을 생성
 * @param todo 반복 규칙이 있는 할일
 * @param weekDays 주간 날짜 배열 (일요일~토요일)
 * @returns 생성된 반복 이벤트 배열
 */
export function generateRecurringEvents(todo: Todo, weekDays: Date[]): Todo[] {
  if (!todo.recurrenceRule) return [todo];

  const events: Todo[] = [];
  const { frequency, interval, endDate, count, exceptions } = todo.recurrenceRule;

  // 시작 날짜를 시간 부분 제거하고 날짜만 비교
  const startDateOnly = new Date(todo.date.getFullYear(), todo.date.getMonth(), todo.date.getDate());
  let eventCount = 0; // 생성된 이벤트 개수 (count 제한용)

  weekDays.forEach((weekDay) => {
    // count 제한 확인
    if (count && eventCount >= count) {
      return;
    }

    // Check if this day should have a recurring event
    let shouldInclude = false;
    const weekDayOnly = new Date(weekDay.getFullYear(), weekDay.getMonth(), weekDay.getDate());

    if (frequency === 'daily') {
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
        const weeksDiff = Math.floor(
          (weekDayOnly.getTime() - startDateOnly.getTime()) / (1000 * 60 * 60 * 24 * 7)
        );
        shouldInclude =
          weekDay.getDay() === todo.date.getDay() &&
          weeksDiff >= 0 &&
          weeksDiff % interval === 0;
      }
    } else if (frequency === 'monthly') {
      const monthsDiff =
        (weekDayOnly.getFullYear() - startDateOnly.getFullYear()) * 12 +
        (weekDayOnly.getMonth() - startDateOnly.getMonth());
      
      if (monthsDiff >= 0 && monthsDiff % interval === 0) {
        const { nthWeekday, monthDay } = todo.recurrenceRule || {};
        
        if (nthWeekday) {
          // 매월 N번째 요일 (예: 매월 첫째주 월요일)
          const targetDay = getNthWeekdayOfMonth(
            weekDay.getFullYear(),
            weekDay.getMonth(),
            nthWeekday.nth,
            nthWeekday.weekday
          );
          shouldInclude = targetDay === weekDay.getDate();
        } else if (monthDay) {
          // 매월 특정 일 (예: 매월 15일)
          shouldInclude = weekDay.getDate() === monthDay;
        } else {
          // 기본: 시작 날짜의 일자로 반복
          shouldInclude = weekDay.getDate() === startDateOnly.getDate();
        }
      }
    } else if (frequency === 'yearly') {
      const yearsDiff = weekDayOnly.getFullYear() - startDateOnly.getFullYear();
      
      if (yearsDiff >= 0 && yearsDiff % interval === 0) {
        const { month, monthDay, nthWeekday } = todo.recurrenceRule || {};
        const targetMonth = month !== undefined ? month - 1 : startDateOnly.getMonth();
        
        if (weekDay.getMonth() === targetMonth) {
          if (nthWeekday) {
            // 매년 N월 N번째 요일 (예: 매년 5월 둘째주 일요일 - 어버이날)
            const targetDay = getNthWeekdayOfMonth(
              weekDay.getFullYear(),
              targetMonth,
              nthWeekday.nth,
              nthWeekday.weekday
            );
            shouldInclude = targetDay === weekDay.getDate();
          } else if (monthDay) {
            // 매년 N월 N일 (예: 매년 12월 25일 - 크리스마스)
            shouldInclude = weekDay.getDate() === monthDay;
          } else {
            // 기본: 시작 날짜의 월/일로 반복
            shouldInclude = weekDay.getDate() === startDateOnly.getDate();
          }
        }
      }
    }

    // Check end date (inclusive)
    if (endDate) {
      const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      if (weekDayOnly > endDateOnly) {
        shouldInclude = false;
      }
    }

    // Check exceptions - 예외 날짜는 이벤트를 생성하지 않음 (영구 제외)
    if (exceptions && exceptions.length > 0) {
      const weekDayKey = formatDateKey(weekDay);
      if (exceptions.includes(weekDayKey)) {
        shouldInclude = false;
      }
    }

    // Check skipped dates - 건너뛴 날짜는 이벤트를 생성하지 않음 (사용자가 수동으로 건너뛴 경우)
    if (todo.skippedDates && todo.skippedDates.length > 0) {
      const weekDayKey = formatDateKey(weekDay);
      if (todo.skippedDates.includes(weekDayKey)) {
        shouldInclude = false;
      }
    }

    if (shouldInclude) {
      events.push({
        ...todo,
        id: `${todo.id}-${weekDay.toISOString()}`,
        date: weekDay,
      });
      eventCount++; // 생성된 이벤트 카운트 증가
    }
  });

  return events;
}
