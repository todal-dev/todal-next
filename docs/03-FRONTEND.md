# 💻 프론트엔드 개발 가이드

> Todal 프론트엔드 아키텍처, 컴포넌트 구조, 주요 기능 구현

---

## 🏗️ 기술 스택

### Core
- **Framework**: Next.js 15 (App Router)
- **React**: React 19 RC
- **Language**: TypeScript 5.3+
- **Styling**: Tailwind CSS v4

### Libraries
- **Drag & Drop**: @dnd-kit (드래그앤드롭)
- **Date**: date-fns (날짜 처리)
- **Animation**: framer-motion (애니메이션)
- **Icons**: lucide-react (아이콘)

### State Management
- **Context API**: Todo, Category 전역 상태
- **Local State**: React useState, useCallback

---

## 📁 프로젝트 구조

```
app/
├── page.tsx                    # 메인 페이지 (Home)
├── login/page.tsx             # 로그인
├── signup/page.tsx            # 회원가입
├── auth/callback/route.ts     # Supabase 콜백
├── layout.tsx                 # 루트 레이아웃
└── globals.css                # 글로벌 스타일

components/
├── auth/
│   └── LogoutButton.tsx       # 로그아웃 버튼
├── calendar/
│   ├── CalendarGrid.tsx       # 주간 캘린더 그리드
│   ├── CalendarHeader.tsx     # 캘린더 헤더 (날짜 네비게이션)
│   ├── GoogleCalendarSyncButton.tsx  # 구글 캘린더 동기화
│   ├── MiniCalendar.tsx       # 미니 캘린더 (월간 뷰)
│   ├── TodoBlock.tsx          # 캘린더 할일 블록
│   └── WeekCalendar.tsx       # 주간 캘린더 메인
├── layout/
│   ├── DesktopLayout.tsx      # 데스크톱 레이아웃
│   └── MobileLayout.tsx       # 모바일 레이아웃
├── todo/
│   ├── CategorySection.tsx    # 카테고리 섹션
│   ├── RecurringSection.tsx   # 반복 일정 섹션
│   ├── TodoInput.tsx          # 할일 입력
│   ├── TodoItem.tsx           # 할일 아이템
│   └── TodoList.tsx           # 할일 리스트
└── ui/
    ├── calendar/              # 캘린더 UI
    ├── dialogs/              # 다이얼로그/모달
    ├── forms/                # 폼 컴포넌트
    ├── menus/                # 컨텍스트 메뉴
    └── utilities/            # 유틸리티 컴포넌트

contexts/
├── CategoryContext.tsx        # 카테고리 Context
└── TodoContext.tsx           # Todo Context

hooks/
├── data/
│   ├── useCategories.ts      # 카테고리 데이터 관리
│   ├── useHolidays.ts        # 공휴일 데이터
│   ├── useTodoRecursive.ts   # 반복 할일 로직
│   └── useTodos.ts           # 할일 데이터 관리
├── drag/
│   ├── useCalendarDrag.ts    # 캘린더 드래그
│   ├── useResizeTodo.ts      # 할일 크기 조정
│   └── useTodoDrag.ts        # 할일 드래그
├── state/
│   ├── useContextMenu.ts     # 컨텍스트 메뉴 상태
│   ├── useDialogs.ts         # 다이얼로그 상태
│   └── useInlineEdit.ts      # 인라인 편집 상태
└── ui/
    ├── useCalendarFilters.ts # 캘린더 필터
    └── useHourHeight.ts      # 시간당 높이 계산

utils/
├── calendarUtils.ts          # 캘린더 유틸 (날짜 포맷 등)
├── dragUtils.ts              # 드래그 유틸
├── eventLayoutUtils.ts       # 이벤트 레이아웃 계산
└── recurringUtils.ts         # 반복 일정 로직
```

---

## 🎯 핵심 컴포넌트

### 1. 메인 페이지 (app/page.tsx)

```typescript
'use client';

export default function Home() {
  // 상태 관리
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // 커스텀 훅
  const { todos, handleAddTodo, ... } = useTodos();
  const { categories, handleAddCategory, ... } = useCategories();
  
  // Context 제공
  return (
    <TodoProvider value={todoContextValue}>
      <CategoryProvider value={categoryContextValue}>
        <Header />
        <DesktopLayout />
        <MobileLayout />
      </CategoryProvider>
    </TodoProvider>
  );
}
```

**역할**: 앱의 진입점, Context 제공, 레이아웃 렌더링

---

### 2. 할일 리스트 (components/todo/TodoList.tsx)

**구조**:
```
TodoList
├── CategorySection (각 카테고리별)
│   ├── CategoryHeader (카테고리명, 색상)
│   └── TodoItem (개별 할일)
│       ├── Checkbox
│       ├── Text (인라인 편집)
│       ├── Time (시작/종료)
│       └── ContextMenu
└── RecurringSection (반복 일정)
    └── RecurringItem
```

**주요 기능**:
- 카테고리별 그룹화
- 드래그앤드롭 정렬
- 인라인 텍스트 편집
- 컨텍스트 메뉴 (우클릭)

---

### 3. 주간 캘린더 (components/calendar/WeekCalendar.tsx)

**구조**:
```
WeekCalendar
├── CalendarHeader (주 네비게이션)
├── TimeAxis (0시~24시)
└── CalendarGrid
    ├── DayColumn x 7 (월~일)
    │   └── TodoBlock (각 할일)
    └── CurrentTimeLine (현재 시각)
```

**주요 기능**:
- 주간 뷰 (월~일)
- 시간 블록 표시 (30분 단위)
- 드래그앤드롭 (할일 → 캘린더)
- 드래그로 시간 조정
- 드래그로 날짜 이동

---

### 4. 미니 캘린더 (components/calendar/MiniCalendar.tsx)

**구조**:
```
MiniCalendar
├── MonthNavigation (이전/다음 달)
├── WeekdayHeader (월~일)
└── DateGrid
    └── DateCell
        ├── Date Number
        └── Todo Dots (카테고리별 색상)
```

**주요 기능**:
- 월간 뷰
- 날짜별 할일 개수 표시 (점으로)
- 날짜 클릭 → 주간 캘린더 이동

---

## 🎨 상태 관리 전략

### 1. Context API

**TodoContext**:
```typescript
interface TodoContextValue {
  todos: Todo[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onAddTodo: (text: string, categoryId: string) => void;
  onDeleteTodo: (id: string) => void;
  onToggleTodo: (id: string) => void;
  onEditTodo: (id: string, text: string) => void;
  onUpdateTodoTime: (id: string, start: string, end: string) => void;
  // ... 더 많은 핸들러
}
```

**CategoryContext**:
```typescript
interface CategoryContextValue {
  categories: Category[];
  onAddCategory: (name: string, color: string) => void;
  onEditCategory: (id: string, name: string) => void;
  onChangeColor: (id: string, color: string) => void;
  onDeleteCategory: (id: string) => void;
  onMoveCategory: (id: string, newIndex: number) => void;
  // 반복 일정 관련
  onAddRecurring: (...) => void;
  onEditRecurring: (...) => void;
  onDeleteRecurring: (...) => void;
}
```

### 2. Custom Hooks

**useTodos**: 할일 데이터 및 CRUD 로직
```typescript
const useTodos = (initialTodos: Todo[]) => {
  const [todos, setTodos] = useState(initialTodos);
  
  // Supabase 연동
  useEffect(() => {
    loadTodosFromSupabase();
  }, []);
  
  // CRUD 핸들러
  const handleAddTodo = useCallback((text, categoryId) => {
    // Supabase에 저장 + 로컬 상태 업데이트
  }, []);
  
  return { todos, handleAddTodo, ... };
};
```

**useCategories**: 카테고리 데이터 및 관리 로직

---

## 🎭 드래그앤드롭 구현

### @dnd-kit 사용

**1. 할일 드래그 (좌측 → 우측)**:
```typescript
// useTodoDrag.ts
const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(KeyboardSensor)
);

const handleDragEnd = (event) => {
  const { active, over } = event;
  
  if (over?.id.startsWith('calendar-')) {
    // 캘린더로 드롭
    const date = extractDateFromId(over.id);
    const time = calculateTimeFromPosition(event.delta.y);
    onMoveTodoToCalendar(active.id, date, time);
  }
};
```

**2. 시간 조정 (드래그로 늘림/줄임)**:
```typescript
// useResizeTodo.ts
const handleResize = (todoId, delta) => {
  const minutesDelta = (delta / HOUR_HEIGHT) * 60;
  onUpdateTodoTime(todoId, newStart, newEnd);
};
```

**3. 순서 변경 (드래그로 정렬)**:
```typescript
// useSortable from @dnd-kit/sortable
const { attributes, listeners, setNodeRef } = useSortable({
  id: todo.id
});
```

---

## 📅 반복 일정 로직

### 반복 규칙 데이터 구조

```typescript
interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;              // 반복 간격
  daysOfWeek?: number[];         // 요일 (0=일, 6=토)
  endDate?: Date;                // 종료일
}

interface Todo {
  // ...
  recurrenceRule?: RecurrenceRule;
  completedDates?: string[];     // 완료한 날짜들
  skippedDates?: string[];       // 건너뛴 날짜들
}
```

### 반복 일정 생성 로직

```typescript
// utils/recurringUtils.ts
function generateRecurringEvents(
  todo: Todo,
  dates: Date[]
): Todo[] {
  const events: Todo[] = [];
  
  dates.forEach(date => {
    if (shouldGenerateOnDate(todo.recurrenceRule, date)) {
      const dateKey = formatDateKey(date);
      const isCompleted = todo.completedDates?.includes(dateKey);
      const isSkipped = todo.skippedDates?.includes(dateKey);
      
      if (!isSkipped) {
        events.push({
          ...todo,
          id: `${todo.id}-${dateKey}`,
          date,
          completed: isCompleted
        });
      }
    }
  });
  
  return events;
}
```

---

## 🎨 스타일링 패턴

### Tailwind CSS 사용

**예시: TodoItem**:
```tsx
<div className="
  flex items-center gap-3 px-4 py-3
  hover:bg-gray-50 rounded-lg
  transition-colors duration-150
  group
">
  <Checkbox checked={completed} />
  <input
    className="
      flex-1 outline-none
      text-gray-900 text-sm
      placeholder:text-gray-400
    "
  />
  <div className="
    opacity-0 group-hover:opacity-100
    transition-opacity
  ">
    <ContextMenuButton />
  </div>
</div>
```

### 조건부 스타일링

```tsx
<div className={cn(
  "px-3 py-2 rounded-md",
  completed && "opacity-50 line-through",
  isToday && "bg-blue-50 border-blue-200"
)}>
```

---

## ⚡ 성능 최적화

### 1. React.memo로 불필요한 리렌더 방지

```typescript
export const TodoItem = React.memo(({ todo, onToggle }) => {
  // ...
}, (prev, next) => {
  return prev.todo.id === next.todo.id
    && prev.todo.completed === next.todo.completed;
});
```

### 2. useCallback으로 함수 메모이제이션

```typescript
const handleToggle = useCallback((id: string) => {
  setTodos(prev => prev.map(todo => 
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  ));
}, []);
```

### 3. useMemo로 계산 결과 캐싱

```typescript
const todosByDate = useMemo(() => {
  return groupTodosByDate(todos);
}, [todos]);
```

---

## 📱 반응형 디자인

### 레이아웃 전환

```tsx
// Desktop: 좌우 분할
<div className="hidden lg:flex">
  <TodoList />
  <WeekCalendar />
</div>

// Mobile: 탭 전환
<div className="lg:hidden">
  <TabNavigation />
  {activeTab === 'todo' ? <TodoList /> : <WeekCalendar />}
</div>
```

---

## 🐛 디버깅 팁

### Console 로그 활용
```typescript
console.log('🔄 Loading todos...');
console.log('✅ Loaded:', todos.length);
console.error('❌ Error:', error);
```

### React DevTools
- Component 트리 확인
- Props/State 검사
- Re-render 추적

---

**Last Updated**: 2025-10-29


