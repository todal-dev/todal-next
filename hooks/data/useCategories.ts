import { useState, useCallback, useEffect, useRef } from 'react';
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
  const initializedRef = useRef(false);

  // DB에서 가져온 카테고리가 있으면 기본 카테고리와 병합 (최초 1회만)
  useEffect(() => {
    if (!initializedRef.current && initialCategories && initialCategories.length > 0) {
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
      initializedRef.current = true;
    }
  }, [initialCategories?.length]); // length만 체크하여 불필요한 리렌더링 방지

  // Add a new category (Optimistic Update)
  const handleAddCategory = useCallback(async (name: string, color: string) => {
    // 임시 ID 생성
    const tempId = `temp-cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // 임시 카테고리 객체 생성
    const tempCategory: Category = {
      id: tempId,
      name,
      color,
    };

    // 1. 즉시 로컬 상태 업데이트 (UI 즉시 반영)
    setCategories(prev => [...prev, tempCategory]);

    // 2. 백그라운드에서 DB에 저장
    const result = await createCategoryDB(name, color);
    
    // 3. 서버 응답 받으면 임시 ID를 실제 ID로 교체
    if (result.success && result.category) {
      setCategories(prev => prev.map(cat => 
        cat.id === tempId ? result.category! : cat
      ));
    } else {
      // 실패시 롤백
      console.error('Failed to create category:', result.error);
      setCategories(prev => prev.filter(cat => cat.id !== tempId));
    }
  }, []);

  // Edit category name (Optimistic Update)
  const handleEditCategory = useCallback(async (id: string, name: string) => {
    // 고정 카테고리는 수정 불가
    if (id === 'cat-recurring' || id === 'cat-etc') {
      return;
    }
    
    // 기본 카테고리(cat1, cat2, cat3 등)는 DB에 저장되지 않으므로 로컬 상태만 업데이트
    const isDefaultCategory = id.startsWith('cat') && !id.includes('-');
    if (isDefaultCategory) {
      // 기본 카테고리는 로컬 상태만 업데이트 (DB 업데이트 시도하지 않음)
      setCategories(prev => prev.map(cat =>
        cat.id === id ? { ...cat, name } : cat
      ));
      return;
    }
    
    // 1. 즉시 로컬 상태 업데이트 (UI 즉시 반영)
    setCategories(prev => prev.map(cat =>
      cat.id === id ? { ...cat, name } : cat
    ));
    
    // 2. 백그라운드에서 DB 업데이트
    const result = await updateCategoryDB(id, { name });
    
    // 3. 실패시 로그
    if (!result.success) {
      console.error('Failed to update category:', result.error);
    }
  }, []);

  // Change category color (Optimistic Update)
  const handleChangeColor = useCallback(async (id: string, color: string) => {
    // 고정 카테고리는 수정 불가
    if (id === 'cat-recurring' || id === 'cat-etc') {
      return;
    }
    
    // 기본 카테고리(cat1, cat2, cat3 등)는 DB에 저장되지 않으므로 로컬 상태만 업데이트
    const isDefaultCategory = id.startsWith('cat') && !id.includes('-');
    if (isDefaultCategory) {
      // 기본 카테고리는 로컬 상태만 업데이트 (DB 업데이트 시도하지 않음)
      setCategories(prev => prev.map(cat =>
        cat.id === id ? { ...cat, color } : cat
      ));
      return;
    }
    
    // 1. 즉시 로컬 상태 업데이트 (UI 즉시 반영)
    setCategories(prev => prev.map(cat =>
      cat.id === id ? { ...cat, color } : cat
    ));
    
    // 2. 백그라운드에서 DB 업데이트
    const result = await updateCategoryDB(id, { color });
    
    // 3. 실패시 로그
    if (!result.success) {
      console.error('Failed to update category color:', result.error);
    }
  }, []);

  // Delete category (Optimistic Update)
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
    
    // 백업 (롤백용)
    let backupCategories: Category[] = [];
    
    // 1. 즉시 로컬 상태에서 삭제 (UI 즉시 반영)
    setCategories(prev => {
      backupCategories = prev;
      return prev.filter(cat => cat.id !== id);
    });
    
    // 2. 백그라운드에서 DB에서 삭제
    const result = await deleteCategoryDB(id);
    
    // 3. 실패시 롤백
    if (!result.success) {
      console.error('Failed to delete category:', result.error);
      setCategories(backupCategories);
    }
  }, [todos]); // todos는 체크를 위해 필요하므로 유지

  // Move category to new position (cannot move 'cat-recurring', 'cat-etc')
  const handleMoveCategory = useCallback((categoryId: string, newIndex: number) => {
    setCategories(prev => {
      const movingCategory = prev.find(cat => cat.id === categoryId);
      
      // Cannot move fixed categories
      if (!movingCategory || 
          movingCategory.id === 'cat-recurring' || 
          movingCategory.id === 'cat-etc') {
        return prev;
      }

      const oldIndex = prev.findIndex(cat => cat.id === categoryId);
      if (oldIndex === -1) return prev;

      // Ensure 'cat-recurring' stays at index 0, 'cat-etc' stays at the end
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
