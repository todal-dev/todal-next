'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Trash2 } from 'lucide-react';
import { useEffect } from 'react';

interface SimpleContextMenuProps {
  isOpen: boolean;
  x: number;
  y: number;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function SimpleContextMenu({
  isOpen,
  x,
  y,
  onClose,
  onEdit,
  onDelete,
}: SimpleContextMenuProps) {
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
          className="fixed bg-white rounded-lg shadow-xl border border-neutral-gray-300 py-1 min-w-[180px] z-50"
          style={{
            left: `${x}px`,
            top: `${y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              onEdit();
              onClose();
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-gray-50 flex items-center gap-2 text-neutral-text-primary cursor-pointer"
          >
            <Edit size={16} />
            편집
          </button>

          <div className="border-t border-neutral-gray-200 my-1" />

          <button
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600 cursor-pointer"
          >
            <Trash2 size={16} />
            삭제
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
