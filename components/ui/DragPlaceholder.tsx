'use client';

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
    <div
      className={className}
      style={{
        height: typeof height === 'number' ? `${height}px` : height
      }}
    />
  );
}
