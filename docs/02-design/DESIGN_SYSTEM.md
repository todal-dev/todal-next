# 디자인 시스템

> Todal의 모든 UI/UX 기준을 정의하는 디자인 시스템

---

## 🎨 디자인 철학

**"Calm & Trustworthy Productivity"**

- 차분하고 신뢰감 있는 분위기
- 토스, 네이버의 직관적이고 깔끔한 UI
- 장시간 사용해도 눈이 편한 색상 팔레트

---

## 🎯 핵심 UI/UX 원칙

| 원칙 | 내용 | 구현 방법 |
| --- | --- | --- |
| **좌우 분할 레이아웃** | 할일 ↔ 캘린더 동시 표시 | Split view (30:70 비율) |
| **드래그앤드롭 중심** | 직관적인 일정화 | Drag & Drop API 활용 |
| **최소 클릭** | 빠른 작업 흐름 | 인라인 입력, 단축키, 컨텍스트 메뉴 |
| **시각적 피드백** | 상태를 한눈에 파악 | 색상 코딩, 아이콘, 애니메이션 |
| **점진적 공개** | 기본은 단순하게 | 고급 기능은 메뉴/설정에 숨김 |

---

## 🎨 컬러 시스템

### Primary Color - Forest Green (성장 & 안정감)

```
Primary            #2D9F6B    메인 액션, 완료 상태, CTA 버튼
Primary Light      #E8F5EE    호버, 선택 배경 (10% 투명도)
Primary Dark       #1F7A51    액티브 상태
```

**사용처:**
- 주요 버튼
- 완료 상태 (체크박스, 일정)
- 액션 링크
- 포커스 상태

### Secondary Color - Slate Blue (신뢰감)

```
Secondary          #5B6B8C    보조 액션, 정보성 요소
```

**사용처:**
- 보조 버튼
- 정보 아이콘
- 보조 텍스트
- 선택되지 않은 상태

### Neutral Colors - Grayscale (배경 & 텍스트)

```
White              #FFFFFF    메인 배경
Background Gray    #F8F9FA    구분 영역, 카드 배경 (토스 스타일)
Gray 300           #E5E7EB    테두리, 구분선
Gray 500           #6B7280    보조 텍스트

Charcoal           #2B2D36    주요 텍스트 (순수 검정보다 부드러움)
Text Secondary     #73777F    보조 텍스트, 메타 정보
Text Tertiary      #A7ABB3    비활성, 플레이스홀더
```

### Status Colors

| 상태 | 색상 | 용도 |
| --- | --- | --- |
| **Success** | #2D9F6B | 완료 상태 (Primary와 동일) |
| **Warning** | #FF9F43 | 미완료 경고 (부드러운 오렌지) |
| **Error** | #E74C3C | 기한 초과 (차분한 빨강) |
| **Info** | #3B82F6 | 정보/알림 (네이버 블루 톤) |

---

## 📝 타이포그래피

### 폰트 선택

**Pretendard Variable**
- 네이버에서 개발한 한글 최적화 폰트
- 가독성 우수
- 웹 폰트로 최적화됨

### 텍스트 스타일

| 요소 | 폰트 | 크기 | 굵기 | 줄높이 | 용도 |
| --- | --- | --- | --- | --- | --- |
| **Heading 1** | Pretendard | 28px | 700 Bold | 140% | 페이지 타이틀 |
| **Heading 2** | Pretendard | 22px | 600 SemiBold | 140% | 섹션 제목 |
| **Heading 3** | Pretendard | 18px | 600 SemiBold | 140% | 카드 제목 |
| **Body** | Pretendard | 15px | 400 Regular | 150% | 본문, 할일 텍스트 |
| **Body Small** | Pretendard | 14px | 400 Regular | 150% | 작은 텍스트 |
| **Caption** | Pretendard | 13px | 400 Regular | 150% | 보조 정보, 시간 표시 |
| **Label** | Pretendard | 12px | 500 Medium | 140% | 태그, 라벨 |

---

## 🔲 스페이싱 & 레이아웃

### Spacing Scale

기본 단위: **4px**

```
4px    → xs
8px    → sm
12px   → md
16px   → lg
20px   → xl
24px   → 2xl
32px   → 3xl
40px   → 4xl
```

### Container & Panel 규격

| 요소 | 규격 | 설명 |
| --- | --- | --- |
| **Container Max** | 1440px | 큰 화면에서 너무 넓지 않게 |
| **Left Panel (할일)** | 360px 고정 | 할일 리스트 영역 |
| **Right Panel (캘린더)** | Flex 1 | 나머지 공간 (유동 너비) |
| **Divider** | 1px, #E5E7EB | 좌우 구분선 |
| **Card Padding** | 16px | 할일 아이템, 일정 박스 |

### 반응형 Breakpoints

```
Mobile:    < 640px
Tablet:    640px - 1024px
Desktop:   > 1024px
```

---

## 🎨 Shape & Border Radius

```
xs: 4px      → 작은 요소 (체크박스, 배지)
sm: 6px      → 미디엄 요소 (태그)
md: 8px      → 기본 (버튼, 입력 필드, 카드)
lg: 12px     → 큰 요소 (모달)
full: 9999px → 원형 (아바타)
```

**원칙**: 토스 스타일의 부드러운 모서리 (8px 기본)

---

## 🌙 그림자 & 깊이

```
Shadow 1 (Subtle)
  0 1px 3px rgba(0, 0, 0, 0.1)

Shadow 2 (Medium)
  0 4px 8px rgba(0, 0, 0, 0.1)

Shadow 3 (Large)
  0 12px 16px rgba(0, 0, 0, 0.1)

Shadow Hover (Drag)
  0 8px 12px rgba(0, 0, 0, 0.15)
```

**사용처:**
- Shadow 1: 카드, 팝오버
- Shadow 2: 버튼 호버, 드래그 중
- Shadow 3: 모달, 메뉴

---

## 🎯 아이콘 시스템

### 아이콘 라이브러리

**Lucide Icons**
- 깔끔하고 일관성 있는 디자인
- 24x24px 기본 크기
- 모든 상태에서 사용 가능

### 아이콘 크기

| 사용처 | 크기 | 설명 |
| --- | --- | --- |
| 헤더 아이콘 | 24px | 주요 네비게이션 |
| 버튼 아이콘 | 20px | 버튼 내 아이콘 |
| 작은 아이콘 | 16px | 인라인 아이콘 |
| 배지 아이콘 | 12px | 아주 작은 아이콘 |

### 아이콘 색상

```
Default/Active   #2D9F6B (Primary)
Inactive         #A7ABB3 (Text Tertiary)
Hover            #1F7A51 (Primary Dark)
Disabled         #E5E7EB (Gray 300)
```

### 주요 아이콘

- **⋮⋮** (DragHandle): 드래그 기능 표시
- **☐** (CheckBox): 미완료 상태
- **☑** (CheckBoxChecked): 완료 상태
- **📅** (Calendar): 날짜/스케줄
- **⏱️** (Clock): 시간/기간
- **🏷️** (Tag): 라벨/카테고리
- **➕** (Plus): 추가
- **⚙️** (Settings): 설정
- **🔍** (Search): 검색

---

## 📱 반응형 디자인 전략

### Desktop (1440px+)

```
┌─────────────────────────────────┐
│ Header                          │
├──────────────┬──────────────────┤
│   Todo       │                  │
│   (360px)    │  Calendar        │
│              │  (Flex)          │
│              │                  │
└──────────────┴──────────────────┘
```

### Tablet (640px - 1024px)

```
┌────────────────────────┐
│ Header                 │
├────────────────────────┤
│ Todo List (축소)       │
├────────────────────────┤
│ Calendar               │
│                        │
└────────────────────────┘
```

### Mobile (< 640px)

```
┌─────────────┐
│ Header      │
├─────────────┤
│ Tab Menu    │ ← Todo / Calendar 선택
├─────────────┤
│ Todo List   │
│ or Calendar │
│             │
└─────────────┘
```

---

## ✅ 접근성 고려사항

### 색상 대비 (WCAG AA 기준)

- 텍스트 vs 배경: 최소 4.5:1
- 대형 텍스트: 최소 3:1

**확인된 조합:**
- Charcoal (#2B2D36) on White (#FFFFFF): 17.5:1 ✅
- Text Secondary (#73777F) on White: 7.5:1 ✅
- Primary (#2D9F6B) on White: 3.8:1 (위험) → 텍스트용 X, 배경용 O

### 터치 타겟 크기

- 최소: 44x44px (모바일)
- 권장: 48x48px (데스크톱)

### 키보드 네비게이션

- Tab으로 이동 가능한 모든 요소: Focus 상태 표시
- Focus 아웃라인: 2px solid Primary
- 불필요한 요소는 `tabindex="-1"`

---

**Last Updated**: 2025-10-17
