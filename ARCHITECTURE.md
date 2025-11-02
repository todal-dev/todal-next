# 🏗️ Todal 완전 분석 - 아키텍처 & 메커니즘

## 📚 목차
1. [데이터 구조](#1-데이터-구조)
2. [전체 아키텍처](#2-전체-아키텍처)
3. [상태 관리 메커니즘](#3-상태-관리-메커니즘)
4. [Optimistic Update 시스템](#4-optimistic-update-시스템)
5. [드래그앤드롭 시스템](#5-드래그앤드롭-시스템)
6. [반복 일정 메커니즘](#6-반복-일정-메커니즘)
7. [캘린더 렌더링 시스템](#7-캘린더-렌더링-시스템)
8. [완전한 기능 목록](#8-완전한-기능-목록)

---

## 1. 데이터 구조

### 1.1 Todo 타입
```typescript
interface Todo {
  id: string;                    // UUID 또는 temp-{timestamp}
  text: string;                  // 할일 제목
  completed: boolean;            // 완료 상태
  date: Date;                    // 날짜
  categoryId: string;            // 카테고리 ID
  subtasks?: Todo[];             // 하위 항목 (재귀 구조)
  parentId?: string;             // 부모 ID
  startTime?: string;            // 시작 시간 (HH:mm)
  endTime?: string;              // 종료 시간 (HH:mm)
  recurrenceRule?: RecurrenceRule; // 반복 규칙
  completedDates?: string[];     // 반복 일정 완료 날짜들 (YYYY-MM-DD)
  skippedDates?: string[];       // 반복 일정 건너뛴 날짜들
  googleEventId?: string;        // 구글 캘린더 이벤트 ID
}
```

### 1.2 RecurrenceRule 타입
```typescript
interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly';  // 반복 주기
  interval: number;                           // 간격 (1=매일, 2=이틀마다...)
  startDate?: Date;                           // 시작 날짜
  endDate?: Date;                             // 종료 날짜
  daysOfWeek?: number[];                      // 요일 (1=월, 7=일)
}
```

### 1.3 Category 타입
```typescript
interface Category {
  id: string;     // UUID 또는 cat-{name}
  name: string;   // 카테고리 이름
  color: string;  // 색상 (#HEX)
}
```

### 1.4 데이터베이스 스키마

**todos 테이블**
```sql
CREATE TABLE todos (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  category_id UUID NULL,           -- 기본 카테고리는 NULL
  parent_id UUID NULL,              -- 하위 항목의 부모 ID
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  date DATE NOT NULL,
  start_time TIME NULL,
  end_time TIME NULL,
  recurrence_rule JSONB NULL,      -- 반복 규칙
  completed_dates TEXT[] NULL,     -- 반복 일정 완료 날짜
  skipped_dates TEXT[] NULL,       -- 반복 일정 건너뛴 날짜
  google_event_id TEXT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**categories 테이블**
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  order INT NOT NULL,              -- 정렬 순서
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 2. 전체 아키텍처

### 2.1 레이어 구조
```
┌─────────────────────────────────────────┐
│         UI Components Layer             │
│  (TodoList, WeekCalendar, TodoBlock)    │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Context Layer                   │
│  (TodoContext, CategoryContext)         │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Hooks Layer                     │
│  (useTodos, useCategories, etc)         │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Supabase Queries                │
│  (createTodo, updateTodo, etc)          │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Supabase Database               │
│  (PostgreSQL + Realtime)                │
└─────────────────────────────────────────┘
```

### 2.2 데이터 흐름

#### 생성 흐름 (Create)
```
1. UI Component
   └─> Context (onAddTodo)
       └─> useTodos Hook
           ├─> 즉시 로컬 상태 업데이트 (임시 ID)
           │   └─> UI 즉시 반영 ✨
           └─> 백그라운드 DB 저장
               ├─ 성공 → 실제 ID로 교체
               └─ 실패 → 롤백 (임시 Todo 제거)
```

#### 수정 흐름 (Update)
```
1. UI Component
   └─> Context (onEditTodo)
       └─> useTodos Hook
           ├─> 즉시 로컬 상태 업데이트
           │   └─> UI 즉시 반영 ✨
           └─> 백그라운드 DB 업데이트
               └─ 실패 → 로그 (롤백 복잡해서 생략)
```

#### 삭제 흐름 (Delete)
```
1. UI Component
   └─> Context (onDeleteTodo)
       └─> useTodos Hook
           ├─> 백업 생성
           ├─> 즉시 로컬 상태에서 삭제
           │   └─> UI 즉시 반영 ✨
           └─> 백그라운드 DB 삭제
               └─ 실패 → 롤백 (백업 복원)
```

---

## 3. 상태 관리 메커니즘

### 3.1 Context 구조

**TodoContext** - 할일 관련 모든 액션
```typescript
interface TodoContextType {
  // 기본 CRUD
  onAddTodo: (text, categoryId, date, parentId?, startTime?, endTime?) => void
  onDeleteTodo: (id) => void
  onToggleTodo: (id) => void
  onEditTodo: (id, text) => void
  
  // 시간/날짜 관리
  onUpdateTodoTime: (id, startTime?, endTime?) => void
  onUpdateTodoDateTime: (id, date, startTime?, endTime?) => void
  onMoveTodoToDate: (id, newDate) => void
  
  // 계층 구조 관리
  onMoveTodo: (todoId, newCategoryId, newParentId?, newIndex?) => void
  
  // 캘린더 전용
  onAddTodoFromCalendar: (todo, callback?) => void
  onUpdateTodo: (id, updates) => void
  
  // 반복 일정 관리
  onToggleRecurringInstance: (recurringId, date) => void
  onSkipRecurringInstance: (recurringId, date) => void
  onDeleteRecurringAfter: (recurringId, date) => void
  onConvertRecurringToRegular: (recurringId, date, categoryId) => void
  onConvertRegularToRecurring: (todoId, text, startTime, endTime, rule, categoryId) => void
}
```

**CategoryContext** - 카테고리 관련 모든 액션
```typescript
interface CategoryContextType {
  // 기본 CRUD
  onAddCategory: (name, color) => void
  onEditCategory: (id, name) => void
  onChangeColor: (id, color) => void
  onDeleteCategory: (id) => void
  
  // 정렬
  onMoveCategory: (categoryId, newIndex) => void
  
  // 반복 일정
  onAddRecurring: (text, startTime, endTime, rule, categoryId) => void
  onEditRecurring: (id, text, startTime, endTime, rule, categoryId) => void
  onDeleteRecurring: (id) => void
}
```

### 3.2 상태 초기화 흐름

```
1. app/page.tsx 마운트
   │
2. useEffect 실행
   ├─> fetchTodos() - Supabase에서 todos 가져오기
   └─> fetchCategories() - Supabase에서 categories 가져오기
   │
3. 데이터 로드 완료
   ├─> setInitialTodos(todosData)
   └─> setInitialCategories(categoriesData)
   │
4. useTodos(initialTodos) 실행
   └─> useState로 로컬 상태 생성
   │
5. useCategories(initialCategories, todos) 실행
   └─> useState로 로컬 상태 생성
   │
6. Context에 값 제공
   └─> TodoProvider, CategoryProvider
       └─> 모든 하위 컴포넌트에서 사용 가능
```

---

## 4. Optimistic Update 시스템

### 4.1 핵심 개념

**Optimistic Update**: 서버 응답을 기다리지 않고 즉시 UI를 업데이트하여 사용자 경험을 향상시키는 기법

### 4.2 구현 패턴

#### 패턴 1: 생성 시 (Create)
```typescript
// 1. 임시 ID 생성
const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// 2. 임시 객체 생성
const tempTodo: Todo = { id: tempId, ...data };

// 3. 즉시 로컬 상태 업데이트
setTodos(prev => [...prev, tempTodo]);

// 4. 백그라운드 DB 저장
const result = await createTodoDB(...);

// 5. 성공 시 임시 ID를 실제 ID로 교체
if (result.success && result.todo) {
  setTodos(prev => prev.map(t => 
    t.id === tempId ? result.todo! : t
  ));
} else {
  // 6. 실패 시 롤백
  setTodos(prev => prev.filter(t => t.id !== tempId));
}
```

#### 패턴 2: 수정 시 (Update)
```typescript
// 1. 즉시 로컬 상태 업데이트
setTodos(prev => updateTodoRecursively(prev, id, updates));

// 2. 백그라운드 DB 업데이트
const result = await updateTodoDB(id, updates);

// 3. 실패 시 로그 (롤백 생략)
if (!result.success) {
  console.error('Failed to update:', result.error);
}
```

#### 패턴 3: 삭제 시 (Delete)
```typescript
// 1. 백업 생성
let backupTodos: Todo[] = [];

// 2. 즉시 로컬 상태에서 삭제
setTodos(prev => {
  backupTodos = prev;
  return deleteRecursively(prev, id);
});

// 3. 백그라운드 DB 삭제
const result = await deleteTodoDB(id);

// 4. 실패 시 롤백
if (!result.success) {
  setTodos(backupTodos);
}
```

### 4.3 임시 ID 처리

**임시 ID 패턴**
- 일반 할일: `temp-{timestamp}-{random}`
- 캘린더 할일: `temp-calendar-{timestamp}-{random}`
- 반복 할일: `temp-recurring-{timestamp}-{random}`
- 변환 할일: `temp-convert-{timestamp}-{random}`

**임시 ID 감지**
```typescript
if (id.startsWith('temp-')) {
  // DB 호출 건너뛰기
  return;
}
```

---

## 5. 드래그앤드롭 시스템

### 5.1 두 가지 드래그 시스템

#### A. dnd-kit (할일 리스트)
**사용처**: 할일 순서 변경, 카테고리 간 이동, 계층 구조

```typescript
// 드래그 데이터 구조
{
  type: 'todo',      // 또는 'category'
  id: 'todo-123',
  categoryId: 'cat1',
  parentId: undefined,
  index: 2
}
```

**주요 기능**
- 8px 활성화 거리 (클릭과 구분)
- 드래그 오버 시 카테고리 하이라이트
- Shift+드롭으로 하위 항목 만들기
- 드래그 중 opacity 0.5

#### B. Native Drag API (캘린더)
**사용처**: 할일 → 캘린더 드래그, 캘린더 내 드래그

```typescript
// 드래그 데이터
const dragData = {
  id: todo.id,
  text: todo.text,
  startTime: todo.startTime,
  endTime: todo.endTime,
  categoryId: todo.categoryId,
};
e.dataTransfer.setData('text/plain', JSON.stringify(dragData));
```

### 5.2 캘린더 내 드래그 메커니즘

#### 할일 블록 드래그
```typescript
1. mousedown 이벤트
   ├─> 현재 위치 저장 (offsetY)
   └─> draggingTodo 상태 설정
   
2. mousemove 이벤트 (requestAnimationFrame으로 60fps)
   ├─> 마우스 X 위치로 날짜 계산
   ├─> 마우스 Y 위치로 시간 계산 (15분 스냅)
   ├─> offsetY 고려하여 자연스러운 이동
   └─> draggingTodo 상태 업데이트
   
3. mouseup 이벤트
   ├─> 날짜 변경 여부 확인
   ├─ YES → onUpdateTodoDateTime(id, newDate, startTime, endTime)
   └─ NO → onEditTodo(id, { startTime, endTime })
```

#### 리사이즈 드래그
```typescript
1. 상단/하단 핸들 mousedown
   └─> resizingTodo 상태 설정 (type: 'top' 또는 'bottom')
   
2. mousemove 이벤트
   ├─> 마우스 Y 위치로 시간 계산 (15분 스냅)
   ├─ type === 'top'
   │  └─> startTime 업데이트 (endTime보다 작아야 함)
   └─ type === 'bottom'
      └─> endTime 업데이트 (startTime보다 커야 함)
   
3. mouseup 이벤트
   └─> onEditTodo(id, { startTime, endTime })
```

### 5.3 15분 스냅 계산
```typescript
// 1. 마우스 Y 좌표를 분 단위로 변환
const totalMinutes = Math.floor((mouseY / hourHeight) * 60);

// 2. 15분 단위로 반올림
const roundedMinutes = Math.round(totalMinutes / 15) * 15;

// 3. 시간으로 변환
const hours = Math.floor(roundedMinutes / 60);
const minutes = roundedMinutes % 60;
const time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
```

---

## 6. 반복 일정 메커니즘

### 6.1 반복 규칙 처리

#### 매일 (Daily)
```typescript
const daysDiff = Math.floor(
  (targetDate - startDate) / (1000 * 60 * 60 * 24)
);
shouldInclude = daysDiff >= 0 && daysDiff % interval === 0;
```

#### 매주 (Weekly)
```typescript
// daysOfWeek가 있는 경우
if (daysOfWeek.includes(dayOfWeek)) {
  const weeksDiff = Math.floor(daysDiff / 7);
  shouldInclude = weeksDiff % interval === 0;
}

// daysOfWeek가 없는 경우 (시작 날짜 요일만)
shouldInclude = 
  targetDate.getDay() === startDate.getDay() &&
  weeksDiff % interval === 0;
```

#### 매월 (Monthly)
```typescript
const monthsDiff =
  (targetYear - startYear) * 12 +
  (targetMonth - startMonth);
shouldInclude =
  targetDate.getDate() === startDate.getDate() &&
  monthsDiff % interval === 0;
```

### 6.2 반복 이벤트 생성

```typescript
// generateRecurringEvents(todo, weekDays)
function generateRecurringEvents(todo: Todo, weekDays: Date[]): Todo[] {
  if (!todo.recurrenceRule) return [todo];
  
  const events: Todo[] = [];
  
  weekDays.forEach((day) => {
    // 1. 반복 규칙 확인
    let shouldInclude = checkRecurrenceRule(todo, day);
    
    // 2. 종료일 확인
    if (endDate && day > endDate) {
      shouldInclude = false;
    }
    
    // 3. 건너뛴 날짜 확인
    if (skippedDates.includes(formatDateKey(day))) {
      shouldInclude = false;
    }
    
    // 4. 이벤트 생성
    if (shouldInclude) {
      events.push({
        ...todo,
        id: `${todo.id}-${day.toISOString()}`,  // 고유 ID
        date: day,
      });
    }
  });
  
  return events;
}
```

### 6.3 완료 상태 관리

**completedDates 배열**
```typescript
// 특정 날짜 완료 토글
const dateString = '2025-11-02';
const isCompleted = completedDates.includes(dateString);

newCompletedDates = isCompleted
  ? completedDates.filter(d => d !== dateString)  // 제거
  : [...completedDates, dateString];              // 추가

// DB 업데이트
updateTodoDB(recurringId, { completedDates: newCompletedDates });
```

### 6.4 건너뛰기 관리

**skippedDates 배열**
```typescript
// 특정 날짜 건너뛰기
const dateString = '2025-11-02';
const skippedDates = todo.skippedDates || [];

if (!skippedDates.includes(dateString)) {
  newSkippedDates = [...skippedDates, dateString];
  
  // DB 업데이트
  updateTodoDB(recurringId, { skippedDates: newSkippedDates });
}

// 생성 시 필터링
if (skippedDates.includes(formatDateKey(day))) {
  shouldInclude = false;  // 이벤트 생성하지 않음
}
```

### 6.5 이후 모두 삭제

```typescript
// endDate를 오늘 -1일로 설정
const endDate = new Date(date);
endDate.setDate(endDate.getDate() - 1);

newRecurrenceRule = {
  ...recurrenceRule,
  endDate  // 오늘 이전까지만 반복
};

updateTodoDB(recurringId, { recurrenceRule: newRecurrenceRule });
```

---

## 7. 캘린더 렌더링 시스템

### 7.1 겹치는 이벤트 레이아웃

**Google Calendar 스타일 알고리즘**
```typescript
function calculateEventLayout(todos: Todo[]): Layout {
  // 1. 시작 시간과 길이로 정렬
  const sorted = todos.sort((a, b) => {
    if (startTime(a) !== startTime(b)) return startTime(a) - startTime(b);
    return duration(b) - duration(a);  // 긴 이벤트 우선
  });
  
  // 2. 컬럼 배정
  const columns: Todo[][] = [];
  sorted.forEach(event => {
    // 겹치지 않는 첫 번째 컬럼 찾기
    let placed = false;
    for (let col of columns) {
      if (!hasOverlap(event, col)) {
        col.push(event);
        placed = true;
        break;
      }
    }
    // 새 컬럼 생성
    if (!placed) columns.push([event]);
  });
  
  // 3. width와 left 계산
  return todos.map(event => {
    const column = findColumn(event, columns);
    const maxColumns = countOverlappingColumns(event, todos);
    
    return {
      width: 100 / maxColumns,
      left: column * (100 / maxColumns)
    };
  });
}
```

### 7.2 시간 블록 CSS 계산

```typescript
function getTodoBlockStyle(
  startTime: string,  // "09:00"
  endTime: string,    // "11:00"
  hourHeight: number  // 60px
): CSSProperties {
  // 1. 분 단위로 변환
  const startMinutes = timeToMinutes(startTime);  // 540
  const endMinutes = timeToMinutes(endTime);      // 660
  const duration = endMinutes - startMinutes;      // 120
  
  // 2. 픽셀 계산
  const top = (startMinutes / 60) * hourHeight;    // 540px
  const height = (duration / 60) * hourHeight - 2; // 118px (2px gap)
  
  return {
    top: `${top}px`,
    height: `${height}px`,
    // 겹치는 경우
    width: `calc(${width}% - 4px)`,
    left: `${left}%`,
  };
}
```

### 7.3 현재 시간 표시

```typescript
// 1분마다 업데이트
useEffect(() => {
  const timer = setInterval(() => {
    setCurrentTime(new Date());
  }, 60000);
  
  return () => clearInterval(timer);
}, []);

// 현재 시간 라인 렌더링
const now = currentTime;
const minutes = now.getHours() * 60 + now.getMinutes();
const topPosition = (minutes / 60) * hourHeight;

<div style={{ top: `${topPosition}px` }} className="current-time-line" />
```

---

## 8. 완전한 기능 목록

### 8.1 할일 리스트 기능

#### 기본 CRUD
- ✅ **할일 추가**: Enter로 빠른 생성
- ✅ **할일 삭제**: Backspace(빈 칸) 또는 삭제 버튼
- ✅ **할일 수정**: 인라인 편집
- ✅ **완료 토글**: 체크박스 클릭

#### 계층 구조
- ✅ **들여쓰기**: Tab 키
- ✅ **내어쓰기**: Shift+Tab 키
- ✅ **하위 항목 추가**: Shift+드롭
- ✅ **부모 완료 시**: 하위 항목 일괄 완료
- ✅ **하위 항목 표시**: 개수 뱃지

#### 시간 관리
- ✅ **시간 추가**: 호버 시 버튼 표시
- ✅ **시간 선택**: TimePicker (15분 단위)
- ✅ **시간 표시**: HH:mm 형식
- ✅ **시간 편집**: 클릭하여 수정

#### 드래그앤드롭
- ✅ **순서 변경**: 같은 카테고리 내
- ✅ **카테고리 이동**: 다른 카테고리로
- ✅ **캘린더로 드래그**: 캘린더 아이콘
- ✅ **반복 변환**: 일반 ↔ 반복

### 8.2 카테고리 기능

#### 기본 관리
- ✅ **카테고리 추가**: + 버튼
- ✅ **색상 변경**: 10가지 팔레트
- ✅ **이름 변경**: 인라인 편집
- ✅ **순서 변경**: 드래그앤드롭
- ✅ **카테고리 삭제**: 확인 모달

#### 특수 카테고리
- ✅ **반복**: 최상단 고정, 삭제 불가
- ✅ **기타**: 최하단 고정, 삭제 불가
- ✅ **자동 생성**: 3개 기본 카테고리

### 8.3 반복 일정 기능

#### 반복 규칙
- ✅ **매일**: 1일마다, 2일마다...
- ✅ **매주**: 요일 다중 선택
- ✅ **매월**: 특정 날짜

#### 날짜 관리
- ✅ **시작일**: 반복 시작
- ✅ **종료일**: 반복 종료
- ✅ **건너뛰기**: 특정 날짜 제외

#### 완료 관리
- ✅ **날짜별 완료**: completedDates 배열
- ✅ **오늘 완료**: 체크박스 토글
- ✅ **완료 표시**: 카테고리 색상

#### 수정/삭제
- ✅ **반복 일정 편집**: 모든 인스턴스 적용
- ✅ **오늘만 건너뛰기**: skippedDates 추가
- ✅ **이후 모두 삭제**: endDate 설정
- ✅ **전체 삭제**: 반복 일정 자체 삭제

#### 변환
- ✅ **일반 → 반복**: 드래그 + 규칙 설정
- ✅ **반복 → 일반**: 특정 날짜만

### 8.4 캘린더 기능

#### 뷰 관리
- ✅ **주간 뷰**: 일~토 7일
- ✅ **타임라인**: 0시~24시
- ✅ **시간 높이 조절**: Zoom
- ✅ **현재 시간**: 빨간 라인
- ✅ **공휴일 표시**: API 연동

#### 드래그 생성
- ✅ **빈 공간 드래그**: 새 이벤트
- ✅ **15분 스냅**: 자동 정렬
- ✅ **인라인 입력**: 즉시 제목 입력
- ✅ **Enter 확정**: 할일 생성
- ✅ **Escape 취소**: 생성 취소

#### 할일 블록
- ✅ **블록 드래그**: 날짜/시간 이동
- ✅ **상단 리사이즈**: 시작 시간
- ✅ **하단 리사이즈**: 종료 시간
- ✅ **더블클릭 편집**: 제목 수정
- ✅ **체크박스**: 완료 토글
- ✅ **우클릭 메뉴**: 6가지 액션

#### 시각 표시
- ✅ **카테고리 색상**: 배경색
- ✅ **반복 아이콘**: Repeat 표시
- ✅ **시간 표시**: HH:mm - HH:mm
- ✅ **하위 항목**: 개수 + 툴팁
- ✅ **과거 이벤트**: 투명도 감소
- ✅ **겹치는 이벤트**: Google 스타일 레이아웃

#### 필터링
- ✅ **카테고리 필터**: 다중 선택
- ✅ **완료 필터**: 전체/완료/미완료

### 8.5 성능 최적화

#### React 최적화
- ✅ **React.memo**: TodoBlock, TodoItem, CategorySection
- ✅ **useMemo**: 복잡한 계산 캐싱
- ✅ **useCallback**: 함수 메모이제이션
- ✅ **메모이제이션 비교**: 세밀한 props 비교

#### 드래그 최적화
- ✅ **requestAnimationFrame**: 60fps 드래그
- ✅ **throttling**: 과도한 이벤트 방지
- ✅ **애니메이션 취소**: unmount 시

#### DB 최적화
- ✅ **Optimistic Update**: 즉시 UI 반영
- ✅ **임시 ID**: 서버 응답 전 사용
- ✅ **롤백 메커니즘**: 실패 시 복원
- ✅ **백그라운드 저장**: 비동기 처리

### 8.6 UX 세부 기능

#### 키보드 단축키
- ✅ **Enter**: 다음 할일 / 편집 완료
- ✅ **Escape**: 편집 취소
- ✅ **Tab**: 들여쓰기
- ✅ **Shift+Tab**: 내어쓰기
- ✅ **Backspace**: 빈 칸 삭제

#### 드래그 피드백
- ✅ **8px 활성화**: 클릭과 구분
- ✅ **Opacity 0.5**: 드래그 중
- ✅ **DragOverlay**: 커서 따라다님
- ✅ **카테고리 하이라이트**: 드롭 가능 표시

#### 호버 효과
- ✅ **밝기 변경**: hover 시
- ✅ **버튼 표시**: opacity 0 → 100
- ✅ **핸들 표시**: 리사이즈 가능
- ✅ **툴팁 표시**: 하위 항목

#### 애니메이션
- ✅ **Framer Motion**: 부드러운 전환
- ✅ **색상 전환**: transition 0.15s
- ✅ **스케일 효과**: 버튼 hover
- ✅ **슬라이드**: 모달 등장

### 8.7 데이터 관리

#### 로컬 스토리지
- ✅ **hourHeight**: 캘린더 줌 레벨
- ✅ **카테고리 필터**: 선택 상태
- ✅ **완료 필터**: 선택 상태

#### Supabase 실시간
- ✅ **자동 동기화**: 변경 사항 실시간 반영
- ✅ **사용자 격리**: user_id로 필터링
- ✅ **RLS 정책**: 보안

### 8.8 에러 처리

#### Optimistic Update 에러
- ✅ **생성 실패**: 임시 Todo 제거
- ✅ **삭제 실패**: 백업 복원
- ✅ **수정 실패**: 콘솔 로그

#### 사용자 에러
- ✅ **로그인 필요**: 에러 메시지
- ✅ **권한 없음**: 에러 메시지
- ✅ **네트워크 오류**: 로그

---

## 결론

Todal은 **Optimistic Update**, **드래그앤드롭**, **반복 일정**, **계층 구조** 등 복잡한 기능들을 **React Context**, **Custom Hooks**, **Supabase**를 활용하여 깔끔하게 구현한 프로젝트입니다.

**핵심 강점**:
1. ⚡ **빠른 UX**: Optimistic Update로 즉시 반영
2. 🎯 **직관적**: 드래그앤드롭으로 자연스러운 조작
3. 🔄 **강력한 반복**: 복잡한 반복 규칙 지원
4. 📊 **확장 가능**: 깔끔한 아키텍처
5. 🎨 **세밀한 최적화**: React.memo, useMemo, useCallback

**Phase 1 완성도**: 85% (구글 캘린더 연동 제외)


