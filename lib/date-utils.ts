/**
 * 날짜 변환 유틸리티
 * - 로컬 시간대 유지
 * - UTC 변환 오류 방지
 */

/**
 * YYYY-MM-DD 형식의 문자열을 로컬 시간대의 Date 객체로 변환
 * @param dateString - YYYY-MM-DD 형식의 날짜 문자열
 * @returns 로컬 시간대의 Date 객체
 */
export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    throw new Error(`Invalid date format: ${dateString}. Expected YYYY-MM-DD`);
  }
  
  return new Date(year, month - 1, day);
}

/**
 * Date 객체를 YYYY-MM-DD 형식의 문자열로 변환
 * @param date - Date 객체
 * @returns YYYY-MM-DD 형식의 날짜 문자열
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 날짜가 유효한지 검증
 * @param date - 검증할 Date 객체
 * @returns 유효 여부
 */
export function isValidDate(date: unknown): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * 두 날짜가 같은 날인지 비교
 * @param date1 - 첫 번째 날짜
 * @param date2 - 두 번째 날짜
 * @returns 같은 날이면 true
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * 날짜 범위 생성
 * @param startDate - 시작 날짜
 * @param endDate - 종료 날짜
 * @returns 날짜 배열
 */
export function getDateRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

