# 🎨 설계 (Design) 문서

Todal의 UI/UX 디자인 시스템 및 워크플로우 가이드입니다.

---

## 📑 핵심 문서

### **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** - 디자인 시스템 (필수 읽음)
- 디자인 철학 및 UI/UX 원칙
- **컬러 시스템**: Primary (Forest Green), Secondary, Neutral, Status
- **타이포그래피**: Pretendard 기반 텍스트 스타일
- **스페이싱**: 4px 그리드 기반 레이아웃 규격
- **셰이프 & 보더**: Border Radius 규격
- **아이콘 시스템**: Lucide Icons 활용
- **반응형 디자인**: Desktop, Tablet, Mobile 전략
- **접근성**: 색상 대비, 터치 타겟, 키보드 네비게이션

**언제 읽나요?**
- UI 컴포넌트 구현 전 (필수)
- 디자인 토큰을 CSS/Tailwind로 변환할 때
- 색상, 폰트, 간격 규격 확인

---

### **[COMPONENTS.md](./COMPONENTS.md)** - UI 컴포넌트 스타일 가이드
- **기본 컴포넌트**: Button, Input, Checkbox, Label
- **복합 컴포넌트**: TodoItem, CalendarEvent, Header, Panel
- 상태별 스타일 (Default, Hover, Active, Disabled, Focus)
- 반응형 동작 (Desktop, Tablet, Mobile)
- 각 컴포넌트의 정확한 CSS 값

**언제 읽나요?**
- 각 UI 컴포넌트 구현 시
- 호버, 포커스 등 상태 정의 필요할 때
- CSS 클래스 및 Tailwind 값 확인

---

### **[INTERACTIONS.md](./INTERACTIONS.md)** - 인터랙션 & 애니메이션
- **애니메이션 원칙**: 목적성, 일관성, 성능
- **타이밍 값**: Duration (100ms-300ms), Easing (ease, ease-out 등)
- **마우스/터치 인터랙션**: Hover, Click, Press 상태
- **주요 인터랙션**: 드래그, 드롭, 모달, 토스트 등
- **상태 전환**: 미완료→완료, 로딩, 에러 등
- **접근성**: prefers-reduced-motion 대응
- **모바일**: 터치 피드백

**언제 읽나요?**
- CSS transition/animation 작성 시
- 드래그앤드롭 인터랙션 구현 시
- 사용자 피드백 추가할 때

---

### **[DESIGN_WORKFLOW.md](./DESIGN_WORKFLOW.md)** - 디자인 → 개발 워크플로우
- Figma 디자인 프로세스
- 디자인-개발 전체 단계별 가이드
- 각 단계의 체크리스트
- 효율적인 개발 프롬프트 예시
- 디자인 QA 및 검증 방법

**언제 읽나요?**
- 새로운 기능/화면 개발 시작 시
- 디자인과 개발의 싱크 맞을 때
- 피그마 디자인 활용 방법

---

## 🔗 빠른 링크

| 링크 | 설명 |
| --- | --- |
| [←전체 문서](../README.md) | docs 폴더로 돌아가기 |
| [01-기획](../01-planning/) | 제품 기획 및 로드맵 |
| [03-개발](../03-development/) | 개발 가이드 및 아키텍처 |
| [04-인프라](../04-infrastructure/) | 외부 서비스 설정 |
| [05-기능](../05-features/) | 기능 명세 |

---

**Last Updated**: 2025-10-17

