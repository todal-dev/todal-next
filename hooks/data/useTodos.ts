import { useState, useCallback, useEffect } from 'react';
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

  // initialTodos가 변경되면 todos 상태 업데이트
  useEffect(() => {
    if (initialTodos.length > 0) {
      setTodos(initialTodos);
    }
  }, [initialTodos]);

  // Add a new todo
  const handleAddTodo = useCallback((
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

    setTodos(prevTodos => {
      if (parentId) {
        // Add as subtask
        return addSubtaskRecursively(prevTodos, parentId, newTodo);
      } else {
        // Add as top-level todo
        return [...prevTodos, newTodo];
      }
    });
  }, []);

  // Delete a todo (recursively deletes subtasks)
  const handleDeleteTodo = useCallback((id: string) => {
    setTodos(prevTodos => deleteRecursively(prevTodos, id));
  }, []);

  // Toggle todo completion (toggles all subtasks, updates parent)
  const handleToggleTodo = useCallback((id: string) => {
    setTodos(prevTodos => toggleRecursively(prevTodos, id));
  }, []);

  // Edit todo text
  const handleEditTodo = useCallback((id: string, text: string) => {
    setTodos(prevTodos => editRecursively(prevTodos, id, text));
  }, []);

  // Update todo time
  const handleUpdateTodoTime = useCallback((id: string, startTime?: string, endTime?: string) => {
    setTodos(prevTodos => updateTimeRecursively(prevTodos, id, startTime, endTime));
  }, []);

  // Update todo date and time
  const handleUpdateTodoDateTime = useCallback((
    id: string,
    date: Date,
    startTime?: string,
    endTime?: string
  ) => {
    setTodos(prevTodos => updateDateRecursively(prevTodos, id, date, startTime, endTime));
  }, []);

  // Update todo with partial updates
  const handleUpdateTodo = useCallback((id: string, updates: Partial<Todo>) => {
    setTodos(prevTodos => updateTodoRecursively(prevTodos, id, updates));
  }, []);

  // Move todo to different category/parent
  const handleMoveTodo = useCallback((
    todoId: string,
    newCategoryId: string,
    newParentId?: string,
    newIndex?: number
  ) => {
    setTodos(prevTodos => {
      let movedTodo: Todo | null = null;

      // Find and remove the todo
      const newTodos = findAndRemoveTodo(prevTodos, todoId, (todo) => {
        // 반복 할일이 반복 카테고리 내에서 이동하는 경우, categoryId 유지
        const shouldKeepCategoryId = todo.recurrenceRule && newCategoryId === 'cat-recurring';
        movedTodo = {
          ...todo,
          categoryId: shouldKeepCategoryId ? todo.categoryId : newCategoryId,
          parentId: newParentId
        };
      });

      if (!movedTodo) return prevTodos;

      // Insert at new position
      if (newParentId) {
        // Move as subtask
        return addToParent(newTodos, newParentId, movedTodo, newIndex);
      } else {
        // Move as top-level todo
        const insertIndex = newIndex !== undefined ? Math.min(newIndex, newTodos.length) : newTodos.length;
        return [
          ...newTodos.slice(0, insertIndex),
          movedTodo,
          ...newTodos.slice(insertIndex),
        ];
      }
    });
  }, []);

  // Move todo to a different date
  const handleMoveTodoToDate = useCallback((id: string, newDate: Date) => {
    setTodos(prevTodos => updateTodoRecursively(prevTodos, id, { date: newDate }));
  }, []);

  // Add recurring todo
  const handleAddRecurring = useCallback((
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
    setTodos(prevTodos => [...prevTodos, newRecurring]);
  }, []);

  // Edit recurring todo
  const handleEditRecurring = useCallback((
    id: string,
    text: string,
    startTime: string,
    endTime: string,
    recurrenceRule: RecurrenceRule,
    categoryId: string
  ) => {
    setTodos(prevTodos => prevTodos.map(todo => {
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
  }, []);

  // Delete recurring todo
  const handleDeleteRecurring = useCallback((id: string) => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
  }, []);

  // Add todo from calendar (with callback)
  const handleAddTodoFromCalendar = useCallback((
    todo: Omit<Todo, 'id'>,
    callback?: (id: string) => void
  ) => {
    const newTodo: Todo = {
      ...todo,
      id: Date.now().toString(),
      subtasks: todo.subtasks || [],
    };
    setTodos(prevTodos => [...prevTodos, newTodo]);
    callback?.(newTodo.id);
  }, []);

  // Toggle recurring instance (completedDates 토글)
  const handleToggleRecurringInstance = useCallback((recurringId: string, date: Date) => {
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
  }, []);

  // Skip recurring instance (skippedDates에 날짜 추가)
  const handleSkipRecurringInstance = useCallback((recurringId: string, date: Date) => {
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
  }, []);

  // Delete recurring after (endDate를 오늘로 설정)
  const handleDeleteRecurringAfter = useCallback((recurringId: string, date: Date) => {
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
  }, []);

  // Convert recurring to regular (특정 날짜만 일반 할일로 분리)
  const handleConvertRecurringToRegular = useCallback((
    recurringId: string,
    date: Date,
    categoryId: string
  ) => {
    setTodos(prevTodos => {
      const recurringTodo = prevTodos.find(t => t.id === recurringId);
      if (!recurringTodo || !recurringTodo.recurrenceRule) return prevTodos;

      const dateString = formatDateKey(date);

      // 1. skippedDates에 해당 날짜 추가
      const skippedDates = recurringTodo.skippedDates || [];
      const updatedRecurring = updateTodoRecursively(prevTodos, recurringId, {
        skippedDates: [...skippedDates, dateString]
      });

      // 2. 새로운 일반 할일 생성
      const newRegularTodo: Todo = {
        id: `regular-${Date.now()}`,
        text: recurringTodo.text,
        completed: false,
        date: new Date(date),
        categoryId,
        startTime: recurringTodo.startTime,
        endTime: recurringTodo.endTime,
        subtasks: [],
      };

      return [...updatedRecurring, newRegularTodo];
    });
  }, []);

  // Convert regular to recurring (일반 할일을 반복으로 변환)
  const handleConvertRegularToRecurring = useCallback((
    todoId: string,
    text: string,
    startTime: string,
    endTime: string,
    recurrenceRule: RecurrenceRule,
    categoryId: string
  ) => {
    setTodos(prevTodos => {
      const todo = prevTodos.find(t => t.id === todoId);
      if (!todo || todo.recurrenceRule) return prevTodos;

      // 기존 일반 할일 삭제
      const filteredTodos = prevTodos.filter(t => t.id !== todoId);

      // 새로운 반복 할일 생성
      const newRecurring: Todo = {
        id: `recurring-${Date.now()}`,
        text,
        completed: false,
        date: todo.date,
        categoryId,
        startTime,
        endTime,
        recurrenceRule,
        subtasks: [],
      };

      return [...filteredTodos, newRecurring];
    });
  }, []);

  // Convert recurring to regular (모든 반복 항목을 일반으로 변환)
  const handleConvertRecurringToRegularAll = useCallback((
    recurringId: string,
    date: Date,
    categoryId: string
  ) => {
    setTodos(prevTodos => {
      const recurringTodo = prevTodos.find(t => t.id === recurringId);
      if (!recurringTodo || !recurringTodo.recurrenceRule) return prevTodos;

      // 기존 반복 할일 삭제
      const filteredTodos = prevTodos.filter(t => t.id !== recurringId);

      // 새로운 일반 할일 생성 (반복 규칙 제거)
      const newRegularTodo: Todo = {
        id: `regular-${Date.now()}`,
        text: recurringTodo.text,
        completed: false,
        date: new Date(date),
        categoryId,
        startTime: recurringTodo.startTime,
        endTime: recurringTodo.endTime,
        subtasks: [],
        // recurrenceRule 제거됨
      };

      return [...filteredTodos, newRegularTodo];
    });
  }, []);

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
    handleConvertRecurringToRegular,
    handleConvertRegularToRecurring,
    handleConvertRecurringToRegularAll,
  };
}
