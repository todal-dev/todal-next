# Phase 1-3: 캘린더 통합 (Calendar Integration)

> **Phase**: 1 (MVP)  
> **카테고리**: 캘린더  
> **우선순위**: 🔴 필수  
> **주차**: Week 4 (4주차)

---

## 📋 기능 개요

react-big-calendar를 기반으로 한 주간/월간 캘린더 뷰와 할일을 캘린더에 드래그앤드롭으로 배치하는 기능입니다.

### 핵심 특징

1. **주간/월간 뷰**: 캘린더 기본 뷰 제공
2. **할일 → 캘린더 드래그**: 할일을 캘린더에 드롭하여 일정 생성
3. **시간 조정**: 드래그로 시간 늘림/줄임
4. **소요시간 자동 업데이트**: 캘린더에서 시간 조정 시 할일 소요시간 반영
5. **일정 체크박스**: 캘린더 일정에서 바로 완료 처리

---

## 🎯 사용자 시나리오

### 시나리오 1: 주간 뷰 보기
```
1. 캘린더 "주간" 버튼 클릭
2. 현재 주의 월~일 표시
3. 시간대별 그리드 (09:00 ~ 18:00)
4. 각 일정이 시간대에 표시
```

### 시나리오 2: 할일을 캘린더로 드래그
```
1. 좌측 할일 "프로젝트 회의 30분" 드래그 시작
2. 우측 캘린더 월요일 10:00 영역 위에 올리기
3. 드래그 중 일정 예상 위치 가이드 표시
4. 마우스 뗌 → Schedule 모델 생성
5. 자동으로 예상 소요시간(30분)만큼 일정 생성
```

### 시나리오 3: 캘린더에서 시간 조정
```
1. 캘린더 일정 "프로젝트 회의" 10:00~10:30 클릭
2. 일정 박스 하단 모서리 드래그
3. 10:00~11:00으로 확장
4. 드롭 → 좌측 할일 소요시간도 60분으로 업데이트
```

### 시나리오 4: 캘린더에서 완료 처리
```
1. 캘린더 일정의 우측 상단 체크박스 클릭
2. 즉시 UI 업데이트:
   - 일정 박스 투명도 50% 감소
   - 좌측 할일도 체크 표시
3. 양쪽 모두 완료 상태 반영
```

### 시나리오 5: 미완료 일정 시각화
```
1. 어제 일정 "미완료 작업" (빨강)
2. 오늘 지난 시간대 "회의 준비" (주황)
3. 사용자가 한눈에 미완료 항목 파악
```

---

## 🗄️ 데이터 모델

### Schedule 테이블

```prisma
model Schedule {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  
  todoId      String?
  todo        Todo?    @relation(fields: [todoId], references: [id])
  
  title       String
  startTime   DateTime
  endTime     DateTime
  
  completed   Boolean  @default(false)
  completedAt DateTime?
  
  // 구글 연동 (Week 5)
  googleEventId String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Todo {
  // ... 기존 필드
  schedules   Schedule[]
}
```

### 시간 계산

```typescript
// 소요시간 (분) → 시간 범위
function calculateEndTime(startTime: Date, estimatedMin?: number): Date {
  const end = new Date(startTime)
  end.setMinutes(end.getMinutes() + (estimatedMin || 60))
  return end
}

// 시간 범위 → 소요시간 (분)
function calculateDuration(startTime: Date, endTime: Date): number {
  return (endTime.getTime() - startTime.getTime()) / (1000 * 60)
}
```

---

## 💻 구현 세부사항

### react-big-calendar 설정

```typescript
// components/calendar/calendar-view.tsx
'use client'

import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import koLocale from 'date-fns/locale/ko'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const locales = { ko: koLocale }
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => 0, // 일요일 시작
  getDay,
  locales,
})

interface CalendarViewProps {
  events: Schedule[]
  onSelectSlot: (slotInfo: SlotInfo) => void
  onSelectEvent: (event: Schedule) => void
}

export function CalendarView({
  events,
  onSelectSlot,
  onSelectEvent,
}: CalendarViewProps) {
  const [view, setView] = useState<'month' | 'week'>('week')
  const [date, setDate] = useState(new Date())

  return (
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="startTime"
      endAccessor="endTime"
      view={view}
      onView={setView}
      date={date}
      onNavigate={setDate}
      onSelectSlot={onSelectSlot}
      onSelectEvent={onSelectEvent}
      selectable
      popup
      views={['month', 'week']}
    />
  )
}
```

### 할일 → 캘린더 드래그

```typescript
// Server Actions
export async function createScheduleFromTodo(
  todoId: string,
  startTime: Date,
  estimatedMin?: number
): Promise<Schedule> {
  const todo = await prisma.todo.findUnique({ where: { id: todoId } })
  
  const endTime = new Date(startTime)
  endTime.setMinutes(endTime.getMinutes() + (estimatedMin || todo.estimatedMin || 60))
  
  return prisma.schedule.create({
    data: {
      userId,
      todoId,
      title: todo.title,
      startTime,
      endTime,
    },
  })
}

// 시간 조정
export async function updateScheduleTime(
  scheduleId: string,
  startTime: Date,
  endTime: Date
): Promise<void> {
  const schedule = await prisma.schedule.update({
    where: { id: scheduleId },
    data: { startTime, endTime },
  })
  
  // 연결된 할일의 소요시간도 업데이트
  if (schedule.todoId) {
    const duration = calculateDuration(startTime, endTime)
    await prisma.todo.update({
      where: { id: schedule.todoId },
      data: { estimatedMin: Math.round(duration) },
    })
  }
}
```

### 완료 토글

```typescript
export async function toggleScheduleComplete(
  scheduleId: string
): Promise<void> {
  const schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId },
  })
  
  const completed = !schedule.completed
  
  await prisma.schedule.update({
    where: { id: scheduleId },
    data: {
      completed,
      completedAt: completed ? new Date() : null,
    },
  })
  
  // 연결된 할일도 완료 처리
  if (schedule.todoId) {
    await prisma.todo.update({
      where: { id: schedule.todoId },
      data: {
        completed,
        completedAt: completed ? new Date() : null,
      },
    })
  }
}
```

---

## 🎨 UI 상태

### 1. 캘린더 일정 박스

```
┌────────────────────────────┐
│ 프로젝트 회의          ☐   │ ← 우측 상단 체크박스
│ 10:00 - 11:00             │
│ [프로젝트 🔵]              │
└────────────────────────────┘
```

**스타일**:
- 패딩: 12px
- 보더: 2px solid (카테고리 색상)
- 배경: 카테고리 색상 10% 투명도
- 높이: 시간에 따라 변동 (30분 = ~30px)

### 2. 완료 일정

```
┌────────────────────────────┐
│ ✓ 프로젝트 회의        ☑   │
│ 10:00 - 11:00             │
│ [프로젝트 🔵]              │
└────────────────────────────┘
```

**변경사항**:
- 투명도: 50% + 가벼운 초록 배경 오버레이
- 텍스트: 취소선 추가
- 체크: ✅ 표시

### 3. 미완료 시각화

| 상태 | 색상 | 설명 |
| --- | --- | --- |
| **정상** | 카테고리 색상 | 미완료, 향후 일정 |
| **진행 중** | 노랑 (#FF9F43) | 현재 시간 기준 진행 중 |
| **미완료** | 빨강 (#E74C3C) | 지난 시간에 미완료 |
| **완료** | 초록 (#2D9F6B) | 완료된 일정 |

---

## ⌨️ 키보드 단축키

| 단축키 | 동작 |
| --- | --- |
| `←` / `→` | 주/월 전후로 이동 |
| `T` | 오늘 날짜로 이동 |
| `W` | 주간 뷰 전환 |
| `M` | 월간 뷰 전환 |
| `E` | 일정 선택 시 편집 |
| `Delete` | 일정 선택 시 삭제 |

---

## 🚀 성능 최적화

### 이벤트 윈도윙

```typescript
// 보이는 범위의 일정만 렌더링
function CalendarView({ events }: CalendarViewProps) {
  const [viewRange, setViewRange] = useState({ start: new Date(), end: new Date() })
  
  // 표시 범위의 이벤트만 필터링
  const visibleEvents = events.filter(
    e => e.startTime >= viewRange.start && e.endTime <= viewRange.end
  )
  
  return <Calendar events={visibleEvents} />
}
```

### Optimistic Update

```typescript
const [optimisticSchedules, setOptimisticSchedules] = useOptimistic(schedules)

async function handleTimeAdjust(scheduleId: string, startTime: Date, endTime: Date) {
  // 즉시 UI 업데이트
  setOptimisticSchedules(prev =>
    prev.map(s => s.id === scheduleId ? { ...s, startTime, endTime } : s)
  )
  
  // 서버 업데이트
  await updateScheduleTime(scheduleId, startTime, endTime)
}
```

---

## ✅ 완료 기준

- [ ] react-big-calendar 설치 및 설정
- [ ] 주간/월간 뷰 전환 가능
- [ ] Schedule 모델 DB 저장 가능
- [ ] 할일 → 캘린더 드래그앤드롭
- [ ] 드롭 시 Schedule 자동 생성
- [ ] 캘린더에서 시간 조정 (드래그)
- [ ] 시간 조정 시 할일 소요시간 자동 업데이트
- [ ] 일정 완료 체크박스 작동
- [ ] 좌우 일정 동기화
- [ ] 미완료 시각화 (색상)

---

## 📌 연관 기능

- **Week 2**: [할일 관리](./01-todo-management.md) (선행 완료)
- **Week 3**: [드래그앤드롭](./02-drag-and-drop.md) (할일 드래그)
- **Week 5**: [구글 동기화](./04-google-sync.md) (외부 캘린더 연동)

---

**Last Updated**: 2025-10-17
