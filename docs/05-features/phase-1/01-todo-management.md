# Phase 1-1: 할일 관리 (Todo Management)

> **Phase**: 1 (MVP)  
> **카테고리**: 할일 관리  
> **우선순위**: 🔴 필수  
> **주차**: Week 2 (2주차)

---

## 📋 기능 개요

Todomate 스타일의 직관적인 할일 입력 인터페이스로, 빠르고 자연스러운 할일 관리를 제공합니다.

### 핵심 특징

1. **Todomate 스타일 입력**: 체크박스 + 인라인 텍스트 입력
2. **Enter 단축키**: 새 할일 즉시 생성
3. **색상 라벨**: 카테고리별 색상 구분
4. **인라인 편집**: 할일 클릭 시 직접 수정
5. **빠른 완료**: 체크박스로 즉시 완료 표시

---

## 🎯 사용자 시나리오

### 시나리오 1: 할일 추가하기
```
1. 할일 입력 필드 클릭 → "새 할일 입력..."
2. 텍스트 입력: "프로젝트 A 마무리"
3. Enter 키 누름 → 할일 추가, 입력 필드 초기화
4. 새로운 입력 필드 활성화 준비
```

### 시나리오 2: 카테고리 선택하기
```
1. 할일 입력 중 [카테고리 선택] 버튼 클릭
2. 카테고리 드롭다운 열기 (색상 표시)
   - 🟢 일
   - 🔵 프로젝트
   - 🟡 개인
   - 🟣 학습
3. 카테고리 선택 → 입력 필드 옆에 색상 배지 표시
4. Enter로 할일 생성
```

### 시나리오 3: 할일 완료하기
```
1. 할일 우측의 체크박스 클릭
2. 즉시 UI 업데이트:
   - ✅ 체크 아이콘 표시
   - 텍스트 색상 #A7ABB3로 변경
   - 텍스트에 취소선 적용
3. 완료 시간 기록 (DB에 completedAt 저장)
```

### 시나리오 4: 할일 수정하기
```
1. 할일 텍스트 더블클릭 또는 편집 아이콘 클릭
2. 텍스트 필드 활성화 (인라인 편집)
3. 텍스트 수정
4. Enter 또는 외부 클릭 → 저장
```

### 시나리오 5: 할일 삭제하기
```
1. 할일 우측 메뉴 (⋯) 클릭
2. 컨텍스트 메뉴 표시
   - 편집
   - 복제
   - 삭제
3. "삭제" 선택 → 확인 대화
4. 할일 삭제
```

---

## 🗄️ 데이터 모델

### Todo 테이블

```prisma
model Todo {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  
  categoryId  String?
  category    Category? @relation(fields: [categoryId], references: [id])
  
  title       String    @db.VarChar(255)
  memo        String?   @db.Text          // 선택: 메모/설명
  
  completed   Boolean   @default(false)
  completedAt DateTime?
  
  // 계층 구조
  parentId    String?
  parent      Todo?     @relation("TodoChildren", fields: [parentId], references: [id])
  children    Todo[]    @relation("TodoChildren")
  
  // 소요시간
  estimatedMin Int?     // 예상 소요시간 (분)
  
  // 정렬
  order       Int       @default(0)      // 같은 레벨 내 순서
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime? // Soft delete (선택)
}

model Category {
  id      String  @id @default(cuid())
  userId  String
  user    User    @relation(fields: [userId], references: [id])
  
  name    String  @db.VarChar(50)
  color   String  @default("#2D9F6B") // HEX 색상
  order   Int     @default(0)
  
  todos   Todo[]
  
  createdAt DateTime @default(now())
  
  @@unique([userId, name])
}
```

### Category (초기 기본값)

```json
[
  { "name": "일", "color": "#2D9F6B" },      // 초록색
  { "name": "프로젝트", "color": "#5B6B8C" }, // 파란색
  { "name": "개인", "color": "#FF9F43" },    // 주황색
  { "name": "학습", "color": "#9B59B6" }     // 보라색
]
```

---

## 💻 구현 세부사항

### 컴포넌트 구조

```
TodoList (Server Component)
├── TodoInput (Client Component)
│   └── CategorySelector
└── TodoItems (Client Component)
    ├── TodoItem (각 항목)
    │   ├── Checkbox
    │   ├── TodoText
    │   ├── MetaInfo (시간, 카테고리)
    │   └── Menu (⋯)
    └── [반복]
```

### Server Actions

```typescript
// app/actions/todo-actions.ts

// 할일 생성
async function createTodo(input: {
  title: string
  categoryId?: string
  estimatedMin?: number
  parentId?: string
}): Promise<Todo>

// 할일 수정
async function updateTodo(id: string, input: {
  title?: string
  categoryId?: string
  estimatedMin?: number
}): Promise<Todo>

// 할일 완료 토글
async function toggleTodo(id: string): Promise<Todo>

// 할일 삭제
async function deleteTodo(id: string): Promise<void>

// 여러 할일 순서 변경 (정렬 후 사용)
async function reorderTodos(items: Array<{
  id: string
  order: number
  parentId?: string
}>): Promise<void>
```

### API Routes (필요시)

```
GET  /api/todos            # 모든 할일 조회
GET  /api/todos/[id]       # 특정 할일 조회
POST /api/todos            # 할일 생성
PUT  /api/todos/[id]       # 할일 수정
DEL  /api/todos/[id]       # 할일 삭제
```

### UI 컴포넌트 명세

#### 1. TodoItem

```tsx
interface TodoItemProps {
  todo: Todo
  category?: Category
  onToggle: (id: string) => Promise<void>
  onUpdate: (id: string, data: Partial<Todo>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

// 렌더링:
// [ ☐ ] 할일 텍스트                  [🏷️] [⏱️] [⋯]
// └─ 체크박스  └─ 16px/400  └─ 우측 메타
```

**높이**: 40px  
**호버**: 배경 #F8F9FA로 변경, 아이콘 표시  
**완료**: 텍스트 #A7ABB3, 취소선 추가  
**활성**: 배경 #E8F5EE (Primary Light)

#### 2. TodoInput

```tsx
interface TodoInputProps {
  placeholder?: string
  onSubmit: (input: CreateTodoInput) => Promise<void>
}

// 렌더링:
// [ ☐ ] [새 할일 입력...] [카테고리 ▼] [시간 ⏱️]
```

**기능**:
- Enter: 할일 생성
- Shift+Enter: 줄바꿈 (텍스트 길어질 경우)
- Escape: 입력 취소 (비어있을 때)
- Tab: 다음 필드로 (구현: Week 3)

#### 3. CategorySelector

```tsx
interface CategorySelectorProps {
  value?: string
  categories: Category[]
  onChange: (categoryId: string) => void
}

// 드롭다운 UI:
// ┌─────────────────────┐
// │ 🟢 일               │
// │ 🔵 프로젝트         │
// │ 🟡 개인             │
// │ 🟣 학습             │
// └─────────────────────┘
```

---

## ⌨️ 키보드 단축키

| 단축키 | 동작 |
| --- | --- |
| `Enter` | 할일 생성 (입력 필드에서) |
| `Ctrl+Enter` | 메모 입력 중 줄바꿈 |
| `Escape` | 입력 취소 (입력 필드 비워지면 숨김) |
| `Delete` | 할일 삭제 (선택 시, 확인 후) |
| `Tab` | 다음 필드 포커스 (Week 3) |
| `Shift+Tab` | 이전 필드 포커스 (Week 3) |

---

## 🎨 UI 상태

### 1. 입력 필드 상태

| 상태 | 스타일 |
| --- | --- |
| **기본** | 배경 White, 테두리 #E5E7EB, 플레이스홀더 #A7ABB3 |
| **포커스** | 테두리 2px solid #2D9F6B, 쉐도우 0 0 0 3px rgba(45, 159, 107, 0.1) |
| **입력 중** | 배경 White, 텍스트 #2B2D36 |

### 2. 할일 상태

| 상태 | 설명 |
| --- | --- |
| **미완료** | 배경 White, 텍스트 #2B2D36, 체크박스 빈상태 |
| **호버** | 배경 #F8F9FA, 우측 메뉴 아이콘 표시 |
| **완료** | 텍스트 #A7ABB3 + 취소선, 배경 #F8F9FA, 체크박스 ✅ |
| **선택** | 배경 #E8F5EE, 좌측 선택 바 |

---

## 🚀 성능 최적화

### React Query 활용

```typescript
// hooks/use-todos.ts
export function useTodos() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: () => fetch('/api/todos').then(r => r.json()),
    staleTime: 5 * 60 * 1000, // 5분
  })
}

export function useTodoMutation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createTodo,
    onMutate: (newTodo) => {
      // Optimistic update
      queryClient.setQueryData(['todos'], (old) => [
        ...old,
        { id: 'temp', ...newTodo }
      ])
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['todos'])
    }
  })
}
```

### useOptimistic (React 19)

```typescript
export function TodoItem({ todo }) {
  const [optimisticTodo, setOptimisticTodo] = useOptimistic(todo)

  async function handleToggle() {
    setOptimisticTodo({ ...todo, completed: !todo.completed })
    await toggleTodo(todo.id)
  }
}
```

---

## ✅ 완료 기준

- [ ] Todo 모델 DB 저장 가능
- [ ] 할일 생성/수정/삭제 완전 작동
- [ ] 체크박스로 완료/미완료 토글
- [ ] Todomate 스타일 UI 구현
- [ ] 색상 라벨 시스템 작동
- [ ] 카테고리 선택 기능
- [ ] 인라인 편집 기능
- [ ] 소요시간 입력 옵션
- [ ] Optimistic UI 업데이트
- [ ] 모든 에러 케이스 처리

---

## 📌 연관 기능

- **Week 3**: [드래그앤드롭](./02-drag-and-drop.md) (순서 재배치)
- **Week 4**: [캘린더 통합](./03-calendar-integration.md) (할일 → 캘린더 이동)

---

**Last Updated**: 2025-10-17
