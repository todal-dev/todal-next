'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Checkbox } from '@/components/ui/Checkbox';

interface TodoInputProps {
  categoryId: string;
  parentId?: string;
  level?: number;
  selectedDate: Date;
  onAddTodo: (text: string, categoryId: string, date: Date, parentId?: string) => void;
}

export function TodoInput({
  categoryId,
  parentId,
  level = 0,
  selectedDate,
  onAddTodo,
}: TodoInputProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

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
            className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-neutral-gray-50"
          >
            <Checkbox checked={false} onChange={() => {}} className="flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Add todo..."
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
              className="flex-1 text-sm bg-transparent text-neutral-text-primary placeholder:text-neutral-text-tertiary focus:outline-none border-0 focus:ring-0"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        key="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        onClick={() => setIsAdding(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-neutral-gray-50 transition-colors text-neutral-text-tertiary hover:text-primary-500 w-full text-left"
      >
        <Plus size={14} />
        <span className="text-sm">Add todo</span>
      </motion.button>
    </div>
  );
}
