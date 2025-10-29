'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Checkbox } from '@/components/ui/forms/Checkbox';

interface TodoInputProps {
  categoryId: string;
  parentId?: string;
  level?: number;
  selectedDate: Date;
  onAddTodo: (text: string, categoryId: string, date: Date, parentId?: string) => void;
  hideButton?: boolean;
  isAdding?: boolean;
  onIsAddingChange?: (isAdding: boolean) => void;
}

export function TodoInput({
  categoryId,
  parentId,
  level = 0,
  selectedDate,
  onAddTodo,
  hideButton = false,
  isAdding: externalIsAdding,
  onIsAddingChange,
}: TodoInputProps) {
  const [internalIsAdding, setInternalIsAdding] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Use external isAdding if provided, otherwise use internal state
  const isAdding = externalIsAdding !== undefined ? externalIsAdding : internalIsAdding;
  const setIsAdding = (value: boolean) => {
    if (onIsAddingChange) {
      onIsAddingChange(value);
    } else {
      setInternalIsAdding(value);
    }
  };

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleAdd = () => {
    const trimmedValue = value.trim();
    if (trimmedValue) {
      onAddTodo(trimmedValue, categoryId, selectedDate, parentId);
      setValue('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    } else {
      setIsAdding(false);
    }
  };

  return (
    <div style={{ paddingLeft: `${level * 24}px` }}>
      <AnimatePresence>
        {isAdding && (
          <motion.div
            key="input"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 min-h-[44px]"
          >
            <Checkbox checked={false} onChange={() => {}} className="flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="할일 입력..."
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAdd();
                } else if (e.key === 'Escape') {
                  setIsAdding(false);
                  setValue('');
                }
              }}
              onBlur={() => {
                setTimeout(() => {
                  setIsAdding(false);
                  setValue('');
                }, 150);
              }}
              className="flex-1 text-body bg-transparent text-gray-900 dark:text-gray-50 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none border-0 focus:ring-0"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {!hideButton && (
        <motion.button
          key="button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary-100 w-full text-left min-h-[44px]"
        >
          <Plus size={14} />
          <span className="text-body-small">할일 추가</span>
        </motion.button>
      )}
    </div>
  );
}
