export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // N일/주/월/년마다 (기본값: 1)
  startDate?: Date;
  endDate?: Date; // 종료 날짜
  count?: number; // N회 반복 후 종료
  daysOfWeek?: number[]; // 1=월, 2=화, ..., 7=일 (weekly용)
  monthDay?: number; // 매월 N일 (monthly/yearly용, 1-31)
  month?: number; // 매년 N월 (yearly용, 1-12)
  nthWeekday?: { // 매월 N번째 요일 (예: 첫째주 월요일)
    nth: number; // 1=첫째, 2=둘째, 3=셋째, 4=넷째, -1=마지막
    weekday: number; // 1=월, 2=화, ..., 7=일
  };
  exceptions?: string[]; // 예외 날짜 (YYYY-MM-DD 형식) - 건너뛴 날짜와 별개
}

export interface Todo {
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
  completedDates?: string[]; // 반복 일정에서 완료한 날짜들 (YYYY-MM-DD 형식)
  skippedDates?: string[]; // 반복 일정에서 건너뛴 날짜들 (YYYY-MM-DD 형식)
  googleEventId?: string; // Google Calendar Event ID (양방향 동기화용)
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface BigCalendarProps {
  selectedDate?: Date;
  todos?: Todo[];
  categories?: Category[];
  onUpdateTodoDateTime?: (id: string, date: Date, startTime?: string, endTime?: string) => void;
  onAddTodo?: (todo: Omit<Todo, 'id'>, callback?: (id: string) => void) => void;
  onEditTodo?: (id: string, updates: Partial<Todo>) => void;
  onDeleteTodo?: (id: string) => void;
  onMoveTodo?: (id: string, newDate: Date) => void;
}
