import { useState, useCallback } from 'react';
import type { Category, Todo } from '@/types/calendar';

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat1', name: '업무', color: '#3B82F6' },
  { id: 'cat2', name: '개인', color: '#A855F7' },
  { id: 'cat3', name: '학습', color: '#2D9F6B' },
  { id: 'cat-etc', name: '기타', color: '#9CA3AF' },
];

export function useCategories(
  initialCategories: Category[] = DEFAULT_CATEGORIES,
  todos: Todo[] = []
) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  // Add a new category
  const handleAddCategory = useCallback((name: string, color: string) => {
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name,
      color,
    };
    setCategories(prev => [...prev, newCategory]);
  }, []);

  // Edit category name (cannot edit 'cat-etc')
  const handleEditCategory = useCallback((id: string, name: string) => {
    if (id === 'cat-etc') {
      return;
    }
    setCategories(prev => prev.map(cat =>
      cat.id === id ? { ...cat, name } : cat
    ));
  }, []);

  // Change category color
  const handleChangeColor = useCallback((id: string, color: string) => {
    setCategories(prev => prev.map(cat =>
      cat.id === id ? { ...cat, color } : cat
    ));
  }, []);

  // Delete category (cannot delete 'cat-etc')
  const handleDeleteCategory = useCallback((id: string, onDeleteTodos?: () => void) => {
    // Cannot delete the default 'etc' category
    if (id === 'cat-etc') {
      alert('기타 카테고리는 삭제할 수 없습니다.');
      return;
    }

    // Check if there are todos with this category
    const hasTodos = todos.some(todo => todo.categoryId === id);
    if (hasTodos) {
      if (!confirm('이 카테고리에 할일이 있습니다. 정말 삭제하시겠습니까?')) {
        return;
      }
      // Call the callback to delete todos
      onDeleteTodos?.();
    }
    setCategories(prev => prev.filter(cat => cat.id !== id));
  }, [todos]);

  // Move category to new position
  const handleMoveCategory = useCallback((categoryId: string, newIndex: number) => {
    setCategories(prev => {
      const oldIndex = prev.findIndex(cat => cat.id === categoryId);
      if (oldIndex === -1) return prev;

      const newCategories = [...prev];
      const [movedCategory] = newCategories.splice(oldIndex, 1);
      newCategories.splice(newIndex, 0, movedCategory);

      return newCategories;
    });
  }, []);

  return {
    categories,
    setCategories,
    handleAddCategory,
    handleEditCategory,
    handleChangeColor,
    handleDeleteCategory,
    handleMoveCategory,
  };
}
