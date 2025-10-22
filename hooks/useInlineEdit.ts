import { useState, useEffect } from 'react';
import type { Todo } from '@/types/calendar';

interface UseInlineEditProps {
  todos: Todo[];
  onEditTodo?: (id: string, updates: Partial<Todo>) => void;
  onDeleteTodo?: (id: string) => void;
}

/**
 * Inline editing functionality for todo blocks
 * Handles editing state, text updates, and cleanup
 */
export function useInlineEdit({ todos, onEditTodo, onDeleteTodo }: UseInlineEditProps) {
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);

  // Handle pending edit after todo is created
  useEffect(() => {
    if (pendingEditId) {
      const todo = todos.find(t => t.id === pendingEditId);
      if (todo) {
        setEditingTodoId(pendingEditId);
        setEditingText(todo.text || '');
        setPendingEditId(null);
      }
    }
  }, [todos, pendingEditId]);

  // Clean up empty todos when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Don't process if clicking on input or inside editing todo
      if (target.tagName === 'INPUT' || target.closest('input')) {
        return;
      }

      if (editingTodoId && editingText.trim() === '') {
        onDeleteTodo?.(editingTodoId);
        setEditingTodoId(null);
        setEditingText('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [editingTodoId, editingText, onDeleteTodo]);

  const startEdit = (todoId: string, text: string) => {
    setEditingTodoId(todoId);
    setEditingText(text);
  };

  const finishEdit = () => {
    if (editingTodoId) {
      const trimmedText = editingText.trim();
      if (trimmedText) {
        onEditTodo?.(editingTodoId, { text: trimmedText });
      } else {
        onDeleteTodo?.(editingTodoId);
      }
    }
    setEditingTodoId(null);
    setEditingText('');
  };

  const cancelEdit = () => {
    setEditingTodoId(null);
    setEditingText('');
  };

  return {
    editingTodoId,
    editingText,
    setEditingText,
    setPendingEditId,
    startEdit,
    finishEdit,
    cancelEdit,
  };
}
