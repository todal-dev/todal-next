# Phase 1: MVP 기능 명세

> **Phase 1 (MVP)**: 할일 관리 + 캘린더 통합 기본 앱
> 
> **기간**: 2025.10.17 ~ 2025.11.30 (예정)
> 
> **목표**: "할일을 캘린더로 옮겨 관리할 수 있다"

---

## 📋 Phase 1 기능 목록

### Week 2: 할일 관리
**[🔴 할일 관리 (Todo Management)](./01-todo-management.md)**
- Todomate 스타일 입력
- Enter로 새 할일 생성
- 색상 라벨 시스템
- 인라인 편집
- 체크박스로 완료 처리

### Week 3: 드래그앤드롭
**[🔴 드래그앤드롭 (Drag & Drop)](./02-drag-and-drop.md)**
- dnd-kit 라이브러리 활용
- 드래그 핸들 (⋮⋮) UI
- Tab/Shift+Tab 들여쓰기
- 노션식 계층 구조
- 자동 저장

### Week 4: 캘린더 통합
**[🔴 캘린더 통합 (Calendar Integration)](./03-calendar-integration.md)**
- react-big-calendar 기반
- 주간/월간 뷰
- 할일 → 캘린더 드래그
- 시간 조정
- 좌우 동기화

### Week 5: 구글 캘린더 동기화
**[🔴 구글 동기화 (Google Calendar Sync)](./04-google-sync.md)**
- Google OAuth 인증
- 양방향 동기화
- 색상 매핑
- Webhook 설정
- 토큰 갱신

### Week 6: 루틴 자동화
**[🔴 루틴 자동화 (Routine Automation)](./05-routine-automation.md)**
- Vercel Cron Job
- 매일 자동 생성
- 루틴 on/off 토글
- 자정 알림
- 미완료 항목 일괄 이동

---

## 🎯 개발 순서

```
Week 1: 셋업 (기획 완료)
  ↓
Week 2: 할일 관리 ✓
  ↓
Week 3: 드래그앤드롭
  ↓
Week 4: 캘린더 통합
  ↓
Week 5: 구글 동기화
  ↓
Week 6: 루틴 자동화
  ↓
Phase 1 완료 (v0.1.0)
```

---

## 📊 의존성

```
Week 2: 할일 관리
├─ Week 3: 드래그앤드롭 (할일 필수)
│  └─ Week 4: 캘린더 통합 (할일 + 드래그 필수)
│     └─ Week 5: 구글 동기화 (캘린더 필수)
└─ Week 6: 루틴 자동화 (할일 필수)
```

---

## 🗄️ 데이터베이스 스키마

### 핵심 테이블

- **User**: 사용자 정보
- **Category**: 할일 카테고리 (색상 라벨)
- **Todo**: 할일 (계층 구조 지원)
- **Schedule**: 캘린더 일정
- **Routine**: 반복 루틴
- **RoutineComplete**: 루틴 완료 기록
- **GoogleAuth**: 구글 인증 정보
- **ColorMapping**: 색상 매핑 설정

---

## ✅ Phase 1 완료 체크리스트

- [ ] Week 2: 할일 관리 완료
- [ ] Week 3: 드래그앤드롭 완료
- [ ] Week 4: 캘린더 통합 완료
- [ ] Week 5: 구글 동기화 완료
- [ ] Week 6: 루틴 자동화 완료
- [ ] 통합 테스트
- [ ] 배포 준비
- [ ] v0.1.0 릴리스

---

## 🚀 각 기능별 참고 문서

| 기능 | 주차 | 문서 | 상태 |
| --- | --- | --- | --- |
| 할일 관리 | Week 2 | [📄 01-todo-management.md](./01-todo-management.md) | 📝 작성 완료 |
| 드래그앤드롭 | Week 3 | [📄 02-drag-and-drop.md](./02-drag-and-drop.md) | 📝 작성 완료 |
| 캘린더 통합 | Week 4 | [📄 03-calendar-integration.md](./03-calendar-integration.md) | 📝 작성 완료 |
| 구글 동기화 | Week 5 | [📄 04-google-sync.md](./04-google-sync.md) | 📝 작성 완료 |
| 루틴 자동화 | Week 6 | [📄 05-routine-automation.md](./05-routine-automation.md) | 📝 작성 완료 |

---

**Last Updated**: 2025-10-17
