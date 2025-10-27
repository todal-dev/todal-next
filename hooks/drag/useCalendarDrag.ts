import { useState, useEffect } from 'react';
import { roundToQuarterHour } from '@/utils/calendarUtils';

interface CreatingEvent {
  date: Date;
  hour: number;
  tempId: string;
  startTime: string;
  endTime: string;
  isEditing?: boolean;
}

interface UseCalendarDragProps {
  hourHeight: number;
  onAddTodo?: (todo: any, callback?: (id: string) => void) => void;
  onFinishEdit?: () => void;
}

export function useCalendarDrag({ hourHeight, onAddTodo, onFinishEdit }: UseCalendarDragProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ date: Date; hour: number; minute: number } | null>(null);
  const [creatingEvent, setCreatingEvent] = useState<CreatingEvent | null>(null);
  const [editingEventText, setEditingEventText] = useState('');

  const handleDragStart = (date: Date, hour: number, e: React.MouseEvent) => {
    e.preventDefault();

    // Finish any pending edit before creating new event
    if (onFinishEdit) {
      onFinishEdit();
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const minuteOffset = Math.floor((y / hourHeight) * 60);
    const roundedMinute = roundToQuarterHour(minuteOffset);

    let startHour = hour;
    let startMinute = roundedMinute;

    // If rounding caused overflow to next hour
    if (roundedMinute === 0 && minuteOffset > 45) {
      startHour = hour + 1;
      startMinute = 0;
    }

    // Ensure we don't go past 23:59
    if (startHour >= 24) {
      startHour = 23;
      startMinute = 45;
    }

    const startTime = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`;

    // Default 1 hour duration
    let endTotalMinutes = startHour * 60 + startMinute + 60;
    if (endTotalMinutes > 24 * 60) {
      endTotalMinutes = 24 * 60;
    }
    const endHour = Math.floor(endTotalMinutes / 60);
    const endMinute = endTotalMinutes % 60;
    const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;

    setIsDragging(true);
    setDragStart({ date, hour: startHour, minute: startMinute });

    // Immediately create the event block
    setCreatingEvent({
      date,
      hour: startHour,
      tempId: `temp-${Date.now()}`,
      startTime,
      endTime,
    });
  };

  const handleDragMove = (date: Date, hour: number, e: React.MouseEvent) => {
    if (!isDragging || !dragStart || !creatingEvent) return;

    // Only allow dragging on the same day
    if (date.toDateString() !== dragStart.date.toDateString()) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const minuteOffset = Math.floor((y / hourHeight) * 60);
    let endMinute = roundToQuarterHour(minuteOffset);
    let endHour = hour;

    // If rounding caused overflow to next hour
    if (endMinute === 0 && minuteOffset > 45) {
      endHour = hour + 1;
      endMinute = 0;
    }

    const endTotalMinutes = endHour * 60 + endMinute;
    const startTotalMinutes = dragStart.hour * 60 + dragStart.minute;

    // Ensure end is after start (minimum 15 minutes)
    if (endTotalMinutes <= startTotalMinutes) {
      return;
    }

    const startTime = `${String(dragStart.hour).padStart(2, '0')}:${String(dragStart.minute).padStart(2, '0')}`;
    const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;

    // Update creating event with new end time for real-time preview
    setCreatingEvent({
      ...creatingEvent,
      startTime,
      endTime,
    });
  };

  const handleDragEnd = () => {
    if (!isDragging || !creatingEvent) return;

    let { startTime, endTime } = creatingEvent;

    // Normalize times to prevent 60 minutes
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const normalizedStartMinute = startMinute >= 60 ? 0 : startMinute;
    const normalizedStartHour = startMinute >= 60 ? startHour + 1 : startHour;

    const normalizedEndMinute = endMinute >= 60 ? 0 : endMinute;
    const normalizedEndHour = endMinute >= 60 ? endHour + 1 : endHour;

    startTime = `${String(normalizedStartHour).padStart(2, '0')}:${String(normalizedStartMinute).padStart(2, '0')}`;
    endTime = `${String(normalizedEndHour).padStart(2, '0')}:${String(normalizedEndMinute).padStart(2, '0')}`;

    // 편집 모드로 전환 (실제 생성하지 않음)
    setCreatingEvent({
      ...creatingEvent,
      startTime,
      endTime,
      isEditing: true,
    });
    setEditingEventText('');
    setIsDragging(false);
    setDragStart(null);
  };

  const handleConfirmCreate = () => {
    if (!creatingEvent || !creatingEvent.isEditing) return;

    const text = editingEventText.trim();
    
    // 제목이 비어있으면 생성하지 않고 취소
    if (!text) {
      handleCancelCreate();
      return;
    }

    // 실제로 todo 생성
    onAddTodo?.({
      text,
      completed: false,
      date: creatingEvent.date,
      categoryId: 'cat-etc',
      startTime: creatingEvent.startTime,
      endTime: creatingEvent.endTime,
    });

    // 상태 초기화
    setCreatingEvent(null);
    setEditingEventText('');
  };

  const handleCancelCreate = () => {
    setCreatingEvent(null);
    setEditingEventText('');
  };

  // 외부 클릭 시 편집 중인 이벤트 취소
  useEffect(() => {
    if (!creatingEvent?.isEditing) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // input 클릭은 무시
      if (target.tagName === 'INPUT' || target.closest('input')) {
        return;
      }

      // 편집 중인 이벤트 블록 클릭은 무시
      if (target.closest('.calendar-creating-event')) {
        return;
      }

      // 외부 클릭 시 취소
      handleCancelCreate();
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [creatingEvent?.isEditing]);

  return {
    isDragging,
    creatingEvent,
    editingEventText,
    setEditingEventText,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    handleConfirmCreate,
    handleCancelCreate,
  };
}
