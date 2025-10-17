# Todal 개발 가이드

> Next.js 15 + React 19 기반 개발 환경 및 기술 스택 가이드

---

## 💻 기술 스택

### Frontend

| 레이어 | 기술 | 버전 | 이유 |
| --- | --- | --- | --- |
| **Framework** | Next.js | 15 | App Router, RSC, 서버 액션 지원 |
| **React** | React | 19 | 최신 기능, 성능 개선, useOptimistic |
| **Language** | TypeScript | 5+ | 타입 안정성, 유지보수성 |
| **Styling** | Tailwind CSS | v4 | Next.js와 완벽 호환, 유틸리티 우선 |
| **상태관리** | Zustand | latest | 클라이언트 상태 (UI, 임시 데이터) |
| **서버 상태** | TanStack Query | v5 | 서버 상태 관리, 캐싱, 자동 리패칭 |
| **드래그앤드롭** | dnd-kit | latest | 성능 좋고 접근성 우수 |
| **캘린더** | react-big-calendar | latest | 커스터마이징 가능 |
| **날짜 처리** | date-fns | latest | 가볍고 트리쉐이킹 지원 |
| **폼 관리** | React Hook Form | latest | 성능, 간결함 |
| **UI 컴포넌트** | Shadcn UI | latest | Radix UI 기반, 커스터마이징 가능 |

### Backend

| 레이어 | 기술 | 이유 |
| --- | --- | --- |
| **API** | Next.js API Routes | 프론트엔드와 통합, 서버 액션 활용 |
| **Database** | Supabase (PostgreSQL) | 관계형 데이터, 실시간 기능 내장 |
| **ORM** | Prisma | 5+ | TypeScript 친화적, Supabase 호환 |
| **인증** | Supabase Auth | - | 이메일, OAuth, 소셜 로그인 통합 |
| **파일 저장** | Supabase Storage | - | 통합 솔루션, S3 호환 |
| **실시간** | Supabase Realtime | - | WebSocket 기반 실시간 업데이트 |

### API & 연동

| 서비스 | 용도 | Phase |
| --- | --- | --- |
| **Google Calendar API** | 양방향 동기화 | Phase 1 |
| **OpenAI API** | AI 코칭, 자가 진단 | Phase 4 |
| **Firebase Cloud Messaging** | 푸시 알림 (모바일) | Phase 3 |

### DevOps & 인프라

| 항목 | 기술 | 설명 |
| --- | --- | --- |
| **호스팅** | Vercel | 프론트엔드 배포 |
| **데이터베이스** | Supabase | PostgreSQL + Realtime |
| **CI/CD** | Vercel Git Integration | 자동 배포 |
| **모니터링** | Vercel Analytics + Sentry | 성능 및 에러 추적 |
| **환경변수** | Vercel + Supabase | 안전한 비밀 관리 |

---

## 🗂️ 폴더 구조 (Next.js 15 App Router)

```
todal/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 인증 레이아웃 그룹
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── (main)/                   # 메인 레이아웃 그룹
│   │   ├── layout.tsx            # 좌우 분할 레이아웃
│   │   ├── page.tsx              # 홈 (할일 + 캘린더)
│   │   ├── dashboard/
│   │   │   └── page.tsx          # 대시보드 (Phase 2)
│   │   ├── settings/
│   │   │   └── page.tsx          # 설정
│   │   └── friends/              # Phase 5
│   │       └── page.tsx
│   ├── api/                      # API Routes
│   │   ├── todos/
│   │   │   └── route.ts          # GET, POST /api/todos
│   │   ├── todos/[id]/
│   │   │   └── route.ts          # PUT, DELETE /api/todos/:id
│   │   ├── calendar/
│   │   │   └── route.ts
│   │   ├── google/
│   │   │   ├── auth/
│   │   │   │   └── route.ts      # 구글 OAuth
│   │   │   └── sync/
│   │   │       └── route.ts      # 구글 캘린더 동기화
│   │   └── ai/                   # Phase 4
│   │       ├── analyze/
│   │       │   └── route.ts
│   │       └── chat/
│   │           └── route.ts
│   ├── actions/                  # Server Actions
│   │   ├── todo-actions.ts       # 할일 CRUD 액션
│   │   ├── calendar-actions.ts   # 캘린더 액션
│   │   └── routine-actions.ts    # 루틴 액션
│   ├── layout.tsx                # 루트 레이아웃
│   ├── globals.css               # 글로벌 스타일
│   └── providers.tsx             # 클라이언트 프로바이더
│
├── components/                   # React 컴포넌트
│   ├── common/                   # 공통 컴포넌트
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── checkbox.tsx
│   ├── todo/                     # 할일 관련 (Client Components)
│   │   ├── todo-list.tsx
│   │   ├── todo-item.tsx
│   │   ├── todo-input.tsx
│   │   └── drag-handle.tsx
│   ├── calendar/                 # 캘린더 관련
│   │   ├── calendar-view.tsx     # 'use client'
│   │   ├── event-box.tsx
│   │   └── time-grid.tsx
│   ├── dashboard/                # 대시보드 (Phase 2)
│   │   ├── stats-card.tsx
│   │   └── chart-view.tsx
│   └── layout/                   # 레이아웃 컴포넌트
│       ├── sidebar.tsx
│       └── header.tsx
│
├── lib/                          # 라이브러리 & 유틸리티
│   ├── prisma.ts                 # Prisma 클라이언트
│   ├── auth.ts                   # NextAuth 설정
│   ├── google-calendar.ts        # 구글 API 래퍼
│   └── utils.ts                  # 유틸리티 함수
│
├── hooks/                        # 클라이언트 훅
│   ├── use-todos.ts              # React Query 훅
│   ├── use-calendar.ts
│   ├── use-drag-and-drop.ts
│   └── use-google-sync.ts
│
├── stores/                       # Zustand 스토어
│   ├── todo-store.ts             # 클라이언트 임시 상태
│   ├── ui-store.ts               # UI 상태 (사이드바 등)
│   └── user-store.ts
│
├── types/                        # TypeScript 타입
│   ├── todo.ts
│   ├── calendar.ts
│   └── api.ts
│
├── prisma/                       # Prisma
│   ├── schema.prisma             # DB 스키마
│   └── migrations/               # 마이그레이션
│
├── public/                       # 정적 파일
│   ├── icons/
│   └── images/
│
├── docs/                         # 문서
│   ├── features/                 # 기능별 상세 명세
│   ├── design/                   # UI/UX 설계
│   └── api/                      # API 문서
│
├── .env.example                  # 환경변수 예시
├── .env.local                    # 로컬 환경변수 (git ignore)
├── .gitignore
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
└── README.md
```

### 파일 네이밍 컨벤션

- **컴포넌트**: kebab-case (예: `todo-list.tsx`)
- **훅**: kebab-case with use- prefix (예: `use-todos.ts`)
- **타입**: kebab-case (예: `todo.ts`)
- **유틸리티**: kebab-case (예: `date-utils.ts`)
- **Server Actions**: kebab-case with -actions suffix (예: `todo-actions.ts`)

---

## 🚀 Next.js 15 특화 기능 활용

### 1. Server Components (RSC)

서버 컴포넌트를 기본으로 사용하고, 인터랙션이 필요한 경우에만 클라이언트 컴포넌트로 분리합니다.

```tsx
// app/(main)/page.tsx - 서버 컴포넌트
import { getTodos } from '@/app/actions/todo-actions'
import { TodoList } from '@/components/todo/todo-list'
import { CalendarView } from '@/components/calendar/calendar-view'

export default async function HomePage() {
  // 서버에서 데이터 페칭
  const todos = await getTodos()

  return (
    <div className="flex h-screen">
      <aside className="w-[360px] border-r">
        <TodoList initialTodos={todos} /> {/* Client Component */}
      </aside>
      <main className="flex-1">
        <CalendarView /> {/* Client Component */}
      </main>
    </div>
  )
}
```

### 2. Server Actions

폼 제출 및 데이터 변경은 Server Actions를 사용합니다.

```tsx
// app/actions/todo-actions.ts
'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createTodo(data: CreateTodoInput) {
  const todo = await prisma.todo.create({
    data: {
      title: data.title,
      categoryId: data.categoryId,
      userId: data.userId,
    }
  })

  revalidatePath('/(main)')
  return todo
}

export async function updateTodoStatus(id: string, completed: boolean) {
  await prisma.todo.update({
    where: { id },
    data: { 
      completed, 
      completedAt: completed ? new Date() : null 
    }
  })

  revalidatePath('/(main)')
}
```

### 3. React Query + Server Actions

```tsx
// hooks/use-todos.ts
'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createTodo, updateTodoStatus } from '@/app/actions/todo-actions'

export function useTodos() {
  const queryClient = useQueryClient()

  const { data: todos, isLoading } = useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      const res = await fetch('/api/todos')
      return res.json()
    }
  })

  const createMutation = useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    }
  })

  return { 
    todos, 
    isLoading,
    createTodo: createMutation.mutate 
  }
}
```

### 4. React 19 - useOptimistic

Optimistic UI 업데이트로 즉각적인 피드백 제공

```tsx
// components/todo/todo-item.tsx
'use client'

import { useOptimistic } from 'react'
import { updateTodoStatus } from '@/app/actions/todo-actions'

interface TodoItemProps {
  todo: Todo
}

export function TodoItem({ todo }: TodoItemProps) {
  const [optimisticTodo, setOptimisticTodo] = useOptimistic(todo)

  async function handleToggle() {
    // 즉시 UI 업데이트
    setOptimisticTodo({ ...todo, completed: !todo.completed })
    
    // 서버 업데이트
    await updateTodoStatus(todo.id, !todo.completed)
  }

  return (
    <div>
      <input
        type="checkbox"
        checked={optimisticTodo.completed}
        onChange={handleToggle}
      />
      <span className={optimisticTodo.completed ? 'line-through' : ''}>
        {optimisticTodo.title}
      </span>
    </div>
  )
}
```

### 5. Route Groups로 레이아웃 분리

- `(auth)`: 로그인/회원가입 - 심플한 레이아웃
- `(main)`: 메인 앱 - 좌우 분할 레이아웃
- URL에 영향 없이 레이아웃만 구분

### 6. Loading & Error States

```tsx
// app/(main)/loading.tsx
export default function Loading() {
  return <div>로딩 중...</div>
}

// app/(main)/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>오류가 발생했습니다!</h2>
      <button onClick={reset}>다시 시도</button>
    </div>
  )
}
```

---

## 🎨 Tailwind CSS 설정

### tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2D9F6B',
          light: '#E8F5EE',
          dark: '#1F7A51',
        },
        secondary: {
          DEFAULT: '#5B6B8C',
        },
        background: {
          DEFAULT: '#FFFFFF',
          gray: '#F8F9FA',
        },
        text: {
          DEFAULT: '#2B2D36',
          secondary: '#73777F',
          tertiary: '#A7ABB3',
        },
        status: {
          success: '#2D9F6B',
          warning: '#FF9F43',
          error: '#E74C3C',
          info: '#3B82F6',
        },
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '360': '360px', // Left panel width
      },
    },
  },
  plugins: [],
}

export default config
```

---

## 📦 데이터 페칭 전략

| 위치 | 방법 | 사용처 | 캐싱 |
| --- | --- | --- | --- |
| **초기 로드** | Server Component + Prisma | 페이지 첫 렌더링 | Next.js 자동 캐싱 |
| **실시간 업데이트** | React Query + API Routes | 드래그앤드롭, 완료 체크 | React Query 캐싱 |
| **폼 제출** | Server Actions | 할일 생성, 수정 | revalidatePath |
| **구글 연동** | API Routes (OAuth) | 외부 API 호출 | 수동 캐시 제어 |

---

## 🔐 환경변수 설정

### .env.example

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:password@db.your-project.supabase.co:5432/postgres"

# Google OAuth (Supabase에서 설정)
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Google Calendar API
GOOGLE_CALENDAR_API_KEY="your-api-key"

# OpenAI (Phase 4)
OPENAI_API_KEY="your-openai-key"

# Vercel (자동 설정)
VERCEL_URL=""
```

---

## 🧪 개발 환경 설정

### 1. 패키지 매니저

**pnpm 사용 권장** (빠른 설치, 디스크 효율)

```powershell
# pnpm 설치 (전역)
npm install -g pnpm

# 프로젝트 생성
pnpm create next-app@latest todal --typescript --tailwind --app --use-pnpm
```

### 2. 초기 설정 단계

```powershell
# 1. 프로젝트 생성 후 이동
cd todal

# 2. Supabase 및 Prisma 설치
pnpm add @supabase/supabase-js @supabase/ssr
pnpm add @prisma/client prisma

# 3. 상태 관리 및 UI 라이브러리
pnpm add @tanstack/react-query
pnpm add zustand
pnpm add @dnd-kit/core @dnd-kit/sortable
pnpm add react-big-calendar
pnpm add date-fns
pnpm add react-hook-form

# 4. 개발 의존성
pnpm add -D @types/node @types/react @types/react-dom
pnpm add -D eslint eslint-config-next
pnpm add -D prettier prettier-plugin-tailwindcss

# 5. Prisma 초기화
pnpm prisma init
```

### 3. Supabase 설정

```powershell
# 1. Supabase 프로젝트 생성 (https://supabase.com)
# 2. DATABASE_URL을 .env.local에 복사
# 3. Prisma 스키마 작성 후 마이그레이션
pnpm prisma migrate dev --name init

# 4. Prisma Studio 실행 (DB GUI)
pnpm prisma studio

# 5. Supabase Studio에서도 확인 가능 (https://app.supabase.com)
```

### 4. 개발 서버 실행

```powershell
pnpm dev
```

---

## 🎯 성능 최적화 전략

### Next.js 특화

- [ ] Dynamic imports로 클라이언트 컴포넌트 지연 로딩
- [ ] Image 컴포넌트로 이미지 최적화
- [ ] Font 최적화 (next/font)
- [ ] Metadata API로 SEO 최적화
- [ ] `loading.tsx`로 로딩 상태 처리
- [ ] `error.tsx`로 에러 바운더리

### React 최적화

- [ ] React.memo로 불필요한 리렌더 방지
- [ ] useOptimistic으로 즉각적인 UI 피드백
- [ ] React.lazy로 컴포넌트 코드 스플리팅
- [ ] 가상 스크롤 (할일이 100개 이상일 때)

### 데이터 최적화

- [ ] React Query로 서버 상태 캐싱
- [ ] Debounce/Throttle (검색, 드래그)
- [ ] 캘린더 이벤트 윈도윙 (보이는 범위만 렌더)
- [ ] Prisma 쿼리 최적화 (select, include)

---

## ♿ 접근성 (a11y) 체크리스트

- [ ] 키보드 네비게이션 (Tab, Enter, Esc)
- [ ] ARIA 라벨 (체크박스, 버튼)
- [ ] 포커스 인디케이터 (2px outline)
- [ ] 색상 대비 WCAG AA 준수
- [ ] 스크린 리더 테스트
- [ ] dnd-kit의 접근성 기능 활용

---

## 🧹 코드 품질

### ESLint 설정

```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "prettier"
  ],
  "rules": {
    "prefer-const": "error",
    "no-unused-vars": "warn"
  }
}
```

### Prettier 설정

```json
// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### TypeScript 설정

```json
// tsconfig.json (주요 부분)
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

## 🔍 디버깅 도구

| 도구 | 용도 |
| --- | --- |
| **React DevTools** | 컴포넌트 트리, Props, State 확인 |
| **TanStack Query DevTools** | 쿼리 캐시 상태 확인 |
| **Prisma Studio** | 데이터베이스 GUI |
| **Vercel Logs** | 서버 로그 확인 |
| **Sentry** | 에러 트래킹 (Phase 2+) |

---

**Last Updated**: 2025-10-17

