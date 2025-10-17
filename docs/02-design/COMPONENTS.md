# UI 컴포넌트 스타일 가이드

> Phase 1 MVP에서 사용되는 모든 UI 컴포넌트의 상세 스타일 명세

---

## 📚 목차

1. [기본 컴포넌트](#기본-컴포넌트)
2. [복합 컴포넌트](#복합-컴포넌트)
3. [상태별 스타일](#상태별-스타일)
4. [반응형 동작](#반응형-동작)

---

## 기본 컴포넌트

### 1. 버튼 (Button)

#### Primary Button

```
배경:        #2D9F6B (Primary)
텍스트:      #FFFFFF (White)
패딩:        12px 20px (MD)
Border Radius: 8px
높이:        40px
폰트:        Body / 500 Medium
```

**상태:**
- **Default**: 배경 Primary
- **Hover**: 배경 Primary Dark (#1F7A51)
- **Active**: 배경 Primary Dark + 2px 인셋 그림자
- **Disabled**: 배경 Gray 300, 텍스트 Text Tertiary, Cursor Not-allowed

**상호작용:**
- Transition: all 150ms ease
- 클릭 시: 약간의 스케일 (0.98) 피드백

#### Secondary Button

```
배경:        #F8F9FA (Background Gray)
텍스트:      #2B2D36 (Charcoal)
테두리:      1px solid #E5E7EB (Gray 300)
패딩:        12px 20px
Border Radius: 8px
높이:        40px
```

**상태:**
- **Hover**: 배경 #F0F1F3
- **Active**: 배경 #E8E9EC + 테두리 Primary

#### Ghost Button

```
배경:        투명
텍스트:      #5B6B8C (Secondary)
패딩:        12px 20px
```

**상태:**
- **Hover**: 배경 #F8F9FA
- **Active**: 텍스트 Primary

**크기 변형:**

| 크기 | 패딩 | 높이 | 폰트 |
| --- | --- | --- | --- |
| Small | 8px 12px | 32px | Caption |
| Medium | 12px 20px | 40px | Body |
| Large | 16px 24px | 48px | Body |

---

### 2. 입력 필드 (Input)

```
배경:           #FFFFFF
테두리:         1px solid #E5E7EB
Border Radius:  8px
패딩:           12px 16px
높이:           40px
폰트:           Body
플레이스홀더:   #A7ABB3 (Text Tertiary)
```

**상태:**

| 상태 | 스타일 |
| --- | --- |
| **Default** | 테두리 Gray 300 |
| **Focus** | 테두리 2px Primary + 그림자 0 0 0 3px rgba(45, 159, 107, 0.1) |
| **Hover** | 테두리 Gray 400 |
| **Disabled** | 배경 Background Gray + 텍스트 Text Tertiary |
| **Error** | 테두리 2px Error (#E74C3C) |

**텍스트 입력 시:**
- Transition: border-color 150ms ease

---

### 3. 체크박스 (Checkbox)

```
크기:           20px × 20px
테두리:         2px solid #E5E7EB
Border Radius:  4px
```

**상태:**

| 상태 | 스타일 |
| --- | --- |
| **Unchecked Default** | 테두리 Gray 300 |
| **Unchecked Hover** | 테두리 Gray 400 + 배경 Background Gray |
| **Checked** | 배경 Primary + 테두리 Primary + 흰색 체크마크 |
| **Checked Hover** | 배경 Primary Dark |
| **Disabled** | 테두리 Gray 300 + 배경 Background Gray |

**애니메이션:**
- 체크 시: 150ms ease 스케일 업/다운 + 회전 (0.5x)

---

### 4. 라벨/배지 (Label/Badge)

```
패딩:           4px 12px
Border Radius:  4px
폰트:           Label (12px / 500)
높이:           24px
```

**Color Variants:**

```
Primary:     배경 #E8F5EE, 텍스트 #1F7A51
Secondary:   배경 #F3F4F6, 텍스트 #5B6B8C
Success:     배경 #ECFDF5, 텍스트 #065F46
Warning:     배경 #FEF3C7, 텍스트 #92400E
Error:       배경 #FEE2E2, 텍스트 #991B1B
```

---

## 복합 컴포넌트

### 5. 할일 아이템 (TodoItem)

레이아웃:
```
┌─────────────────────────────────────────────────────┐
│ [ ⋮⋮ ]  [ ☐ ]  할일 텍스트 (인라인 편집)  [🏷️] [⏱️] │
└─────────────────────────────────────────────────────┘
```

#### 스타일 명세

```
높이:              40px
패딩:              12px 16px
배경:              White
테두리:            1px solid transparent (호버 시 Gray 300)
Border Radius:     6px
```

#### 요소별 상세

**드래그 핸들 (⋮⋮)**
```
너비:              24px
아이콘:            #A7ABB3 (Text Tertiary)
호버:              #73777F (Text Secondary)
CursorPointer:     grab
드래그 중:         grabbing + 색상 Primary
```

**체크박스**
```
참고: "3. 체크박스" 참고
호버:              좌측에 드래그 핸들과 함께 표시
```

**텍스트 영역**
```
폰트:              Body / 400
색상:              Charcoal (#2B2D36)
완료 시:           #A7ABB3 + 취소선
들여쓰기:          24px씩 증가 (nesting level)
인라인 편집:       포커스 시 밑줄 추가, 배경 Primary Light 10%
```

**우측 메타 정보 (아이콘들)**
```
크기:              16px
간격:              8px
색상:              #A7ABB3 (기본)
호버:              Primary
```

**호버 상태:**
```
배경:              #F9FAFB
테두리:            1px solid #E5E7EB
드래그 핸들:       표시됨 (기본 시 숨김)
모든 아이콘:       활성화됨
```

**완료 상태:**
```
텍스트:            #A7ABB3 + 취소선
배경:              유지
호버:              여전히 활성화
```

---

### 6. 캘린더 일정 박스 (CalendarEvent)

레이아웃:
```
┌────────────────────────────────┐
│ 일정명             ☐           │ ← 우측 상단 체크박스
│ 10:00 - 11:00                  │
│ [라벨 뱃지]                     │
└────────────────────────────────┘
```

#### 스타일 명세

```
패딩:              12px
테두리:            2px solid (카테고리 색상)
배경:              카테고리 색상 10% 투명도
Border Radius:     6px
박스 섀도우:       0 1px 3px rgba(0,0,0,0.1)
최소 높이:         60px
```

#### 요소별 상세

**제목**
```
폰트:              Body / 500 SemiBold
색상:              Charcoal
마진:              0 0 8px 0
```

**시간 표시**
```
폰트:              Caption / 400
색상:              Text Secondary
마진:              0 0 8px 0
예시:              "10:00 - 11:00" 또는 "10:00 - "
```

**라벨 뱃지**
```
참고:              "4. 라벨/배지" 참고
마진:              4px (우측)
```

**체크박스 (우측 상단)**
```
위치:              absolute top-2 right-2
참고:              "3. 체크박스" 참고
호버:              항상 표시
```

**완료 상태:**
```
체크 ☑:            표시됨
투명도:            50%
배경:              카테고리 색상 10% + Primary 5% 오버레이
텍스트:            취소선 추가 (옵션)
색상:              Text Tertiary
```

**호버 상태:**
```
박스 섀도우:       0 4px 8px rgba(0,0,0,0.1) (Shadow 2)
스케일:            1.02 (약간 커짐)
Transition:        all 150ms ease
```

**드래그 상태:**
```
박스 섀도우:       0 8px 12px rgba(0,0,0,0.15) (Shadow Hover)
투명도:            80%
커서:              grabbing
```

---

### 7. 헤더 (Header) - 최소화 버전

```
높이:              48px
배경:              같음 (페이지와 동일)
테두리:            없음
박스 섀도우:       없음
패딩:              12px 20px
구분선:            1px solid #E5E7EB (하단만, 선택)
```

**레이아웃 (우측 정렬):**
```
┌──────────────────────────────┐
│                   [⚙️] [👤] │
│                  설정  프로필 │
└──────────────────────────────┘
```

**요소:**
- **프로필 버튼**: Ghost 버튼, 20px 아이콘
- **설정 버튼**: Ghost 버튼, 20px 아이콘
- **간격**: 12px
- **호버**: 배경 Background Gray (#F8F9FA)

**간단함 원칙:**
- 로고/제목 X
- 네비게이션 메뉴 X
- 우측에만 버튼 2개
- 페이지 배경과 동일하게 (White or 자동으로 페이지 배경색)

---

### 8. 사이드바/패널 (Sidebar/Panel)

```
너비:              360px (고정) / 100% (모바일)
배경:              White
테두리:            1px solid #E5E7EB (우측)
내부 패딩:         12px
```

---

## 상태별 스타일

### Focus 상태 (포커스 아웃라인)

모든 대화형 요소:
```
아웃라인:          2px solid Primary (#2D9F6B)
아웃라인 오프셋:   2px
```

예외: 입력 필드는 상자 섀도우 사용

### Disabled 상태

```
텍스트 색상:       #A7ABB3 (Text Tertiary)
배경:              #F8F9FA (Background Gray) 또는 유지
테두리:            #E5E7EB (Gray 300)
커서:              not-allowed
투명도:            50% (아이콘에만 적용)
포인터 이벤트:     none
```

### Loading 상태

```
spinner:           Primary 색상 회전
텍스트:            유지 또는 회색으로 변환
대화형성:          비활성화
```

---

## 반응형 동작

### Desktop (1024px+)

- 모든 컴포넌트 풀 크기로 표시
- 호버 상태 활성화
- 드래그앤드롭 활성화

### Tablet (640px - 1024px)

- 패딩 줄임: 12px → 8px
- 폰트 크기 유지
- 터치 타겟 크기 48px 유지
- 호버 상태 비활성화 (tap으로 대체)

### Mobile (< 640px)

- 패딩 축소: 12px → 8px
- 폰트 크기 유지
- 일정 박스 높이 축소
- 메뉴/옵션 토글식으로 변경
- 터치 타겟: 최소 44px × 44px

---

## 📐 그리드 시스템 (예정)

Phase 2에서 구체적인 CSS Grid 시스템 추가 예정

---

**Last Updated**: 2025-10-17
