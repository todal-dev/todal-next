import { useState, useCallback, useEffect, useRef } from 'react';
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
  const initializedRef = useRef(false);

  // initialTodos가 변경되면 todos 상태 업데이트 (최초 1회만)
  useEffect(() => {
    if (!initializedRef.current && initialTodos.length > 0) {
      setTodos(initialTodos);
      initializedRef.current = true;
    }
  }, [initialTodos.length]); // length만 체크하여 불필요한 리렌더링 방지

  // Add a new todo (Optimistic Update)
  const handleAddTodo = useCallback(async (
    text: string,
    categoryId: string,
    date: Date,
    parentId?: string,
    startTime?: string,
    endTime?: string
  ) => {
    // 임시 ID 생성 (타임스탬프 기반)
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // 임시 Todo 객체 생성
    const tempTodo: Todo = {
      id: tempId,
      text,
      categoryId,
      date,
      completed: false,
      parentId,
      startTime,
      endTime,
      subtasks: [],
    };

    // 1. 즉시 로컬 상태 업데이트 (UI 즉시 반영)
    setTodos(prevTodos => {
      if (parentId) {
        return addSubtaskRecursively(prevTodos, parentId, tempTodo);
      } else {
        return [...prevTodos, tempTodo];
      }
    });

    // 2. 백그라운드에서 DB에 저장
    const result = await createTodoDB(text, categoryId, date, parentId, startTime, endTime);
    
    // 3. 서버 응답 받으면 임시 ID를 실제 ID로 교체
    if (result.success && result.todo) {
      setTodos(prevTodos => {
        const replaceTempId = (todos: Todo[]): Todo[] => {
          return todos.map(todo => {
            if (todo.id === tempId) {
              return result.todo!;
            }
            if (todo.subtasks && todo.subtasks.length > 0) {
              return {
                ...todo,
                subtasks: replaceTempId(todo.subtasks),
              };
            }
            return todo;
          });
        };
        return replaceTempId(prevTodos);
      });
    } else {
      // 실패시 롤백 (임시 Todo 제거)
      console.error('Failed to create todo:', result.error);
      setTodos(prevTodos => deleteRecursively(prevTodos, tempId));
    }
  }, []);

  // Delete a todo (Optimistic Update)
  const handleDeleteTodo = useCallback(async (id: string) => {
    // 삭제 전 백업 (롤백용)
    let backupTodos: Todo[] = [];
    
    // 1. 즉시 로컬 상태에서 삭제 (UI 즉시 반영)
    setTodos(prevTodos => {
      backupTodos = prevTodos;
      return deleteRecursively(prevTodos, id);
    });

    // 임시 ID인 경우 DB 호출 건너뛰기
    if (id.startsWith('temp-')) {
      return;
    }

    // 2. 백그라운드에서 DB에서 삭제
    const result = await deleteTodoDB(id);
    
    // 3. 실패시 롤백
    if (!result.success) {
      console.error('Failed to delete todo:', result.error);
      setTodos(backupTodos);
    }
  }, []);

  // Toggle todo completion (toggles all subtasks, updates parent)
  const handleToggleTodo = useCallback(async (id: string) => {
    let updatedCompleted: boolean | undefined;
    
    // 1. 먼저 로컬 상태 업데이트
    setTodos(prevTodos => {
      const updatedTodos = toggleRecursively(prevTodos, id);
      const todo = findTodoById(updatedTodos, id);
      
      if (todo) {
        updatedCompleted = todo.completed;
      }
      
      return updatedTodos;
    });
    
    // 2. 렌더링이 완료된 후 DB 업데이트
    if (updatedCompleted !== undefined) {
      await updateTodoDB(id, { completed: updatedCompleted });
    }
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

  // Edit todo text (Optimistic Update)
  const handleEditTodo = useCallback(async (id: string, text: string) => {
    // 1. 즉시 로컬 상태 업데이트 (UI 즉시 반영)
    setTodos(prevTodos => editRecursively(prevTodos, id, text));
    
    // 2. 백그라운드에서 DB 업데이트
    const result = await updateTodoDB(id, { text });
    
    // 3. 실패시 로그 (롤백은 복잡하므로 생략)
    if (!result.success) {
      console.error('Failed to update todo text:', result.error);
    }
  }, []);

  // Update todo time (Optimistic Update)
  const handleUpdateTodoTime = useCallback(async (id: string, startTime?: string, endTime?: string) => {
    // 1. 즉시 로컬 상태 업데이트 (UI 즉시 반영)
    setTodos(prevTodos => updateTimeRecursively(prevTodos, id, startTime, endTime));
    
    // 2. 백그라운드에서 DB 업데이트
    const result = await updateTodoDB(id, { startTime, endTime });
    
    // 3. 실패시 로그
    if (!result.success) {
      console.error('Failed to update todo time:', result.error);
    }
  }, []);

  // Update todo date and time (Optimistic Update)
  const handleUpdateTodoDateTime = useCallback(async (
    id: string,
    date: Date,
    startTime?: string,
    endTime?: string
  ) => {
    // 1. 즉시 로컬 상태 업데이트 (UI 즉시 반영)
    setTodos(prevTodos => updateDateRecursively(prevTodos, id, date, startTime, endTime));
    
    // 2. 백그라운드에서 DB 업데이트
    const result = await updateTodoDB(id, { date, startTime, endTime });
    
    // 3. 실패시 로그
    if (!result.success) {
      console.error('Failed to update todo date/time:', result.error);
    }
  }, []);

  // Update todo with partial updates (Optimistic Update)
  const handleUpdateTodo = useCallback(async (id: string, updates: Partial<Todo>) => {
    // 1. 즉시 로컬 상태 업데이트 (UI 즉시 반영)
    setTodos(prevTodos => updateTodoRecursively(prevTodos, id, updates));
    
    // 2. 백그라운드에서 DB 업데이트
    const dbUpdates: any = {};
    if (updates.text !== undefined) dbUpdates.text = updates.text;
    if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
    if (updates.categoryId !== undefined) dbUpdates.categoryId = updates.categoryId;
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.startTime !== undefined) dbUpdates.startTime = updates.startTime;
    if (updates.endTime !== undefined) dbUpdates.endTime = updates.endTime;
    if (updates.parentId !== undefined) dbUpdates.parentId = updates.parentId;
    
    const result = await updateTodoDB(id, dbUpdates);
    
    // 3. 실패시 로그
    if (!result.success) {
      console.error('Failed to update todo:', result.error);
    }
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

    setTodos(prevTodos => {
      const currentTodo = findTodo(prevTodos, todoId);
      if (!currentTodo) return prevTodos;

      // Determine final categoryId
      const shouldKeepCategoryId = currentTodo.recurrenceRule && newCategoryId === 'cat-recurring';
      const finalCategoryId = shouldKeepCategoryId ? currentTodo.categoryId : newCategoryId;
      
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
    // finalCategoryId를 계산하기 위해 setTodos의 결과를 기다릴 필요 없이
    // prevTodos에서 직접 계산한 값을 사용
    setTodos(prevTodos => {
      const currentTodo = findTodo(prevTodos, todoId);
      if (currentTodo) {
        const shouldKeepCategoryId = currentTodo.recurrenceRule && newCategoryId === 'cat-recurring';
        const finalCategoryId = shouldKeepCategoryId ? currentTodo.categoryId : newCategoryId;
        
        updateTodoDB(todoId, {
          categoryId: finalCategoryId,
          parentId: newParentId
        });
      }
      return prevTodos;
    });
  }, []); // 의존성 배열 제거

  // Move todo to a different date (Optimistic Update)
  const handleMoveTodoToDate = useCallback(async (id: string, newDate: Date) => {
    // 1. 즉시 로컬 상태 업데이트 (UI 즉시 반영)
    setTodos(prevTodos => updateTodoRecursively(prevTodos, id, { date: newDate }));
    
    // 2. 백그라운드에서 DB 업데이트
    const result = await updateTodoDB(id, { date: newDate });
    
    // 3. 실패시 로그
    if (!result.success) {
      console.error('Failed to move todo to date:', result.error);
    }
  }, []);

  // Add recurring todo (Optimistic Update)
  const handleAddRecurring = useCallback(async (
    text: string,
    startTime: string,
    endTime: string,
    recurrenceRule: RecurrenceRule,
    selectedDate: Date,
    categoryId: string = 'cat-etc'
  ) => {
    // 임시 ID 생성
    const tempId = `temp-recurring-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // 임시 Todo 객체 생성
    const tempTodo: Todo = {
      id: tempId,
      text,
      categoryId,
      date: selectedDate,
      completed: false,
      startTime,
      endTime,
      recurrenceRule,
      subtasks: [],
      completedDates: [],
      skippedDates: [],
    };

    // 1. 즉시 로컬 상태 업데이트
    setTodos(prevTodos => [...prevTodos, tempTodo]);

    // 2. 백그라운드에서 DB에 저장
    const result = await createRecurringTodoDB(
      text,
      categoryId,
      selectedDate,
      startTime,
      endTime,
      recurrenceRule
    );
    
    // 3. 서버 응답 받으면 임시 ID를 실제 ID로 교체
    if (result.success && result.todo) {
      setTodos(prevTodos => prevTodos.map(todo => 
        todo.id === tempId ? result.todo! : todo
      ));
    } else {
      // 실패시 롤백
      console.error('Failed to create recurring todo:', result.error);
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== tempId));
    }
  }, []);

  // Edit recurring todo (Optimistic Update)
  const handleEditRecurring = useCallback(async (
    id: string,
    text: string,
    startTime: string,
    endTime: string,
    recurrenceRule: RecurrenceRule,
    categoryId: string
  ) => {
    // 1. 즉시 로컬 상태 업데이트
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
    
    // 2. 백그라운드에서 DB 업데이트
    const result = await updateTodoDB(id, { text, startTime, endTime, categoryId });
    
    // 3. 실패시 로그
    if (!result.success) {
      console.error('Failed to update recurring todo:', result.error);
    }
  }, []);

  // Delete recurring todo (Optimistic Update)
  const handleDeleteRecurring = useCallback(async (id: string) => {
    // 백업 (롤백용)
    let backupTodos: Todo[] = [];
    
    // 1. 즉시 로컬 상태에서 삭제
    setTodos(prevTodos => {
      backupTodos = prevTodos;
      return prevTodos.filter(todo => todo.id !== id);
    });
    
    // 2. 백그라운드에서 DB에서 삭제
    const result = await deleteTodoDB(id);
    
    // 3. 실패시 롤백
    if (!result.success) {
      console.error('Failed to delete recurring todo:', result.error);
      setTodos(backupTodos);
    }
  }, []);

  // Add todo from calendar (Optimistic Update with callback)
  const handleAddTodoFromCalendar = useCallback(async (
    todo: Omit<Todo, 'id'>,
    callback?: (id: string) => void
  ) => {
    // 임시 ID 생성
    const tempId = `temp-calendar-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // 임시 Todo 객체 생성
    const tempTodo: Todo = {
      ...todo,
      id: tempId,
      subtasks: todo.subtasks || [],
    };

    // 1. 즉시 로컬 상태 업데이트
    setTodos(prevTodos => [...prevTodos, tempTodo]);
    
    // 콜백 즉시 호출 (임시 ID로)
    callback?.(tempId);

    // 2. 백그라운드에서 DB에 저장
    const result = await createTodoDB(
      todo.text,
      todo.categoryId,
      todo.date,
      todo.parentId,
      todo.startTime,
      todo.endTime
    );
    
    // 3. 서버 응답 받으면 임시 ID를 실제 ID로 교체
    if (result.success && result.todo) {
      setTodos(prevTodos => prevTodos.map(t => 
        t.id === tempId ? result.todo! : t
      ));
    } else {
      // 실패시 롤백
      console.error('Failed to create todo from calendar:', result.error);
      setTodos(prevTodos => prevTodos.filter(t => t.id !== tempId));
    }
  }, []);

  // Toggle recurring instance (Optimistic Update)
  const handleToggleRecurringInstance = useCallback(async (recurringId: string, date: Date) => {
    let newCompletedDates: string[] = [];
    
    // 1. 즉시 로컬 상태 업데이트
    setTodos(prevTodos => {
      const recurringTodo = prevTodos.find(t => t.id === recurringId);
      if (!recurringTodo) return prevTodos;

      const dateString = formatDateKey(date);
      const completedDates = recurringTodo.completedDates || [];
      const isCompleted = completedDates.includes(dateString);

      // 토글: 있으면 제거, 없으면 추가
      newCompletedDates = isCompleted
        ? completedDates.filter(d => d !== dateString)
        : [...completedDates, dateString];

      return updateTodoRecursively(prevTodos, recurringId, {
        completedDates: newCompletedDates
      });
    });
    
    // 2. 백그라운드에서 DB 업데이트
    const result = await updateTodoDB(recurringId, { completedDates: newCompletedDates });
    
    // 3. 실패시 로그
    if (!result.success) {
      console.error('Failed to update completed dates:', result.error);
    }
  }, []);

  // Skip recurring instance (Optimistic Update)
  const handleSkipRecurringInstance = useCallback(async (recurringId: string, date: Date) => {
    let newSkippedDates: string[] = [];
    let shouldUpdate = false;
    
    // 1. 즉시 로컬 상태 업데이트
    setTodos(prevTodos => {
      const recurringTodo = prevTodos.find(t => t.id === recurringId);
      if (!recurringTodo) return prevTodos;

      const dateString = formatDateKey(date);
      const skippedDates = recurringTodo.skippedDates || [];

      // 이미 건너뛴 날짜면 추가하지 않음
      if (skippedDates.includes(dateString)) return prevTodos;

      newSkippedDates = [...skippedDates, dateString];
      shouldUpdate = true;

      return updateTodoRecursively(prevTodos, recurringId, {
        skippedDates: newSkippedDates
      });
    });
    
    // 2. 백그라운드에서 DB 업데이트
    if (shouldUpdate) {
      const result = await updateTodoDB(recurringId, { skippedDates: newSkippedDates });
      
      // 3. 실패시 로그
      if (!result.success) {
        console.error('Failed to update skipped dates:', result.error);
      }
    }
  }, []);

  // Delete recurring after (Optimistic Update)
  const handleDeleteRecurringAfter = useCallback(async (recurringId: string, date: Date) => {
    let newRecurrenceRule: RecurrenceRule | undefined;
    
    // 1. 즉시 로컬 상태 업데이트
    setTodos(prevTodos => {
      const recurringTodo = prevTodos.find(t => t.id === recurringId);
      if (!recurringTodo || !recurringTodo.recurrenceRule) return prevTodos;

      // endDate를 오늘 날짜로 설정 (오늘 이전으로)
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() - 1); // 오늘은 제외하고 어제까지만

      newRecurrenceRule = {
        ...recurringTodo.recurrenceRule,
        endDate
      };

      return updateTodoRecursively(prevTodos, recurringId, {
        recurrenceRule: newRecurrenceRule
      });
    });
    
    // 2. 백그라운드에서 DB 업데이트
    if (newRecurrenceRule) {
      const result = await updateTodoDB(recurringId, { recurrenceRule: newRecurrenceRule });
      
      // 3. 실패시 로그
      if (!result.success) {
        console.error('Failed to update recurrence rule:', result.error);
      }
    }
  }, []);

  // Convert recurring to regular (Optimistic Update)
  const handleConvertRecurringToRegular = useCallback(async (
    recurringId: string,
    date: Date,
    categoryId: string
  ) => {
    let recurringTodo: Todo | undefined;
    
    setTodos(prevTodos => {
      recurringTodo = prevTodos.find(t => t.id === recurringId);
      return prevTodos;
    });
    
    if (!recurringTodo || !recurringTodo.recurrenceRule) return;

    const dateString = formatDateKey(date);
    const skippedDates = recurringTodo.skippedDates || [];
    const newSkippedDates = [...skippedDates, dateString];

    // 임시 ID 생성
    const tempId = `temp-convert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // 임시 Todo 객체 생성
    const tempTodo: Todo = {
      id: tempId,
      text: recurringTodo.text,
      categoryId,
      date,
      completed: false,
      startTime: recurringTodo.startTime,
      endTime: recurringTodo.endTime,
      subtasks: [],
    };

    // 1. 즉시 로컬 상태 업데이트
    setTodos(prevTodos => {
      // skippedDates 업데이트
      const updatedRecurring = updateTodoRecursively(prevTodos, recurringId, {
        skippedDates: newSkippedDates
      });
      // 새 할일 추가
      return [...updatedRecurring, tempTodo];
    });

    // 2. 백그라운드에서 DB 업데이트
    await updateTodoDB(recurringId, { skippedDates: newSkippedDates });

    // 3. 새로운 일반 할일 생성 (DB에 저장)
    const result = await createTodoDB(
      recurringTodo.text,
      categoryId,
      date,
      undefined,
      recurringTodo.startTime,
      recurringTodo.endTime
    );

    // 4. 서버 응답 받으면 임시 ID를 실제 ID로 교체
    if (result.success && result.todo) {
      setTodos(prevTodos => prevTodos.map(t => 
        t.id === tempId ? result.todo! : t
      ));
    } else {
      // 실패시 롤백
      console.error('Failed to create regular todo:', result.error);
      setTodos(prevTodos => prevTodos.filter(t => t.id !== tempId));
    }
  }, []); // 의존성 배열 제거

  // Convert regular to recurring (Optimistic Update)
  const handleConvertRegularToRecurring = useCallback(async (
    todoId: string,
    text: string,
    startTime: string,
    endTime: string,
    recurrenceRule: RecurrenceRule,
    categoryId: string
  ) => {
    let todo: Todo | undefined;
    let backupTodos: Todo[] = [];
    
    setTodos(prevTodos => {
      todo = prevTodos.find(t => t.id === todoId);
      backupTodos = prevTodos;
      return prevTodos;
    });
    
    if (!todo || todo.recurrenceRule) return;

    // 임시 ID 생성
    const tempId = `temp-recurring-convert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // 임시 반복 Todo 객체 생성
    const tempTodo: Todo = {
      id: tempId,
      text,
      categoryId,
      date: todo.date,
      completed: false,
      startTime,
      endTime,
      recurrenceRule,
      subtasks: [],
      completedDates: [],
      skippedDates: [],
    };

    // 백업 (롤백용)
    backupTodos = todos;

    // 1. 즉시 로컬 상태 업데이트
    setTodos(prevTodos => {
      const filteredTodos = prevTodos.filter(t => t.id !== todoId);
      return [...filteredTodos, tempTodo];
    });

    // 2. 백그라운드에서 DB 작업
    // 기존 일반 할일 삭제
    const deleteResult = await deleteTodoDB(todoId);
    
    if (!deleteResult.success) {
      console.error('Failed to delete regular todo:', deleteResult.error);
      setTodos(backupTodos);
      return;
    }

    // 새로운 반복 할일 생성
    const result = await createRecurringTodoDB(
      text,
      categoryId,
      todo.date,
      startTime,
      endTime,
      recurrenceRule
    );

    // 3. 서버 응답 받으면 임시 ID를 실제 ID로 교체
    if (result.success && result.todo) {
      setTodos(prevTodos => prevTodos.map(t => 
        t.id === tempId ? result.todo! : t
      ));
    } else {
      // 실패시 롤백
      console.error('Failed to create recurring todo:', result.error);
      setTodos(backupTodos);
    }
  }, []); // 의존성 배열 제거

  // Convert recurring to regular all (Optimistic Update)
  const handleConvertRecurringToRegularAll = useCallback(async (
    recurringId: string,
    date: Date,
    categoryId: string
  ) => {
    let recurringTodo: Todo | undefined;
    let backupTodos: Todo[] = [];
    
    setTodos(prevTodos => {
      recurringTodo = prevTodos.find(t => t.id === recurringId);
      backupTodos = prevTodos;
      return prevTodos;
    });
    
    if (!recurringTodo || !recurringTodo.recurrenceRule) return;

    // 임시 ID 생성
    const tempId = `temp-regular-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // 임시 Todo 객체 생성
    const tempTodo: Todo = {
      id: tempId,
      text: recurringTodo.text,
      categoryId,
      date,
      completed: false,
      startTime: recurringTodo.startTime,
      endTime: recurringTodo.endTime,
      subtasks: [],
    };

    // 백업 (롤백용)
    backupTodos = todos;

    // 1. 즉시 로컬 상태 업데이트
    setTodos(prevTodos => {
      const filteredTodos = prevTodos.filter(t => t.id !== recurringId);
      return [...filteredTodos, tempTodo];
    });

    // 2. 백그라운드에서 DB 작업
    // 기존 반복 할일 삭제
    const deleteResult = await deleteTodoDB(recurringId);
    
    if (!deleteResult.success) {
      console.error('Failed to delete recurring todo:', deleteResult.error);
      setTodos(backupTodos);
      return;
    }

    // 새로운 일반 할일 생성
    const result = await createTodoDB(
      recurringTodo.text,
      categoryId,
      date,
      undefined,
      recurringTodo.startTime,
      recurringTodo.endTime
    );

    // 3. 서버 응답 받으면 임시 ID를 실제 ID로 교체
    if (result.success && result.todo) {
      setTodos(prevTodos => prevTodos.map(t => 
        t.id === tempId ? result.todo! : t
      ));
    } else {
      // 실패시 롤백
      console.error('Failed to create regular todo:', result.error);
      setTodos(backupTodos);
    }
  }, []); // 의존성 배열 제거

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
