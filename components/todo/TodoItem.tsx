'use client';

import { GripVertical, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/Checkbox';
import { useState } from 'react';

interface TodoItemProps {
  id: string;
  text: string;
  completed?: boolean;
  color?: string;
  level?: number;
  onToggle?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string, text: string) => void;
}

export function TodoItem({
  id,
  text,
  completed = false,
  color = 'primary',
  level = 0,
  onToggle,
  onDelete,
  onEdit,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const [isHovered, setIsHovered] = useState(false);

  const handleSave = () => {
    if (editText.trim()) {
      onEdit?.(id, editText.trim());
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditText(text);
    }
  };

  const colorMap: Record<string, string> = {
    primary: 'border-l-4 border-l-primary-500',
    warning: 'border-l-4 border-l-status-warning',
    error: 'border-l-4 border-l-status-error',
  };

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-md
        transition-all duration-normal
        ${colorMap[color]}
        bg-white
        ${completed ? 'opacity-60' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ paddingLeft: `calc(1rem + ${level * 24}px)` }}
    >
      {/* Drag Handle - 항상 렌더링, 공간 예약 */}
      <div className="flex-shrink-0 cursor-grab active:cursor-grabbing text-neutral-text-tertiary invisible w-4 h-4">
        <GripVertical size={16} />
      </div>

      {/* Checkbox */}
      <Checkbox
        checked={completed}
        onChange={() => onToggle?.(id)}
        className="flex-shrink-0"
      />

      {/* Text Content */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            autoFocus
            className={`
              w-full text-body
              bg-primary-50 border border-primary-500 rounded px-2 py-1
              placeholder:text-neutral-text-tertiary
            `}
          />
        ) : (
          <p
            onClick={() => setIsEditing(true)}
            className={`
              text-body cursor-text
              transition-all duration-normal
              ${
                completed
                  ? 'text-neutral-text-tertiary line-through'
                  : 'text-neutral-text-primary hover:underline'
              }
            `}
          >
            {text}
          </p>
        )}
      </div>

      {/* Delete Button */}
      {isHovered && !isEditing && (
        <button
          onClick={() => onDelete?.(id)}
          className={`
            flex-shrink-0 p-1.5 rounded transition-colors
            text-neutral-text-tertiary hover:text-status-error
            hover:bg-red-50 cursor-pointer
          `}
          aria-label="삭제"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}
