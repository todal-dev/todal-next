# Todal 개발 워크플로우

> 1인 개발 최적화된 Git 전략, 개발 프로세스, 배포 가이드

---

## 🌿 Git 브랜치 전략

### 1인 개발 최적화 전략

복잡한 Git Flow 대신 **간소화된 브랜치 전략** 사용

```
main (production)
  ├── dev (개발)
  │   ├── feature/todo-list
  │   ├── feature/calendar-view
  │   └── feature/google-sync
  └── hotfix/critical-bug (긴급 수정)
```

### 브랜치 설명

| 브랜치 | 용도 | 배포 | 보호 |
| --- | --- | --- | --- |
| **main** | 프로덕션 환경 | Vercel Production | ✅ Protected |
| **dev** | 개발/테스트 환경 | Vercel Preview | ❌ |
| **feature/** | 새 기능 개발 | 로컬 | ❌ |
| **hotfix/** | 긴급 버그 수정 | main 직행 | ❌ |

### 브랜치 네이밍

```bash
# 기능 개발
feature/할일-관리
feature/드래그앤드롭
feature/구글-연동

# 버그 수정
fix/체크박스-버그
fix/캘린더-렌더링

# 긴급 수정
hotfix/보안-취약점

# 리팩토링
refactor/컴포넌트-구조

# 문서
docs/API-문서-추가
```

---

## 🔄 개발 프로세스

### Phase별 개발 흐름

```
[기획] → [설계] → [개발] → [테스트] → [배포] → [피드백]
   ↑                                              │
   └──────────────────────────────────────────────┘
```

### 1. 기능 개발 프로세스

#### Step 1: 이슈 생성 (선택)

```markdown
# GitHub Issue Template

## 📋 기능 설명
캘린더에서 드래그앤드롭으로 할일을 배치할 수 있어야 함

## 🎯 목표
- [ ] dnd-kit 설치 및 설정
- [ ] 할일 리스트에 Draggable 적용
- [ ] 캘린더에 Droppable 적용
- [ ] 드래그 종료 시 Schedule 생성

## 📐 디자인
- 드래그 중 반투명 표시
- 드롭 가능 영역 하이라이트

## ✅ 완료 조건
- 할일을 캘린더로 드래그 가능
- 일정이 DB에 저장됨
- 좌우 상태 동기화
```

#### Step 2: 브랜치 생성

```powershell
# dev에서 최신 코드 가져오기
git checkout dev
git pull origin dev

# 새 기능 브랜치 생성
git checkout -b feature/캘린더-드래그앤드롭
```

#### Step 3: 개발

```powershell
# 작은 단위로 커밋
git add .
git commit -m "feat: dnd-kit 설치 및 기본 설정"

git add .
git commit -m "feat: TodoItem에 Draggable 적용"

git add .
git commit -m "feat: CalendarView에 Droppable 적용"

git add .
git commit -m "feat: 드래그 종료 핸들러 구현"
```

#### Step 4: dev에 병합

```powershell
# dev로 이동
git checkout dev

# 기능 브랜치 병합
git merge feature/캘린더-드래그앤드롭

# 원격에 푸시
git push origin dev
```

#### Step 5: 테스트 (Vercel Preview)

- Vercel이 자동으로 Preview 배포 생성
- Preview URL에서 기능 테스트
- 문제 없으면 main으로 병합

#### Step 6: 프로덕션 배포

```powershell
# main으로 이동
git checkout main

# dev 병합 (또는 PR)
git merge dev

# 태그 추가 (선택)
git tag -a v0.1.0 -m "Phase 1 MVP 완료"

# 푸시
git push origin main --tags
```

---

## 📝 커밋 컨벤션

### Conventional Commits 사용

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 종류

| Type | 설명 | 예시 |
| --- | --- | --- |
| **feat** | 새 기능 | `feat: 할일 드래그앤드롭 구현` |
| **fix** | 버그 수정 | `fix: 체크박스 클릭 안되는 버그 수정` |
| **docs** | 문서 수정 | `docs: README에 설치 가이드 추가` |
| **style** | 코드 포맷팅 (기능 변경 X) | `style: Prettier 적용` |
| **refactor** | 리팩토링 | `refactor: TodoItem 컴포넌트 분리` |
| **perf** | 성능 개선 | `perf: 캘린더 렌더링 최적화` |
| **test** | 테스트 추가/수정 | `test: TodoList 유닛 테스트 추가` |
| **chore** | 빌드/설정 변경 | `chore: Prisma 스키마 업데이트` |

### 예시

```bash
# 기본
git commit -m "feat: 구글 캘린더 동기화 기능 추가"

# Scope 포함
git commit -m "feat(calendar): 주간/월간 뷰 전환 기능"

# Body 포함
git commit -m "fix: 드래그앤드롭 후 상태 동기화 버그

useOptimistic 훅을 사용하여 즉시 UI 업데이트 후
서버 액션으로 실제 데이터 변경"

# Breaking Change
git commit -m "feat!: API 응답 구조 변경

BREAKING CHANGE: /api/todos 응답에서 category 필드가
categoryId로 변경됨"
```

---

## 🚀 배포 전략

### Vercel 자동 배포

```
┌─────────────┐
│  Git Push   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Vercel    │
│   감지      │
└──────┬──────┘
       │
       ├─► main 브랜치 → Production 배포
       │   └─► https://todal.vercel.app
       │
       └─► dev 브랜치 → Preview 배포
           └─► https://todal-dev-xxx.vercel.app
```

### 환경별 설정

| 환경 | 브랜치 | URL | 데이터베이스 |
| --- | --- | --- | --- |
| **Production** | main | todal.vercel.app | Production DB |
| **Preview** | dev | todal-dev-*.vercel.app | Preview DB |
| **Local** | - | localhost:3000 | Local DB |

### 배포 체크리스트

#### 개발 (dev) 배포 전

- [ ] 로컬에서 정상 작동 확인
- [ ] TypeScript 에러 없음
- [ ] ESLint 경고 최소화
- [ ] 커밋 메시지 명확하게 작성

#### 프로덕션 (main) 배포 전

- [ ] Preview 환경에서 충분히 테스트
- [ ] 브라우저 콘솔 에러 없음
- [ ] 주요 기능 수동 테스트 완료
- [ ] 데이터베이스 마이그레이션 확인
- [ ] 환경변수 설정 확인
- [ ] 버전 태그 추가 (선택)

---

## 🗓️ 일일 개발 루틴

### 아침 (개발 시작)

```powershell
# 1. 최신 코드 동기화
git checkout dev
git pull origin dev

# 2. 의존성 업데이트 확인
pnpm install

# 3. 데이터베이스 마이그레이션 확인
pnpm prisma migrate dev

# 4. 개발 서버 실행
pnpm dev
```

### 저녁 (개발 종료)

```powershell
# 1. 변경사항 커밋
git add .
git commit -m "feat: 오늘 작업 내용"

# 2. 원격에 백업
git push origin feature/현재-작업

# 3. 진행상황 문서화 (선택)
# CHANGELOG.md 또는 개인 노트에 기록
```

---

## 📊 프로젝트 관리

### 1인 개발 Task 관리

#### 방법 1: GitHub Projects (권장)

```
📋 Todal Board

┌──────────────┬──────────────┬──────────────┬──────────────┐
│   Backlog    │   To Do      │  In Progress │     Done     │
├──────────────┼──────────────┼──────────────┼──────────────┤
│ AI 코칭      │ 구글 연동    │ 드래그앤드롭 │ 할일 CRUD    │
│ 소셜 기능    │ 루틴 자동화  │              │ 기본 레이아웃│
│              │              │              │ Prisma 설정  │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

#### 방법 2: Markdown TODO (간단)

```markdown
# Phase 1 진행상황

## Week 1-2 ✅
- [x] Next.js 프로젝트 셋업
- [x] Prisma 스키마 설계
- [x] 기본 레이아웃 구성

## Week 3-4 🚧
- [x] 할일 CRUD
- [ ] 드래그앤드롭 (진행 중)
- [ ] 캘린더 뷰

## Week 5-6 📅
- [ ] 구글 OAuth
- [ ] 캘린더 동기화
- [ ] 루틴 자동화
```

---

## 🐛 버그 수정 프로세스

### 일반 버그

```powershell
# 1. dev에서 버그 수정 브랜치 생성
git checkout dev
git checkout -b fix/체크박스-버그

# 2. 수정 및 커밋
git commit -m "fix: 체크박스 클릭 안되는 버그 수정"

# 3. dev에 병합
git checkout dev
git merge fix/체크박스-버그
git push origin dev
```

### 긴급 버그 (Hotfix)

```powershell
# 1. main에서 직접 hotfix 브랜치 생성
git checkout main
git checkout -b hotfix/보안-취약점

# 2. 수정 및 커밋
git commit -m "fix!: XSS 취약점 긴급 수정"

# 3. main에 병합
git checkout main
git merge hotfix/보안-취약점
git tag -a v0.1.1 -m "긴급 보안 패치"
git push origin main --tags

# 4. dev에도 반영
git checkout dev
git merge hotfix/보안-취약점
git push origin dev
```

---

## 📐 코드 리뷰 (자기 점검)

### 코드 작성 후 체크리스트

#### 기능성
- [ ] 요구사항을 모두 충족하는가?
- [ ] 엣지 케이스를 고려했는가?
- [ ] 에러 처리가 적절한가?

#### 코드 품질
- [ ] 변수명이 명확한가?
- [ ] 함수가 한 가지 일만 하는가?
- [ ] 중복 코드가 없는가?
- [ ] 주석이 필요한 복잡한 로직이 있는가?

#### 성능
- [ ] 불필요한 리렌더가 없는가?
- [ ] 메모이제이션이 필요한 부분은?
- [ ] API 호출이 최소화되었는가?

#### 보안
- [ ] 사용자 입력을 검증하는가?
- [ ] 인증/인가가 적절한가?
- [ ] 민감한 정보가 노출되지 않는가?

#### 접근성
- [ ] 키보드로 조작 가능한가?
- [ ] ARIA 라벨이 있는가?
- [ ] 색상 대비가 적절한가?

---

## 🔄 데이터베이스 마이그레이션

### 스키마 변경 시

```powershell
# 1. schema.prisma 수정

# 2. 마이그레이션 생성
pnpm prisma migrate dev --name add_memo_field

# 3. 마이그레이션 파일 확인
# prisma/migrations/20251017_add_memo_field/migration.sql

# 4. Git에 커밋
git add prisma/
git commit -m "chore: Todo에 memo 필드 추가"

# 5. 배포 시 자동 실행
# Vercel이 빌드 시 자동으로 마이그레이션 실행
```

### 데이터 마이그레이션 (데이터 변환)

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 예: 기존 할일들에 기본 카테고리 할당
  const defaultCategory = await prisma.category.create({
    data: {
      name: '기본',
      color: '#2D9F6B',
      userId: 'system'
    }
  })

  await prisma.todo.updateMany({
    where: { categoryId: null },
    data: { categoryId: defaultCategory.id }
  })
}

main()
```

```powershell
# Seed 실행
pnpm prisma db seed
```

---

## 📦 버전 관리

### Semantic Versioning

```
v{MAJOR}.{MINOR}.{PATCH}

예: v0.1.0 → v0.2.0 → v1.0.0
```

| 버전 | 의미 | 예시 |
| --- | --- | --- |
| **MAJOR** | 호환성 깨지는 변경 | API 구조 변경 |
| **MINOR** | 기능 추가 (호환 가능) | Phase 2 기능 추가 |
| **PATCH** | 버그 수정 | 오타 수정, 버그 패치 |

### Phase별 버전

```
v0.1.0 - Phase 1 MVP
v0.2.0 - Phase 2 대시보드
v0.3.0 - Phase 3 플랫폼 확장
v0.4.0 - Phase 4 AI 기능
v1.0.0 - Phase 5 소셜 기능 (정식 출시)
```

### 태그 생성

```powershell
# 태그 생성
git tag -a v0.1.0 -m "Phase 1 MVP 완료"

# 원격에 푸시
git push origin v0.1.0

# 모든 태그 푸시
git push origin --tags
```

---

## 📚 문서 관리

### 문서 업데이트 타이밍

| 문서 | 업데이트 시점 |
| --- | --- |
| **README.md** | 주요 기능 추가/변경 시 |
| **CHANGELOG.md** | 배포 시마다 |
| **API 문서** | API 변경 시 |
| **컴포넌트 문서** | 새 컴포넌트 추가 시 |

### CHANGELOG.md 작성

```markdown
# Changelog

## [0.1.0] - 2025-10-20

### Added
- 할일 CRUD 기능
- 드래그앤드롭 캘린더
- 구글 캘린더 연동
- 루틴 자동 생성

### Fixed
- 체크박스 클릭 버그 수정
- 드래그 시 깜빡임 문제 해결

### Changed
- API 응답 구조 개선

## [0.0.1] - 2025-10-17

### Added
- 초기 프로젝트 셋업
```

---

## 🛠️ 유용한 PowerShell 별칭

```powershell
# .bashrc 또는 PowerShell 프로필에 추가

# Git 단축키
function gs { git status }
function ga { git add . }
function gc { git commit -m $args }
function gp { git push }
function gl { git log --oneline --graph --all }

# 개발 단축키
function dev { pnpm dev }
function build { pnpm build }
function studio { pnpm prisma studio }
```

---

**Last Updated**: 2025-10-17

