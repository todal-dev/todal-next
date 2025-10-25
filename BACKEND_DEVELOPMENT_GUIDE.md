# Todal 백엔드 개발 가이드

## 목차
1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택](#2-기술-스택)
3. [데이터 모델](#3-데이터-모델)
4. [API 요구사항](#4-api-요구사항)
5. [백엔드 연결 전 프론트엔드 수정사항](#5-백엔드-연결-전-프론트엔드-수정사항)
6. [데이터베이스 스키마 제안](#6-데이터베이스-스키마-제안)
7. [인증 및 권한](#7-인증-및-권한)
8. [성능 최적화 고려사항](#8-성능-최적화-고려사항)

---

## 1. 프로젝트 개요

### 1.1 애플리케이션 설명
Todal은 할일 관리 및 캘린더 기능을 제공하는 웹 애플리케이션입니다.

### 1.2 주요 기능
- **할일 관리**: 카테고리별 할일 생성, 수정, 삭제, 완료 처리
- **서브태스크**: 할일 내에 하위 할일 생성 (재귀적 구조)
- **반복 일정**: 일/주/월 단위 반복 일정 생성 및 관리
- **캘린더 뷰**: 주간 캘린더에서 일정 시각화 및 드래그 앤 드롭
- **카테고리 관리**: 카테고리 생성, 수정, 삭제, 순서 변경
- **시간 설정**: 할일에 시작/종료 시간 설정

### 1.3 현재 상태
- 프론트엔드는 React (Next.js 15, React 19 RC) 기반으로 완성
- **현재 모든 상태가 클라이언트 메모리에서 관리됨 (localStorage 미사용)**
- Supabase 클라이언트 설정은 되어있으나 실제 연동은 안됨
- ID 생성은 `Date.now().toString()` 또는 `recurring-${Date.now()}` 형태로 임시 생성

---

## 2. 기술 스택

### 2.1 프론트엔드
- **Framework**: Next.js 15.0.0 (App Router)
- **React**: 19.0.0-rc.0
- **UI 라이브러리**:
  - Framer Motion (애니메이션)
  - @dnd-kit (드래그 앤 드롭)
  - Lucide React (아이콘)
  - Tailwind CSS 4.0
- **날짜 처리**: date-fns 2.30.0

### 2.2 백엔드 (권장)
- **데이터베이스**: Supabase PostgreSQL
- **인증**: Supabase Auth
- **API**: Supabase REST API / GraphQL
- **실시간 동기화**: Supabase Realtime (선택적)

---

## 3. 데이터 모델

### 3.1 Todo (할일)

**타입 정의 위치**: `types/calendar.ts`

```typescript
interface Todo {
  id: string;                    // 할일 고유 ID
  text: string;                  // 할일 내용
  completed: boolean;            // 완료 여부
  date: Date;                    // 할일 날짜
  categoryId: string;            // 카테고리 ID (외래키)
  subtasks?: Todo[];             // 서브태스크 배열 (재귀적 구조)
  parentId?: string;             // 부모 할일 ID (서브태스크인 경우)
  startTime?: string;            // 시작 시간 (HH:mm 형식, 예: "09:00")
  endTime?: string;              // 종료 시간 (HH:mm 형식, 예: "17:00")
  recurrenceRule?: RecurrenceRule; // 반복 규칙 (반복 일정인 경우)
  completedDates?: string[];     // 반복 일정에서 완료한 날짜들 (YYYY-MM-DD 형식)
  skippedDates?: string[];       // 반복 일정에서 건너뛴 날짜들 (YYYY-MM-DD 형식)
}
```

**주요 특징**:
- `subtasks`는 재귀적 구조로, 무한 깊이의 서브태스크 지원
- 반복 일정은 `recurrenceRule`이 있으면 반복 일정으로 취급
- 반복 일정의 개별 인스턴스 완료/건너뛰기는 `completedDates`, `skippedDates` 배열로 관리

### 3.2 RecurrenceRule (반복 규칙)

```typescript
interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly'; // 반복 주기
  interval: number;                          // 반복 간격 (예: 2주마다 = interval:2, frequency:'weekly')
  startDate?: Date;                          // 반복 시작 날짜 (선택적)
  endDate?: Date;                            // 반복 종료 날짜 (선택적)
  daysOfWeek?: number[];                     // 주간 반복 시 요일 지정 (1=월, 2=화, ..., 7=일)
}
```

**반복 로직**:
- `frequency: 'daily'`: 매일 또는 N일마다 반복
- `frequency: 'weekly'`: 매주 또는 N주마다 특정 요일에 반복
- `frequency: 'monthly'`: 매월 또는 N개월마다 특정 날짜에 반복
- `endDate`가 없으면 무한 반복
- **반복 이벤트 생성 로직**: `utils/recurringUtils.ts`의 `generateRecurringEvents()` 함수 참조

### 3.3 Category (카테고리)

```typescript
interface Category {
  id: string;      // 카테고리 고유 ID
  name: string;    // 카테고리 이름
  color: string;   // 카테고리 색상 (HEX 코드, 예: "#3B82F6")
}
```

**기본 카테고리** (`hooks/data/useCategories.ts`):
```typescript
const DEFAULT_CATEGORIES = [
  { id: 'cat1', name: '업무', color: '#3B82F6' },
  { id: 'cat2', name: '개인', color: '#A855F7' },
  { id: 'cat3', name: '학습', color: '#2D9F6B' },
  { id: 'cat-etc', name: '기타', color: '#9CA3AF' },
];
```

**주요 특징**:
- `cat-etc` (기타) 카테고리는 삭제 및 이름 변경 불가
- 카테고리 순서는 UI에서 드래그 앤 드롭으로 변경 가능 (순서 저장 필요)
- 카테고리 삭제 시 해당 카테고리의 모든 할일도 삭제됨

---

## 4. API 요구사항

### 4.1 할일 (Todos) API

#### 4.1.1 할일 목록 조회
```
GET /api/todos
Query Parameters:
  - userId: string (현재 사용자 ID)
  - startDate?: string (YYYY-MM-DD, 조회 시작 날짜)
  - endDate?: string (YYYY-MM-DD, 조회 종료 날짜)
  - categoryId?: string (카테고리 필터)

Response:
{
  todos: Todo[]
}
```

**주의사항**:
- `subtasks`는 재귀적으로 포함되어야 함
- 반복 일정도 포함 (반복 인스턴스는 클라이언트에서 생성)

#### 4.1.2 할일 생성
```
POST /api/todos
Body:
{
  text: string
  categoryId: string
  date: string (ISO 8601 또는 YYYY-MM-DD)
  parentId?: string
  startTime?: string (HH:mm)
  endTime?: string (HH:mm)
}

Response:
{
  todo: Todo
}
```

#### 4.1.3 할일 수정
```
PATCH /api/todos/:id
Body: Partial<Todo>

Response:
{
  todo: Todo
}
```

**주요 업데이트 케이스**:
- 텍스트 수정: `{ text: "새 내용" }`
- 완료 토글: `{ completed: true/false }`
- 시간 설정: `{ startTime: "09:00", endTime: "10:00" }`
- 날짜/시간 이동: `{ date: "2025-10-15", startTime: "14:00", endTime: "15:00" }`
- 카테고리 변경: `{ categoryId: "cat2" }`

#### 4.1.4 할일 삭제
```
DELETE /api/todos/:id

Response:
{
  success: boolean
}
```

**주의사항**:
- 할일 삭제 시 모든 서브태스크도 함께 삭제되어야 함 (Cascade Delete)

#### 4.1.5 할일 이동 (카테고리/부모 변경)
```
PATCH /api/todos/:id/move
Body:
{
  newCategoryId: string
  newParentId?: string
  newIndex?: number
}

Response:
{
  todo: Todo
}
```

**설명**:
- `newParentId`가 없으면 최상위 할일로 이동
- `newIndex`는 카테고리/부모 내에서의 순서

### 4.2 반복 일정 (Recurring Todos) API

#### 4.2.1 반복 일정 생성
```
POST /api/todos/recurring
Body:
{
  text: string
  categoryId: string
  startTime: string (HH:mm)
  endTime: string (HH:mm)
  recurrenceRule: RecurrenceRule
  date: string (시작 날짜, YYYY-MM-DD)
}

Response:
{
  todo: Todo
}
```

#### 4.2.2 반복 일정 수정
```
PATCH /api/todos/recurring/:id
Body:
{
  text?: string
  startTime?: string
  endTime?: string
  recurrenceRule?: RecurrenceRule
  categoryId?: string
}

Response:
{
  todo: Todo
}
```

#### 4.2.3 반복 일정 인스턴스 완료/건너뛰기
```
PATCH /api/todos/recurring/:id/instance
Body:
{
  date: string (YYYY-MM-DD)
  action: 'complete' | 'skip' | 'uncomplete'
}

Response:
{
  todo: Todo (업데이트된 completedDates 또는 skippedDates 포함)
}
```

**설명**:
- `action: 'complete'`: `completedDates` 배열에 날짜 추가
- `action: 'skip'`: `skippedDates` 배열에 날짜 추가
- `action: 'uncomplete'`: `completedDates` 배열에서 날짜 제거

#### 4.2.4 반복 일정 특정 날짜 이후 삭제
```
PATCH /api/todos/recurring/:id/delete-after
Body:
{
  date: string (YYYY-MM-DD, 이 날짜 이후 모두 삭제)
}

Response:
{
  todo: Todo (endDate가 업데이트됨)
}
```

**설명**:
- `recurrenceRule.endDate`를 지정한 날짜 이전으로 설정

#### 4.2.5 반복 일정을 일반 할일로 변환
```
POST /api/todos/recurring/:id/convert-to-regular
Body:
{
  date: string (YYYY-MM-DD, 변환할 특정 날짜)
  categoryId: string
  convertAll?: boolean (true면 전체 반복 삭제 후 해당 날짜만 일반 할일로)
}

Response:
{
  newTodo: Todo (생성된 일반 할일)
  updatedRecurringTodo?: Todo (convertAll=false인 경우, skippedDates 업데이트된 원본)
}
```

### 4.3 카테고리 (Categories) API

#### 4.3.1 카테고리 목록 조회
```
GET /api/categories
Query Parameters:
  - userId: string

Response:
{
  categories: Category[]
}
```

**주의사항**:
- 카테고리 순서도 저장되어야 함 (order 필드 추가 필요)

#### 4.3.2 카테고리 생성
```
POST /api/categories
Body:
{
  name: string
  color: string (HEX 코드)
}

Response:
{
  category: Category
}
```

#### 4.3.3 카테고리 수정
```
PATCH /api/categories/:id
Body:
{
  name?: string
  color?: string
}

Response:
{
  category: Category
}
```

**제약사항**:
- `id === 'cat-etc'`인 경우 `name` 변경 불가 (색상만 변경 가능)

#### 4.3.4 카테고리 삭제
```
DELETE /api/categories/:id

Response:
{
  success: boolean
}
```

**제약사항**:
- `id === 'cat-etc'`인 경우 삭제 불가
- 카테고리 삭제 시 해당 카테고리의 모든 할일도 삭제됨 (Cascade Delete)

#### 4.3.5 카테고리 순서 변경
```
PATCH /api/categories/reorder
Body:
{
  categoryIds: string[] (새로운 순서의 카테고리 ID 배열)
}

Response:
{
  categories: Category[]
}
```

**설명**:
- `cat-etc`는 항상 마지막 순서여야 함

---

## 5. 백엔드 연결 전 프론트엔드 수정사항

### 5.1 ID 생성 방식 변경

**현재 문제**:
- 클라이언트에서 `Date.now().toString()` 또는 `recurring-${Date.now()}`로 ID 생성
- 백엔드에서 UUID 또는 다른 방식으로 ID를 생성할 경우 충돌 가능

**수정 방안**:
1. **옵션 1**: 백엔드에서 생성한 ID를 사용하도록 변경
   - 할일/카테고리 생성 API 호출 후 응답에서 받은 ID 사용
   - Optimistic Update 시 임시 ID 사용 후 API 응답 시 교체

2. **옵션 2**: UUID v4 라이브러리 도입
   - `npm install uuid`
   - 클라이언트에서 UUID 생성하여 백엔드와 동기화

**수정 위치**:
- `hooks/data/useTodos.ts`: `handleAddTodo`, `handleAddRecurring`, `handleAddTodoFromCalendar`
- `hooks/data/useCategories.ts`: `handleAddCategory`

### 5.2 상태 관리 변경

**현재 문제**:
- 모든 상태가 `useState`로 클라이언트 메모리에만 저장됨
- 페이지 새로고침 시 모든 데이터 손실

**수정 방안**:
1. **API 통합**:
   - Supabase 클라이언트를 이용한 CRUD 작업 구현
   - 각 hook의 handler 함수들을 API 호출로 변경

2. **낙관적 업데이트 (Optimistic Update)**:
   - 사용자 경험 향상을 위해 API 응답 전에 UI 먼저 업데이트
   - API 실패 시 롤백 처리

3. **상태 동기화**:
   - 초기 로드 시 서버에서 데이터 fetch
   - `useEffect`를 통한 초기 데이터 로드

**수정 위치**:
- `hooks/data/useTodos.ts`: 모든 handler 함수
- `hooks/data/useCategories.ts`: 모든 handler 함수
- `app/page.tsx`: 초기 데이터 로드 로직 추가

### 5.3 날짜/시간 처리 표준화

**현재 문제**:
- `Date` 객체와 문자열이 혼재
- 타임존 처리 미흡

**수정 방안**:
1. **서버로 전송할 때**:
   - `Date` → ISO 8601 문자열 (`date.toISOString()`)
   - 또는 YYYY-MM-DD 형식 (`formatDateKey()` 사용)

2. **서버에서 받을 때**:
   - ISO 8601 문자열 → `new Date(dateString)`
   - 타임존은 UTC 기준으로 통일

**수정 위치**:
- API 호출하는 모든 handler 함수들
- 유틸리티 함수로 date serialization/deserialization 추가 필요

### 5.4 에러 처리 추가

**현재 문제**:
- API 에러 처리 로직 없음
- 사용자에게 에러 피드백 없음

**수정 방안**:
1. **에러 상태 추가**:
   ```typescript
   const [error, setError] = useState<string | null>(null);
   const [isLoading, setIsLoading] = useState(false);
   ```

2. **에러 UI 추가**:
   - Toast 알림 또는 Error Boundary 추가
   - react-hot-toast 또는 sonner 라이브러리 추천

**수정 위치**:
- 모든 API 호출 함수
- `app/layout.tsx`: 전역 에러 처리 컴포넌트 추가

### 5.5 초기 데이터 로드

**현재 문제**:
- `INITIAL_TODOS`가 하드코딩되어 있음 (`app/page.tsx`)
- 실제 사용자 데이터를 로드하지 않음

**수정 방안**:
1. **서버에서 초기 데이터 fetch**:
   ```typescript
   useEffect(() => {
     async function fetchInitialData() {
       const todosData = await fetch('/api/todos').then(r => r.json());
       const categoriesData = await fetch('/api/categories').then(r => r.json());
       setTodos(todosData.todos);
       setCategories(categoriesData.categories);
     }
     fetchInitialData();
   }, []);
   ```

2. **로딩 상태 처리**:
   - 데이터 로드 중 스켈레톤 UI 표시

**수정 위치**:
- `app/page.tsx`: `INITIAL_TODOS` 제거 및 fetch 로직 추가

### 5.6 인증 추가

**현재 문제**:
- 사용자 인증 없음
- 모든 사용자가 동일한 데이터 공유

**수정 방안**:
1. **Supabase Auth 통합**:
   - 로그인/회원가입 페이지 추가
   - `lib/supabase/client.ts`의 클라이언트 사용

2. **보호된 라우트**:
   - `middleware.ts`에서 인증 체크
   - 미인증 시 로그인 페이지로 리디렉트

3. **사용자별 데이터 필터링**:
   - 모든 API 요청에 `userId` 포함
   - RLS (Row Level Security) 정책 설정

**수정 위치**:
- `lib/supabase/middleware.ts`: 이미 기본 구조 존재, 활성화 필요
- `app/` 디렉토리: 인증 페이지 추가 (login, signup)

---

## 6. 데이터베이스 스키마 제안

### 6.1 users 테이블
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6.2 categories 테이블
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) NOT NULL, -- HEX 코드 (#RRGGBB)
  order_index INTEGER NOT NULL DEFAULT 0,
  is_default BOOLEAN DEFAULT FALSE, -- cat-etc 카테고리 식별용
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_order ON categories(user_id, order_index);
```

### 6.3 todos 테이블
```sql
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES todos(id) ON DELETE CASCADE, -- 서브태스크 관계
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  date DATE NOT NULL,
  start_time TIME, -- 시작 시간 (nullable)
  end_time TIME,   -- 종료 시간 (nullable)

  -- 반복 일정 필드
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_frequency VARCHAR(20), -- 'daily', 'weekly', 'monthly'
  recurrence_interval INTEGER,
  recurrence_start_date DATE,
  recurrence_end_date DATE,
  recurrence_days_of_week INTEGER[], -- [1,2,3,4,5] 형태
  completed_dates DATE[], -- 반복 일정에서 완료한 날짜들
  skipped_dates DATE[],   -- 반복 일정에서 건너뛴 날짜들

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_category_id ON todos(category_id);
CREATE INDEX idx_todos_parent_id ON todos(parent_id);
CREATE INDEX idx_todos_date ON todos(date);
CREATE INDEX idx_todos_recurring ON todos(user_id, is_recurring) WHERE is_recurring = TRUE;
```

### 6.4 RLS (Row Level Security) 정책

```sql
-- Users 테이블
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Categories 테이블
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own categories"
  ON categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  USING (auth.uid() = user_id AND is_default = FALSE);

-- Todos 테이블
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own todos"
  ON todos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own todos"
  ON todos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own todos"
  ON todos FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own todos"
  ON todos FOR DELETE
  USING (auth.uid() = user_id);
```

### 6.5 기본 데이터 삽입 (사용자 생성 시)

```sql
-- 신규 사용자 생성 시 기본 카테고리 자동 생성 (트리거)
CREATE OR REPLACE FUNCTION create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO categories (user_id, name, color, order_index, is_default)
  VALUES
    (NEW.id, '업무', '#3B82F6', 0, FALSE),
    (NEW.id, '개인', '#A855F7', 1, FALSE),
    (NEW.id, '학습', '#2D9F6B', 2, FALSE),
    (NEW.id, '기타', '#9CA3AF', 3, TRUE);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_default_categories
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_categories();
```

---

## 7. 인증 및 권한

### 7.1 Supabase Auth 설정

**필요한 작업**:
1. Supabase 프로젝트에서 Email/Password 인증 활성화
2. OAuth 제공자 설정 (선택적: Google, GitHub 등)
3. 이메일 템플릿 커스터마이징

### 7.2 프론트엔드 인증 플로우

1. **로그인 페이지** (`app/login/page.tsx`):
   - 이메일/비밀번호 입력
   - Supabase Auth API 호출

2. **회원가입 페이지** (`app/signup/page.tsx`):
   - 이메일/비밀번호 입력
   - 이메일 인증 링크 발송

3. **보호된 라우트**:
   - `middleware.ts`에서 인증 체크
   - 세션 관리

### 7.3 세션 관리

**현재 설정** (`lib/supabase/server.ts`, `lib/supabase/client.ts`):
- Server Components: `createServerClient` 사용
- Client Components: `createBrowserClient` 사용
- 쿠키 기반 세션 저장

**권장사항**:
- Access Token 자동 갱신 설정
- Refresh Token 처리 로직 추가

---

## 8. 성능 최적화 고려사항

### 8.1 데이터 페칭 최적화

1. **날짜 범위 기반 조회**:
   - 캘린더 뷰에서는 현재 주(7일)만 조회
   - TodoList 뷰에서는 선택한 날짜만 조회
   - 반복 일정은 필요한 범위만 계산

2. **인덱스 최적화**:
   - `date`, `user_id`, `category_id` 복합 인덱스
   - `is_recurring` 필터링용 인덱스

3. **서브태스크 로딩**:
   - Recursive CTE를 사용한 한 번의 쿼리로 전체 트리 로드
   - 또는 필요 시 지연 로딩 (Lazy Loading)

### 8.2 클라이언트 최적화

1. **메모이제이션**:
   - `useMemo`, `useCallback` 활용 (현재 이미 구현됨)
   - React.memo로 컴포넌트 최적화 (TodoItem, CalendarGrid 등 이미 적용됨)

2. **가상화 (Virtualization)**:
   - 할일이 많은 경우 react-window 또는 react-virtual 도입 고려

3. **이미지 최적화**:
   - Next.js Image 컴포넌트 사용 (로고 이미지 등)

### 8.3 실시간 동기화 (선택적)

**Supabase Realtime 활용**:
```typescript
// Example
supabase
  .channel('todos')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'todos' },
    (payload) => {
      // 다른 기기/탭에서 변경 시 자동 업데이트
      console.log('Change received!', payload)
    }
  )
  .subscribe()
```

**장점**:
- 다중 기기 동기화
- 협업 기능 추가 가능

**단점**:
- 추가 비용 발생 가능
- 복잡도 증가

---

## 9. 주요 파일 구조 및 역할

### 9.1 컨텍스트 (Contexts)
- `contexts/TodoContext.tsx`: 할일 관련 상태 및 액션 제공
- `contexts/CategoryContext.tsx`: 카테고리 관련 상태 및 액션 제공

### 9.2 커스텀 훅 (Hooks)
- `hooks/data/useTodos.ts`: 할일 CRUD 로직 (서브태스크, 반복 일정 포함)
- `hooks/data/useCategories.ts`: 카테고리 CRUD 로직
- `hooks/data/useTodoRecursive.ts`: 재귀적 할일 처리 유틸리티
- `hooks/drag/useCalendarDrag.ts`: 캘린더 드래그로 일정 생성
- `hooks/drag/useTodoDrag.ts`: 할일 드래그 앤 드롭
- `hooks/drag/useResizeTodo.ts`: 할일 시간 조절 (리사이즈)
- `hooks/ui/useCalendarFilters.ts`: 캘린더 필터 상태
- `hooks/ui/useHourHeight.ts`: 캘린더 줌 레벨 관리
- `hooks/state/useDialogs.ts`: 다이얼로그 상태 관리
- `hooks/state/useInlineEdit.ts`: 인라인 편집 상태
- `hooks/state/useContextMenu.ts`: 컨텍스트 메뉴 상태 및 핸들러

### 9.3 유틸리티 (Utils)
- `utils/calendarUtils.ts`: 날짜/시간 변환, Todo 블록 스타일 계산
- `utils/recurringUtils.ts`: 반복 일정 생성 로직 (**중요**)
- `utils/eventLayoutUtils.ts`: 겹치는 일정 레이아웃 계산
- `utils/dragUtils.ts`: 드래그 앤 드롭 유틸리티

### 9.4 컴포넌트 (Components)
- `components/todo/TodoList.tsx`: 할일 목록 (카테고리별)
- `components/todo/TodoItem.tsx`: 개별 할일 (서브태스크 재귀 렌더링)
- `components/todo/CategorySection.tsx`: 카테고리 섹션
- `components/todo/RecurringSection.tsx`: 반복 일정 섹션
- `components/calendar/WeekCalendar.tsx`: 주간 캘린더 메인
- `components/calendar/CalendarGrid.tsx`: 캘린더 그리드 (시간대별)
- `components/calendar/TodoBlock.tsx`: 캘린더의 할일 블록
- `components/calendar/MiniCalendar.tsx`: 미니 캘린더 (월간 뷰)
- `components/calendar/CalendarHeader.tsx`: 캘린더 헤더 (필터, 네비게이션)
- `components/ui/dialogs/*`: 각종 다이얼로그 컴포넌트
- `components/ui/forms/*`: 폼 컴포넌트 (Input, Checkbox, Select 등)
- `components/ui/menus/*`: 컨텍스트 메뉴 컴포넌트

### 9.5 레이아웃 (Layouts)
- `components/layout/DesktopLayout.tsx`: 데스크탑 레이아웃 (사이드바 + 캘린더)
- `components/layout/MobileLayout.tsx`: 모바일 레이아웃 (탭 네비게이션)

---

## 10. 백엔드 구현 시 주의사항

### 10.1 반복 일정 처리

**중요**: 반복 일정은 **원본 1개만 DB에 저장**하고, 개별 인스턴스는 **클라이언트에서 생성**합니다.

- **DB 저장**: `recurrenceRule` 필드만 저장
- **개별 완료/건너뛰기**: `completedDates`, `skippedDates` 배열로 관리
- **생성 로직**: `utils/recurringUtils.ts`의 `generateRecurringEvents()` 참조

### 10.2 서브태스크 재귀 처리

- **DB 구조**: `parent_id` 외래키로 자기 참조 (Self-Referencing)
- **조회 시**: Recursive CTE 또는 여러 번 쿼리로 전체 트리 반환
- **삭제 시**: Cascade Delete로 하위 항목 모두 삭제

예시 (PostgreSQL Recursive CTE):
```sql
WITH RECURSIVE todo_tree AS (
  -- 최상위 할일
  SELECT * FROM todos WHERE parent_id IS NULL AND user_id = $1
  UNION ALL
  -- 재귀적으로 서브태스크
  SELECT t.* FROM todos t
  INNER JOIN todo_tree tt ON t.parent_id = tt.id
)
SELECT * FROM todo_tree;
```

### 10.3 카테고리 순서 관리

- `order_index` 필드로 순서 저장
- 순서 변경 시 관련 카테고리들의 `order_index` 재계산
- `cat-etc`는 항상 마지막 (`order_index` 최대값)

### 10.4 타임존 처리

- **권장**: 모든 날짜를 UTC로 저장
- 시간대는 클라이언트에서 처리 (사용자 브라우저 타임존)
- `date` 필드는 `DATE` 타입으로, `startTime`/`endTime`은 `TIME` 타입으로 분리

### 10.5 성능 모니터링

- **슬로우 쿼리 로깅**: PostgreSQL slow query log 활성화
- **인덱스 사용률**: `EXPLAIN ANALYZE`로 쿼리 계획 확인
- **API 응답 시간**: 평균 200ms 이하 목표

---

## 11. 테스트 시나리오

### 11.1 할일 생성 및 수정
1. 할일 생성 (텍스트만)
2. 할일에 시간 추가
3. 할일 완료 토글
4. 할일 텍스트 수정
5. 할일 삭제

### 11.2 서브태스크
1. 할일에 서브태스크 추가
2. 서브태스크에 또 다른 서브태스크 추가 (3단계 깊이)
3. 부모 할일 완료 시 모든 서브태스크 완료 확인
4. 서브태스크 완료 시 부모 자동 완료 확인
5. 부모 할일 삭제 시 서브태스크 모두 삭제 확인

### 11.3 반복 일정
1. 매일 반복 일정 생성
2. 매주 특정 요일(월,수,금) 반복 생성
3. 특정 날짜만 완료 처리
4. 특정 날짜만 건너뛰기
5. 특정 날짜 이후 삭제
6. 반복 일정 전체 삭제

### 11.4 카테고리
1. 카테고리 생성
2. 카테고리 색상 변경
3. 카테고리 순서 변경 (드래그 앤 드롭)
4. 카테고리 삭제 (할일 포함)
5. "기타" 카테고리 삭제 시도 (실패 확인)

### 11.5 캘린더 드래그
1. 빈 영역 드래그로 새 일정 생성
2. 할일 드래그로 다른 날짜/시간 이동
3. 할일 리사이즈로 시간 조절
4. 겹치는 일정 레이아웃 확인

---

## 12. 배포 전 체크리스트

### 12.1 환경 변수 설정
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- (백엔드) `SUPABASE_SERVICE_ROLE_KEY` (RLS 우회용, 서버 전용)

### 12.2 보안
- [x] RLS 정책 활성화
- [ ] CORS 설정 (허용 도메인 제한)
- [ ] Rate Limiting 설정
- [ ] SQL Injection 방어 (Prepared Statements)
- [ ] XSS 방어 (입력 sanitization)

### 12.3 성능
- [ ] 인덱스 최적화 확인
- [ ] 쿼리 성능 테스트 (EXPLAIN ANALYZE)
- [ ] API 응답 시간 측정
- [ ] 클라이언트 번들 크기 최적화

### 12.4 모니터링
- [ ] 에러 추적 (Sentry 등)
- [ ] 로그 수집 (CloudWatch, Datadog 등)
- [ ] 성능 모니터링 (New Relic 등)

---

## 13. 참고 자료

### 13.1 주요 로직 파일
- 반복 일정 생성: `utils/recurringUtils.ts:10-97`
- 할일 재귀 처리: `hooks/data/useTodoRecursive.ts`
- 캘린더 드래그: `hooks/drag/useCalendarDrag.ts`

### 13.2 Supabase 문서
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Functions](https://supabase.com/docs/guides/database/functions)

### 13.3 Next.js 문서
- [App Router](https://nextjs.org/docs/app)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

---

## 연락처

프론트엔드 관련 문의: (담당자 정보 입력)
백엔드 구현 중 질문사항이 있으면 언제든지 연락 주세요.

---

**작성일**: 2025-10-25
**문서 버전**: 1.0.0
