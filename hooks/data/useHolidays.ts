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

// 로컬 스토리지 캐시 키
const CACHE_KEY = 'holidays_cache';
const CACHE_EXPIRY_KEY = 'holidays_cache_expiry';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7일

// 싱글톤 패턴으로 공휴일 데이터 관리 (중복 로드 방지)
let globalHolidays: Set<string> | null = null;
let loadingPromise: Promise<Set<string>> | null = null;

/**
 * 로컬 스토리지에서 캐시된 공휴일 데이터 로드
 */
function loadFromCache(): Set<string> | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);
    
    if (cached && expiry) {
      const expiryTime = parseInt(expiry, 10);
      if (Date.now() < expiryTime) {
        const holidays = JSON.parse(cached);
        return new Set(holidays);
      }
    }
  } catch (error) {
    console.error('캐시 로드 실패:', error);
  }
  
  return null;
}

/**
 * 로컬 스토리지에 공휴일 데이터 저장
 */
function saveToCache(holidays: Set<string>): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify([...holidays]));
    localStorage.setItem(CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString());
  } catch (error) {
    console.error('캐시 저장 실패:', error);
  }
}

/**
 * 공휴일 데이터를 서버에서 로드 (싱글톤)
 */
async function loadHolidaysData(): Promise<Set<string>> {
  // 이미 로딩 중이면 기존 Promise 반환
  if (loadingPromise) {
    return loadingPromise;
  }

  // 이미 로드된 데이터가 있으면 반환
  if (globalHolidays) {
    return globalHolidays;
  }

  // 캐시에서 먼저 로드 시도
  const cached = loadFromCache();
  if (cached) {
    globalHolidays = cached;
    return cached;
  }

  // 새로 로드
  loadingPromise = (async () => {
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

      // 여러 연도의 공휴일을 병렬로 로드 (서버 API Route 사용)
      try {
        const fetchPromises = yearsToLoad.map(year => 
          fetch(`/api/holidays?year=${year}`, {
            next: { revalidate: 86400 } // 1일 캐시
          })
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

        console.log(`✅ 공휴일 ${holidaySet.size}개 로드 완료`);
      } catch (error) {
        // API 실패 시 기본 데이터 유지
        console.warn('⚠️ 공휴일 API 로드 실패, 기본 데이터를 사용합니다:', error);
      }

      // 캐시에 저장
      saveToCache(holidaySet);
      globalHolidays = holidaySet;
      loadingPromise = null;
      
      return holidaySet;
    } catch (error) {
      console.error('공휴일 로드 중 오류:', error);
      loadingPromise = null;
      
      // 에러 시 기본 데이터만 반환
      const fallbackSet = new Set<string>();
      const currentYear = new Date().getFullYear();
      [currentYear - 1, currentYear, currentYear + 1].forEach(year => {
        if (DEFAULT_HOLIDAYS[year]) {
          DEFAULT_HOLIDAYS[year].forEach((date) => {
            fallbackSet.add(`${year}-${date}`);
          });
        }
      });
      
      return fallbackSet;
    }
  })();

  return loadingPromise;
}

/**
 * 공휴일 데이터를 로드하고 관리하는 커스텀 훅 (최적화됨)
 * @returns holidays - 공휴일 Set (YYYY-MM-DD 형식)
 * @returns isHoliday - 특정 날짜가 공휴일인지 확인하는 함수
 */
export function useHolidays() {
  const [holidays, setHolidays] = useState<Set<string>>(() => globalHolidays || new Set());
  const [isLoading, setIsLoading] = useState(!globalHolidays);

  useEffect(() => {
    // 이미 로드되어 있으면 스킵
    if (globalHolidays) {
      setHolidays(globalHolidays);
      setIsLoading(false);
      return;
    }

    // 비동기로 로드
    loadHolidaysData().then(data => {
      setHolidays(data);
      setIsLoading(false);
    });
  }, []);

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

