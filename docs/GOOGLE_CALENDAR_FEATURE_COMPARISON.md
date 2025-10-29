# 🔍 구글 캘린더 기능 비교 분석

> Todal vs Google Calendar 기능 비교 및 추가 개발 로드맵

---

## 📊 현재 상태 요약

| 카테고리 | Todal 구현 | Google Calendar | 우선순위 |
|---------|-----------|-----------------|---------|
| **기본 일정 관리** | ✅ 80% | ✅ 100% | - |
| **반복 일정** | ✅ 60% | ✅ 100% | 🔴 높음 |
| **알림 시스템** | ❌ 0% | ✅ 100% | 🔴 높음 |
| **공유/협업** | ❌ 0% | ✅ 100% | 🟡 중간 |
| **통합 기능** | 🔄 20% | ✅ 100% | 🟢 낮음 |
| **다양한 뷰** | ✅ 40% | ✅ 100% | 🟡 중간 |

---

## ✅ Todal에 이미 있는 기능

### 1. 기본 일정 관리
- ✅ 일정 생성/수정/삭제
- ✅ 제목, 시작/종료 시간 설정
- ✅ 날짜별 일정 표시
- ✅ 완료 체크박스
- ✅ 드래그앤드롭으로 시간 조정
- ✅ 드래그앤드롭으로 날짜 이동

### 2. 카테고리/색상 시스템
- ✅ 카테고리 생성/수정/삭제
- ✅ 10가지 색상 프리셋
- ✅ 카테고리별 색상 구분
- ✅ 카테고리별 그룹화

### 3. 캘린더 뷰
- ✅ 주간 뷰 (월~일)
- ✅ 월간 뷰 (미니 캘린더)
- ✅ 시간 블록 표시 (0시~24시)

### 4. 반복 일정 (기본)
- ✅ 매일 반복
- ✅ 매주 반복 (요일 선택)
- ✅ 매월 반복
- ✅ 특정 날짜 완료 표시
- ✅ 특정 날짜 건너뛰기

### 5. 할일 관리
- ✅ 할일 풀 (좌측 패널)
- ✅ 서브 할일 (계층 구조)
- ✅ 순서 변경 (드래그)
- ✅ 인라인 텍스트 편집

### 6. 구글 캘린더 연동 (개발 중)
- 🔄 OAuth 인증
- 🔄 양방향 동기화

---

## ❌ Todal에 없는 구글 캘린더 기능

### 🔴 우선순위 높음 (Phase 2-3 권장)

#### 1. 알림/리마인더 시스템
**Google Calendar 기능**:
- 이메일 알림 (일정 N분/시간/일 전)
- 푸시 알림 (브라우저/모바일)
- 다중 알림 설정 (예: 1일 전 + 30분 전)
- 기본 알림 시간 설정
- 일정별 알림 커스터마이징

**구현 방안**:
```typescript
// todos 테이블에 추가
reminders: {
  type: 'email' | 'push' | 'both';
  timings: number[]; // [1440, 30] = 1일 전, 30분 전 (분 단위)
}

// Phase 2
- Supabase Edge Functions로 알림 스케줄링
- 이메일: Resend API 또는 Supabase Auth 이메일
- 푸시: Web Push API (PWA)

// Phase 3
- 기본 알림 설정 (사용자 설정)
- 카테고리별 기본 알림
```

**예상 공수**: 2-3주

---

#### 2. 일간 뷰 (Day View)
**Google Calendar 기능**:
- 하루의 모든 일정을 시간순으로 표시
- 시간대별 상세 보기
- 현재 시각 표시

**구현 방안**:
```typescript
// components/calendar/DayView.tsx
- 0시~24시 타임라인 (주간 뷰와 유사)
- 해당 날짜의 모든 일정 표시
- 드래그로 시간 조정
- 빈 시간대 클릭으로 일정 생성
```

**예상 공수**: 1주

---

#### 3. 반복 일정 고급 옵션
**Google Calendar 기능**:
- 매월 N번째 요일 (예: 매월 첫째주 월요일)
- 매년 특정 날짜
- 반복 종료일 설정
- N일/주/월마다 반복
- 월말일 반복
- 반복 예외 날짜 지정

**구현 방안**:
```typescript
interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // 2주마다 = 2
  daysOfWeek?: number[]; // 요일
  monthDay?: number; // 매월 N일
  nthWeekday?: { // 매월 N번째 요일
    nth: number; // 1=첫째, -1=마지막
    weekday: number;
  };
  endDate?: Date; // 종료일
  count?: number; // N회 반복 후 종료
  exceptions?: string[]; // 예외 날짜 (YYYY-MM-DD)
}
```

**예상 공수**: 1-2주

---

#### 4. 일정 검색
**Google Calendar 기능**:
- 키워드로 일정 검색
- 날짜 범위 검색
- 카테고리 필터링
- 검색 결과 하이라이트

**구현 방안**:
```typescript
// components/search/SearchBar.tsx
- 상단 헤더에 검색 바
- 실시간 검색 (debounce)
- Supabase Full-Text Search 활용

// Supabase Query
const { data } = await supabase
  .from('todos')
  .select('*')
  .textSearch('text', searchQuery)
  .eq('user_id', userId);
```

**예상 공수**: 1주

---

### 🟡 우선순위 중간 (Phase 3-4 권장)

#### 5. 참석자 초대 및 응답 관리
**Google Calendar 기능**:
- 이메일로 참석자 초대
- 참석 여부 응답 (참석/미참석/미정)
- 참석자 목록 표시
- 선택적 참석자 설정

**구현 방안**:
```sql
-- attendees 테이블 추가
CREATE TABLE attendees (
  id UUID PRIMARY KEY,
  todo_id UUID REFERENCES todos(id),
  email TEXT NOT NULL,
  name TEXT,
  status TEXT, -- 'pending' | 'accepted' | 'declined' | 'tentative'
  is_optional BOOLEAN DEFAULT FALSE
);

-- 이메일 초대
- Resend API로 초대 이메일 발송
- 응답 링크 포함 (토큰 기반)
```

**예상 공수**: 2-3주

---

#### 6. 캘린더 공유
**Google Calendar 기능**:
- 다른 사용자와 캘린더 공유
- 권한 설정 (보기 전용, 수정 가능, 전체 권한)
- 공개 캘린더 URL

**구현 방안**:
```sql
-- calendar_shares 테이블
CREATE TABLE calendar_shares (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  shared_with_email TEXT,
  permission TEXT, -- 'view' | 'edit' | 'admin'
  created_at TIMESTAMPTZ
);

-- RLS 정책 수정
- 공유된 캘린더는 shared_with_email도 조회 가능
```

**예상 공수**: 2주

---

#### 7. 위치 정보
**Google Calendar 기능**:
- 일정에 위치 추가
- Google Maps 연동
- 위치 기반 알림 (도착 시)

**구현 방안**:
```typescript
// todos 테이블에 추가
location: {
  name: string; // "스타벅스 강남점"
  address: string;
  lat?: number;
  lng?: number;
}

// UI
- Google Maps API 또는 Kakao Maps API
- 위치 검색 autocomplete
- 지도 미리보기
```

**예상 공수**: 1-2주

---

#### 8. 연간 뷰 (Year View)
**Google Calendar 기능**:
- 12개월 캘린더 한눈에 보기
- 월별 일정 개수 표시
- 월 클릭 시 해당 월로 이동

**구현 방안**:
```typescript
// components/calendar/YearView.tsx
- 3x4 그리드로 12개월 표시
- 각 월은 미니 캘린더 형태
- 일정 많은 날짜는 점으로 표시
```

**예상 공수**: 1주

---

#### 9. 일정 목록 뷰 (Agenda View)
**Google Calendar 기능**:
- 날짜별로 일정을 리스트 형태로 표시
- 과거/미래 일정 스크롤
- 날짜 구분선

**구현 방안**:
```typescript
// components/calendar/AgendaView.tsx
- 날짜별 그룹화
- 시간순 정렬
- 무한 스크롤 (react-intersection-observer)
```

**예상 공수**: 1주

---

#### 10. 첨부 파일
**Google Calendar 기능**:
- 일정에 파일 첨부 (Google Drive)
- 여러 파일 첨부 가능
- 미리보기

**구현 방안**:
```typescript
// Supabase Storage 활용
bucket: 'todo-attachments'

// todos 테이블에 추가
attachments: {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
}[]

// 구현
- 드래그앤드롭 업로드
- 파일 크기 제한 (10MB)
- 이미지 미리보기
```

**예상 공수**: 1-2주

---

### 🟢 우선순위 낮음 (Phase 4+ 또는 선택)

#### 11. Google Meet 통합
**Google Calendar 기능**:
- 일정 생성 시 자동으로 Meet 링크 생성
- 화상 회의 바로 참여

**구현 방안**:
```typescript
// Google Meet API 사용 (또는 Zoom API)
- OAuth로 Meet 권한 획득
- 일정 생성 시 Meet 링크 자동 생성
- 또는 수동 링크 추가 필드
```

**예상 공수**: 1주

---

#### 12. 타임존 지원
**Google Calendar 기능**:
- 다른 시간대의 일정 표시
- 타임존별 시간 변환
- 여행 시 자동 조정

**구현 방안**:
```typescript
// todos 테이블에 추가
timezone: string; // 'Asia/Seoul', 'America/New_York'

// date-fns-tz 라이브러리 사용
import { formatInTimeZone } from 'date-fns-tz';
```

**예상 공수**: 1주

---

#### 13. 작업 시간 (Working Hours)
**Google Calendar 기능**:
- 근무 시간 설정 (예: 평일 9-6시)
- 근무 시간 외 일정은 회색 표시
- 근무 시간만 보기

**구현 방안**:
```typescript
// 사용자 설정에 추가
workingHours: {
  enabled: boolean;
  days: number[]; // [1,2,3,4,5] = 월~금
  startTime: string; // "09:00"
  endTime: string; // "18:00"
}

// 캘린더에서 비근무 시간 회색 배경 표시
```

**예상 공수**: 3-5일

---

#### 14. Focus Time
**Google Calendar 기능**:
- 집중 시간 블록 설정
- 해당 시간에 알림 차단
- 자동으로 "바쁨" 상태 표시

**구현 방안**:
```typescript
// todos에 속성 추가
isFocusTime: boolean;

// 기능
- Focus time 동안 알림 자동 음소거
- 특별한 색상/아이콘 표시
```

**예상 공수**: 3-5일

---

#### 15. Out of Office
**Google Calendar 기능**:
- 부재 중 기간 설정
- 자동 응답 메시지
- 캘린더에 표시

**구현 방안**:
```typescript
// 별도 out_of_office 테이블 또는
// todos에 type 추가
type: 'event' | 'task' | 'out_of_office';

// UI에서 전체 날짜 블록으로 표시
```

**예상 공수**: 3-5일

---

#### 16. 이메일로 일정 생성
**Google Calendar 기능**:
- 특정 이메일 주소로 메일 전송 시 자동으로 일정 생성

**구현 방안**:
```typescript
// Supabase Edge Function
- Inbound Email Webhook (SendGrid 등)
- 제목/본문 파싱하여 일정 생성
- 응답 이메일 발송
```

**예상 공수**: 1주

---

#### 17. 오프라인 모드
**Google Calendar 기능**:
- 인터넷 없이도 캘린더 조회/편집
- 온라인 시 자동 동기화

**구현 방안**:
```typescript
// PWA + Service Worker
- Cache API로 데이터 캐싱
- IndexedDB에 로컬 저장
- Background Sync API로 동기화
```

**예상 공수**: 2-3주

---

#### 18. 캘린더 구독 (iCal)
**Google Calendar 기능**:
- iCal URL 제공
- 다른 캘린더 앱에서 구독
- 공휴일 캘린더 구독

**구현 방안**:
```typescript
// API 엔드포인트
GET /api/calendar/:userId/ical

// iCalendar 형식 생성
import ical from 'ical-generator';
```

**예상 공수**: 1주

---

## 🚀 Todal 추가 개발 로드맵 제안

### Phase 2 (성장 트래킹) - 4주
**추가 기능**:
1. ✅ 대시보드 (기존 계획)
2. ✅ 통계 (기존 계획)
3. 🆕 **알림 시스템** (이메일 + 푸시)
4. 🆕 **일간 뷰**
5. 🆕 **일정 검색**

### Phase 3 (편의성 향상) - 3주
**추가 기능**:
1. 🆕 **반복 일정 고급 옵션**
2. 🆕 **연간 뷰 + 목록 뷰**
3. 🆕 **위치 정보**
4. 🆕 **첨부 파일**
5. ✅ 모바일 최적화 (기존 계획)

### Phase 4 (협업 기능) - 4주
**추가 기능**:
1. 🆕 **참석자 초대**
2. 🆕 **캘린더 공유**
3. 🆕 **타임존 지원**
4. ✅ AI 코칭 (기존 계획)

### Phase 5+ (고급 기능)
**선택적 구현**:
- Google Meet 통합
- Working Hours
- Focus Time
- Out of Office
- 오프라인 모드
- iCal 구독

---

## 💡 Todal만의 차별화 기능 (Google Calendar에 없는 것)

### ✨ 이미 구현됨
1. **할일 풀 시스템**: 좌측에 할일을 모아두고 드래그로 일정화
2. **계층 구조**: 서브 할일로 복잡한 프로젝트 관리
3. **시각적 드래그앤드롭**: 할일 → 캘린더 자연스러운 전환
4. **완료율 표시**: 미니 캘린더에 날짜별 완료/미완료 시각화

### 🎯 추가 제안 (구글에 없는 Todal만의 기능)

#### 1. 시간 블록 템플릿
```
개념: 하루 일과를 템플릿으로 저장
예시: "평일 루틴" 템플릿
  - 09:00-10:00: 이메일 확인
  - 10:00-12:00: 집중 작업
  - 12:00-13:00: 점심
  - ...

구현: 
- 템플릿 저장/불러오기
- 한 번에 하루 일정 생성
```

#### 2. 타임 트래킹
```
개념: 실제 소요 시간 측정
기능:
- 일정 시작 시 타이머 시작
- 실제 소요 시간 기록
- 예상 vs 실제 시간 비교 통계

통계:
- 카테고리별 실제 시간 분석
- 효율성 지표 (예상 대비 실제)
```

#### 3. 에너지 레벨 트래킹
```
개념: 시간대별 생산성 분석
기능:
- 일정 완료 후 에너지 레벨 기록 (1-5)
- 시간대별 에너지 패턴 분석
- 최적 시간대 추천

예시:
- "당신은 오전 10-12시에 가장 생산적입니다"
- "오후 3시 이후는 루틴 작업 추천"
```

#### 4. 할일 자동 스케줄링 AI
```
개념: AI가 빈 시간에 할일 자동 배치
조건:
- 우선순위
- 예상 소요 시간
- 데드라인
- 에너지 레벨 (위 기능)
- 선호 시간대

결과:
- "이 할일은 내일 오전 10시에 하는 게 좋습니다" (제안)
- 한 번에 일주일 일정 자동 생성
```

#### 5. 습관 트래커 통합
```
개념: 반복 일정의 달성률을 시각화
기능:
- 루틴별 히트맵 (GitHub 스타일)
- 연속 달성 일수 (Streak)
- 달성률 뱃지/레벨

동기부여:
- 7일 연속 달성 시 축하 메시지
- 월간 달성률 리포트
```

#### 6. 포모도로 타이머 통합
```
개념: 캘린더에서 바로 포모도로 시작
기능:
- 일정 클릭 → 포모도로 시작
- 25분 집중 + 5분 휴식
- 완료된 포모도로 개수 기록

통계:
- 일별/주별 포모도로 개수
- 카테고리별 집중 시간
```

---

## 📋 구현 우선순위 최종 정리

### Must Have (꼭 필요)
1. 🔴 **알림 시스템** - 일정 놓치지 않기
2. 🔴 **일간 뷰** - 하루 일정 집중
3. 🔴 **일정 검색** - 빠른 일정 찾기
4. 🔴 **반복 일정 고급** - 더 유연한 반복

### Should Have (있으면 좋음)
5. 🟡 **참석자 초대** - 협업 기능
6. 🟡 **위치 정보** - 장소 기반 일정
7. 🟡 **캘린더 공유** - 팀/가족 공유
8. 🟡 **연간/목록 뷰** - 다양한 관점

### Nice to Have (선택적)
9. 🟢 **타임존 지원** - 글로벌 사용
10. 🟢 **첨부 파일** - 참고 자료
11. 🟢 **Working Hours** - 근무 시간 관리
12. 🟢 **오프라인 모드** - PWA 고도화

### Todal 차별화 (독자 기능)
13. ⭐ **타임 트래킹** - 실제 시간 측정
14. ⭐ **에너지 레벨** - 생산성 분석
15. ⭐ **AI 자동 스케줄링** - 스마트 일정
16. ⭐ **습관 트래커** - 루틴 시각화
17. ⭐ **포모도로 통합** - 집중 시간 관리

---

## 🎯 결론 및 권장사항

### 단기 (Phase 2-3, 다음 2-3개월)
현재 MVP를 안정화하고, **구글 캘린더와의 경쟁력**을 높이는 데 집중:
- ✅ 알림 시스템
- ✅ 일간 뷰
- ✅ 검색 기능
- ✅ 반복 일정 고급 옵션

### 중기 (Phase 4-5, 6개월 후)
**협업 기능**으로 사용자 범위 확장:
- 참석자 초대
- 캘린더 공유
- 위치 정보

### 장기 (Phase 6+)
**Todal만의 차별화 기능**으로 독자적 가치 창출:
- 타임 트래킹
- AI 자동 스케줄링
- 에너지 레벨 분석
- 습관 트래커

**핵심 전략**:
> "Google Calendar의 필수 기능을 갖추되,  
> 할일 관리 + 시간 시각화 + 생산성 분석에서 압도적 우위를 점한다"

---

**Last Updated**: 2025-10-29


