'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { Todo } from '@/types/calendar';

interface TodoContextType {
  todos: Todo[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onAddTodo: (text: string, categoryId: string, date: Date, parentId?: string, startTime?: string, endTime?: string) => void;
  onDeleteTodo: (id: string) => void;
  onToggleTodo: (id: string) => void;
  onEditTodo: (id: string, text: string) => void;
  onUpdateTodoTime: (id: string, startTime?: string, endTime?: string) => void;
  onMoveTodo: (todoId: string, newCategoryId: string, newParentId?: string, newIndex?: number) => void;
  onUpdateTodoDateTime: (id: string, date: Date, startTime?: string, endTime?: string) => void;
  onAddTodoFromCalendar: (todo: Omit<Todo, 'id'>, callback?: (id: string) => void) => void;
  onUpdateTodo: (id: string, updates: Partial<Todo>) => void;
  onMoveTodoToDate: (id: string, newDate: Date) => void;
  onToggleRecurringInstance: (recurringId: string, date: Date) => void;
  onSkipRecurringInstance: (recurringId: string, date: Date) => void;
  onDeleteRecurringAfter: (recurringId: string, date: Date) => void;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

interface TodoProviderProps {
  children: ReactNode;
  value: TodoContextType;
}

export function TodoProvider({ children, value }: TodoProviderProps) {
  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}

export function useTodoContext() {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error('useTodoContext must be used within a TodoProvider');
  }
  return context;
}
