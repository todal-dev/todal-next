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

/**
 * 드래그 가능한 아이템의 공통 스타일 생성
 * 카테고리와 할일 모두에 적용 가능
 */
export function getDraggableStyle(
  transform: { x: number; y: number; scaleX: number; scaleY: number } | null,
  transition: string | undefined,
  isDragging: boolean,
  dragOpacity: number = 0.5,
  removeSpace: boolean = false
) {
  const baseStyle = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0) scaleX(${transform.scaleX}) scaleY(${transform.scaleY})`
      : undefined,
    transition,
    opacity: isDragging ? dragOpacity : 1,
  };

  // 드래그 중이고 공간 제거 옵션이 true면 높이와 여백 제거
  if (isDragging && removeSpace) {
    return {
      ...baseStyle,
      height: 0,
      minHeight: 0,
      maxHeight: 0,
      overflow: 'hidden' as const,
      margin: 0,
      padding: 0,
      border: 'none',
    };
  }

  return baseStyle;
}
