# Phase 1-5: 루틴 자동화 (Routine Automation)

> **Phase**: 1 (MVP)  
> **카테고리**: 루틴 & 알림  
> **우선순위**: 🔴 필수  
> **주차**: Week 6 (6주차)

---

## 📋 기능 개요

매일 반복되는 루틴을 자동으로 생성하고, 미완료 항목에 대해 자정에 알림을 보내는 기능입니다.

### 핵심 특징

1. **매일 자동 생성**: Vercel Cron으로 정시에 루틴 자동 생성
2. **루틴 on/off**: 루틴 활성화/비활성화 간편 토글
3. **완료율 기록**: 루틴 달성 여부 저장 (히트맵용)
4. **자정 알림**: 미완료 항목 알림
5. **일괄 이동**: 미완료 항목 오늘로 이동 버튼

---

## 🎯 사용자 시나리오

### 시나리오 1: 루틴 생성하기
```
1. 좌측 + 버튼 또는 설정 > "루틴 추가"
2. 루틴 입력:
   - 이름: "아침 운동"
   - 시간: 07:00 (매일)
   - 반복: 월-금 (선택)
3. 저장 → 내일부터 자동 생성
```

### 시나리오 2: 매일 루틴 자동 생성
```
1. 매일 자정 (00:00) 또는 설정 시간에 실행
2. 활성화된 모든 루틴 자동 생성
3. 사용자가 앱 켤 때 즉시 표시
4. 예: 7시 "아침 운동"이 할일 리스트에 나타남
```

### 시나리오 3: 루틴 완료 기록
```
1. 루틴 할일 "아침 운동" 체크
2. 완료 시간 기록 (일별 통계용)
3. 히트맵에 표시 (나중에 대시보드에서)
```

### 시나리오 4: 미완료 알림 (자정)
```
1. 어제 미완료 항목 감지
   - "프로젝트 A 마무리"
   - "회의 보고서"
2. 자정(00:00)에 이메일 또는 브라우저 알림
   "어제 완료하지 못한 할일이 2개 있습니다"
3. "오늘로 이동" 버튼 제공
```

### 시나리오 5: 미완료 항목 일괄 이동
```
1. 앱에서 "미완료 항목 이동" 버튼 (수동 호출)
2. 또는 자정 알림에서 "오늘로 이동" 클릭
3. 어제 미완료 항목들을 오늘로 자동 이동
```

---

## 🗄️ 데이터 모델

### Routine 테이블

```prisma
model Routine {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  
  title     String
  time      String   @default("09:00") // HH:mm 형식
  
  // 반복 설정
  isActive  Boolean  @default(true)
  daysOfWeek String  @default("1,2,3,4,5") // 1=월, 7=일 (JSON 배열로 저장 가능)
  
  // 매 일마다 생성된 할일
  todos     Todo[]   @relation("RoutineTodos")
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model RoutineComplete {
  id        String   @id @default(cuid())
  userId    String
  routineId String
  routine   Routine  @relation(fields: [routineId], references: [id])
  
  completedDate DateTime // 날짜만 (시간 제거)
  completed Boolean     @default(false)
  completedAt   DateTime?
  
  createdAt DateTime @default(now())
  
  @@unique([routineId, completedDate])
}

model Todo {
  // ... 기존 필드
  routineId String?
  isFromRoutine Boolean @default(false) // 루틴에서 생성된 항목인지 여부
}
```

---

## 💻 구현 세부사항

### Vercel Cron Job

```typescript
// app/api/cron/generate-routines/route.ts
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  // 1. Vercel 크론 검증
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    await generateDailyRoutines()
    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (error) {
    console.error('Cron job error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}

// vercel.json
{
  "crons": [{
    "path": "/api/cron/generate-routines",
    "schedule": "0 0 * * *"  // 매일 자정
  }]
}
```

### 루틴 자동 생성 로직

```typescript
// app/actions/routine-actions.ts
'use server'

export async function generateDailyRoutines(): Promise<void> {
  // 1. 모든 활성 루틴 조회
  const routines = await prisma.routine.findMany({
    where: { isActive: true },
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dayOfWeek = today.getDay() // 0=일, 1=월, ..., 6=토

  for (const routine of routines) {
    // 2. 오늘이 루틴 반복일인지 확인
    const daysOfWeek = routine.daysOfWeek.split(',').map(d => parseInt(d))
    const normalizedDay = dayOfWeek === 0 ? 7 : dayOfWeek // 1=월, 7=일
    
    if (!daysOfWeek.includes(normalizedDay)) continue

    // 3. 이미 생성되었는지 확인
    const existing = await prisma.routineComplete.findUnique({
      where: {
        routineId_completedDate: {
          routineId: routine.id,
          completedDate: today,
        },
      },
    })

    if (existing) continue

    // 4. 루틴 할일 생성
    const [hours, minutes] = routine.time.split(':').map(Number)
    const scheduledTime = new Date(today)
    scheduledTime.setHours(hours, minutes, 0, 0)

    const todo = await prisma.todo.create({
      data: {
        userId: routine.userId,
        title: routine.title,
        routineId: routine.id,
        isFromRoutine: true,
        estimatedMin: 60, // 기본값
        categoryId: null, // 또는 기본 카테고리
      },
    })

    // 5. RoutineComplete 기록
    await prisma.routineComplete.create({
      data: {
        userId: routine.userId,
        routineId: routine.id,
        completedDate: today,
      },
    })
  }

  // 6. 미완료 알림 발송
  await sendMidnightNotifications()
}
```

### 미완료 알림

```typescript
// lib/notifications.ts

export async function sendMidnightNotifications(): Promise<void> {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(0, 0, 0, 0)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 1. 어제 미완료 할일 찾기
  const incompleteTodos = await prisma.todo.findMany({
    where: {
      completed: false,
      createdAt: {
        gte: yesterday,
        lt: today,
      },
    },
    include: { user: true },
    distinct: ['userId'],
  })

  // 2. 사용자별로 그룹화
  const userTodoMap = new Map<string, number>()
  for (const todo of incompleteTodos) {
    const count = userTodoMap.get(todo.userId) || 0
    userTodoMap.set(todo.userId, count + 1)
  }

  // 3. 각 사용자에게 알림 발송
  for (const [userId, count] of userTodoMap) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (user?.email) {
      await sendEmail({
        to: user.email,
        subject: `Todal: 어제 미완료 항목 ${count}개`,
        template: 'incomplete-reminder',
        data: { count, userName: user.name },
      })
    }
  }
}
```

### 루틴 on/off 토글

```typescript
export async function toggleRoutine(
  routineId: string,
  isActive: boolean
): Promise<Routine> {
  return prisma.routine.update({
    where: { id: routineId },
    data: { isActive },
  })
}

// UI에서
// <ToggleSwitch
//   checked={routine.isActive}
//   onChange={(checked) => toggleRoutine(routine.id, checked)}
// />
```

### 미완료 항목 일괄 이동

```typescript
export async function moveIncompleteTodaysToday(
  userId: string
): Promise<number> {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(0, 0, 0, 0)

  const result = await prisma.todo.updateMany({
    where: {
      userId,
      completed: false,
      createdAt: {
        gte: new Date(yesterday.getTime() - 24 * 60 * 60 * 1000), // 범위 확장
        lt: yesterday,
      },
    },
    data: {
      createdAt: new Date(), // 오늘 날짜로 변경
    },
  })

  return result.count
}
```

---

## 🎨 UI 구현

### 루틴 설정 UI

```tsx
// components/routine/routine-settings.tsx
'use client'

export function RoutineSettings() {
  const [routines, setRoutines] = useState<Routine[]>([])
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      {/* 루틴 목록 */}
      <div className="space-y-2">
        {routines.map(routine => (
          <div key={routine.id} className="flex items-center justify-between p-3">
            <div>
              <p className="font-medium">{routine.title}</p>
              <p className="text-sm text-gray-500">{routine.time}</p>
            </div>
            <Toggle
              checked={routine.isActive}
              onChange={(checked) => toggleRoutine(routine.id, checked)}
            />
          </div>
        ))}
      </div>

      {/* 루틴 추가 버튼 */}
      <Button onClick={() => setIsOpen(true)}>+ 루틴 추가</Button>

      {/* 루틴 생성 다이얼로그 */}
      {isOpen && <RoutineDialog onClose={() => setIsOpen(false)} />}
    </div>
  )
}
```

### 미완료 알림 배너

```tsx
// components/incomplete-reminder.tsx
'use client'

export function IncompleteReminder({ count }: { count: number }) {
  if (count === 0) return null

  return (
    <div className="bg-orange-50 border-l-4 border-orange-400 p-4">
      <div className="flex items-center justify-between">
        <p className="text-orange-800">
          어제 완료하지 못한 할일이 {count}개 있습니다
        </p>
        <Button
          size="sm"
          onClick={() => moveIncompleteToday()}
        >
          오늘로 이동
        </Button>
      </div>
    </div>
  )
}
```

---

## ✅ 완료 기준

- [ ] Routine 모델 DB 저장 가능
- [ ] Vercel Cron Job 설정
- [ ] 매일 자정에 루틴 자동 생성
- [ ] 루틴 on/off 토글 작동
- [ ] RoutineComplete 기록 저장
- [ ] 미완료 항목 감지
- [ ] 자정 이메일 알림 발송
- [ ] 미완료 항목 일괄 이동
- [ ] 루틴 설정 UI
- [ ] 알림 배너 표시

---

## 📌 연관 기능

- Phase 2: 루틴 히트맵 (대시보드)

---

**Last Updated**: 2025-10-17
