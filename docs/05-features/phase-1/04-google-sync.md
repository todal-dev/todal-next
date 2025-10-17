# Phase 1-4: 구글 캘린더 동기화 (Google Calendar Sync)

> **Phase**: 1 (MVP)  
> **카테고리**: 구글 캘린더  
> **우선순위**: 🔴 필수  
> **주차**: Week 5 (5주차)

---

## 📋 기능 개요

Google Calendar API를 통한 양방향 동기화로, Todal의 일정과 구글 캘린더의 일정을 자동으로 동기화합니다.

### 핵심 특징

1. **양방향 동기화**: Todal ↔ Google 실시간 동기화
2. **색상 매핑**: 구글 캘린더 색상 → Todal 라벨 연결
3. **OAuth 인증**: 구글 계정으로 안전한 연결
4. **자동 반영**: 변경사항 자동으로 반영

---

## 🎯 사용자 시나리오

### 시나리오 1: 구글 캘린더 연결
```
1. 설정 → "구글 캘린더 연결" 버튼 클릭
2. 구글 로그인 팝업
3. "Todal에 캘린더 접근 권한 부여" 동의
4. 성공 메시지 → 초기 동기화 시작
5. 구글 캘린더의 모든 일정 불러오기
```

### 시나리오 2: Todal에서 일정 생성 → 구글에 반영
```
1. Todal에서 "회의" 일정 생성 (월요일 10:00)
2. 자동으로 구글 캘린더에도 추가
3. 색상 매핑: Todal "프로젝트"(🔵) → 구글 "구글 블루"
4. googleEventId 저장 (동기화 추적용)
```

### 시나리오 3: 구글 캘린더에서 일정 수정 → Todal에 반영
```
1. 구글 캘린더에서 "회의" 시간을 10:00 → 14:00으로 변경
2. Webhook 또는 Polling으로 감지
3. Todal의 일정도 자동으로 14:00으로 업데이트
4. 필요시 좌측 할일도 업데이트
```

### 시나리오 4: 색상 매핑 설정
```
1. 설정 → "색상 매핑" 
2. Todal 카테고리와 구글 색상 연결
   - "일" (초록) ← → Google 초록
   - "프로젝트" (파랑) ← → Google 파랑
   - "개인" (주황) ← → Google 주황
3. 저장 → 새 일정부터 적용
```

---

## 🗄️ 데이터 모델

### GoogleAuth 테이블 추가

```prisma
model GoogleAuth {
  id           String  @id @default(cuid())
  userId       String  @unique
  user         User    @relation(fields: [userId], references: [id])
  
  accessToken  String
  refreshToken String
  expiresAt    DateTime
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Schedule {
  // ... 기존 필드
  googleEventId String?  // Google Calendar Event ID
}

model ColorMapping {
  id        String  @id @default(cuid())
  userId    String
  user      User    @relation(fields: [userId], references: [id])
  
  categoryId   String
  googleColor String  // Google Calendar color name
  
  createdAt DateTime @default(now())
}
```

### Google Calendar API 색상 맵핑

```typescript
const GOOGLE_COLORS = {
  '1': '#a4bdfc',  // Peacock
  '2': '#7ae7bf',  // Sage
  '3': '#51b749',  // Banana
  '4': '#fbd75b',  // Tangerine
  '5': '#ffb878',  // Flamingo
  '6': '#ff887c',  // Tomato
  '7': '#dc2743',  // Cherry
  '8': '#e1a1c1',  // Lavender
  '9': '#33b679',  // Graphite
  '10': '#8f03b3', // Blueberry
  '11': '#3f51b5', // Basil
}
```

---

## 💻 구현 세부사항

### Google OAuth 설정

```typescript
// lib/auth.ts
import { google } from 'googleapis'

export const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

export const googleAuth = google.auth.getAuthClient({
  scopes: [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.readonly',
  ],
})
```

### 동기화 로직

```typescript
// lib/google-calendar.ts

export async function syncGoogleCalendar(userId: string): Promise<void> {
  const googleAuth = await prisma.googleAuth.findUnique({ where: { userId } })
  if (!googleAuth) return

  // 1. 액세스 토큰 갱신
  const tokens = await oauth2Client.refreshAccessToken({
    refresh_token: googleAuth.refreshToken,
  })
  oauth2Client.setCredentials(tokens.credentials)

  // 2. 구글 캘린더에서 이벤트 가져오기
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    maxResults: 100,
  })

  // 3. Todal 일정과 동기화
  for (const event of response.data.items || []) {
    const existingSchedule = await prisma.schedule.findUnique({
      where: { googleEventId: event.id },
    })

    if (existingSchedule) {
      // 업데이트
      await prisma.schedule.update({
        where: { id: existingSchedule.id },
        data: {
          title: event.summary,
          startTime: new Date(event.start.dateTime),
          endTime: new Date(event.end.dateTime),
        },
      })
    } else {
      // 생성
      await prisma.schedule.create({
        data: {
          userId,
          title: event.summary,
          startTime: new Date(event.start.dateTime),
          endTime: new Date(event.end.dateTime),
          googleEventId: event.id,
        },
      })
    }
  }
}
```

### Todal → Google 푸시

```typescript
export async function pushScheduleToGoogle(
  scheduleId: string
): Promise<void> {
  const schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId },
  })
  
  const googleAuth = await prisma.googleAuth.findUnique({
    where: { userId: schedule.userId },
  })

  oauth2Client.setCredentials({
    access_token: googleAuth.accessToken,
  })

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

  if (schedule.googleEventId) {
    // 업데이트
    await calendar.events.update({
      calendarId: 'primary',
      eventId: schedule.googleEventId,
      requestBody: {
        summary: schedule.title,
        start: { dateTime: schedule.startTime.toISOString() },
        end: { dateTime: schedule.endTime.toISOString() },
      },
    })
  } else {
    // 생성
    const event = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: schedule.title,
        start: { dateTime: schedule.startTime.toISOString() },
        end: { dateTime: schedule.endTime.toISOString() },
      },
    })

    // googleEventId 저장
    await prisma.schedule.update({
      where: { id: scheduleId },
      data: { googleEventId: event.data.id },
    })
  }
}
```

### Webhook 설정 (푸시 알림)

```typescript
// app/api/google/webhook/route.ts
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const headerToken = req.headers.get('x-goog-channel-token')
  const resourceId = req.headers.get('x-goog-resource-id')

  // 1. 토큰 검증
  if (headerToken !== process.env.GOOGLE_WEBHOOK_TOKEN) {
    return new Response('Unauthorized', { status: 401 })
  }

  // 2. 사용자 찾기 (resourceId로 매핑)
  const sync = await prisma.googleSync.findUnique({
    where: { resourceId },
  })

  if (sync) {
    // 3. 동기화 실행
    await syncGoogleCalendar(sync.userId)
  }

  return new Response(null, { status: 204 })
}
```

### 색상 매핑 서버 액션

```typescript
// app/actions/google-actions.ts
'use server'

export async function updateColorMapping(
  userId: string,
  categoryId: string,
  googleColor: string
): Promise<void> {
  await prisma.colorMapping.upsert({
    where: { userId_categoryId: { userId, categoryId } },
    update: { googleColor },
    create: { userId, categoryId, googleColor },
  })
}

export async function getColorMapping(
  userId: string
): Promise<Map<string, string>> {
  const mappings = await prisma.colorMapping.findMany({
    where: { userId },
  })

  return new Map(mappings.map(m => [m.categoryId, m.googleColor]))
}
```

---

## ✅ 완료 기준

- [ ] Google OAuth 설정 완료
- [ ] GoogleAuth 모델 저장 가능
- [ ] Todal → Google 동기화 (푸시)
- [ ] Google → Todal 동기화 (풀 또는 Webhook)
- [ ] 색상 매핑 설정 UI
- [ ] googleEventId 추적
- [ ] 액세스 토큰 자동 갱신
- [ ] 동기화 오류 처리
- [ ] 양방향 일정 동기화 테스트
- [ ] 충돌 감지 및 해결

---

## 📌 연관 기능

- **Week 4**: [캘린더 통합](./03-calendar-integration.md) (선행 완료)

---

**Last Updated**: 2025-10-17
