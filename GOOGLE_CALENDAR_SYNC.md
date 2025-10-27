# Google Calendar API 연동 가이드

Todal에 구글 캘린더 일정을 가져와서 할일로 변환할 수 있습니다.

## 구현 개요

### 동작 방식
1. 사용자가 Google 로그인 (OAuth)
2. 캘린더 읽기 권한 요청
3. Google Calendar API로 이벤트 가져오기
4. 캘린더 이벤트 → Todal Todo 형식으로 변환
5. 사용자 데이터베이스에 저장

### 가져올 수 있는 정보
- ✅ 이벤트 제목 → Todo 텍스트
- ✅ 시작/종료 시간 → startTime, endTime
- ✅ 날짜 → date
- ✅ 설명 → 메모 (나중에 구현 가능)
- ✅ 반복 일정 → recurrenceRule로 변환

---

## 1. Google Cloud Console 설정

### 1단계: Calendar API 활성화

1. https://console.cloud.google.com 접속
2. 기존 프로젝트 선택 (OAuth와 동일한 프로젝트)
3. 왼쪽 메뉴 → **API 및 서비스** → **라이브러리**
4. "Google Calendar API" 검색
5. **Google Calendar API** 클릭
6. **사용 설정** 클릭

### 2단계: OAuth 스코프 추가

이미 생성한 OAuth 클라이언트에 캘린더 권한만 추가하면 됩니다.

**Supabase에서 자동으로 처리되므로 별도 설정 불필요!**

하지만 확인차 Google Cloud Console에서:
1. **API 및 서비스** → **OAuth 동의 화면**
2. **범위** 섹션 확인
3. 필요시 `.../auth/calendar.readonly` 추가

---

## 2. 구현 계획

### Phase 1: OAuth 스코프 확장
```typescript
// 로그인 시 캘린더 권한 요청
supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    scopes: 'https://www.googleapis.com/auth/calendar.readonly',
    redirectTo: `${window.location.origin}/auth/callback`,
  },
})
```

### Phase 2: Calendar API 호출
```typescript
// Google Calendar API로 이벤트 가져오기
async function fetchGoogleCalendarEvents(accessToken: string, startDate: Date, endDate: Date) {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
    `timeMin=${startDate.toISOString()}&` +
    `timeMax=${endDate.toISOString()}&` +
    `singleEvents=true&` +
    `orderBy=startTime`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )
  return response.json()
}
```

### Phase 3: 데이터 변환
```typescript
// Google 이벤트 → Todal Todo 변환
function convertGoogleEventToTodo(event: GoogleCalendarEvent): Todo {
  return {
    id: `google-${event.id}`,
    text: event.summary,
    completed: false,
    date: new Date(event.start.dateTime || event.start.date),
    startTime: extractTime(event.start.dateTime),
    endTime: extractTime(event.end.dateTime),
    categoryId: 'google-calendar', // 구글 캘린더 전용 카테고리
    subtasks: [],
  }
}
```

### Phase 4: UI 추가
- 헤더에 "구글 캘린더 동기화" 버튼
- 동기화 상태 표시
- 마지막 동기화 시간 표시
- 자동 동기화 옵션

---

## 3. 구현 옵션

### 옵션 A: 읽기 전용 (추천)
- **장점**: 간단, 빠른 구현
- **동작**: 구글 캘린더 일정을 Todal에 **복사**
- **권한**: `calendar.readonly`
- **양방향 동기화**: ❌

### 옵션 B: 양방향 동기화
- **장점**: Todal에서 수정 → 구글 캘린더 반영
- **동작**: 실시간 양방향 동기화
- **권한**: `calendar` (쓰기 권한)
- **양방향 동기화**: ✅
- **복잡도**: 높음 (충돌 처리 필요)

### 추천: 옵션 A (읽기 전용)
구글 캘린더는 "참조용"으로만 사용하고, Todal에서 별도 관리하는 것이 더 깔끔합니다.

---

## 4. 구현 단계별 가이드

### Step 1: OAuth 스코프 추가
```typescript
// lib/auth/actions.ts 또는 로그인 컴포넌트
export async function signInWithGoogleCalendar() {
  const supabase = createClient()

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      scopes: 'https://www.googleapis.com/auth/calendar.readonly',
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline', // 리프레시 토큰 받기
        prompt: 'consent',
      },
    },
  })

  return { error }
}
```

### Step 2: Access Token 가져오기
```typescript
// lib/google/calendar.ts
export async function getGoogleAccessToken() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  return session?.provider_token // Google Access Token
}
```

### Step 3: 캘린더 이벤트 가져오기
```typescript
export async function syncGoogleCalendar() {
  const accessToken = await getGoogleAccessToken()

  if (!accessToken) {
    throw new Error('Google 로그인이 필요합니다.')
  }

  // 이번 달 이벤트 가져오기
  const startDate = new Date()
  startDate.setDate(1)
  const endDate = new Date()
  endDate.setMonth(endDate.getMonth() + 1)

  const events = await fetchGoogleCalendarEvents(accessToken, startDate, endDate)
  return events
}
```

### Step 4: Supabase에 저장
```typescript
export async function importGoogleEventsToTodos(events: GoogleCalendarEvent[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('로그인이 필요합니다.')

  // 구글 캘린더 전용 카테고리 생성 (없으면)
  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('name', 'Google Calendar')
    .eq('user_id', user.id)
    .single()

  let categoryId = category?.id

  if (!categoryId) {
    const { data: newCategory } = await supabase
      .from('categories')
      .insert({
        user_id: user.id,
        name: 'Google Calendar',
        color: '#4285F4', // 구글 블루
        order: 999,
      })
      .select()
      .single()

    categoryId = newCategory.id
  }

  // 이벤트를 Todo로 변환해서 저장
  const todos = events.items.map(event => convertGoogleEventToTodo(event, categoryId))

  await supabase.from('todos').insert(todos)
}
```

---

## 5. UI 구현

### 헤더에 동기화 버튼 추가
```typescript
// components/calendar/SyncButton.tsx
'use client'

export function GoogleCalendarSyncButton() {
  const [syncing, setSyncing] = useState(false)

  const handleSync = async () => {
    setSyncing(true)
    try {
      const events = await syncGoogleCalendar()
      await importGoogleEventsToTodos(events)
      toast.success('구글 캘린더 동기화 완료!')
    } catch (error) {
      toast.error('동기화 실패: ' + error.message)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <button onClick={handleSync} disabled={syncing}>
      {syncing ? '동기화 중...' : '📅 캘린더 동기화'}
    </button>
  )
}
```

---

## 6. 고급 기능

### 자동 동기화
```typescript
// 1시간마다 자동 동기화
useEffect(() => {
  const interval = setInterval(() => {
    syncGoogleCalendar()
  }, 60 * 60 * 1000)

  return () => clearInterval(interval)
}, [])
```

### 선택적 캘린더 동기화
- 사용자가 여러 캘린더 중 선택해서 동기화
- 특정 캘린더만 가져오기

### 중복 방지
- 이미 가져온 이벤트는 스킵
- `google_event_id` 필드로 중복 체크

---

## 7. 제한사항

### Google Calendar API Quotas
- **일일 한도**: 1,000,000 requests/day (충분함)
- **100초당**: 100 requests
- **사용자당 100초**: 100 requests

### Supabase Provider Token
- Google 로그인 시 `provider_token`에 Access Token 저장됨
- 만료 시간: 1시간 (자동 갱신 필요)

---

## 8. 구현 우선순위

### Phase 1 (기본) - 추천
- ✅ Google OAuth 로그인 (이미 완료)
- ⬜ 캘린더 읽기 권한 추가
- ⬜ 수동 동기화 버튼
- ⬜ 이벤트 → Todo 변환
- ⬜ "Google Calendar" 카테고리에 저장

### Phase 2 (고급)
- ⬜ 자동 동기화 (1시간마다)
- ⬜ 마지막 동기화 시간 표시
- ⬜ 선택적 캘린더 동기화
- ⬜ 중복 방지

### Phase 3 (프로)
- ⬜ 양방향 동기화
- ⬜ 실시간 동기화
- ⬜ Webhook 연동

---

## 구현 시작할까요?

지금 바로 구현을 시작할 수 있습니다!

1. **기본 구현** (30분)
   - OAuth 스코프 추가
   - 동기화 함수 구현
   - UI 버튼 추가

2. **테스트** (10분)
   - 구글 로그인
   - 캘린더 권한 승인
   - 동기화 버튼 클릭

구현해드릴까요? 🚀
