import { useState, useEffect, useCallback, useRef } from 'react';
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

  // Use refs to access latest values in event handlers
  const editingTodoIdRef = useRef<string | null>(null);
  const editingTextRef = useRef<string>('');
  const onDeleteTodoRef = useRef(onDeleteTodo);

  // Update refs when values change
  useEffect(() => {
    editingTodoIdRef.current = editingTodoId;
    editingTextRef.current = editingText;
    onDeleteTodoRef.current = onDeleteTodo;
  }, [editingTodoId, editingText, onDeleteTodo]);

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

  // Clean up empty todos when clicking outside - use refs to avoid dependency issues
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Don't process if clicking on input or inside editing todo
      if (target.tagName === 'INPUT' || target.closest('input')) {
        return;
      }

      // Use refs to get latest values
      const currentEditingId = editingTodoIdRef.current;
      const currentEditingText = editingTextRef.current;

      if (currentEditingId && currentEditingText.trim() === '') {
        onDeleteTodoRef.current?.(currentEditingId);
        setEditingTodoId(null);
        setEditingText('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []); // Empty dependency array - use refs for latest values

  const startEdit = useCallback((todoId: string, text: string) => {
    setEditingTodoId(todoId);
    setEditingText(text);
  }, []);

  const finishEdit = useCallback(() => {
    if (editingTodoIdRef.current) {
      const trimmedText = editingTextRef.current.trim();
      if (trimmedText) {
        onEditTodo?.(editingTodoIdRef.current, { text: trimmedText });
      } else {
        onDeleteTodoRef.current?.(editingTodoIdRef.current);
      }
    }
    setEditingTodoId(null);
    setEditingText('');
  }, [onEditTodo]);

  const cancelEdit = useCallback(() => {
    setEditingTodoId(null);
    setEditingText('');
  }, []);

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
