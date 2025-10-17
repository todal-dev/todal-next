# Todal

> **투두(Todo) + 캘린더(Calendar)** = 개인 성장 통합 관리 플랫폼

Todal은 할일 관리와 시간 시각화를 하나로 통합한 생산성 앱입니다. 노션의 직관적인 할일 관리와 구글 캘린더의 강력한 시간 배치 기능을 결합하여, 당신의 성장을 추적하고 최적화합니다.

## 🎯 핵심 가치

```
할일 관리 + 시간 시각화 + 성장 트래킹
```

- **좌측**: 할일 풀 (노션 스타일 계층 구조)
- **우측**: 타임라인 캘린더 (구글 캘린더 양방향 연동)
- **드래그앤드롭**: 자연스러운 일정화

## ✨ 주요 기능

### Phase 1 (MVP) - 현재 개발 중
- ✅ **Todomate 스타일 할일 관리**: 체크박스 + 인라인 입력, Enter로 빠른 추가
- ✅ **노션식 계층 구조**: Tab/Shift+Tab으로 들여쓰기, 드래그로 순서 변경
- ✅ **색상 라벨 시스템**: 카테고리별 색상 구분
- ✅ **드래그앤드롭 캘린더**: 할일을 캘린더로 드래그하여 일정화
- ✅ **시간 조정**: 드래그로 일정 시간 늘림/줄임
- ✅ **구글 캘린더 연동**: 양방향 실시간 동기화
- ✅ **루틴 자동화**: 매일 반복되는 루틴 자동 생성
- ✅ **미완료 알림**: 자정에 어제 미완료 항목 알림

### Phase 2 - 성장 트래킹
- 📊 카테고리별 시간 분배 통계
- 📈 루틴 달성률 히트맵
- 🎯 목표 설정 및 달성률 추적
- 📅 월간 리포트 자동 생성

### Phase 3 - 플랫폼 확장
- 💻 Electron 데스크톱 앱 (반투명 위젯 모드)
- 📱 모바일 웹/앱 (빠른 체크, 간단 추가)

### Phase 4 - AI 코칭
- 🤖 AI 패턴 분석 및 생산성 진단
- 💬 AI 채팅 코칭 (개선 상담)
- ⚡ 스마트 스케줄링 (최적 시간 제안)

### Phase 5 - 소셜
- 👥 친구와 함께 성장 (통계 공유, 응원)
- 🏆 챌린지 시스템
- 🔒 프라이버시 세부 설정

## 🎨 디자인 철학

**"Calm & Trustworthy Productivity"**

- 차분하고 신뢰감 있는 색상 (Forest Green #2D9F6B)
- 토스/네이버 스타일의 깔끔한 UI
- 장시간 사용해도 눈이 편한 디자인
- 최소 클릭으로 빠른 작업 흐름

## 🚀 기술 스택

- **Framework**: Next.js 15 (App Router)
- **React**: React 19
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma 5+
- **Auth**: Supabase Auth
- **Realtime**: Supabase Realtime
- **Storage**: Supabase Storage
- **State**: Zustand + TanStack Query
- **Drag & Drop**: dnd-kit
- **Calendar**: react-big-calendar
- **Deploy**: Vercel

## 📦 설치 및 실행 (Phase 1 이후 업데이트 예정)

```powershell
# 저장소 클론
git clone https://github.com/yourusername/todal.git
cd todal

# 의존성 설치
pnpm install

# Supabase 프로젝트 생성 및 연결
# SUPABASE_SETUP.md 문서 참고

# 환경 변수 설정
# .env.local 파일을 생성하고 Supabase 키 입력

# 데이터베이스 마이그레이션
pnpm prisma migrate dev

# 개발 서버 실행
pnpm dev
```

브라우저에서 `http://localhost:3000`을 열어 확인하세요.

## 📚 문서

### 핵심 문서
- [제품 기획서](./docs/PRODUCT_SPEC.md) - 상세 기능 명세 및 UI/UX 가이드
- [개발 가이드](./docs/DEVELOPMENT.md) - 기술 스택 및 개발 환경 설정
- [아키텍처](./docs/ARCHITECTURE.md) - 시스템 설계 및 데이터 구조
- [워크플로우](./docs/WORKFLOW.md) - 개발 프로세스 및 Git 전략
- [로드맵](./docs/ROADMAP.md) - Phase별 개발 계획

### 설정 가이드
- [Supabase 설정](./docs/SUPABASE_SETUP.md) - Supabase 프로젝트 생성 및 연결

### 상세 문서
- [기능 명세](./docs/features/) - 각 기능별 상세 문서
- [디자인 시스템](./docs/design/) - UI/UX 가이드라인
- [API 문서](./docs/api/) - API 엔드포인트 명세

📁 [전체 문서 보기](./docs/)

## 🗂️ 프로젝트 구조 (예정)

```
todal/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 페이지
│   ├── (main)/            # 메인 앱
│   ├── api/               # API Routes
│   └── actions/           # Server Actions
├── components/            # React 컴포넌트
├── lib/                   # 유틸리티 & 설정
├── hooks/                 # React Hooks
├── stores/                # Zustand 스토어
├── prisma/                # 데이터베이스 스키마
└── docs/                  # 상세 문서
```

## 💡 왜 Todal인가?

| 기존 서비스 | 문제점 | Todal의 해결책 |
|------------|--------|---------------|
| **노션** | 시간 시각화 부족 | 캘린더 연동으로 시간 배치 직관화 |
| **구글 캘린더** | 할일 관리 약함 | 할일 풀에서 일정으로 자연스러운 전환 |
| **Todoist** | 시간 배치 약함 | 드래그앤드롭으로 쉬운 시간 배치 |
| **Notion Calendar** | 성장 트래킹 부족 | 루틴 자동화 + AI 코칭 + 대시보드 |

## 🎯 개발 현황

### 현재 상태: 기획 단계
- [x] 제품 기획 완료
- [ ] 디자인 시스템 구축
- [ ] MVP 개발 (Phase 1)
- [ ] 베타 테스트
- [ ] 정식 출시

## 📝 라이선스

이 프로젝트는 개인 개발 프로젝트입니다.

## 👨‍💻 개발자

1인 개발 프로젝트

---

**Last Updated**: 2025-10-17

