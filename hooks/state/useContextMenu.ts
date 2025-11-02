import { useState } from 'react';
import type { Todo } from '@/types/calendar';
import { isRecurringInstance } from '@/utils/recurringUtils';

interface UseContextMenuProps {
  todos: Todo[];
  onAddTodo?: (todo: Omit<Todo, 'id'>, callback?: (id: string) => void) => void;
  onEditTodo?: (id: string, updates: Partial<Todo>) => void;
  onDeleteTodo?: (id: string) => void;
  onMoveTodo?: (id: string, newDate: Date) => void;
  openCategoryDialog: (todoId: string, currentCategoryId: string) => void;
  openDateDialog: (todoId: string, currentDate: Date) => void;
  openDuplicateDialog: (todoId: string, todoName: string) => void;
  openRecurringDialog: (todoId: string, action: 'edit' | 'delete') => void;
  startEdit: (todoId: string, text: string) => void;
  finishEdit: () => void;
}

export interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  todoId: string;
}

/**
 * Context menu management for todo operations
 * Handles right-click menu and related actions
 */
export function useContextMenu({
  todos,
  onAddTodo,
  onDeleteTodo,
  openCategoryDialog,
  openDateDialog,
  openDuplicateDialog,
  openRecurringDialog,
  startEdit,
  finishEdit,
}: UseContextMenuProps) {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    todoId: '',
  });

  const handleContextMenu = (e: React.MouseEvent, todoId: string) => {
    e.preventDefault();
    e.stopPropagation();

    // Finish editing before opening context menu
    finishEdit();

    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      todoId,
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ ...contextMenu, isOpen: false });
  };

  const handleDuplicate = () => {
    const todo = todos.find((t) => t.id === contextMenu.todoId);
    if (!todo) return;

    openDuplicateDialog(todo.id, todo.text);
  };

  const handleConfirmDuplicate = (todoId: string) => {
    const todo = todos.find((t) => t.id === todoId);
    if (!todo) return;

    onAddTodo?.({
      text: todo.text,
      completed: false,
      date: todo.date,
      categoryId: todo.categoryId,
      startTime: todo.startTime,
      endTime: todo.endTime,
    });
  };

  const handleDelete = () => {
    const todo = todos.find((t) => t.id === contextMenu.todoId);
    if (!todo) return;

    // 생성된 반복 이벤트인지 확인 (UUID-timestamp 형식)
    if (isRecurringInstance(todo.id)) {
      openRecurringDialog(todo.id, 'delete');
    } else {
      onDeleteTodo?.(todo.id);
    }
  };

  const handleMove = () => {
    const todo = todos.find((t) => t.id === contextMenu.todoId);
    if (!todo) return;

    openDateDialog(todo.id, todo.date);
  };

  const handleChangeCategory = () => {
    const todo = todos.find((t) => t.id === contextMenu.todoId);
    if (!todo) return;

    openCategoryDialog(todo.id, todo.categoryId);
  };

  const handleRename = () => {
    const todo = todos.find((t) => t.id === contextMenu.todoId);
    if (!todo) return;

    startEdit(todo.id, todo.text);
  };

  const handleSetRecurrence = () => {
    // This would open a recurrence settings dialog
    // For now, just placeholder
    console.log('Set recurrence for', contextMenu.todoId);
  };

  return {
    contextMenu,
    handleContextMenu,
    closeContextMenu,
    handleDuplicate,
    handleConfirmDuplicate,
    handleDelete,
    handleMove,
    handleChangeCategory,
    handleRename,
    handleSetRecurrence,
  };
}
