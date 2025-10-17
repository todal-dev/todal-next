# API 문서

Todal의 API 엔드포인트 명세입니다.

## 🌐 Base URL

- **Production**: `https://todal.vercel.app`
- **Development**: `http://localhost:3000`

## 🔐 인증

Todal은 **NextAuth.js**를 사용합니다.

### 인증 방식

- **Session-based** (쿠키)
- Server Actions: 자동 인증
- API Routes: `getServerSession()` 사용

### 인증 헤더

```
Cookie: next-auth.session-token=xxxxx
```

## 📚 API 카테고리

### [인증 API](./authentication.md)

- 로그인
- 회원가입
- 로그아웃
- 세션 확인

### [할일 API](./todos.md)

- `GET /api/todos` - 할일 목록 조회
- `POST /api/todos` - 할일 생성
- `PUT /api/todos/:id` - 할일 수정
- `DELETE /api/todos/:id` - 할일 삭제

### [캘린더 API](./calendar.md)

- `GET /api/schedules` - 일정 목록 조회
- `POST /api/schedules` - 일정 생성
- `PUT /api/schedules/:id` - 일정 수정
- `DELETE /api/schedules/:id` - 일정 삭제

### [루틴 API](./routines.md)

- `GET /api/routines` - 루틴 목록 조회
- `POST /api/routines` - 루틴 생성
- `PUT /api/routines/:id` - 루틴 수정
- `DELETE /api/routines/:id` - 루틴 삭제

### [구글 연동](./google-sync.md)

- `GET /api/google/auth` - OAuth 인증
- `POST /api/google/sync` - 수동 동기화

### [Webhooks](./webhooks.md)

- `POST /api/webhooks/google-calendar` - 구글 캘린더 변경 알림

## 📋 공통 응답 형식

### 성공 응답

```json
{
  "success": true,
  "data": {
    // 응답 데이터
  }
}
```

### 에러 응답

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 메시지"
  }
}
```

## 🚨 에러 코드

| 코드 | 설명 |
| --- | --- |
| 400 | Bad Request - 잘못된 요청 |
| 401 | Unauthorized - 인증 필요 |
| 403 | Forbidden - 권한 없음 |
| 404 | Not Found - 리소스 없음 |
| 409 | Conflict - 충돌 (중복 등) |
| 500 | Internal Server Error - 서버 에러 |

## 📝 Server Actions

Next.js Server Actions는 별도의 REST API 없이 서버 함수를 직접 호출합니다.

```typescript
// app/actions/todo-actions.ts
'use server'

export async function createTodo(data: CreateTodoInput) {
  // ...
}
```

```typescript
// Client Component
import { createTodo } from '@/app/actions/todo-actions'

const handleSubmit = async () => {
  const result = await createTodo({ title: '새 할일' })
}
```

## 🔄 Rate Limiting

- **API Routes**: 분당 60회 (Phase 2+)
- **Server Actions**: 제한 없음 (인증된 사용자)

## 📊 Pagination

목록 조회 API는 pagination을 지원합니다.

### 요청

```
GET /api/todos?page=1&limit=20
```

### 응답

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

---

**Last Updated**: 2025-10-17

