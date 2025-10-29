# 📊 Todal 대시보드 설계 문서

> 생산성 시각화 및 인사이트 제공을 위한 대시보드 기획

---

## 🎯 대시보드 목표

### 핵심 가치
1. **한눈에 보는 생산성**: 오늘/이번 주/이번 달 성과 즉시 파악
2. **데이터 기반 인사이트**: 패턴 분석으로 개선점 발견
3. **동기부여**: 시각적 피드백으로 지속적인 실천 유도
4. **Todal 차별화**: 구글 캘린더에 없는 독자적 분석 기능

---

## 📐 대시보드 레이아웃 구조

```
┌─────────────────────────────────────────────────────┐
│  🏠 대시보드                                    [날짜 필터] │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📈 핵심 지표 카드 (4개)                              │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐              │
│  │ 오늘 │ │ 이번 │ │ 총   │ │ 연속 │              │
│  │ 완료 │ │ 주   │ │ 할일 │ │ 달성 │              │
│  └──────┘ └──────┘ └──────┘ └──────┘              │
│                                                     │
│  ┌─────────────────┐ ┌────────────────────┐        │
│  │                 │ │                    │        │
│  │  📅 다가오는     │ │  🎯 카테고리별      │        │
│  │     일정         │ │     시간 분석       │        │
│  │                 │ │                    │        │
│  └─────────────────┘ └────────────────────┘        │
│                                                     │
│  ┌─────────────────────────────────────────┐        │
│  │  📊 주간 생산성 차트                       │        │
│  │  (완료율 추이 그래프)                       │        │
│  └─────────────────────────────────────────┘        │
│                                                     │
│  ┌──────────────┐ ┌───────────────────────┐        │
│  │              │ │                       │        │
│  │  🔥 습관      │ │  ⏱️ 시간대별           │        │
│  │     트래커    │ │     생산성             │        │
│  │              │ │                       │        │
│  └──────────────┘ └───────────────────────┘        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🎨 위젯 상세 설계

### 1️⃣ 핵심 지표 카드 (Stats Cards)

#### 카드 1: 오늘 완료율
```typescript
{
  title: "오늘 완료",
  value: "8/12", // 완료/전체
  percentage: 67,
  trend: "+15%", // 어제 대비
  icon: "✅",
  color: "green"
}
```

#### 카드 2: 이번 주 완료율
```typescript
{
  title: "이번 주",
  value: "32/45",
  percentage: 71,
  trend: "+5%", // 지난주 대비
  icon: "📈",
  color: "blue"
}
```

#### 카드 3: 총 할일 개수
```typescript
{
  title: "총 할일",
  value: "24", // 미완료 할일
  breakdown: {
    overdue: 3, // 기한 지남
    today: 5,   // 오늘
    upcoming: 16 // 예정
  },
  icon: "📝",
  color: "purple"
}
```

#### 카드 4: 연속 달성 일수 (Streak)
```typescript
{
  title: "연속 달성",
  value: "7일", // 연속으로 모든 일정 완료한 날
  bestStreak: "23일", // 최고 기록
  icon: "🔥",
  color: "orange"
}
```

**데이터 소스**:
```sql
-- 오늘 완료율
SELECT 
  COUNT(*) FILTER (WHERE completed = true) as completed,
  COUNT(*) as total
FROM todos
WHERE user_id = $1 
  AND date = CURRENT_DATE;

-- 연속 달성 계산
WITH daily_completion AS (
  SELECT 
    date,
    COUNT(*) FILTER (WHERE completed = true) = COUNT(*) as all_completed
  FROM todos
  WHERE user_id = $1
  GROUP BY date
  ORDER BY date DESC
)
SELECT COUNT(*) as streak
FROM daily_completion
WHERE all_completed = true
  AND date >= (
    SELECT MIN(date) FROM daily_completion WHERE all_completed = false
  );
```

---

### 2️⃣ 다가오는 일정 (Upcoming Events)

**목적**: 오늘/내일/이번 주 중요 일정 미리보기

**UI**:
```
┌─────────────────────────────────┐
│ 📅 다가오는 일정                  │
├─────────────────────────────────┤
│                                 │
│ 🔴 오늘 14:00                    │
│    팀 미팅                        │
│    📍 회의실 A                    │
│                                 │
│ 🟡 내일 09:00                    │
│    프로젝트 발표                  │
│    ⏰ 1시간 30분                 │
│                                 │
│ 🟢 금요일 15:00                  │
│    고객 미팅                      │
│                                 │
│ [전체 일정 보기 →]               │
└─────────────────────────────────┘
```

**기능**:
- 기한 임박 순 정렬
- 카테고리 색상 표시
- 클릭 시 캘린더 해당 날짜로 이동
- 최대 5개 표시

**데이터**:
```typescript
interface UpcomingEvent {
  id: string;
  title: string;
  startTime: Date;
  duration: number; // 분
  category: {
    name: string;
    color: string;
  };
  location?: string;
  priority: 'high' | 'medium' | 'low';
}
```

---

### 3️⃣ 카테고리별 시간 분석 (Category Time Analysis)

**목적**: 어디에 시간을 쓰고 있는지 시각화

**UI**: 도넛 차트 + 리스트
```
┌──────────────────────────────┐
│ 🎯 카테고리별 시간 분석         │
│    (이번 주)                  │
├──────────────────────────────┤
│                              │
│      [도넛 차트]               │
│                              │
│  🔴 업무      18h (45%)      │
│  🔵 개인개발  12h (30%)      │
│  🟢 운동       6h (15%)      │
│  🟡 독서       4h (10%)      │
│                              │
│  총 시간: 40시간              │
└──────────────────────────────┘
```

**데이터 계산**:
```typescript
// 각 카테고리별 일정 시간 합계
const categoryStats = categories.map(cat => {
  const totalMinutes = todos
    .filter(t => t.category_id === cat.id)
    .filter(t => isThisWeek(t.date))
    .reduce((sum, t) => sum + t.duration, 0);
  
  return {
    name: cat.name,
    color: cat.color,
    hours: totalMinutes / 60,
    percentage: (totalMinutes / totalWeekMinutes) * 100
  };
});
```

---

### 4️⃣ 주간 생산성 차트 (Weekly Productivity)

**목적**: 완료율 추이를 한눈에 파악

**UI**: 세로 막대 그래프
```
┌─────────────────────────────────────┐
│ 📊 주간 생산성                       │
├─────────────────────────────────────┤
│                                     │
│  100% ┤                             │
│   75% ┤     ███         ███         │
│   50% ┤ ███ ███     ███ ███ ███     │
│   25% ┤ ███ ███ ███ ███ ███ ███     │
│    0% └─────────────────────────    │
│        월  화  수  목  금  토  일    │
│                                     │
│  평균 완료율: 68%                    │
│  최고: 금요일 (85%)                  │
└─────────────────────────────────────┘
```

**데이터**:
```typescript
interface DailyStats {
  date: string;
  completed: number;
  total: number;
  percentage: number;
}

// 최근 7일 데이터
const weeklyData: DailyStats[] = last7Days.map(date => {
  const dayTodos = todos.filter(t => isSameDay(t.date, date));
  const completed = dayTodos.filter(t => t.completed).length;
  
  return {
    date: format(date, 'E'), // 월, 화, 수...
    completed,
    total: dayTodos.length,
    percentage: (completed / dayTodos.length) * 100
  };
});
```

---

### 5️⃣ 습관 트래커 히트맵 (Habit Heatmap)

**목적**: 반복 일정의 달성 패턴 시각화 (GitHub 스타일)

**UI**:
```
┌──────────────────────────────────┐
│ 🔥 습관 트래커                    │
├──────────────────────────────────┤
│                                  │
│  아침 운동 (7일 연속 달성! 🔥)     │
│  ░░░░░░ ▓▓▓▓▓▓▓                 │
│  월 화 수 목 금 토 일              │
│                                  │
│  독서 30분                        │
│  ░▓░▓▓░ ▓▓░▓▓▓░                 │
│                                  │
│  ▓ 완료   ░ 미완료               │
│                                  │
│  [전체 습관 보기 →]               │
└──────────────────────────────────┘
```

**기능**:
- 반복 일정만 필터링
- 최근 14일 or 30일 히트맵
- 연속 달성 일수 강조
- 클릭 시 상세 통계

**데이터**:
```typescript
interface HabitStreak {
  recurringId: string;
  title: string;
  currentStreak: number; // 연속 달성 일수
  totalCompletions: number;
  completionRate: number; // %
  heatmap: {
    date: string;
    completed: boolean;
  }[];
}
```

---

### 6️⃣ 시간대별 생산성 (Time-of-Day Productivity)

**목적**: 어느 시간대에 가장 생산적인지 분석

**UI**: 히트맵 또는 선 그래프
```
┌─────────────────────────────────┐
│ ⏱️ 시간대별 생산성                │
├─────────────────────────────────┤
│                                 │
│  완료율                          │
│  100% ┤     ███                 │
│   75% ┤   ███████               │
│   50% ┤ ███████████             │
│   25% ┤ ███████████████         │
│    0% └─────────────────────    │
│       6  9  12 15 18 21 24     │
│                                 │
│  🌟 최고 시간대: 오전 10-12시     │
│     (평균 완료율 82%)             │
│                                 │
│  💡 추천: 중요한 일은 오전에!     │
└─────────────────────────────────┘
```

**데이터 분석**:
```typescript
// 시간대별 완료율 계산 (2시간 단위)
const timeSlots = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];

const productivityByTime = timeSlots.map(hour => {
  const slotTodos = todos.filter(t => {
    const todoHour = new Date(t.start_time).getHours();
    return todoHour >= hour && todoHour < hour + 2;
  });
  
  return {
    hour,
    label: `${hour}:00-${hour+2}:00`,
    completionRate: (slotTodos.filter(t => t.completed).length / slotTodos.length) * 100
  };
});

// 최고 생산성 시간대 찾기
const bestTimeSlot = productivityByTime.reduce((max, slot) => 
  slot.completionRate > max.completionRate ? slot : max
);
```

---

### 7️⃣ 월간 개요 (Monthly Overview) - 선택적

**UI**: 작은 캘린더 + 완료율
```
┌──────────────────────────────────┐
│ 📅 10월 개요                      │
├──────────────────────────────────┤
│                                  │
│  일 월 화 수 목 금 토              │
│        1  2  3  4  5             │
│     ▓  ▓  ░  ▓  ▓  ░            │
│  6  7  8  9 10 11 12             │
│  ▓  ▓  ▓  ░  ▓  ▓  ░            │
│ 13 14 15 16 17 18 19             │
│  ▓  ▓  ▓  ▓  ▓  ░  ░            │
│                                  │
│  월간 완료율: 72%                 │
│  완료일: 21일 / 미완료: 8일        │
└──────────────────────────────────┘
```

---

## 🎨 디자인 가이드

### 색상 시스템
```typescript
const dashboardColors = {
  // 지표 카드
  success: '#10b981', // 녹색 - 완료
  warning: '#f59e0b', // 주황 - 진행중
  danger: '#ef4444',  // 빨강 - 기한 지남
  info: '#3b82f6',    // 파랑 - 정보
  
  // 차트
  chartPrimary: '#8b5cf6',   // 보라
  chartSecondary: '#06b6d4', // 청록
  chartTertiary: '#f97316',  // 주황
  
  // 배경
  cardBg: '#ffffff',
  cardBgDark: '#1f2937',
  border: '#e5e7eb'
};
```

### 반응형 레이아웃
```
Desktop (>1024px):
- 2열 또는 3열 그리드
- 모든 위젯 표시

Tablet (768-1024px):
- 2열 그리드
- 일부 위젯 축소

Mobile (<768px):
- 1열 스택
- 핵심 지표만 표시
- 나머지는 펼치기/접기
```

---

## 📊 필요한 데이터 쿼리

### 1. 대시보드 초기 로드
```typescript
// app/api/dashboard/route.ts
export async function GET(request: Request) {
  const userId = await getUserId();
  
  // 병렬로 모든 데이터 가져오기
  const [
    todayStats,
    weekStats,
    upcomingEvents,
    categoryStats,
    habitStreaks,
    timeProductivity
  ] = await Promise.all([
    getTodayStats(userId),
    getWeekStats(userId),
    getUpcomingEvents(userId),
    getCategoryStats(userId),
    getHabitStreaks(userId),
    getTimeProductivity(userId)
  ]);
  
  return NextResponse.json({
    todayStats,
    weekStats,
    upcomingEvents,
    categoryStats,
    habitStreaks,
    timeProductivity
  });
}
```

### 2. Supabase RLS 정책
```sql
-- dashboard_stats 뷰 생성 (성능 최적화)
CREATE VIEW dashboard_stats AS
SELECT 
  user_id,
  date,
  COUNT(*) as total_todos,
  COUNT(*) FILTER (WHERE completed = true) as completed_todos,
  SUM(duration) as total_minutes,
  COUNT(DISTINCT category_id) as active_categories
FROM todos
GROUP BY user_id, date;

-- RLS 정책
ALTER TABLE dashboard_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stats"
ON dashboard_stats
FOR SELECT
USING (auth.uid() = user_id);
```

---

## 🚀 구현 단계

### Phase 1: 기본 대시보드 (1주)
- ✅ 레이아웃 구조
- ✅ 핵심 지표 카드 4개
- ✅ 다가오는 일정
- ✅ 주간 생산성 차트

### Phase 2: 고급 분석 (1주)
- ✅ 카테고리별 시간 분석
- ✅ 시간대별 생산성
- ✅ 차트 라이브러리 통합 (recharts)

### Phase 3: 차별화 기능 (1주)
- ✅ 습관 트래커 히트맵
- ✅ 연속 달성 기록
- ✅ 인사이트 자동 생성

### Phase 4: 최적화 (3-5일)
- ✅ 캐싱 (React Query)
- ✅ 실시간 업데이트 (Supabase Realtime)
- ✅ 모바일 최적화

---

## 📦 필요한 라이브러리

```json
{
  "dependencies": {
    "recharts": "^2.10.0",        // 차트
    "date-fns": "^3.0.0",         // 날짜 계산
    "@tanstack/react-query": "^5.0.0", // 데이터 캐싱
    "framer-motion": "^11.0.0"    // 애니메이션
  }
}
```

---

## 🎯 성공 지표

### 사용자 행동
- 대시보드 방문율: 일일 사용자의 60% 이상
- 평균 체류 시간: 1분 이상
- 인사이트 클릭률: 30% 이상

### 기술 지표
- 초기 로드 시간: < 1초
- 데이터 새로고침: < 300ms
- 모바일 성능 점수: > 90

---

## 💡 향후 확장 아이디어

### AI 인사이트
```
"이번 주 업무 시간이 지난주 대비 20% 증가했어요"
"오전 10-12시에 가장 생산적이네요!"
"운동 루틴을 7일 연속 달성했어요! 🎉"
"금요일 오후에 완료율이 낮아요. 중요한 일은 오전에 배치해보세요"
```

### 목표 설정
- 주간 목표 완료율 설정
- 카테고리별 시간 목표
- 목표 달성 시 축하 알림

### 비교 분석
- 지난주/지난달 대비
- 월별 트렌드
- 연간 리포트

### 공유 기능
- 주간 리포트 이미지 생성
- SNS 공유
- 팀 대시보드 (협업 시)

---

## 📝 참고사항

### 프라이버시
- 모든 데이터는 사용자별로 격리
- 집계된 통계만 표시
- 개인 정보 노출 없음

### 성능 최적화
- 초기 로드: Critical 데이터만
- 나머지: Lazy Loading
- 차트: SVG 최적화
- 이미지: WebP 포맷

### 접근성
- 색맹 고려 (색상 + 아이콘)
- 스크린 리더 지원
- 키보드 네비게이션

---

**Last Updated**: 2025-10-29

