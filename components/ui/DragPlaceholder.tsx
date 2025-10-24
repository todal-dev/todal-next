'use client';

import { motion } from 'framer-motion';

interface DragPlaceholderProps {
  height?: number | string;
  className?: string;
}

/**
 * 드래그 중 빈 공간을 표시하는 Placeholder 컴포넌트
 * 드롭될 위치를 시각적으로 표시
 */
export function DragPlaceholder({ height = 40, className = '' }: DragPlaceholderProps) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height, opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className={className}
      style={{
        minHeight: typeof height === 'number' ? `${height}px` : height
      }}
    />
  );
}
