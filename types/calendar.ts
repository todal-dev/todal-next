export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
  startDate?: Date;
  endDate?: Date;
  daysOfWeek?: number[]; // 1=월, 2=화, ..., 7=일
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
