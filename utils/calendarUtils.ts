/**
 * 주어진 날짜의 주 시작일(일요일)부터 7일간의 날짜 배열 반환
 */
export function getWeekDays(startDate: Date): Date[] {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    days.push(date);
  }
  return days;
}

/**
 * Date 객체를 YYYY-MM-DD 형식의 문자열로 변환
 */
export function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * 분을 15분 단위로 반올림 (0, 15, 30, 45)
 * 60 이상은 0으로 반환
 */
export function roundToQuarterHour(minutes: number): number {
  const rounded = Math.round(minutes / 15) * 15;
  return rounded >= 60 ? 0 : rounded;
}

/**
 * 시간 문자열(HH:mm)을 분 단위로 변환
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Todo 블록의 CSS 스타일 계산
 */
export function getTodoBlockStyle(
  startTime: string,
  endTime: string,
  hourHeight: number,
  width?: number,
  left?: number
): React.CSSProperties {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const duration = endMinutes - startMinutes;

  const top = (startMinutes / 60) * hourHeight;
  const height = (duration / 60) * hourHeight - 2; // 2px gap between blocks

  const style: React.CSSProperties = {
    top: `${top}px`,
    height: `${height}px`
  };

  // Apply width and left if provided (for overlapping events)
  if (width !== undefined && left !== undefined) {
    style.width = `calc(${width}% - 4px)`;
    style.left = `${left}%`;
    style.marginLeft = '2px';
    style.marginRight = '2px';
  } else {
    style.left = '0';
    style.right = '0';
    style.marginLeft = '4px';
    style.marginRight = '4px';
  }

  return style;
}
