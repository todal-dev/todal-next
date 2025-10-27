import { useState, useCallback, useEffect } from 'react';
import type { Category, Todo } from '@/types/calendar';
import {
  createCategory as createCategoryDB,
  updateCategory as updateCategoryDB,
  deleteCategory as deleteCategoryDB,
} from '@/lib/supabase/queries';

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-recurring', name: '반복', color: '#FB923C' }, // 반복 카테고리 (고정)
  { id: 'cat1', name: '업무', color: '#3B82F6' },
  { id: 'cat2', name: '개인', color: '#A855F7' },
  { id: 'cat3', name: '학습', color: '#2D9F6B' },
  { id: 'cat-etc', name: '기타', color: '#9CA3AF' },
];

export function useCategories(
  initialCategories: Category[] | undefined = undefined,
  todos: Todo[] = []
) {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);

  // DB에서 가져온 카테고리가 있으면 기본 카테고리와 병합
  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) {
      const mergedCategories = [
        ...DEFAULT_CATEGORIES, 
        ...initialCategories.filter(cat => 
          !DEFAULT_CATEGORIES.some(defaultCat => defaultCat.id === cat.id)
        )
      ];
      console.log('🔄 Merging categories:', {
        default: DEFAULT_CATEGORIES.length,
        fromDB: initialCategories.length,
        merged: mergedCategories.length,
        categories: mergedCategories.map(c => c.name)
      });
      setCategories(mergedCategories);
    }
  }, [initialCategories]);

  // Add a new category
  const handleAddCategory = useCallback(async (name: string, color: string) => {
    // DB에 저장
    const result = await createCategoryDB(name, color);
    
    if (result.success && result.category) {
      setCategories(prev => [...prev, result.category!]);
    } else {
      console.error('Failed to create category:', result.error);
    }
  }, []);

  // Edit category name (cannot edit 'cat-recurring' or 'cat-etc')
  const handleEditCategory = useCallback(async (id: string, name: string) => {
    if (id === 'cat-recurring' || id === 'cat-etc') {
      return;
    }
    
    // DB 업데이트
    await updateCategoryDB(id, { name });
    
    setCategories(prev => prev.map(cat =>
      cat.id === id ? { ...cat, name } : cat
    ));
  }, []);

  // Change category color
  const handleChangeColor = useCallback(async (id: string, color: string) => {
    // DB 업데이트
    await updateCategoryDB(id, { color });
    
    setCategories(prev => prev.map(cat =>
      cat.id === id ? { ...cat, color } : cat
    ));
  }, []);

  // Delete category (cannot delete 'cat-recurring' or 'cat-etc')
  const handleDeleteCategory = useCallback(async (id: string, onDeleteTodos?: () => void) => {
    // Cannot delete the fixed categories
    if (id === 'cat-recurring') {
      alert('반복 카테고리는 삭제할 수 없습니다.');
      return;
    }
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
    
    // DB에서 삭제
    const result = await deleteCategoryDB(id);
    
    if (result.success) {
      setCategories(prev => prev.filter(cat => cat.id !== id));
    } else {
      console.error('Failed to delete category:', result.error);
    }
  }, [todos]);

  // Move category to new position (cannot move 'cat-recurring' or 'cat-etc')
  const handleMoveCategory = useCallback((categoryId: string, newIndex: number) => {
    // Cannot move fixed categories
    if (categoryId === 'cat-recurring' || categoryId === 'cat-etc') {
      return;
    }

    setCategories(prev => {
      const oldIndex = prev.findIndex(cat => cat.id === categoryId);
      if (oldIndex === -1) return prev;

      // Ensure 'cat-recurring' stays at index 0 and 'cat-etc' stays at the end
      const recurringIndex = prev.findIndex(cat => cat.id === 'cat-recurring');
      const etcIndex = prev.findIndex(cat => cat.id === 'cat-etc');

      // Prevent moving to fixed category positions
      if (recurringIndex !== -1 && newIndex === recurringIndex) return prev;
      if (etcIndex !== -1 && newIndex === etcIndex) return prev;

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
