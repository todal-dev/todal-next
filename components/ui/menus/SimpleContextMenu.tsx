'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

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
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // 다크 모드 상태 체크
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    // MutationObserver로 다크 모드 변경 감지
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    
    return () => observer.disconnect();
  }, []);

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
          className="fixed bg-white dark:bg-gray-700 rounded-md shadow-xl border border-gray-200 dark:border-gray-600 py-1 min-w-[180px] z-50"
          style={{
            left: `${x}px`,
            top: `${y}px`,
            backgroundColor: isDarkMode ? '#374151' : '#FFFFFF',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              onEdit();
              onClose();
            }}
            className="w-full px-4 py-2 text-left text-body-small hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2 text-gray-900 dark:text-gray-50 cursor-pointer transition-colors"
          >
            <Edit size={16} />
            편집
          </button>

          <div className="border-t border-gray-200 dark:border-gray-600 my-1" />

          <button
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="w-full px-4 py-2 text-left text-body-small hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2 text-red-600 dark:text-red-400 cursor-pointer transition-colors"
          >
            <Trash2 size={16} />
            삭제
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
