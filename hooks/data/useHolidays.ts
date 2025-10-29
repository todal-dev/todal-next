import { useState, useEffect } from 'react';

// 기본 한국 공휴일 (수동 데이터 - API 로드 전 사용)
const DEFAULT_HOLIDAYS: Record<number, string[]> = {
  2025: [
    '01-01', // 신정
    '02-10', // 설 연휴
    '02-11', // 설
    '02-12', // 설 연휴
    '03-01', // 삼일절
    '04-05', // 어린이날
    '05-05', // 어린이날
    '05-15', // 부처님 오신 날
    '06-06', // 현충일
    '08-15', // 광복절
    '09-16', // 추석 연휴
    '09-17', // 추석
    '09-18', // 추석 연휴
    '10-03', // 개천절
    '10-09', // 한글날
    '12-25', // 크리스마스
  ],
  2026: [
    '01-01',
    '01-29', '01-30', '01-31',
    '03-01',
    '04-05',
    '05-05',
    '05-25',
    '06-06',
    '08-15',
    '09-04', '09-05', '09-06',
    '10-03',
    '10-09',
    '12-25',
  ],
};

/**
 * 공휴일 데이터를 로드하고 관리하는 커스텀 훅
 * @returns holidays - 공휴일 Set (YYYY-MM-DD 형식)
 * @returns isHoliday - 특정 날짜가 공휴일인지 확인하는 함수
 */
export function useHolidays() {
  const [holidays, setHolidays] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHolidays();
  }, []);

  const loadHolidays = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const holidaySet = new Set<string>();

      // 기본 공휴일을 먼저 추가 (fallback)
      const yearsToLoad = [currentYear - 1, currentYear, currentYear + 1];
      yearsToLoad.forEach(year => {
        if (DEFAULT_HOLIDAYS[year]) {
          DEFAULT_HOLIDAYS[year].forEach((date) => {
            holidaySet.add(`${year}-${date}`);
          });
        }
      });

      setHolidays(new Set(holidaySet));
      setIsLoading(false);

      // 여러 연도의 공휴일을 병렬로 로드 (서버 API Route 사용)
      try {
        const fetchPromises = yearsToLoad.map(year => 
          fetch(`/api/holidays?year=${year}`)
        );

        const responses = await Promise.all(fetchPromises);
        
        for (const response of responses) {
          if (response.ok) {
            const data = await response.json();
            
            // API 에러 체크
            if (data.response?.header?.resultCode !== '00') {
              console.warn('공휴일 API 응답 오류:', data.response?.header?.resultMsg);
              continue;
            }

            if (data.response?.body?.items?.item) {
              const items = Array.isArray(data.response.body.items.item) 
                ? data.response.body.items.item 
                : [data.response.body.items.item];
              
              items.forEach((item: any) => {
                if (item.locdate) {
                  const dateStr = item.locdate.toString();
                  const formatted = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
                  holidaySet.add(formatted);
                }
              });
            }
          }
        }

        // API에서 로드한 데이터로 업데이트
        setHolidays(new Set(holidaySet));
        console.log(`공휴일 ${holidaySet.size}개 로드 완료`);
      } catch (error) {
        // API 실패 시 기본 데이터 유지
        console.warn('공휴일 API 로드 실패, 기본 데이터를 사용합니다:', error);
      }
    } catch (error) {
      console.error('공휴일 로드 중 오류:', error);
      setIsLoading(false);
    }
  };

  /**
   * 특정 날짜가 공휴일인지 확인
   * @param date - 확인할 날짜
   * @returns 공휴일이면 true, 아니면 false
   */
  const isHoliday = (date: Date): boolean => {
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return holidays.has(dateKey);
  };

  return { holidays, isHoliday, isLoading };
}

