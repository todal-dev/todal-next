'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { Category, RecurrenceRule } from '@/types/calendar';

interface CategoryContextType {
  categories: Category[];
  onAddCategory: (name: string, color: string) => void;
  onEditCategory: (id: string, name: string) => void;
  onChangeColor: (id: string, color: string) => void;
  onDeleteCategory: (id: string) => void;
  onAddRecurring: (text: string, startTime: string, endTime: string, recurrenceRule: RecurrenceRule, categoryId: string) => void;
  onEditRecurring: (id: string, text: string, startTime: string, endTime: string, recurrenceRule: RecurrenceRule, categoryId: string) => void;
  onDeleteRecurring: (id: string) => void;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

interface CategoryProviderProps {
  children: ReactNode;
  value: CategoryContextType;
}

export function CategoryProvider({ children, value }: CategoryProviderProps) {
  return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>;
}

export function useCategoryContext() {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategoryContext must be used within a CategoryProvider');
  }
  return context;
}
