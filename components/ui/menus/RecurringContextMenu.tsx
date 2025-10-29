'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Trash2, SkipForward, X, CalendarX } from 'lucide-react';
import { useEffect, useState } from 'react';

interface RecurringContextMenuProps {
  isOpen: boolean;
  x: number;
  y: number;
  onClose: () => void;
  onEdit: () => void;
  onSkipInstance: () => void;
  onDeleteAll: () => void;
  onDeleteAfter: () => void;
}

export function RecurringContextMenu({
  isOpen,
  x,
  y,
  onClose,
  onEdit,
  onSkipInstance,
  onDeleteAll,
  onDeleteAfter,
}: RecurringContextMenuProps) {
  const [deleteSubmenuOpen, setDeleteSubmenuOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setDeleteSubmenuOpen(false);
      return;
    }

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
          className="fixed bg-white dark:bg-gray-700 rounded-md shadow-xl border border-gray-200 dark:border-gray-600 py-1 min-w-[180px] z-50"
          style={{
            left: `${x}px`,
            top: `${y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 편집 */}
          <button
            onClick={() => {
              onEdit();
              onClose();
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2 text-gray-900 dark:text-gray-50"
          >
            <Edit size={16} />
            편집
          </button>

          <div className="border-t border-gray-200 dark:border-gray-600 my-1" />

          {/* 삭제 (서브메뉴) */}
          <div
            className="relative"
            onMouseEnter={() => setDeleteSubmenuOpen(true)}
            onMouseLeave={() => setDeleteSubmenuOpen(false)}
          >
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center justify-between text-red-600"
            >
              <div className="flex items-center gap-2">
                <Trash2 size={16} />
                삭제
              </div>
              <span className="text-xs">▶</span>
            </button>

            {/* 삭제 서브메뉴 */}
            <AnimatePresence>
              {deleteSubmenuOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.1 }}
                  className="absolute left-full top-0 ml-1 bg-white dark:bg-gray-700 rounded-md shadow-xl border border-gray-200 dark:border-gray-600 py-1 min-w-[200px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      onSkipInstance();
                      onClose();
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2 text-gray-900 dark:text-gray-50"
                  >
                    <SkipForward size={16} />
                    이 일정만 건너뛰기
                  </button>

                  <button
                    onClick={() => {
                      onDeleteAfter();
                      onClose();
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"
                  >
                    <CalendarX size={16} />
                    이 일정 이후 삭제
                  </button>

                  <button
                    onClick={() => {
                      onDeleteAll();
                      onClose();
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"
                  >
                    <X size={16} />
                    모든 반복 일정 삭제
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
