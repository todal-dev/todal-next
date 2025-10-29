# 🔧 인프라 & 배포 가이드

> Todal의 인프라 구성, Supabase 설정, 배포 가이드

---

## 🏗️ 인프라 스택

### Hosting & Deployment
- **Vercel**: 프론트엔드 호스팅
- 자동 배포 (Git Push → 자동 빌드 & 배포)
- 무료 SSL/HTTPS

### Database & Backend
- **Supabase**: PostgreSQL 데이터베이스
- Supabase Auth: 인증 시스템
- Supabase Realtime: 실시간 구독
- Supabase Storage: 파일 저장소 (Phase 2+)

### External APIs
- **Google Calendar API**: 캘린더 동기화
- **공휴일 API**: 한국 공휴일 데이터

---

## 🚀 Supabase 설정

### 1. 프로젝트 생성

1. [Supabase](https://supabase.com) 접속
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - **Name**: `todal`
   - **Database Password**: 강력한 비밀번호 (저장!)
   - **Region**: `Northeast Asia (Seoul)`
   - **Plan**: Free Tier

### 2. API Keys 복사

**Settings → API**에서:
```
Project URL:              https://xxxxx.supabase.co
anon public key:          eyJhbG...
service_role key:         eyJhbG... (서버 전용)
```

### 3. 환경 변수 설정

**로컬 개발** (`.env.local`):
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Google Calendar (선택)
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

**Vercel 환경 변수**:
1. Vercel Dashboard → Project Settings → Environment Variables
2. 위 환경 변수들을 모두 추가
3. Environment: Production, Preview, Development 모두 선택

---

## 🗄️ 데이터베이스 마이그레이션

### 1. SQL 파일로 마이그레이션

**supabase/migrations/20250101000000_initial_schema.sql**:
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories 테이블
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, name)
);

CREATE INDEX idx_categories_user_id ON categories(user_id);

-- Todos 테이블
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES todos(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  date DATE NOT NULL,
  start_time TEXT,
  end_time TEXT,
  recurrence_rule JSONB,
  completed_dates TEXT[],
  skipped_dates TEXT[],
  google_event_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_category_id ON todos(category_id);
CREATE INDEX idx_todos_date ON todos(date);
CREATE INDEX idx_todos_parent_id ON todos(parent_id);

-- RLS 활성화
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Categories RLS 정책
CREATE POLICY "Users can view own categories"
  ON categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  USING (auth.uid() = user_id);

-- Todos RLS 정책
CREATE POLICY "Users can view own todos"
  ON todos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own todos"
  ON todos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own todos"
  ON todos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own todos"
  ON todos FOR DELETE
  USING (auth.uid() = user_id);

-- Updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_todos_updated_at
  BEFORE UPDATE ON todos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 2. Supabase Dashboard에서 실행

1. Supabase Dashboard → SQL Editor
2. 위 SQL 파일 내용 붙여넣기
3. Run 클릭

---

## 🔐 Supabase Auth 설정

### 이메일 인증 설정

**Settings → Authentication → Email Templates**:
- Confirm signup: 이메일 인증 템플릿 커스터마이징
- Invite user: 초대 이메일 템플릿
- Magic link: 마법 링크 로그인

### Redirect URLs

**Settings → Authentication → URL Configuration**:
```
Site URL: https://todal.vercel.app (프로덕션)

Redirect URLs:
- http://localhost:3000/auth/callback (로컬)
- https://todal.vercel.app/auth/callback (프로덕션)
- https://*.vercel.app/auth/callback (프리뷰)
```

---

## 🔗 Google Calendar API 설정

### 1. Google Cloud Console 설정

1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 새 프로젝트 생성: "Todal"
3. APIs & Services → Enable APIs → Google Calendar API 활성화

### 2. OAuth 클라이언트 생성

**APIs & Services → Credentials → Create Credentials → OAuth client ID**:
- Application type: Web application
- Name: Todal Web
- Authorized redirect URIs:
  ```
  http://localhost:3000/auth/google/callback
  https://todal.vercel.app/auth/google/callback
  ```

### 3. 환경 변수 추가

```bash
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

---

## 📦 Vercel 배포

### 1. GitHub 연동

1. GitHub에 프로젝트 Push
2. [Vercel](https://vercel.com) 접속
3. "Import Project" → GitHub 저장소 선택

### 2. 빌드 설정

**Build & Development Settings**:
```
Framework Preset:      Next.js
Build Command:         next build
Output Directory:      .next
Install Command:       npm install
```

### 3. 환경 변수 설정

**Environment Variables**에 추가:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
```

### 4. 배포

- "Deploy" 클릭
- 자동 빌드 & 배포 시작
- 완료 후 도메인 할당: `https://todal.vercel.app`

---

## 🔄 CI/CD 파이프라인

### 자동 배포 플로우

```
Git Push to main
    ↓
GitHub Webhook → Vercel
    ↓
Vercel Build (next build)
    ↓
TypeScript Check
    ↓
Lint Check
    ↓
Build Success?
    ↓ Yes
Deploy to Production
    ↓
Live: https://todal.vercel.app
```

### 브랜치별 배포

- `main` → Production (https://todal.vercel.app)
- `dev` → Preview (https://todal-dev.vercel.app)
- Feature branches → Temporary preview URLs

---

## 📊 모니터링

### Vercel Analytics

**자동 제공**:
- Page Views
- Unique Visitors
- 페이지 로드 시간
- Web Vitals (LCP, FID, CLS)

### Supabase Dashboard

**확인 가능**:
- Database Size
- Active Connections
- Query Performance
- API Requests
- Storage Usage

---

## 🐛 트러블슈팅

### 1. Supabase 연결 오류

**증상**: "Failed to fetch from Supabase"

**해결**:
```bash
# 환경 변수 확인
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# .env.local 파일 확인
cat .env.local

# Supabase 프로젝트 상태 확인 (Dashboard)
```

### 2. RLS 정책으로 데이터 조회 안됨

**증상**: "SELECT 쿼리 결과가 비어있음"

**해결**:
```sql
-- Supabase SQL Editor에서 RLS 정책 확인
SELECT * FROM categories WHERE user_id = 'your-user-id';

-- RLS 비활성화 (테스트용)
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
```

### 3. Vercel 빌드 실패

**증상**: "Build failed: Type error"

**해결**:
```bash
# 로컬에서 빌드 테스트
npm run build

# TypeScript 오류 확인
npm run lint

# node_modules 재설치
rm -rf node_modules package-lock.json
npm install
```

---

## 🔒 보안 체크리스트

### 배포 전 확인

- [ ] `.env.local` 파일이 `.gitignore`에 포함되어 있는지
- [ ] Supabase RLS 정책이 올바르게 설정되어 있는지
- [ ] API Keys가 환경 변수로 관리되는지 (코드에 하드코딩 X)
- [ ] HTTPS 사용 중인지 (Vercel 자동 제공)
- [ ] CORS 설정이 올바른지

### 주기적 확인

- [ ] Supabase 사용량 모니터링 (Free Tier 제한)
- [ ] Vercel 배포 상태 확인
- [ ] 보안 업데이트 적용 (npm outdated)

---

## 📈 확장 전략

### Phase 1 → Phase 2

**예상 트래픽**:
- 사용자: 100명
- Daily Active Users: 50명
- API Requests: ~10,000/day

**현재 스택으로 충분** (Supabase Free + Vercel Hobby)

### Phase 3+ (스케일업)

**유료 플랜 고려**:
- Supabase Pro: $25/month (더 많은 DB 용량, 실시간 연결)
- Vercel Pro: $20/month (더 빠른 빌드, 분석)

**최적화**:
- CDN 캐싱 활용
- 이미지 최적화 (Next.js Image)
- Database 인덱싱
- Supabase Edge Functions (서버리스)

---

## 📚 유용한 링크

- [Supabase 문서](https://supabase.com/docs)
- [Vercel 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [Google Calendar API Docs](https://developers.google.com/calendar)

---

**Last Updated**: 2025-10-29


