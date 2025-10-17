# Todal 아키텍처 설계

> 시스템 아키텍처, 데이터 모델, 설계 결정사항

---

## 🏗️ 시스템 아키텍처

### 전체 구조

```
┌─────────────────────────────────────────────────────────┐
│                       Client                             │
│  ┌─────────────────┐        ┌──────────────────┐       │
│  │  React 19       │        │  Client State    │       │
│  │  Components     │◄──────►│  (Zustand)       │       │
│  └─────────────────┘        └──────────────────┘       │
│          │                           │                   │
│          │                           ▼                   │
│          │                  ┌──────────────────┐        │
│          │                  │  Server State    │        │
│          └─────────────────►│  (React Query)   │        │
│                              └──────────────────┘        │
└──────────────────────────────────┬──────────────────────┘
                                   │ HTTP/WebSocket
┌──────────────────────────────────┼──────────────────────┐
│                       Server     │                       │
│  ┌─────────────────┐             ▼                      │
│  │  Next.js 15     │    ┌─────────────────┐            │
│  │  App Router     │◄───│ API Routes      │            │
│  └─────────────────┘    └─────────────────┘            │
│          │                       │                       │
│          ▼                       │                       │
│  ┌─────────────────┐             │                      │
│  │ Server Actions  │─────────────┤                      │
│  └─────────────────┘             │                      │
│          │                       │                       │
│          ▼                       ▼                       │
│  ┌─────────────────┐    ┌─────────────────┐            │
│  │  Prisma ORM     │    │  External APIs  │            │
│  └─────────────────┘    └─────────────────┘            │
│          │                       │                       │
│          ▼                       ▼                       │
│  ┌─────────────────┐    ┌─────────────────┐            │
│  │  Supabase       │    │  Google/OpenAI  │            │
│  │  (PostgreSQL)   │    │                 │            │
│  └─────────────────┘    └─────────────────┘            │
└─────────────────────────────────────────────────────────┘
```

### 계층별 역할

| 계층 | 기술 | 역할 |
| --- | --- | --- |
| **Presentation** | React 19 Components | UI 렌더링, 사용자 인터랙션 |
| **State Management** | Zustand + React Query | 클라이언트/서버 상태 관리 |
| **API Layer** | Next.js API Routes | 외부 API 연동, 복잡한 비즈니스 로직 |
| **Business Logic** | Server Actions | CRUD 작업, 데이터 변환 |
| **Data Access** | Prisma ORM | 데이터베이스 쿼리 |
| **Database** | Supabase (PostgreSQL) | 데이터 저장, 실시간 기능 |
| **Auth** | Supabase Auth | 인증 및 권한 관리 |

---

## 📊 데이터베이스 스키마

### ERD (Entity Relationship Diagram)

```
┌──────────────┐         ┌──────────────┐
│    User      │         │   Category   │
├──────────────┤         ├──────────────┤
│ id           │         │ id           │
│ email        │         │ userId       │
│ name         │         │ name         │
│ createdAt    │         │ color        │
└──────┬───────┘         │ order        │
       │                 └──────┬───────┘
       │                        │
       │                        │
       │ 1:N              1:N   │
       │                        │
       ▼                        │
┌──────────────┐                │
│    Todo      │◄───────────────┘
├──────────────┤
│ id           │
│ userId       │
│ categoryId   │
│ title        │
│ completed    │
│ parentId     │◄─┐
│ order        │  │
│ memo         │  │ Self Reference
│ estimatedMin │  │ (계층 구조)
│ createdAt    │  │
│ completedAt  │  │
└──────┬───────┘  │
       │          │
       └──────────┘
       │
       │ 1:N
       ▼
┌──────────────┐         ┌──────────────┐
│   Schedule   │         │   Routine    │
├──────────────┤         ├──────────────┤
│ id           │         │ id           │
│ todoId       │         │ userId       │
│ startTime    │         │ title        │
│ endTime      │         │ categoryId   │
│ date         │         │ fixedTime    │
│ googleEventId│         │ daysOfWeek   │
└──────────────┘         │ isActive     │
                         │ createdAt    │
                         └──────────────┘

┌──────────────┐         ┌──────────────┐
│   Goal       │         │  Friend      │
├──────────────┤         ├──────────────┤
│ id           │         │ id           │
│ userId       │         │ userId       │
│ categoryId   │         │ friendId     │
│ type         │         │ status       │
│ targetMinutes│         │ createdAt    │
│ period       │         └──────────────┘
│ startDate    │
└──────────────┘         ┌──────────────┐
                         │   Activity   │
                         ├──────────────┤
                         │ id           │
                         │ userId       │
                         │ type         │
                         │ data         │
                         │ createdAt    │
                         └──────────────┘
```

### Prisma 스키마

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 사용자
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  emailVerified DateTime?
  
  // Relations
  categories    Category[]
  todos         Todo[]
  routines      Routine[]
  goals         Goal[]
  friends       Friend[]  @relation("UserFriends")
  friendOf      Friend[]  @relation("FriendOf")
  activities    Activity[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@map("users")
}

// 카테고리 (색상 라벨)
model Category {
  id        String   @id @default(cuid())
  userId    String
  name      String
  color     String   // HEX color code
  order     Int      @default(0)
  
  // Relations
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  todos     Todo[]
  routines  Routine[]
  goals     Goal[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([userId, name])
  @@index([userId])
  @@map("categories")
}

// 할일
model Todo {
  id            String    @id @default(cuid())
  userId        String
  categoryId    String?
  parentId      String?   // 계층 구조용
  
  title         String
  completed     Boolean   @default(false)
  order         Int       @default(0)
  memo          String?   @db.Text
  estimatedMin  Int?      // 예상 소요시간 (분)
  
  // Relations
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  category      Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  parent        Todo?     @relation("TodoHierarchy", fields: [parentId], references: [id], onDelete: Cascade)
  children      Todo[]    @relation("TodoHierarchy")
  schedules     Schedule[]
  
  createdAt     DateTime  @default(now())
  completedAt   DateTime?
  updatedAt     DateTime  @updatedAt
  
  @@index([userId])
  @@index([categoryId])
  @@index([parentId])
  @@index([completed])
  @@map("todos")
}

// 일정 (캘린더에 배치된 할일)
model Schedule {
  id            String    @id @default(cuid())
  todoId        String
  
  startTime     DateTime
  endTime       DateTime
  date          DateTime  // 날짜 (시간 제외)
  
  googleEventId String?   @unique // 구글 캘린더 연동용
  
  // Relations
  todo          Todo      @relation(fields: [todoId], references: [id], onDelete: Cascade)
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([todoId])
  @@index([date])
  @@map("schedules")
}

// 루틴
model Routine {
  id          String   @id @default(cuid())
  userId      String
  categoryId  String?
  
  title       String
  fixedTime   String   // "09:00" 형식
  daysOfWeek  Int[]    // [0,1,2,3,4,5,6] (일~토)
  isActive    Boolean  @default(true)
  
  // Relations
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  category    Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([userId])
  @@index([isActive])
  @@map("routines")
}

// 목표 (Phase 2)
model Goal {
  id            String   @id @default(cuid())
  userId        String
  categoryId    String?
  
  type          String   // "weekly" | "monthly"
  targetMinutes Int      // 목표 시간 (분)
  period        String   // "2025-W42" or "2025-10"
  
  startDate     DateTime
  endDate       DateTime
  
  // Relations
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  category      Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@unique([userId, categoryId, period])
  @@index([userId])
  @@map("goals")
}

// 친구 관계 (Phase 5)
model Friend {
  id        String   @id @default(cuid())
  userId    String
  friendId  String
  
  status    String   @default("pending") // "pending" | "accepted" | "blocked"
  
  // Relations
  user      User     @relation("UserFriends", fields: [userId], references: [id], onDelete: Cascade)
  friend    User     @relation("FriendOf", fields: [friendId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([userId, friendId])
  @@index([userId])
  @@index([friendId])
  @@map("friends")
}

// 활동 로그 (Phase 5 - 소셜 피드)
model Activity {
  id        String   @id @default(cuid())
  userId    String
  
  type      String   // "completed_todo" | "achieved_goal" | "routine_streak"
  data      Json     // 상세 데이터
  
  // Relations
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  
  @@index([userId])
  @@index([createdAt])
  @@map("activities")
}
```

---

## 🔄 데이터 플로우

### 1. 할일 생성

```
[사용자 입력]
    │
    ▼
[TodoInput Component] (Client)
    │
    │ Enter 키
    ▼
[createTodo Server Action]
    │
    ▼
[Prisma: todo.create()]
    │
    ▼
[PostgreSQL]
    │
    ▼
[revalidatePath('/')]
    │
    ▼
[React Query: invalidate]
    │
    ▼
[UI 자동 업데이트]
```

### 2. 드래그앤드롭 (할일 → 캘린더)

```
[dnd-kit onDragEnd]
    │
    ▼
[useOptimistic: 즉시 UI 업데이트]
    │
    ▼
[createSchedule Server Action]
    │
    ├─► [Prisma: schedule.create()]
    │   └─► [PostgreSQL]
    │
    └─► [Google Calendar API] (양방향 연동)
        └─► [구글 캘린더에 이벤트 생성]
    │
    ▼
[React Query: invalidate]
    │
    ▼
[UI 최종 확정]
```

### 3. 구글 캘린더 동기화

```
[주기적 Sync (Webhook or Polling)]
    │
    ▼
[Google Calendar API: events.list()]
    │
    ▼
[서버에서 변경사항 감지]
    │
    ├─► 새 이벤트 → Prisma: schedule.create()
    ├─► 수정 이벤트 → Prisma: schedule.update()
    └─► 삭제 이벤트 → Prisma: schedule.delete()
    │
    ▼
[PostgreSQL 업데이트]
    │
    ▼
[Pusher or Server-Sent Events] (선택)
    │
    ▼
[클라이언트 자동 리페치]
```

---

## 🎯 주요 설계 결정사항

### 1. 상태 관리 전략

| 상태 타입 | 라이브러리 | 사용처 |
| --- | --- | --- |
| **서버 상태** | TanStack Query | 할일, 일정, 루틴 등 서버 데이터 |
| **클라이언트 상태** | Zustand | UI 상태 (사이드바 열림/닫힘, 모달) |
| **폼 상태** | React Hook Form | 입력 폼 관리 |
| **Optimistic UI** | React 19 useOptimistic | 체크박스, 드래그앤드롭 |

**이유**: 
- 서버 상태와 클라이언트 상태를 명확히 분리
- React Query의 캐싱/리페칭으로 불필요한 API 호출 감소
- useOptimistic으로 즉각적인 사용자 피드백

### 2. 계층 구조 구현

**Self-referencing 방식 채택**

```typescript
// Todo 테이블에 parentId 컬럼
model Todo {
  id       String  @id
  parentId String? // 부모 할일 ID
  parent   Todo?   @relation("TodoHierarchy", fields: [parentId], references: [id])
  children Todo[]  @relation("TodoHierarchy")
}
```

**장점**:
- 무제한 깊이 지원
- 쿼리 단순 (Prisma의 중첩 쿼리 활용)
- 유연한 구조 변경

**단점** (해결방안):
- N+1 문제 → Prisma의 `include` 최적화
- 깊은 트리 성능 → 클라이언트에서 재귀 렌더링 최적화

### 3. 할일 vs 일정 분리

**설계**: `Todo`와 `Schedule`을 별도 테이블로 분리

```
Todo (1) ←→ (N) Schedule
```

**이유**:
- 할일은 "무엇을 할지"
- 일정은 "언제 할지"
- 한 할일을 여러 시간대에 배치 가능 (반복 작업)
- 구글 캘린더 이벤트와 1:1 매핑

### 4. 구글 캘린더 연동 방식

**양방향 동기화 전략**:

1. **Todal → Google**: 
   - 일정 생성 시 즉시 Google Calendar API 호출
   - `googleEventId` 저장

2. **Google → Todal**:
   - Webhook (Push Notification) 우선
   - Fallback: 주기적 Polling (5분마다)

3. **충돌 해결**:
   - `updatedAt` 타임스탬프 비교
   - 최신 변경사항 우선

### 5. 루틴 자동 생성 로직

**방식**: Vercel Cron Jobs (무료)

```typescript
// app/api/cron/generate-routines/route.ts
export async function GET() {
  // 매일 00:01에 실행
  const today = new Date()
  const activeRoutines = await prisma.routine.findMany({
    where: { isActive: true }
  })

  for (const routine of activeRoutines) {
    if (routine.daysOfWeek.includes(today.getDay())) {
      // 오늘 실행해야 하는 루틴이면 Todo 생성
      await prisma.todo.create({...})
    }
  }
}
```

**설정**: `vercel.json`
```json
{
  "crons": [
    {
      "path": "/api/cron/generate-routines",
      "schedule": "1 0 * * *"
    }
  ]
}
```

### 6. 드래그앤드롭 구현

**라이브러리**: dnd-kit

**이유**:
- 접근성 우수 (키보드 지원)
- 성능 최적화 (Virtual DOM)
- 다양한 드래그 시나리오 지원

**구조**:
```typescript
<DndContext onDragEnd={handleDragEnd}>
  <Droppable id="todo-list">
    {todos.map(todo => (
      <Draggable key={todo.id} id={todo.id}>
        <TodoItem todo={todo} />
      </Draggable>
    ))}
  </Droppable>
  
  <Droppable id="calendar">
    <CalendarView />
  </Droppable>
</DndContext>
```

---

## 🔐 보안 고려사항

### 1. 인증/인가

- **Supabase Auth** 사용
- JWT 기반 세션 관리
- 이메일/비밀번호, Google OAuth, 소셜 로그인 지원
- Row Level Security (RLS)로 데이터베이스 레벨 보안

### 2. API 보호

```typescript
// Server Action에서 사용자 검증
import { createServerClient } from '@supabase/ssr'

export async function createTodo(data: CreateTodoInput) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    // ... cookies config
  )
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  // userId가 세션 사용자와 일치하는지 확인
  return prisma.todo.create({
    data: {
      ...data,
      userId: user.id
    }
  })
}
```

### 3. SQL Injection 방지

- Prisma ORM의 파라미터화된 쿼리 사용
- Raw 쿼리 최소화

### 4. XSS 방지

- React의 자동 이스케이핑
- `dangerouslySetInnerHTML` 사용 금지

### 5. CSRF 방지

- NextAuth.js의 CSRF 토큰 자동 처리
- Server Actions의 자동 CSRF 보호

---

## 📈 확장성 고려사항

### 1. 데이터베이스 인덱싱

```prisma
// 자주 쿼리되는 컬럼에 인덱스
@@index([userId])
@@index([categoryId])
@@index([completed])
@@index([date])
```

### 2. 쿼리 최적화

```typescript
// ❌ N+1 문제
const todos = await prisma.todo.findMany()
for (const todo of todos) {
  const category = await prisma.category.findUnique({
    where: { id: todo.categoryId }
  })
}

// ✅ Include로 한 번에 가져오기
const todos = await prisma.todo.findMany({
  include: {
    category: true,
    schedules: true
  }
})
```

### 3. 캐싱 전략

| 레벨 | 방법 | TTL |
| --- | --- | --- |
| **CDN** | Vercel Edge Network | 정적 파일 |
| **Browser** | React Query | 5분 (staleTime) |
| **Server** | Next.js unstable_cache | 1분 |
| **Database** | Prisma Connection Pool | - |

### 4. Phase별 확장 전략

- **Phase 1-2**: Vercel Hobby + Supabase Free
- **Phase 3**: Vercel Pro + Supabase Pro (필요시)
- **Phase 4**: AI API 호출 최적화 (스트리밍)
- **Phase 5**: Supabase Realtime + Edge Functions (실시간 기능)

---

**Last Updated**: 2025-10-17

