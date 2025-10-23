import { useState } from 'react';
import type { Todo, RecurrenceRule } from '@/types/calendar';
import { formatDateKey } from '@/utils/calendarUtils';
import {
  deleteRecursively,
  addSubtaskRecursively,
  toggleRecursively,
  editRecursively,
  updateTimeRecursively,
  updateDateRecursively,
  updateTodoRecursively,
  findAndRemoveTodo,
  addToParent,
} from './useTodoRecursive';

export function useTodos(initialTodos: Todo[] = []) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);

  // Add a new todo
  const handleAddTodo = (
    text: string,
    categoryId: string,
    date: Date,
    parentId?: string,
    startTime?: string,
    endTime?: string
  ) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      text,
      completed: false,
      date,
      categoryId,
      parentId,
      subtasks: [],
      startTime,
      endTime,
    };

    if (parentId) {
      // Add as subtask
      setTodos(addSubtaskRecursively(todos, parentId, newTodo));
    } else {
      // Add as top-level todo
      setTodos([...todos, newTodo]);
    }
  };

  // Delete a todo (recursively deletes subtasks)
  const handleDeleteTodo = (id: string) => {
    setTodos(deleteRecursively(todos, id));
  };

  // Toggle todo completion (toggles all subtasks, updates parent)
  const handleToggleTodo = (id: string) => {
    setTodos(toggleRecursively(todos, id));
  };

  // Edit todo text
  const handleEditTodo = (id: string, text: string) => {
    setTodos(editRecursively(todos, id, text));
  };

  // Update todo time
  const handleUpdateTodoTime = (id: string, startTime?: string, endTime?: string) => {
    setTodos(updateTimeRecursively(todos, id, startTime, endTime));
  };

  // Update todo date and time
  const handleUpdateTodoDateTime = (
    id: string,
    date: Date,
    startTime?: string,
    endTime?: string
  ) => {
    setTodos(updateDateRecursively(todos, id, date, startTime, endTime));
  };

  // Update todo with partial updates
  const handleUpdateTodo = (id: string, updates: Partial<Todo>) => {
    setTodos(updateTodoRecursively(todos, id, updates));
  };

  // Move todo to different category/parent
  const handleMoveTodo = (
    todoId: string,
    newCategoryId: string,
    newParentId?: string,
    newIndex?: number
  ) => {
    let movedTodo: Todo | null = null;

    // Find and remove the todo
    const newTodos = findAndRemoveTodo(todos, todoId, (todo) => {
      movedTodo = { ...todo, categoryId: newCategoryId, parentId: newParentId };
    });

    if (!movedTodo) return;

    // Insert at new position
    if (newParentId) {
      // Move as subtask
      setTodos(addToParent(newTodos, newParentId, movedTodo, newIndex));
    } else {
      // Move as top-level todo
      const insertIndex = newIndex !== undefined ? Math.min(newIndex, newTodos.length) : newTodos.length;
      setTodos([
        ...newTodos.slice(0, insertIndex),
        movedTodo,
        ...newTodos.slice(insertIndex),
      ]);
    }
  };

  // Move todo to a different date
  const handleMoveTodoToDate = (id: string, newDate: Date) => {
    setTodos(updateTodoRecursively(todos, id, { date: newDate }));
  };

  // Add recurring todo
  const handleAddRecurring = (
    text: string,
    startTime: string,
    endTime: string,
    recurrenceRule: RecurrenceRule,
    selectedDate: Date,
    categoryId: string = 'cat-etc'
  ) => {
    const newRecurring: Todo = {
      id: `recurring-${Date.now()}`,
      text,
      completed: false,
      date: selectedDate,
      categoryId,
      startTime,
      endTime,
      recurrenceRule,
      subtasks: [],
    };
    setTodos([...todos, newRecurring]);
  };

  // Edit recurring todo
  const handleEditRecurring = (
    id: string,
    text: string,
    startTime: string,
    endTime: string,
    recurrenceRule: RecurrenceRule,
    categoryId: string
  ) => {
    setTodos(todos.map(todo => {
      if (todo.id === id) {
        return {
          ...todo,
          text,
          startTime,
          endTime,
          recurrenceRule,
          categoryId,
        };
      }
      return todo;
    }));
  };

  // Delete recurring todo
  const handleDeleteRecurring = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  // Add todo from calendar (with callback)
  const handleAddTodoFromCalendar = (
    todo: Omit<Todo, 'id'>,
    callback?: (id: string) => void
  ) => {
    const newTodo: Todo = {
      ...todo,
      id: Date.now().toString(),
      subtasks: todo.subtasks || [],
    };
    setTodos([...todos, newTodo]);
    callback?.(newTodo.id);
  };

  // Toggle recurring instance (completedDates 토글)
  const handleToggleRecurringInstance = (recurringId: string, date: Date) => {
    setTodos(prevTodos => {
      const recurringTodo = prevTodos.find(t => t.id === recurringId);
      if (!recurringTodo) return prevTodos;

      const dateString = formatDateKey(date);
      const completedDates = recurringTodo.completedDates || [];
      const isCompleted = completedDates.includes(dateString);

      // 토글: 있으면 제거, 없으면 추가
      const newCompletedDates = isCompleted
        ? completedDates.filter(d => d !== dateString)
        : [...completedDates, dateString];

      return updateTodoRecursively(prevTodos, recurringId, {
        completedDates: newCompletedDates
      });
    });
  };

  // Skip recurring instance (skippedDates에 날짜 추가)
  const handleSkipRecurringInstance = (recurringId: string, date: Date) => {
    setTodos(prevTodos => {
      const recurringTodo = prevTodos.find(t => t.id === recurringId);
      if (!recurringTodo) return prevTodos;

      const dateString = formatDateKey(date);
      const skippedDates = recurringTodo.skippedDates || [];

      // 이미 건너뛴 날짜면 추가하지 않음
      if (skippedDates.includes(dateString)) return prevTodos;

      return updateTodoRecursively(prevTodos, recurringId, {
        skippedDates: [...skippedDates, dateString]
      });
    });
  };

  // Delete recurring after (endDate를 오늘로 설정)
  const handleDeleteRecurringAfter = (recurringId: string, date: Date) => {
    setTodos(prevTodos => {
      const recurringTodo = prevTodos.find(t => t.id === recurringId);
      if (!recurringTodo || !recurringTodo.recurrenceRule) return prevTodos;

      // endDate를 오늘 날짜로 설정 (오늘 이전으로)
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() - 1); // 오늘은 제외하고 어제까지만

      return updateTodoRecursively(prevTodos, recurringId, {
        recurrenceRule: {
          ...recurringTodo.recurrenceRule,
          endDate
        }
      });
    });
  };

  return {
    todos,
    setTodos,
    handleAddTodo,
    handleDeleteTodo,
    handleToggleTodo,
    handleEditTodo,
    handleUpdateTodoTime,
    handleUpdateTodoDateTime,
    handleUpdateTodo,
    handleMoveTodo,
    handleMoveTodoToDate,
    handleAddRecurring,
    handleEditRecurring,
    handleDeleteRecurring,
    handleAddTodoFromCalendar,
    handleToggleRecurringInstance,
    handleSkipRecurringInstance,
    handleDeleteRecurringAfter,
  };
}
