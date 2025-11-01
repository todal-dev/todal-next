import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 기본 한국 공휴일 (API 실패 시 fallback)
const DEFAULT_HOLIDAYS: Record<number, string[]> = {
  2024: [
    '01-01',
    '02-09', '02-10', '02-11', '02-12',
    '03-01',
    '04-10',
    '05-05', '05-06', '05-15',
    '06-06',
    '08-15',
    '09-16', '09-17', '09-18',
    '10-03', '10-09',
    '12-25',
  ],
  2025: [
    '01-01',
    '01-28', '01-29', '01-30',
    '03-01',
    '04-05',
    '05-05', '05-06',
    '06-06',
    '08-15',
    '10-03', '10-05', '10-06', '10-07', '10-08',
    '10-09',
    '12-25',
  ],
  2026: [
    '01-01',
    '02-16', '02-17', '02-18',
    '03-01',
    '04-05',
    '05-05', '05-24',
    '06-06',
    '08-15',
    '09-24', '09-25', '09-26',
    '10-03',
    '10-09',
    '12-25',
  ],
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const year = searchParams.get('year');

  if (!year || isNaN(Number(year))) {
    return NextResponse.json(
      { error: '유효한 년도를 입력해주세요.' },
      { status: 400 }
    );
  }

  const yearNum = Number(year);
  const apiKey = process.env.NEXT_PUBLIC_HOLIDAY_API_KEY;

  // API 키가 없거나 기본값이면 기본 데이터 반환
  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    const holidays = DEFAULT_HOLIDAYS[yearNum] || [];
    return NextResponse.json({
      holidays: holidays.map(date => `${yearNum}-${date}`),
      source: 'default',
    });
  }

  try {
    // 공공데이터포털 API 호출
    const apiUrl = `https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getHoliDeInfo?solYear=${year}&_type=json&numOfRows=100&serviceKey=${encodeURIComponent(apiKey)}`;
    
    const response = await fetch(apiUrl, {
      next: { revalidate: 86400 }, // 24시간 캐시
    });

    if (!response.ok) {
      throw new Error(`API 응답 실패: ${response.status}`);
    }

    const data = await response.json();

    // API 에러 체크
    if (data.response?.header?.resultCode !== '00') {
      console.warn('공휴일 API 응답 오류:', data.response?.header?.resultMsg);
      
      // fallback to default data
      const holidays = DEFAULT_HOLIDAYS[yearNum] || [];
      return NextResponse.json({
        holidays: holidays.map(date => `${yearNum}-${date}`),
        source: 'default',
        warning: data.response?.header?.resultMsg,
      });
    }

    // API 데이터 파싱
    const holidays: string[] = [];
    if (data.response?.body?.items?.item) {
      const items = Array.isArray(data.response.body.items.item)
        ? data.response.body.items.item
        : [data.response.body.items.item];

      items.forEach((item: any) => {
        if (item.locdate) {
          const dateStr = item.locdate.toString();
          const formatted = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
          holidays.push(formatted);
        }
      });
    }

    return NextResponse.json({
      holidays,
      source: 'api',
    });
  } catch (error) {
    console.error('공휴일 API 호출 실패:', error);

    // fallback to default data
    const holidays = DEFAULT_HOLIDAYS[yearNum] || [];
    return NextResponse.json({
      holidays: holidays.map(date => `${yearNum}-${date}`),
      source: 'default',
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    });
  }
}

