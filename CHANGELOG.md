# Changelog

이 파일은 Todal 프로젝트의 모든 주목할 만한 변경사항을 기록합니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 따르며,
이 프로젝트는 [Semantic Versioning](https://semver.org/lang/ko/)을 준수합니다.

## [Unreleased]

### 진행 중
- 프로젝트 기획 및 문서화

## [0.0.1] - 2025-10-17

### Added
- 프로젝트 초기 설정
- 기획 문서 작성
  - README.md
  - PRODUCT_SPEC.md
  - DEVELOPMENT.md
  - ARCHITECTURE.md
  - WORKFLOW.md
  - ROADMAP.md
  - SUPABASE_SETUP.md
- docs 폴더 구조 생성
  - features/
  - design/
  - api/
- Supabase 통합 설정
  - lib/supabase/ 폴더 (client, server, middleware)
  - 환경변수 설정 가이드
- 문서 구조 재정리
  - 모든 핵심 문서를 docs/ 폴더로 이동
  - docs/README.md를 문서 인덱스로 개편
  - 루트에는 README.md와 CHANGELOG.md만 유지

### Changed
- 데이터베이스: Vercel Postgres → Supabase
- 인증: NextAuth.js → Supabase Auth
- 실시간: Pusher → Supabase Realtime
- 스토리지: Vercel Blob → Supabase Storage
- 문서 구조: 루트 MD 파일들 → docs/ 폴더로 이동

---

## 템플릿

```markdown
## [버전] - YYYY-MM-DD

### Added
- 새로운 기능

### Changed
- 기존 기능 변경

### Deprecated
- 곧 제거될 기능

### Removed
- 제거된 기능

### Fixed
- 버그 수정

### Security
- 보안 관련 변경
```

---

**[Unreleased]**: https://github.com/yourusername/todal/compare/v0.0.1...HEAD
**[0.0.1]**: https://github.com/yourusername/todal/releases/tag/v0.0.1

