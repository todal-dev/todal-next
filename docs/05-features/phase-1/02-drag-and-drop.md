# Phase 1-2: 드래그앤드롭 (Drag and Drop)

> **Phase**: 1 (MVP)  
> **카테고리**: 할일 관리  
> **우선순위**: 🔴 필수  
> **주차**: Week 3 (3주차)

---

## 📋 기능 개요

노션 스타일의 계층 구조를 지원하는 드래그앤드롭 기능으로, 직관적인 할일 정렬과 들여쓰기를 제공합니다.

### 핵심 특징

1. **드래그 핸들**: ⋮⋮ 아이콘으로 순서 재배치
2. **Tab 들여쓰기**: Tab/Shift+Tab으로 계층 구조 조정
3. **노션식 계층 구조**: 카테고리 > 서브 할일 구조
4. **정렬 피드백**: 드래그 중 시각적 가이드라인 표시
5. **자동 저장**: 드롭 시 DB에 자동 반영

---

## 🎯 사용자 시나리오

### 시나리오 1: 할일 순서 변경하기
```
1. 할일의 ⋮⋮ 핸들 (좌측) 마우스로 클릭
2. 드래그 시작 → 할일 그림자 표시, 약간 들어올림
3. 다른 할일 위에서 마우스 뗌
4. 순서 변경 완료 → 자동 저장
```

### 시나리오 2: 할일을 서브 할일로 만들기
```
1. 할일 "프로젝트 A 마무리" 선택
2. Tab 키 누름 또는 우측으로 드래그
3. 들여쓰기 24px 증가
4. 상단 할일 "프로젝트 A"의 자식 항목이 됨
5. 자동으로 parentId 업데이트
```

### 시나리오 3: 서브 할일을 상위 항목으로 올리기
```
1. 서브 할일 "UI 디자인" 선택
2. Shift+Tab 키 누름 또는 좌측으로 드래그
3. 들여쓰기 24px 감소
4. 부모 할일과 같은 레벨이 됨
5. parentId 제거, order 자동 조정
```

### 시나리오 4: 복잡한 계층 구조 만들기
```
1. 카테고리: 일
   └─ 프로젝트 A (parentId: null)
      ├─ UI 디자인 (parentId: A)
      ├─ API 개발 (parentId: A)
      └─ 테스트 (parentId: A)
   └─ 프로젝트 B (parentId: null)
      └─ 문서작성 (parentId: B)
```

---

## 🗄️ 데이터 모델

### Todo 계층 구조

```prisma
model Todo {
  id        String   @id @default(cuid())
  title     String
  
  // 계층 구조
  parentId  String?
  parent    Todo?    @relation("TodoChildren", fields: [parentId], references: [id])
  children  Todo[]   @relation("TodoChildren")
  
  // 정렬
  order     Int      @default(0)  // 같은 레벨 내 순서
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 계층 깊이 제한

- **최대 깊이**: 5 레벨 (사용성 및 성능 고려)
- **제한**: 3 레벨 이상이면 경고 UI 표시

---

## 💻 구현 세부사항

### dnd-kit 라이브러리 사용

```typescript
// components/todo/todo-list.tsx
'use client'

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'

export function TodoList({ todos }: TodoListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { distance: 8 }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  async function handleDragEnd(event) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    await reorderTodos(active.id, over.id)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={todos.map(t => t.id)}
        strategy={verticalListSortingStrategy}
      >
        {todos.map(todo => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </SortableContext>
    </DndContext>
  )
}
```

### Server Actions

```typescript
// app/actions/todo-actions.ts

// 할일 순서 재배치
export async function reorderTodos(
  activeId: string,
  overId: string,
  newParentId?: string
): Promise<void> {
  // 1. 현재 위치와 새 위치 계산
  // 2. 영향받는 모든 할일의 order 업데이트
  // 3. 필요시 parentId 업데이트 (들여쓰기)
  // 4. DB 트랜잭션 실행
}

// 할일 들여쓰기 (Tab 키)
export async function indentTodo(id: string, depth: number): Promise<void> {
  // 1. 현재 깊이 확인
  // 2. 최대 깊이 체크
  // 3. 부모 할일 찾기 (위의 할일을 부모로 설정)
  // 4. 자식 할일들의 parentId 자동 조정 (선택)
}

// 할일 내어쓰기 (Shift+Tab 키)
export async function outdentTodo(id: string): Promise<void> {
  // 1. 부모가 없으면 불가능
  // 2. 부모의 parentId를 현재 항목의 parentId로 설정
  // 3. order 자동 조정
}
```

### Tab 키 처리

```typescript
// components/todo/todo-item.tsx
'use client'

function TodoItem({ todo }: TodoItemProps) {
  async function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Tab') {
      e.preventDefault()
      
      if (e.shiftKey) {
        // Shift+Tab: 내어쓰기
        await outdentTodo(todo.id)
      } else {
        // Tab: 들여쓰기
        await indentTodo(todo.id, currentDepth + 1)
      }
    }
  }

  return (
    <div onKeyDown={handleKeyDown}>
      {/* 할일 내용 */}
    </div>
  )
}
```

---

## 🎨 UI 상태

### 1. 드래그 핸들

```
호버 전:  | 
호버:     ⋮⋮
드래그:   ⋮⋮ (마우스 커서 변화)
```

**스타일**:
- 기본: 색상 #A7ABB3, 호버 시 #2B2D36로 변경
- 크기: 20x20px

### 2. 드래그 중 피드백

```
┌─ 드래그 시작
│  할일 그림자 증가 (0 4px 12px rgba(0,0,0,0.15))
│  투명도 80% 유지
│  약간 들어올림 (transform: translateY(-2px))
│
├─ 드래그 중
│  드롭 가능 위치에 가이드라인 표시
│  들여쓰기 예상 위치 표시 (들여쓰기 가능시)
│
└─ 드롭
   부드러운 애니메이션으로 원위치 복귀
```

### 3. 계층 구조 들여쓰기

| 레벨 | 들여쓰기 |
| --- | --- |
| 1 | 0px |
| 2 | 24px |
| 3 | 48px |
| 4 | 72px |
| 5 | 96px |

```
프로젝트 A 관리          [0px]
├─ UI 설계               [24px]
├─ API 개발              [24px]
│  ├─ 인증 시스템        [48px]
│  └─ 데이터 모델        [48px]
└─ 테스트                [24px]
```

---

## ⌨️ 키보드 단축키

| 단축키 | 동작 | 조건 |
| --- | --- | --- |
| `Tab` | 들여쓰기 (우측) | 할일 포커스 시, 깊이 < 5 |
| `Shift+Tab` | 내어쓰기 (좌측) | 할일 포커스 시, 깊이 > 1 |
| `↑` / `↓` | 위/아래 할일 선택 | dnd-kit 키보드 지원 |
| `Enter` | 드롭 (드래그 중) | dnd-kit 키보드 모드 |
| `Escape` | 드래그 취소 | 드래그 중 |

---

## 🚀 성능 최적화

### 가상 스크롤 (할일 > 100개시)

```typescript
import { FixedSizeList as List } from 'react-window'

// 할일이 많을 때 자동으로 가상 스크롤 활용
function TodoList({ todos }: TodoListProps) {
  if (todos.length > 100) {
    return (
      <List
        height={600}
        itemCount={todos.length}
        itemSize={40}
      >
        {({ index, style }) => (
          <TodoItem style={style} todo={todos[index]} />
        )}
      </List>
    )
  }
  
  return <div>{todos.map(t => <TodoItem key={t.id} todo={t} />)}</div>
}
```

### Optimistic Update

```typescript
const [optimisticTodos, setOptimisticTodos] = useOptimistic(todos)

async function handleDragEnd(event) {
  const reordered = calculateNewOrder(optimisticTodos, event)
  
  // 즉시 UI 업데이트
  setOptimisticTodos(reordered)
  
  // 서버 업데이트
  await reorderTodos(...)
}
```

---

## ✅ 완료 기준

- [ ] dnd-kit 라이브러리 설치 및 설정
- [ ] 드래그 핸들 UI 구현
- [ ] 같은 레벨 내 순서 변경 가능
- [ ] Tab/Shift+Tab 들여쓰기 작동
- [ ] 계층 구조 DB 저장
- [ ] 최대 깊이 제한 (5 레벨)
- [ ] 드래그 중 시각적 피드백
- [ ] 드롭 시 자동 저장
- [ ] Optimistic Update
- [ ] 키보드 네비게이션

---

## 📌 연관 기능

- **Week 2**: [할일 관리](./01-todo-management.md) (선행 완료 필수)
- **Week 4**: [캘린더 통합](./03-calendar-integration.md) (할일 → 캘린더 드래그)

---

**Last Updated**: 2025-10-17
