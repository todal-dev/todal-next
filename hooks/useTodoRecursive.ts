import type { Todo } from '@/types/calendar';

/**
 * Recursive utility functions for todo operations
 */

/**
 * Recursively finds and removes a todo from the tree
 */
export const findAndRemoveTodo = (
  todoList: Todo[],
  todoId: string,
  onFound?: (todo: Todo) => void
): Todo[] => {
  return todoList.filter(todo => {
    if (todo.id === todoId) {
      onFound?.(todo);
      return false;
    }
    if (todo.subtasks && todo.subtasks.length > 0) {
      todo.subtasks = findAndRemoveTodo(todo.subtasks, todoId, onFound);
    }
    return true;
  });
};

/**
 * Recursively deletes a todo and its subtasks
 */
export const deleteRecursively = (todoList: Todo[], todoId: string): Todo[] => {
  return todoList
    .filter(todo => todo.id !== todoId)
    .map(todo => ({
      ...todo,
      subtasks: todo.subtasks ? deleteRecursively(todo.subtasks, todoId) : undefined,
    }));
};

/**
 * Recursively adds a subtask to a parent todo
 */
export const addSubtaskRecursively = (
  todoList: Todo[],
  parentId: string,
  newTodo: Todo
): Todo[] => {
  return todoList.map(todo => {
    if (todo.id === parentId) {
      return {
        ...todo,
        subtasks: [...(todo.subtasks || []), newTodo],
      };
    }
    if (todo.subtasks && todo.subtasks.length > 0) {
      return {
        ...todo,
        subtasks: addSubtaskRecursively(todo.subtasks, parentId, newTodo),
      };
    }
    return todo;
  });
};

/**
 * Toggles all subtasks to the same completion state
 */
export const toggleAllSubtasks = (
  subtasks: Todo[] | undefined,
  completed: boolean
): Todo[] | undefined => {
  if (!subtasks) return undefined;
  return subtasks.map(subtask => ({
    ...subtask,
    completed,
    subtasks: toggleAllSubtasks(subtask.subtasks, completed),
  }));
};

/**
 * Updates parent status based on subtask completion
 */
export const updateParentStatus = (todo: Todo): Todo => {
  if (!todo.subtasks || todo.subtasks.length === 0) {
    return todo;
  }

  // First update all subtask statuses
  const updatedSubtasks = todo.subtasks.map(updateParentStatus);

  // Check if all subtasks are completed
  const allSubtasksCompleted = updatedSubtasks.every(subtask => subtask.completed);

  return {
    ...todo,
    subtasks: updatedSubtasks,
    completed: allSubtasksCompleted,
  };
};

/**
 * Recursively toggles a todo's completion state
 */
export const toggleRecursively = (
  todoList: Todo[],
  todoId: string
): Todo[] => {
  return todoList.map(todo => {
    if (todo.id === todoId) {
      const newCompletedState = !todo.completed;
      return {
        ...todo,
        completed: newCompletedState,
        subtasks: toggleAllSubtasks(todo.subtasks, newCompletedState),
      };
    }
    if (todo.subtasks && todo.subtasks.length > 0) {
      const updatedTodo = {
        ...todo,
        subtasks: toggleRecursively(todo.subtasks, todoId),
      };
      // Update parent status based on subtask state
      return updateParentStatus(updatedTodo);
    }
    return todo;
  });
};

/**
 * Recursively edits a todo's text
 */
export const editRecursively = (
  todoList: Todo[],
  todoId: string,
  text: string
): Todo[] => {
  return todoList.map(todo => {
    if (todo.id === todoId) {
      return { ...todo, text };
    }
    if (todo.subtasks && todo.subtasks.length > 0) {
      return {
        ...todo,
        subtasks: editRecursively(todo.subtasks, todoId, text),
      };
    }
    return todo;
  });
};

/**
 * Recursively updates a todo's time
 */
export const updateTimeRecursively = (
  todoList: Todo[],
  todoId: string,
  startTime?: string,
  endTime?: string
): Todo[] => {
  return todoList.map(todo => {
    if (todo.id === todoId) {
      return { ...todo, startTime, endTime };
    }
    if (todo.subtasks && todo.subtasks.length > 0) {
      return {
        ...todo,
        subtasks: updateTimeRecursively(todo.subtasks, todoId, startTime, endTime),
      };
    }
    return todo;
  });
};

/**
 * Recursively updates a todo's date
 */
export const updateDateRecursively = (
  todoList: Todo[],
  todoId: string,
  date: Date,
  startTime?: string,
  endTime?: string
): Todo[] => {
  return todoList.map(todo => {
    if (todo.id === todoId) {
      return { ...todo, date, startTime, endTime };
    }
    if (todo.subtasks && todo.subtasks.length > 0) {
      return {
        ...todo,
        subtasks: updateDateRecursively(todo.subtasks, todoId, date, startTime, endTime),
      };
    }
    return todo;
  });
};

/**
 * Recursively updates a todo with partial updates
 */
export const updateTodoRecursively = (
  todoList: Todo[],
  todoId: string,
  updates: Partial<Todo>
): Todo[] => {
  return todoList.map(todo => {
    if (todo.id === todoId) {
      return { ...todo, ...updates };
    }
    if (todo.subtasks && todo.subtasks.length > 0) {
      return {
        ...todo,
        subtasks: updateTodoRecursively(todo.subtasks, todoId, updates),
      };
    }
    return todo;
  });
};

/**
 * Adds a subtask to a parent in the tree
 */
export const addToParent = (
  todoList: Todo[],
  parentId: string,
  newTodo: Todo,
  index?: number
): Todo[] => {
  return todoList.map(todo => {
    if (todo.id === parentId) {
      const subtasks = todo.subtasks || [];
      const insertIndex = index !== undefined ? Math.min(index, subtasks.length) : subtasks.length;
      return {
        ...todo,
        subtasks: [
          ...subtasks.slice(0, insertIndex),
          newTodo,
          ...subtasks.slice(insertIndex),
        ],
      };
    }
    if (todo.subtasks && todo.subtasks.length > 0) {
      return {
        ...todo,
        subtasks: addToParent(todo.subtasks, parentId, newTodo, index),
      };
    }
    return todo;
  });
};
