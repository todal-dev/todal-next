# 🔧 인프라 & 설정 문서

Todal의 백엔드 인프라 및 외부 서비스 설정 가이드입니다.

---

## 📑 문서 목록

### **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Supabase 셋업 가이드
- Supabase 프로젝트 생성
- API Keys 설정
- Prisma 연결
- Auth 설정 (이메일, Google OAuth)
- Row Level Security (RLS) 설정
- Realtime 설정
- Storage 설정
- 트러블슈팅

**언제 읽나요?**
- Supabase 처음 셋업
- Auth 문제 발생
- RLS 정책 설정
- 데이터베이스 연결

---

## 🚀 빠른 시작

### 1️⃣ Supabase 프로젝트 생성
```bash
# https://supabase.com 방문 후 프로젝트 생성
# API Keys 복사 (anon key, service role key)
```

### 2️⃣ 환경변수 설정
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
DATABASE_URL=...
```

### 3️⃣ Prisma 마이그레이션
```bash
pnpm prisma migrate dev --name init
```

---

## 📚 다른 서비스 연동

### Google Calendar API
- [기획서의 구글 동기화 섹션](../planning/PRODUCT_SPEC.md)
- [Phase 1-4 기능 명세](../features/phase-1/04-google-sync.md)

### OpenAI API (Phase 4)
- [제품 기획서의 AI 섹션](../planning/PRODUCT_SPEC.md)
- [ROADMAP의 Phase 4](../planning/ROADMAP.md)

---

## 🔗 빠른 링크

| 링크 | 설명 |
| --- | --- |
| [←전체 문서](../README.md) | docs 폴더로 돌아가기 |
| [01-기획](../01-planning/) | 제품 기획 및 로드맵 |
| [02-설계](../02-design/) | UI/UX 설계 |
| [03-개발](../03-development/) | 개발 가이드 및 아키텍처 |
| [05-기능](../05-features/) | 기능 명세 |

---

**Last Updated**: 2025-10-17
