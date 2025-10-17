# 📚 Todal 문서

Todal 프로젝트의 모든 문서가 여기에 정리되어 있습니다.

---

## 📂 문서 폴더 구조

```
docs/
├── 01-planning/               📋 기획 문서
│   ├── README.md
│   ├── PRODUCT_SPEC.md        # 제품 기획서
│   └── ROADMAP.md             # 개발 로드맵
│
├── 02-design/                 🎨 설계 문서
│   ├── README.md
│   ├── DESIGN_WORKFLOW.md     # 디자인 → 개발 워크플로우
│   ├── QUICK_START_FIGMA.md   # Figma MCP 빠른 시작
│   ├── FIGMA_MCP_SETUP.md     # Figma MCP 상세 설정
│   └── figma-links.md         # Figma 링크 모음
│
├── 03-development/            💻 개발 문서
│   ├── README.md
│   ├── DEVELOPMENT.md         # 기술 스택 & 개발 가이드
│   ├── ARCHITECTURE.md        # 시스템 아키텍처
│   └── WORKFLOW.md            # 개발 워크플로우
│
├── 04-infrastructure/         🔧 인프라 & 설정
│   ├── README.md
│   └── SUPABASE_SETUP.md      # Supabase 설정 가이드
│
├── 05-features/               🎯 기능 명세
│   ├── README.md
│   └── phase-1/
│       ├── README.md
│       ├── 01-todo-management.md
│       ├── 02-drag-and-drop.md
│       ├── 03-calendar-integration.md
│       ├── 04-google-sync.md
│       └── 05-routine-automation.md
│
├── 06-guides/                 📖 가이드 & 튜토리얼
│   └── README.md
│
└── README.md                  # 이 파일
```

---

## 🎯 문서 카테고리별 설명

### 📋 [기획 (01-planning/)](./01-planning/)
제품 기획과 개발 로드맵
- **PRODUCT_SPEC.md**: 제품 개요, 기능 로드맵, 디자인 가이드
- **ROADMAP.md**: Phase별 개발 계획, 마일스톤

**언제 읽나요?** 프로젝트 이해, 기능 우선순위 결정, UI/UX 원칙 확인

---

### 🎨 [설계 (02-design/)](./02-design/)
UI/UX 설계 및 Figma 연동
- **DESIGN_WORKFLOW.md**: Figma → 개발 전체 프로세스
- **QUICK_START_FIGMA.md**: Figma MCP 5분 빠른 시작
- **FIGMA_MCP_SETUP.md**: Figma MCP 상세 설정
- **figma-links.md**: 모든 Figma 링크 중앙 관리

**언제 읽나요?** UI 구현 전, Figma 연동, 디자인 시스템

---

### 💻 [개발 (03-development/)](./03-development/)
개발 환경과 아키텍처
- **DEVELOPMENT.md**: 기술 스택, 폴더 구조, 성능 최적화
- **ARCHITECTURE.md**: 시스템 아키텍처, DB 스키마, ERD
- **WORKFLOW.md**: Git 전략, 커밋 컨벤션, 배포 전략

**언제 읽나요?** 프로젝트 시작, 새 기능 개발, 시스템 설계

---

### 🔧 [인프라 (04-infrastructure/)](./04-infrastructure/)
외부 서비스 연동 및 셋업
- **SUPABASE_SETUP.md**: Supabase 프로젝트 생성, Auth 설정, RLS

**언제 읽나요?** Supabase 처음 셋업, 데이터베이스 연결, Auth 문제

---

### 🎯 [기능 명세 (05-features/)](./05-features/)
각 기능의 상세한 명세서
- **phase-1/**: Phase 1 MVP 기능 (5개 기능)
  - 할일 관리, 드래그앤드롭, 캘린더, 구글 동기화, 루틴 자동화

**언제 읽나요?** 특정 기능 개발 전, 데이터베이스 설계, UI 구현

---

### 📖 [가이드 (06-guides/)](./06-guides/)
단계별 실습 가이드 및 튜토리얼
- 첫 시작 가이드, 개발자 온보딩, 배포 가이드 (작성 예정)

---

## 🚀 상황별 추천 읽기 순서

### 상황 1️⃣: **프로젝트 처음 시작**
```
1. README (이 파일)
2. planning/README.md (기획 폴더 소개)
3. planning/PRODUCT_SPEC.md (제품 전체 이해)
4. development/DEVELOPMENT.md (기술 스택)
5. development/ARCHITECTURE.md (시스템 구조)
```

### 상황 2️⃣: **Phase 1 개발 시작**
```
1. planning/ROADMAP.md (일정 확인)
2. features/README.md (기능 목록)
3. features/phase-1/README.md (Phase 1 전체 개요)
4. features/phase-1/[해당 기능].md (개발 전 꼭 읽기!)
```

### 상황 3️⃣: **특정 기능 개발 (예: 할일 관리)**
```
1. features/phase-1/01-todo-management.md 읽기
   - 📋 기능 개요
   - 🎯 사용자 시나리오
   - 🗄️ 데이터 모델
   - 💻 구현 세부사항
2. development/ARCHITECTURE.md (DB 스키마 확인)
3. 코드 구현 시작
```

### 상황 4️⃣: **UI 구현**
```
1. planning/PRODUCT_SPEC.md (디자인 가이드 섹션)
2. design/README.md (디자인 문서 소개)
3. design/DESIGN_WORKFLOW.md (전체 프로세스)
4. features/phase-1/[기능].md (UI 상태 섹션)
```

### 상황 5️⃣: **배포 준비**
```
1. development/WORKFLOW.md (배포 전략)
2. infrastructure/SUPABASE_SETUP.md (프로덕션 설정)
3. guides/README.md (배포 가이드)
```

---

## 📊 문서 작성 현황

| 카테고리 | 파일 | 상태 |
| --- | --- | --- |
| **planning/** | PRODUCT_SPEC.md | ✅ 완료 |
| | ROADMAP.md | ✅ 완료 |
| **features/** | 5개 Phase 1 명세 | ✅ 완료 |
| **development/** | DEVELOPMENT.md | ✅ 완료 |
| | ARCHITECTURE.md | ✅ 완료 |
| | WORKFLOW.md | ✅ 완료 |
| **design/** | 4개 디자인 문서 | ✅ 완료 |
| **infrastructure/** | SUPABASE_SETUP.md | ✅ 완료 |
| **guides/** | 기본 구조 | 🔜 작성 중 |

---

## 🔗 각 폴더의 README 바로가기

| 폴더 | README | 설명 |
| --- | --- | --- |
| [📋 planning/](./01-planning/README.md) | 기획 문서 인덱스 | 제품 기획 및 로드맵 |
| [🎯 features/](./05-features/README.md) | 기능 명세 인덱스 | Phase별 기능 상세 명세 |
| [💻 development/](./03-development/README.md) | 개발 문서 인덱스 | 기술 스택 및 아키텍처 |
| [🎨 design/](./02-design/README.md) | 설계 문서 인덱스 | UI/UX 및 Figma 가이드 |
| [🔧 infrastructure/](./04-infrastructure/README.md) | 인프라 문서 인덱스 | 외부 서비스 설정 |
| [📖 guides/](./06-guides/README.md) | 가이드 인덱스 | 단계별 실습 가이드 |

---

## 💡 문서 작성 및 유지보수 규칙

### 문서 업데이트 타이밍

| 문서 | 업데이트 시점 |
| --- | --- |
| **PRODUCT_SPEC** | 기획 변경 시 |
| **ROADMAP** | 계획 변경 시 |
| **기능 명세** | 기능 개발 완료 후 |
| **DEVELOPMENT** | 기술 스택 변경 시 |
| **ARCHITECTURE** | 데이터 모델 변경 시 |
| **WORKFLOW** | 개발 프로세스 변경 시 |

### 문서 작성 원칙

1. **명확성**: 누구나 이해할 수 있게
2. **최신성**: 코드와 항상 동기화
3. **예제**: 구체적인 코드 예제 포함
4. **구조화**: 섹션별로 명확히 구분
5. **한글**: 모든 문서는 한글로 작성

---

**Last Updated**: 2025-10-17
