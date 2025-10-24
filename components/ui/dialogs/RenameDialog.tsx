'use client';

import { useState, useEffect, useRef } from 'react';
import { BaseDialog, DialogFooter } from './BaseDialog';

interface RenameDialogProps {
  isOpen: boolean;
  currentName: string;
  onClose: () => void;
  onConfirm: (newName: string) => void;
}

export function RenameDialog({ isOpen, currentName, onClose, onConfirm }: RenameDialogProps) {
  const [name, setName] = useState(currentName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(currentName);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, currentName]);

  const handleSubmit = () => {
    if (name.trim()) {
      onConfirm(name.trim());
      onClose();
    }
  };

  return (
    <BaseDialog
      isOpen={isOpen}
      onClose={onClose}
      title="이름 변경"
      showHeaderBorder={false}
      showFooterBorder={false}
      footer={
        <DialogFooter
          onCancel={onClose}
          onConfirm={handleSubmit}
        />
      }
    >
      <input
        ref={inputRef}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSubmit();
          if (e.key === 'Escape') onClose();
        }}
        className="w-full px-3 py-2 border border-neutral-gray-300 rounded-lg focus:outline-none focus:border-primary-500 text-neutral-text-primary"
        placeholder="새 이름을 입력하세요"
      />
    </BaseDialog>
  );
}
