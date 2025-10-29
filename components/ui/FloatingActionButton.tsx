'use client';

import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface FloatingActionButtonProps {
  onClick: () => void;
  label?: string;
}

export function FloatingActionButton({ onClick, label = '새 일정' }: FloatingActionButtonProps) {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-primary dark:bg-primary-600 hover:bg-primary-dark dark:hover:bg-primary-700 active:bg-primary-700 dark:active:bg-primary-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center touch-manipulation"
      aria-label={label}
      style={{
        boxShadow: '0 4px 12px rgba(45, 159, 107, 0.4)',
      }}
    >
      <Plus size={28} strokeWidth={2.5} />
    </motion.button>
  );
}

