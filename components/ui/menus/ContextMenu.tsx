'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Trash2, MoveRight, Tag, Edit, Repeat } from 'lucide-react';
import { useEffect } from 'react';

interface ContextMenuProps {
  isOpen: boolean;
  x: number;
  y: number;
  onClose: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMove: () => void;
  onChangeCategory: () => void;
  onRename: () => void;
  onSetRecurrence: () => void;
}

export function ContextMenu({
  isOpen,
  x,
  y,
  onClose,
  onDuplicate,
  onDelete,
  onMove,
  onChangeCategory,
  onRename,
  onSetRecurrence,
}: ContextMenuProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleClick = () => onClose();
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      onClose();
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.1 }}
          className="fixed bg-warm-white dark:bg-dark-ocean-card rounded-md shadow-xl border border-gray-200 dark:border-gray-600 py-1 min-w-[180px] z-50"
          style={{
            left: `${x}px`,
            top: `${y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              onRename();
              onClose();
            }}
            className="w-full px-4 py-2 text-left text-body-small hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2 text-gray-900 dark:text-gray-50 transition-colors"
          >
            <Edit size={16} />
            이름 변경
          </button>

          <button
            onClick={() => {
              onChangeCategory();
              onClose();
            }}
            className="w-full px-4 py-2 text-left text-body-small hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2 text-gray-900 dark:text-gray-50 transition-colors"
          >
            <Tag size={16} />
            카테고리 변경
          </button>

          <button
            onClick={() => {
              onMove();
              onClose();
            }}
            className="w-full px-4 py-2 text-left text-body-small hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2 text-gray-900 dark:text-gray-50 transition-colors"
          >
            <MoveRight size={16} />
            날짜 이동
          </button>

          <button
            onClick={() => {
              onDuplicate();
              onClose();
            }}
            className="w-full px-4 py-2 text-left text-body-small hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2 text-gray-900 dark:text-gray-50 transition-colors"
          >
            <Copy size={16} />
            복제
          </button>

          <button
            onClick={() => {
              onSetRecurrence();
              onClose();
            }}
            className="w-full px-4 py-2 text-left text-body-small hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2 text-gray-900 dark:text-gray-50 transition-colors"
          >
            <Repeat size={16} />
            반복 설정
          </button>

          <div className="border-t border-gray-200 dark:border-gray-600 my-1" />

          <button
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="w-full px-4 py-2 text-left text-body-small hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2 text-red-600 dark:text-red-400 transition-colors"
          >
            <Trash2 size={16} />
            삭제
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
