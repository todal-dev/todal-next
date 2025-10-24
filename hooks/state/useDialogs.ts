import { useState } from 'react';

export interface CategoryDialogState {
  isOpen: boolean;
  todoId: string;
  currentCategoryId: string;
}

export interface DateDialogState {
  isOpen: boolean;
  todoId: string;
  currentDate: Date;
}

export interface DuplicateDialogState {
  isOpen: boolean;
  todoId: string;
  todoName: string;
}

export interface RecurringDialogState {
  isOpen: boolean;
  todoId: string;
  action: 'edit' | 'delete' | null;
}

/**
 * Dialog state management for calendar operations
 * Manages category, date, duplicate, and recurring dialogs
 */
export function useDialogs() {
  const [categoryDialog, setCategoryDialog] = useState<CategoryDialogState>({
    isOpen: false,
    todoId: '',
    currentCategoryId: '',
  });

  const [dateDialog, setDateDialog] = useState<DateDialogState>({
    isOpen: false,
    todoId: '',
    currentDate: new Date(),
  });

  const [duplicateDialog, setDuplicateDialog] = useState<DuplicateDialogState>({
    isOpen: false,
    todoId: '',
    todoName: '',
  });

  const [recurringDialog, setRecurringDialog] = useState<RecurringDialogState>({
    isOpen: false,
    todoId: '',
    action: null,
  });

  // Category dialog actions
  const openCategoryDialog = (todoId: string, currentCategoryId: string) => {
    setCategoryDialog({ isOpen: true, todoId, currentCategoryId });
  };

  const closeCategoryDialog = () => {
    setCategoryDialog({ ...categoryDialog, isOpen: false });
  };

  // Date dialog actions
  const openDateDialog = (todoId: string, currentDate: Date) => {
    setDateDialog({ isOpen: true, todoId, currentDate });
  };

  const closeDateDialog = () => {
    setDateDialog({ ...dateDialog, isOpen: false });
  };

  // Duplicate dialog actions
  const openDuplicateDialog = (todoId: string, todoName: string) => {
    setDuplicateDialog({ isOpen: true, todoId, todoName });
  };

  const closeDuplicateDialog = () => {
    setDuplicateDialog({ ...duplicateDialog, isOpen: false });
  };

  // Recurring dialog actions
  const openRecurringDialog = (todoId: string, action: 'edit' | 'delete') => {
    setRecurringDialog({ isOpen: true, todoId, action });
  };

  const closeRecurringDialog = () => {
    setRecurringDialog({ ...recurringDialog, isOpen: false });
  };

  return {
    // States
    categoryDialog,
    dateDialog,
    duplicateDialog,
    recurringDialog,

    // Category dialog
    openCategoryDialog,
    closeCategoryDialog,

    // Date dialog
    openDateDialog,
    closeDateDialog,

    // Duplicate dialog
    openDuplicateDialog,
    closeDuplicateDialog,

    // Recurring dialog
    openRecurringDialog,
    closeRecurringDialog,
  };
}
