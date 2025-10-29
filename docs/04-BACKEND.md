# 🔧 백엔드 개발 가이드

> Todal 백엔드 아키텍처, 데이터베이스 스키마, API 설계

---

## 🏗️ 기술 스택

### Database
- **Supabase** (PostgreSQL 기반)
- Row Level Security (RLS)로 데이터 보안

### Authentication
- **Supabase Auth**
- 이메일/비밀번호 로그인
- Google OAuth (예정)

### API
- **Supabase Client** (@supabase/supabase-js)
- 실시간 구독 (Realtime)
- Storage (프로필 이미지 등)

---

## 📊 데이터베이스 스키마

### ERD (Entity Relationship Diagram)

```
┌──────────────┐         ┌──────────────┐
│    users     │         │  categories  │
│  (Supabase)  │         │              │
├──────────────┤         ├──────────────┤
│ id           │         │ id           │
│ email        │         │ user_id      │──┐
│ created_at   │         │ name         │  │
└──────┬───────┘         │ color        │  │
       │                 │ order        │  │
       │                 └──────┬───────┘  │
       │                        │          │
       │ 1:N              1:N   │          │
       │                        │          │
       ▼                        │          │
┌──────────────┐                │          │
│    todos     │◄───────────────┘          │
├──────────────┤                           │
│ id           │                           │
│ user_id      │───────────────────────────┘
│ category_id  │
│ parent_id    │◄─┐ (Self-reference)
│ text         │  │
│ completed    │  │
│ date         │  │
│ start_time   │  │
│ end_time     │  │
│ recurrence_rule  │ (JSON)
│ completed_dates  │ (Array)
│ skipped_dates    │ (Array)
│ google_event_id  │
│ created_at   │  │
│ updated_at   │──┘
└──────────────┘
```

---

## 🗃️ 테이블 상세

### 1. categories (카테고리)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid | Primary Key |
| `user_id` | uuid | 사용자 ID (FK → auth.users) |
| `name` | text | 카테고리명 |
| `color` | text | HEX 색상 코드 (#3B82F6) |
| `order` | integer | 정렬 순서 |
| `created_at` | timestamp | 생성 시각 |
| `updated_at` | timestamp | 수정 시각 |

**인덱스**:
```sql
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE UNIQUE INDEX idx_categories_user_name ON categories(user_id, name);
```

---

### 2. todos (할일)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid | Primary Key |
| `user_id` | uuid | 사용자 ID (FK → auth.users) |
| `category_id` | uuid | 카테고리 ID (FK → categories) |
| `parent_id` | uuid | 부모 할일 ID (계층 구조용) |
| `text` | text | 할일 내용 |
| `completed` | boolean | 완료 여부 |
| `date` | date | 날짜 |
| `start_time` | text | 시작 시간 ("09:00") |
| `end_time` | text | 종료 시간 ("10:30") |
| `recurrence_rule` | jsonb | 반복 규칙 |
| `completed_dates` | text[] | 완료한 날짜 배열 |
| `skipped_dates` | text[] | 건너뛴 날짜 배열 |
| `google_event_id` | text | 구글 캘린더 이벤트 ID |
| `created_at` | timestamp | 생성 시각 |
| `updated_at` | timestamp | 수정 시각 |

**인덱스**:
```sql
CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_category_id ON todos(category_id);
CREATE INDEX idx_todos_date ON todos(date);
CREATE INDEX idx_todos_parent_id ON todos(parent_id);
```

**recurrence_rule JSON 구조**:
```json
{
  "frequency": "weekly",
  "interval": 1,
  "daysOfWeek": [1, 2, 3, 4, 5],
  "endDate": "2025-12-31"
}
```

---

## 🔐 Row Level Security (RLS)

### Categories 정책

```sql
-- SELECT: 사용자는 자신의 카테고리만 조회
CREATE POLICY "Users can view own categories"
  ON categories FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: 사용자는 자신의 카테고리만 생성
CREATE POLICY "Users can insert own categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: 사용자는 자신의 카테고리만 수정
CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id);

-- DELETE: 사용자는 자신의 카테고리만 삭제
CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  USING (auth.uid() = user_id);
```

### Todos 정책

```sql
-- SELECT: 사용자는 자신의 할일만 조회
CREATE POLICY "Users can view own todos"
  ON todos FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: 사용자는 자신의 할일만 생성
CREATE POLICY "Users can insert own todos"
  ON todos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: 사용자는 자신의 할일만 수정
CREATE POLICY "Users can update own todos"
  ON todos FOR UPDATE
  USING (auth.uid() = user_id);

-- DELETE: 사용자는 자신의 할일만 삭제
CREATE POLICY "Users can delete own todos"
  ON todos FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 📡 API 설계 (lib/supabase/queries.ts)

### 1. Categories CRUD

**모든 카테고리 조회**:
```typescript
export async function fetchCategories(): Promise<Category[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Unauthorized');
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .order('order', { ascending: true });
  
  if (error) throw error;
  return data;
}
```

**카테고리 생성**:
```typescript
export async function createCategory(
  name: string,
  color: string,
  order: number
): Promise<Category> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('categories')
    .insert({
      user_id: user.id,
      name,
      color,
      order
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}
```

**카테고리 수정**:
```typescript
export async function updateCategory(
  id: string,
  updates: Partial<Category>
): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}
```

**카테고리 삭제**:
```typescript
export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}
```

---

### 2. Todos CRUD

**할일 조회 (카테고리 포함)**:
```typescript
export async function fetchTodos(): Promise<Todo[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Unauthorized');
  
  const { data, error } = await supabase
    .from('todos')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  // 데이터 변환 (snake_case → camelCase)
  return data.map(transformTodo);
}
```

**할일 생성**:
```typescript
export async function createTodo(
  text: string,
  categoryId: string,
  date: Date,
  startTime?: string,
  endTime?: string
): Promise<Todo> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('todos')
    .insert({
      user_id: user.id,
      category_id: categoryId,
      text,
      date: formatDateForDB(date),
      start_time: startTime,
      end_time: endTime,
      completed: false
    })
    .select()
    .single();
  
  if (error) throw error;
  return transformTodo(data);
}
```

**반복 할일 생성**:
```typescript
export async function createRecurringTodo(
  text: string,
  categoryId: string,
  startTime: string,
  endTime: string,
  recurrenceRule: RecurrenceRule
): Promise<Todo> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('todos')
    .insert({
      user_id: user.id,
      category_id: categoryId,
      text,
      date: new Date().toISOString().split('T')[0],
      start_time: startTime,
      end_time: endTime,
      recurrence_rule: recurrenceRule,
      completed_dates: [],
      skipped_dates: []
    })
    .select()
    .single();
  
  if (error) throw error;
  return transformTodo(data);
}
```

**할일 완료 토글**:
```typescript
export async function toggleTodo(id: string): Promise<Todo> {
  const { data, error } = await supabase
    .from('todos')
    .update({ completed: !completed })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return transformTodo(data);
}
```

**반복 할일 특정 날짜 완료**:
```typescript
export async function toggleRecurringTodoDate(
  id: string,
  dateKey: string
): Promise<Todo> {
  const { data: todo } = await supabase
    .from('todos')
    .select('completed_dates')
    .eq('id', id)
    .single();
  
  const completedDates = todo.completed_dates || [];
  const newCompletedDates = completedDates.includes(dateKey)
    ? completedDates.filter(d => d !== dateKey)
    : [...completedDates, dateKey];
  
  const { data, error } = await supabase
    .from('todos')
    .update({ completed_dates: newCompletedDates })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return transformTodo(data);
}
```

---

## 🔄 실시간 구독 (Realtime)

### 할일 변경 사항 실시간 반영

```typescript
// hooks/data/useTodos.ts
useEffect(() => {
  const supabase = createClient();
  
  const channel = supabase
    .channel('todos-changes')
    .on(
      'postgres_changes',
      {
        event: '*', // INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'todos',
        filter: `user_id=eq.${user.id}`
      },
      (payload) => {
        console.log('Todo changed:', payload);
        
        if (payload.eventType === 'INSERT') {
          setTodos(prev => [...prev, transformTodo(payload.new)]);
        } else if (payload.eventType === 'UPDATE') {
          setTodos(prev => prev.map(todo =>
            todo.id === payload.new.id ? transformTodo(payload.new) : todo
          ));
        } else if (payload.eventType === 'DELETE') {
          setTodos(prev => prev.filter(todo => todo.id !== payload.old.id));
        }
      }
    )
    .subscribe();
  
  return () => {
    supabase.removeChannel(channel);
  };
}, [user.id]);
```

---

## 🔗 구글 캘린더 연동

### OAuth 인증 플로우

```typescript
// lib/google/calendar.ts
export async function getGoogleAuthUrl(): Promise<string> {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_URL}/auth/google/callback`
  );
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar']
  });
}
```

### 이벤트 동기화

```typescript
export async function syncToGoogleCalendar(
  todo: Todo,
  accessToken: string
): Promise<string> {
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  
  const event = {
    summary: todo.text,
    start: {
      dateTime: `${todo.date}T${todo.startTime}:00`,
      timeZone: 'Asia/Seoul'
    },
    end: {
      dateTime: `${todo.date}T${todo.endTime}:00`,
      timeZone: 'Asia/Seoul'
    },
    colorId: getCategoryColorId(todo.categoryId)
  };
  
  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event
  });
  
  return response.data.id; // google_event_id
}
```

---

## 🛡️ 보안 고려사항

### 1. SQL Injection 방지
- Supabase Client의 파라미터화된 쿼리 자동 사용
- Raw SQL 쿼리 사용 금지

### 2. XSS 방지
- React의 자동 이스케이핑
- `dangerouslySetInnerHTML` 사용 금지

### 3. 인증 검증
```typescript
// 모든 API 요청 전 사용자 인증 확인
const { data: { user } } = await supabase.auth.getUser();
if (!user) throw new Error('Unauthorized');
```

### 4. RLS (Row Level Security)
- 데이터베이스 레벨에서 접근 제어
- 사용자는 자신의 데이터만 조회/수정 가능

---

## 📈 성능 최적화

### 1. 인덱스 활용
```sql
-- 자주 쿼리되는 컬럼에 인덱스
CREATE INDEX idx_todos_user_date ON todos(user_id, date);
CREATE INDEX idx_todos_category ON todos(category_id);
```

### 2. 배치 처리
```typescript
// 여러 할일을 한 번에 생성
const { data, error } = await supabase
  .from('todos')
  .insert(todosArray); // 배열로 한 번에
```

### 3. 선택적 조회
```typescript
// 필요한 컬럼만 조회
.select('id, text, completed, date')
```

---

**Last Updated**: 2025-10-29


