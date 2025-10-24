/**
 * 드래그 앤 드롭 관련 유틸리티 함수
 */

export type DragType = 'todo' | 'category' | 'recurring';

export interface DragData {
  type: DragType;
  id: string;
  categoryId?: string;
  parentId?: string;
  index?: number;
  recurringId?: string;
  isRecurring?: boolean;
}

/**
 * 드래그 데이터가 유효한지 확인
 */
export function isValidDragData(data: any): data is DragData {
  return data && typeof data === 'object' && 'type' in data && 'id' in data;
}

/**
 * 드래그 중인 아이템이 드롭 가능한 영역인지 확인
 */
export function canDrop(activeData: DragData, overData: DragData): boolean {
  // 같은 아이템으로는 드롭 불가
  if (activeData.id === overData.id) return false;

  // 반복 할일 -> 일반 카테고리: 가능
  if (activeData.type === 'recurring' && overData.type === 'todo') return true;

  // 일반 할일 -> 반복 섹션: 가능
  if (activeData.type === 'todo' && overData.type === 'recurring') return true;

  // 일반 할일 -> 일반 할일: 가능
  if (activeData.type === 'todo' && overData.type === 'todo') return true;

  // 카테고리 -> 카테고리: 가능
  if (activeData.type === 'category' && overData.type === 'category') return true;

  return false;
}
