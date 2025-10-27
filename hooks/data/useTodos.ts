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
import {
  createTodo as createTodoDB,
  updateTodo as updateTodoDB,
  deleteTodo as deleteTodoDB,
  createRecurringTodo as createRecurringTodoDB,
} from '@/lib/supabase/queries';

export function useTodos(initialTodos: Todo[] = []) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);

  // initialTodos가 변경되면 todos 상태 업데이트
  useEffect(() => {
    if (initialTodos.length > 0) {
      setTodos(initialTodos);
    }
  }, [initialTodos]);

  // Add a new todo
  const handleAddTodo = useCallback(async (
    text: string,
    categoryId: string,
    date: Date,
    parentId?: string,
    startTime?: string,
    endTime?: string
  ) => {
    // DB에 저장
    const result = await createTodoDB(text, categoryId, date, parentId, startTime, endTime);
    
    if (result.success && result.todo) {
      setTodos(prevTodos => {
        if (parentId) {
          // Add as subtask
          return addSubtaskRecursively(prevTodos, parentId, result.todo!);
        } else {
          // Add as top-level todo
          return [...prevTodos, result.todo!];
        }
      });
    } else {
      console.error('Failed to create todo:', result.error);
    }
  }, []);

  // Delete a todo (recursively deletes subtasks)
  const handleDeleteTodo = useCallback(async (id: string) => {
    // DB에서 삭제
    const result = await deleteTodoDB(id);
    
    if (result.success) {
      setTodos(prevTodos => deleteRecursively(prevTodos, id));
    } else {
      console.error('Failed to delete todo:', result.error);
    }
  }, []);

  // Toggle todo completion (toggles all subtasks, updates parent)
  const handleToggleTodo = useCallback(async (id: string) => {
    // 먼저 로컬 상태 업데이트해서 현재 값 확인
    setTodos(prevTodos => {
      const updatedTodos = toggleRecursively(prevTodos, id);
      const todo = findTodoById(updatedTodos, id);
      
      if (todo) {
        // DB 업데이트
        updateTodoDB(id, { completed: todo.completed });
      }
      
      return updatedTodos;
    });
  }, []);

  // Helper function to find todo by id
  const findTodoById = (todos: Todo[], id: string): Todo | null => {
    for (const todo of todos) {
      if (todo.id === id) return todo;
      if (todo.subtasks) {
        const found = findTodoById(todo.subtasks, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Edit todo text
  const handleEditTodo = useCallback(async (id: string, text: string) => {
    // DB 업데이트
    await updateTodoDB(id, { text });
    
    setTodos(prevTodos => editRecursively(prevTodos, id, text));
  }, []);

  // Update todo time
  const handleUpdateTodoTime = useCallback(async (id: string, startTime?: string, endTime?: string) => {
    // DB 업데이트
    await updateTodoDB(id, { startTime, endTime });
    
    setTodos(prevTodos => updateTimeRecursively(prevTodos, id, startTime, endTime));
  }, []);

  // Update todo date and time
  const handleUpdateTodoDateTime = useCallback(async (
    id: string,
    date: Date,
    startTime?: string,
    endTime?: string
  ) => {
    // DB 업데이트
    await updateTodoDB(id, { date, startTime, endTime });
    
    setTodos(prevTodos => updateDateRecursively(prevTodos, id, date, startTime, endTime));
  }, []);

  // Update todo with partial updates
  const handleUpdateTodo = useCallback(async (id: string, updates: Partial<Todo>) => {
    // DB 업데이트
    const dbUpdates: any = {};
    if (updates.text !== undefined) dbUpdates.text = updates.text;
    if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
    if (updates.categoryId !== undefined) dbUpdates.categoryId = updates.categoryId;
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.startTime !== undefined) dbUpdates.startTime = updates.startTime;
    if (updates.endTime !== undefined) dbUpdates.endTime = updates.endTime;
    if (updates.parentId !== undefined) dbUpdates.parentId = updates.parentId;
    
    await updateTodoDB(id, dbUpdates);
    
    setTodos(prevTodos => updateTodoRecursively(prevTodos, id, updates));
  }, []);

  // Move todo to different category/parent
  const handleMoveTodo = useCallback(async (
    todoId: string,
    newCategoryId: string,
    newParentId?: string,
    newIndex?: number
  ) => {
    // Find the todo first to get its recurrenceRule
    const findTodo = (todos: Todo[], id: string): Todo | null => {
      for (const todo of todos) {
        if (todo.id === id) return todo;
        if (todo.subtasks) {
          const found = findTodo(todo.subtasks, id);
          if (found) return found;
        }
      }
      return null;
    };

    const currentTodo = findTodo(todos, todoId);
    if (!currentTodo) return;

    // Determine final categoryId
    const shouldKeepCategoryId = currentTodo.recurrenceRule && newCategoryId === 'cat-recurring';
    const finalCategoryId = shouldKeepCategoryId ? currentTodo.categoryId : newCategoryId;
    
    setTodos(prevTodos => {
      let movedTodo: Todo | null = null;
      
      // Find and remove the todo
      const newTodos = findAndRemoveTodo(prevTodos, todoId, (todo) => {
        movedTodo = {
          ...todo,
          categoryId: finalCategoryId,
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

    // DB 업데이트 (비동기, setTodos 이후)
    await updateTodoDB(todoId, {
      categoryId: finalCategoryId,
      parentId: newParentId
    });
  }, [todos]);

  // Move todo to a different date
  const handleMoveTodoToDate = useCallback(async (id: string, newDate: Date) => {
    // DB 업데이트
    await updateTodoDB(id, { date: newDate });
    
    setTodos(prevTodos => updateTodoRecursively(prevTodos, id, { date: newDate }));
  }, []);

  // Add recurring todo
  const handleAddRecurring = useCallback(async (
    text: string,
    startTime: string,
    endTime: string,
    recurrenceRule: RecurrenceRule,
    selectedDate: Date,
    categoryId: string = 'cat-etc'
  ) => {
    // DB에 저장
    const result = await createRecurringTodoDB(
      text,
      categoryId,
      selectedDate,
      startTime,
      endTime,
      recurrenceRule
    );
    
    if (result.success && result.todo) {
      setTodos(prevTodos => [...prevTodos, result.todo!]);
    } else {
      console.error('Failed to create recurring todo:', result.error);
    }
  }, []);

  // Edit recurring todo
  const handleEditRecurring = useCallback(async (
    id: string,
    text: string,
    startTime: string,
    endTime: string,
    recurrenceRule: RecurrenceRule,
    categoryId: string
  ) => {
    // DB 업데이트 (recurrenceRule은 현재 updateTodoDB에서 지원하지 않으므로 로컬만 업데이트)
    await updateTodoDB(id, { text, startTime, endTime, categoryId });
    
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
  const handleDeleteRecurring = useCallback(async (id: string) => {
    // DB에서 삭제
    await deleteTodoDB(id);
    
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
  }, []);

  // Add todo from calendar (with callback)
  const handleAddTodoFromCalendar = useCallback(async (
    todo: Omit<Todo, 'id'>,
    callback?: (id: string) => void
  ) => {
    // DB에 저장
    const result = await createTodoDB(
      todo.text,
      todo.categoryId,
      todo.date,
      todo.parentId,
      todo.startTime,
      todo.endTime
    );
    
    if (result.success && result.todo) {
      setTodos(prevTodos => [...prevTodos, result.todo!]);
      callback?.(result.todo!.id);
    } else {
      console.error('Failed to create todo from calendar:', result.error);
    }
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
  const handleConvertRecurringToRegular = useCallback(async (
    recurringId: string,
    date: Date,
    categoryId: string
  ) => {
    const recurringTodo = todos.find(t => t.id === recurringId);
    if (!recurringTodo || !recurringTodo.recurrenceRule) return;

    const dateString = formatDateKey(date);

    // 1. skippedDates에 해당 날짜 추가 (DB 업데이트)
    const skippedDates = recurringTodo.skippedDates || [];
    await updateTodoDB(recurringId, {
      // Note: skippedDates는 현재 updateTodoDB에서 지원하지 않으므로 로컬만 업데이트
    });

    // 2. 새로운 일반 할일 생성 (DB에 저장)
    const result = await createTodoDB(
      recurringTodo.text,
      categoryId,
      date,
      undefined,
      recurringTodo.startTime,
      recurringTodo.endTime
    );

    if (result.success && result.todo) {
      setTodos(prevTodos => {
        // skippedDates 업데이트
        const updatedRecurring = updateTodoRecursively(prevTodos, recurringId, {
          skippedDates: [...skippedDates, dateString]
        });
        // 새 할일 추가
        return [...updatedRecurring, result.todo!];
      });
    }
  }, [todos]);

  // Convert regular to recurring (일반 할일을 반복으로 변환)
  const handleConvertRegularToRecurring = useCallback(async (
    todoId: string,
    text: string,
    startTime: string,
    endTime: string,
    recurrenceRule: RecurrenceRule,
    categoryId: string
  ) => {
    const todo = todos.find(t => t.id === todoId);
    if (!todo || todo.recurrenceRule) return;

    // 기존 일반 할일 삭제 (DB에서)
    await deleteTodoDB(todoId);

    // 새로운 반복 할일 생성 (DB에 저장)
    const result = await createRecurringTodoDB(
      text,
      categoryId,
      todo.date,
      startTime,
      endTime,
      recurrenceRule
    );

    if (result.success && result.todo) {
      setTodos(prevTodos => {
        const filteredTodos = prevTodos.filter(t => t.id !== todoId);
        return [...filteredTodos, result.todo!];
      });
    }
  }, [todos]);

  // Convert recurring to regular (모든 반복 항목을 일반으로 변환)
  const handleConvertRecurringToRegularAll = useCallback(async (
    recurringId: string,
    date: Date,
    categoryId: string
  ) => {
    const recurringTodo = todos.find(t => t.id === recurringId);
    if (!recurringTodo || !recurringTodo.recurrenceRule) return;

    // 기존 반복 할일 삭제 (DB에서)
    await deleteTodoDB(recurringId);

    // 새로운 일반 할일 생성 (DB에 저장)
    const result = await createTodoDB(
      recurringTodo.text,
      categoryId,
      date,
      undefined,
      recurringTodo.startTime,
      recurringTodo.endTime
    );

    if (result.success && result.todo) {
      setTodos(prevTodos => {
        const filteredTodos = prevTodos.filter(t => t.id !== recurringId);
        return [...filteredTodos, result.todo!];
      });
    }
  }, [todos]);

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
