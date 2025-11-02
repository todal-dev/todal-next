import type { Todo } from '@/types/calendar';
import { formatDateKey } from './calendarUtils';
import { extractRecurringId } from './recurringUtils';

export interface PendingRecurringEdit {
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
}

export interface RecurringEditHandlersParams {
  pendingRecurringEdit: PendingRecurringEdit;
  todos: Todo[];
  selectedDate: Date;
  onEditTodo?: (id: string, updates: Partial<Todo>) => void;
  onEditRecurring?: (
    id: string,
    text: string,
    startTime: string,
    endTime: string,
    recurrenceRule: any,
    categoryId: string
  ) => void;
}

/**
 * 반복 일정이 특정 날짜에 발생하는지 확인하는 헬퍼 함수
 */
function shouldIncludeDate(
  checkDate: Date,
  originalTodo: Todo,
  originalStartDateObj: Date
): boolean {
  const { frequency, interval = 1, endDate, exceptions } = originalTodo.recurrenceRule || {};
  const checkDateOnly = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());
  const startDateOnly = new Date(originalStartDateObj.getFullYear(), originalStartDateObj.getMonth(), originalStartDateObj.getDate());
  
  // 종료일 확인
  if (endDate) {
    const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    if (checkDateOnly > endDateOnly) {
      return false;
    }
  }
  
  // 예외 날짜 확인
  if (exceptions && exceptions.length > 0) {
    const dateKeyStr = formatDateKey(checkDate);
    if (exceptions.includes(dateKeyStr)) {
      return false;
    }
  }
  
  if (frequency === 'daily') {
    const daysDiff = Math.floor(
      (checkDateOnly.getTime() - startDateOnly.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysDiff >= 0 && daysDiff % interval === 0;
  } else if (frequency === 'weekly') {
    const daysOfWeek = originalTodo.recurrenceRule?.daysOfWeek;
    const dayOfWeekValue = checkDate.getDay() === 0 ? 7 : checkDate.getDay();
    
    if (daysOfWeek && daysOfWeek.length > 0) {
      if (daysOfWeek.includes(dayOfWeekValue)) {
        if (checkDateOnly >= startDateOnly) {
          const daysDiff = Math.floor(
            (checkDateOnly.getTime() - startDateOnly.getTime()) / (1000 * 60 * 60 * 24)
          );
          const weeksDiff = Math.floor(daysDiff / 7);
          return weeksDiff % interval === 0;
        }
      }
    } else {
      const weeksDiff = Math.floor(
        (checkDateOnly.getTime() - startDateOnly.getTime()) / (1000 * 60 * 60 * 24 * 7)
      );
      return (
        checkDate.getDay() === originalStartDateObj.getDay() &&
        weeksDiff >= 0 &&
        weeksDiff % interval === 0
      );
    }
  } else if (frequency === 'monthly') {
    const monthsDiff =
      (checkDateOnly.getFullYear() - startDateOnly.getFullYear()) * 12 +
      (checkDateOnly.getMonth() - startDateOnly.getMonth());
    
    if (monthsDiff >= 0 && monthsDiff % interval === 0) {
      const { nthWeekday, monthDay } = originalTodo.recurrenceRule || {};
      
      if (nthWeekday) {
        return checkDate.getDate() === originalStartDateObj.getDate();
      } else if (monthDay) {
        return checkDate.getDate() === monthDay;
      } else {
        return checkDate.getDate() === originalStartDateObj.getDate();
      }
    }
  } else if (frequency === 'yearly') {
    const yearsDiff = checkDateOnly.getFullYear() - startDateOnly.getFullYear();
    
    if (yearsDiff >= 0 && yearsDiff % interval === 0) {
      const { month } = originalTodo.recurrenceRule || {};
      const targetMonth = month !== undefined ? month - 1 : originalStartDateObj.getMonth();
      
      if (checkDate.getMonth() === targetMonth) {
        return checkDate.getDate() === originalStartDateObj.getDate();
      }
    }
  }
  
  return false;
}

/**
 * 이 일정만 수정 핸들러
 * 특정 날짜의 반복 일정만 예외 처리하여 수정
 */
export function handleEditThisInstance(params: RecurringEditHandlersParams): void {
  const { pendingRecurringEdit, todos, onEditTodo } = params;
  if (!pendingRecurringEdit || !onEditTodo) return;
  
  const { todoId, date, startTime, endTime, text } = pendingRecurringEdit;
  
  // dialog-edit 타입일 때는 todoId가 이미 원본 반복 일정 ID
  const recurringId = pendingRecurringEdit.type === 'dialog-edit' 
    ? todoId 
    : extractRecurringId(todoId);
  
  const originalTodo = todos.find(t => t.id === recurringId);
  if (!originalTodo) return;
  
  // dialog-edit 타입일 때는 pendingRecurringEdit.date를 사용 (편집하려는 날짜)
  const eventDate = pendingRecurringEdit.type === 'dialog-edit' 
    ? date // 편집하려는 날짜 사용
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
  // dialog-edit 타입일 때는 텍스트, 카테고리, 반복 규칙도 업데이트 가능
  const updates: Partial<Todo> = { modifiedInstances: newModifiedInstances };
  if (pendingRecurringEdit.type === 'dialog-edit') {
    if (text !== originalTodo.text) {
      updates.text = text;
    }
    if (pendingRecurringEdit.categoryId && pendingRecurringEdit.categoryId !== originalTodo.categoryId) {
      updates.categoryId = pendingRecurringEdit.categoryId;
    }
  }
  onEditTodo(recurringId, updates);
}

/**
 * 이 일정 및 향후 일정 수정 핸들러
 * 과거 일정은 유지하고 미래 일정만 수정
 */
export function handleEditThisAndFuture(params: RecurringEditHandlersParams): void {
  const { pendingRecurringEdit, todos, onEditTodo } = params;
  if (!pendingRecurringEdit || !onEditTodo) return;
  
  const { todoId, date, startTime, endTime, text, recurrenceRule, categoryId, originalDate } = pendingRecurringEdit;
  
  // dialog-edit 타입일 때는 todoId가 이미 원본 반복 일정 ID
  const recurringId = pendingRecurringEdit.type === 'dialog-edit' 
    ? todoId 
    : extractRecurringId(todoId);
  
  const originalTodo = todos.find(t => t.id === recurringId);
  if (!originalTodo || !originalTodo.recurrenceRule) return;
  
  // dialog-edit 타입일 때는 pendingRecurringEdit.date를 사용 (편집하려는 날짜)
  const eventDate = pendingRecurringEdit.type === 'dialog-edit' 
    ? date // 편집하려는 날짜 사용
    : (() => {
        const timestampPart = todoId.substring(recurringId.length + 1);
        return new Date(timestampPart);
      })();
  
  // 날짜가 변경된 경우 새로운 시작 날짜로 설정, 아니면 편집 날짜
  const newStartDate = pendingRecurringEdit.type === 'drag' && 
    date.toDateString() !== originalDate.toDateString() 
    ? date 
    : eventDate;
  
  // 기존 modifiedInstances 보존 (과거 일정 유지)
  const existingModifiedInstances = originalTodo.modifiedInstances || {};
  
  // 현재 날짜 이전의 modifiedInstances만 필터링하여 보존
  const newStartDateKey = formatDateKey(newStartDate);
  const preservedModifiedInstances: Record<string, { date?: Date; startTime?: string; endTime?: string }> = {};
  
  Object.entries(existingModifiedInstances).forEach(([dateKey, instance]) => {
    // 현재 날짜 이전의 modifiedInstances만 보존
    if (dateKey < newStartDateKey) {
      preservedModifiedInstances[dateKey] = instance;
    }
  });
  
  // 원래 시작 날짜부터 새로운 시작 날짜 직전까지의 모든 반복 일정에 대해 원래 시간 저장
  const originalStartDate = originalTodo.recurrenceRule.startDate || originalTodo.date;
  const originalStartDateObj = new Date(originalStartDate);
  originalStartDateObj.setHours(0, 0, 0, 0);
  
  const newStartDateObj = new Date(newStartDate);
  newStartDateObj.setHours(0, 0, 0, 0);
  
  // 원래 시작 날짜부터 새로운 시작 날짜 직전까지의 날짜 범위 생성
  const dateRange: Date[] = [];
  const currentDate = new Date(originalStartDateObj);
  
  while (currentDate < newStartDateObj) {
    dateRange.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // 각 날짜에 대해 반복 규칙을 확인하여 일정이 있는 날짜에만 원래 시간 저장
  dateRange.forEach((checkDate) => {
    const dateKey = formatDateKey(checkDate);
    
    // 이미 modifiedInstances에 있는 날짜는 건너뛰기
    if (preservedModifiedInstances[dateKey]) {
      return;
    }
    
    // 이 날짜에 반복 일정이 있는지 확인
    const shouldInclude = shouldIncludeDate(checkDate, originalTodo, originalStartDateObj);
    
    // 건너뛴 날짜는 제외
    if (shouldInclude) {
      const dateKeyStr = formatDateKey(checkDate);
      const isSkipped = originalTodo.skippedDates?.includes(dateKeyStr);
      
      if (!isSkipped) {
        // 원래 시간을 modifiedInstances에 저장 (과거 일정 보존)
        preservedModifiedInstances[dateKey] = {
          startTime: originalTodo.startTime,
          endTime: originalTodo.endTime,
        };
      }
    }
  });
  
  // 새로운 반복 규칙 생성 (시작 날짜 변경)
  const cleanedRecurrenceRule = { ...recurrenceRule };
  delete (cleanedRecurrenceRule as any).modifiedInstances;
  
  const newRecurrenceRule = {
    ...originalTodo.recurrenceRule,
    ...cleanedRecurrenceRule, // recurrenceRule도 업데이트
    startDate: newStartDate,
  };
  
  // onEditTodo를 사용하여 modifiedInstances 보존하면서 업데이트
  const updates: Partial<Todo> = {
    recurrenceRule: newRecurrenceRule,
    modifiedInstances: preservedModifiedInstances, // 과거 일정 보존
  };
  
  // 시작 시간이 변경된 경우에만 업데이트
  if (startTime !== originalTodo.startTime) {
    updates.startTime = startTime;
  }
  
  // 종료 시간이 변경된 경우에만 업데이트
  if (endTime !== originalTodo.endTime) {
    updates.endTime = endTime;
  }
  
  // 텍스트나 카테고리도 업데이트 가능
  if (text && text !== originalTodo.text) {
    updates.text = text;
  }
  if (categoryId && categoryId !== originalTodo.categoryId) {
    updates.categoryId = categoryId;
  }
  
  onEditTodo(recurringId, updates);
}

/**
 * 모든 일정 수정 핸들러
 * 원본 반복 일정의 시간 정보를 업데이트
 */
export function handleEditAllInstances(params: RecurringEditHandlersParams): void {
  const { pendingRecurringEdit, todos, selectedDate, onEditRecurring } = params;
  if (!pendingRecurringEdit || !onEditRecurring) return;
  
  const { todoId, date, startTime, endTime, text, recurrenceRule, categoryId } = pendingRecurringEdit;
  
  // dialog-edit 타입일 때는 todoId가 이미 원본 반복 일정 ID
  const recurringId = pendingRecurringEdit.type === 'dialog-edit' 
    ? todoId 
    : extractRecurringId(todoId);
  
  const originalTodo = todos.find(t => t.id === recurringId);
  if (!originalTodo || !originalTodo.recurrenceRule) return;
  
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
  
  onEditRecurring(
    recurringId,
    text || originalTodo.text,
    startTime,
    endTime,
    newRecurrenceRule,
    categoryId || originalTodo.categoryId
  );
}
