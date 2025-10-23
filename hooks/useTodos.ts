import { useState } from 'react';
import type { Todo, RecurrenceRule } from '@/types/calendar';
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
    // Delete the original recurring todo and all instances
    setTodos(todos.filter(todo => todo.id !== id && todo.recurrenceId !== id));
  };

  // Add todo from calendar (with callback)
  const handleAddTodoFromCalendar = (
    todo: Omit<Todo, 'id'>,
    callback?: (id: string) => void
  ) => {
    // recurrenceRule을 제외하고 나머지 속성만 복사
    const { recurrenceRule, ...todoWithoutRecurrence } = todo as any;

    const newTodo: Todo = {
      ...todoWithoutRecurrence,
      id: Date.now().toString(),
      subtasks: [],
    };
    setTodos([...todos, newTodo]);
    callback?.(newTodo.id);
  };

  // Toggle recurring instance (completedDates 토글)
  const handleToggleRecurringInstance = (recurringId: string, date: Date) => {
    setTodos(prevTodos => {
      const recurringTodo = prevTodos.find(t => t.id === recurringId);
      if (!recurringTodo) return prevTodos;

      // 날짜를 YYYY-MM-DD 형식으로 변환
      const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

      // 현재 completedDates 가져오기
      const completedDates = recurringTodo.completedDates || [];

      // 해당 날짜가 이미 완료되어 있는지 확인
      const isCompleted = completedDates.includes(dateString);

      // 토글: 있으면 제거, 없으면 추가
      const newCompletedDates = isCompleted
        ? completedDates.filter(d => d !== dateString)
        : [...completedDates, dateString];

      // 업데이트
      return updateTodoRecursively(prevTodos, recurringId, {
        completedDates: newCompletedDates
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
  };
}
