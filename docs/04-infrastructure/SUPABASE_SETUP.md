# Supabase 설정 가이드

Todal 프로젝트의 Supabase 설정 단계별 가이드입니다.

---

## 1. Supabase 프로젝트 생성

### 1-1. 회원가입 및 프로젝트 생성

1. [Supabase](https://supabase.com) 접속
2. 회원가입 또는 로그인
3. "New Project" 클릭
4. 프로젝트 정보 입력
   - **Name**: `todal`
   - **Database Password**: 강력한 비밀번호 (저장 필수!)
   - **Region**: `Northeast Asia (Seoul)` (한국 사용자용)
   - **Pricing Plan**: Free (시작용)

### 1-2. API Keys 복사

프로젝트가 생성되면:

1. Settings → API 메뉴 이동
2. 다음 값들을 복사:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbG...` (공개 키)
   - **service_role key**: `eyJhbG...` (비밀 키, 서버 전용)

---

## 2. 환경변수 설정

### 2-1. 로컬 개발 (.env.local)

프로젝트 루트에 `.env.local` 파일 생성:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Database (Supabase PostgreSQL)
# Settings → Database → Connection string → URI 복사
DATABASE_URL="postgresql://postgres.xxxxx:password@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres"

# Google OAuth (나중에 설정)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

### 2-2. Vercel 환경변수

Vercel 대시보드에서:

1. Project Settings → Environment Variables
2. 위의 환경변수들을 모두 추가
3. Environment: Production, Preview, Development 모두 선택

---

## 3. 데이터베이스 설정

### 3-1. Prisma 연결

```powershell
# Prisma 초기화
pnpm prisma init

# schema.prisma 파일이 생성됨
```

### 3-2. Prisma 스키마 작성

`prisma/schema.prisma` 파일 참고 (ARCHITECTURE.md 문서 참조)

### 3-3. 마이그레이션

```powershell
# 마이그레이션 생성 및 실행
pnpm prisma migrate dev --name init

# Prisma Studio로 확인
pnpm prisma studio
```

---

## 4. Supabase Auth 설정

### 4-1. 이메일 인증 설정

1. Supabase Dashboard → Authentication → Settings
2. **Site URL**: `http://localhost:3000` (개발용)
3. **Redirect URLs**: 추가
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.com/auth/callback` (프로덕션)

### 4-2. Google OAuth 설정 (선택)

1. [Google Cloud Console](https://console.cloud.google.com)에서 OAuth 클라이언트 생성
2. Redirect URI 추가:
   - `https://your-project-id.supabase.co/auth/v1/callback`
3. Client ID와 Client Secret 복사
4. Supabase Dashboard → Authentication → Providers → Google
   - Client ID, Client Secret 입력
   - 저장

---

## 5. Row Level Security (RLS) 설정

### 5-1. RLS 활성화

Supabase는 기본적으로 RLS가 활성화되어 있습니다. 각 테이블에 대한 정책을 설정해야 합니다.

### 5-2. 정책 예시 (todos 테이블)

```sql
-- 사용자는 자신의 할일만 조회 가능
CREATE POLICY "Users can view own todos"
  ON todos FOR SELECT
  USING (auth.uid() = user_id);

-- 사용자는 자신의 할일만 생성 가능
CREATE POLICY "Users can insert own todos"
  ON todos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 할일만 수정 가능
CREATE POLICY "Users can update own todos"
  ON todos FOR UPDATE
  USING (auth.uid() = user_id);

-- 사용자는 자신의 할일만 삭제 가능
CREATE POLICY "Users can delete own todos"
  ON todos FOR DELETE
  USING (auth.uid() = user_id);
```

Supabase Dashboard → Database → 테이블 선택 → RLS 탭에서 설정 가능

---

## 6. Realtime 설정 (Phase 5)

### 6-1. Realtime 활성화

1. Supabase Dashboard → Database → Replication
2. 실시간으로 구독할 테이블 선택
   - `todos`
   - `schedules`
   - `activities` (Phase 5)

### 6-2. 클라이언트에서 구독

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// 할일 변경사항 실시간 구독
const channel = supabase
  .channel('todos-changes')
  .on(
    'postgres_changes',
    {
      event: '*', // INSERT, UPDATE, DELETE
      schema: 'public',
      table: 'todos',
      filter: `user_id=eq.${userId}`,
    },
    (payload) => {
      console.log('Todo changed:', payload)
      // React Query 캐시 업데이트
    }
  )
  .subscribe()
```

---

## 7. Storage 설정 (Phase 2+)

### 7-1. 버킷 생성

1. Supabase Dashboard → Storage
2. "New Bucket" 클릭
3. Bucket 설정:
   - **Name**: `avatars`
   - **Public**: Yes (프로필 이미지용)

### 7-2. Storage 정책

```sql
-- 사용자는 자신의 아바타만 업로드 가능
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 누구나 아바타 조회 가능 (public bucket)
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');
```

---

## 8. 개발 환경 확인

### 8-1. Supabase 연결 테스트

```typescript
// app/test/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function TestPage() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .limit(5)
  
  if (error) {
    return <div>Error: {error.message}</div>
  }
  
  return (
    <div>
      <h1>Supabase 연결 성공!</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
```

### 8-2. 로컬 개발 서버 실행

```powershell
pnpm dev
```

브라우저에서 `http://localhost:3000/test` 접속하여 확인

---

## 9. Supabase CLI (선택, 고급)

### 9-1. CLI 설치

```powershell
# Windows (scoop 사용)
scoop install supabase

# 또는 npm
npm install -g supabase
```

### 9-2. 로컬 Supabase 실행

```powershell
# Docker Desktop 실행 필요
supabase init
supabase start

# 로컬 Supabase Studio: http://localhost:54323
```

### 9-3. 마이그레이션 관리

```powershell
# 원격 DB에서 스키마 가져오기
supabase db pull

# 로컬 변경사항 원격에 적용
supabase db push
```

---

## 10. 유용한 링크

- [Supabase Dashboard](https://app.supabase.com)
- [Supabase 문서](https://supabase.com/docs)
- [Supabase Next.js 가이드](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Prisma + Supabase 가이드](https://www.prisma.io/docs/guides/database/supabase)

---

## 11. 트러블슈팅

### 문제 1: DATABASE_URL 연결 안됨

**해결**: 
- Connection Pooling URL 사용 (Transaction mode)
- Settings → Database → Connection string → URI 복사

### 문제 2: Auth 쿠키가 설정 안됨

**해결**:
- `middleware.ts` 파일 확인
- Supabase SSR 패키지 버전 확인

### 문제 3: RLS 정책으로 데이터 조회 안됨

**해결**:
- Supabase Dashboard에서 RLS 정책 확인
- Service Role Key 사용 시 RLS 우회 가능 (서버 전용)

---

**Last Updated**: 2025-10-17

