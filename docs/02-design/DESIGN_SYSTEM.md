# 디자인 시스템

> Todal의 모든 UI/UX 기준을 정의하는 디자인 시스템

---

## 🎨 디자인 철학

**"Clean & Minimal Productivity"**

- 불필요한 요소 제거 (미니멀)
- 명확한 기능성 우선
- 깨끗하고 세련된 여백 활용
- 한눈에 읽히는 구조
- 모노톤 중심, 포인트 색상은 최소한으로

---

## 🎯 핵심 UI/UX 원칙

| 원칙 | 내용 | 구현 방법 |
| --- | --- | --- |
| **미니멀리즘** | 불필요한 것 제거 | 화려한 색상/그림자 최소화 |
| **명확성** | 역할이 명백하게** | 시각적 계층 강화 |
| **여백** | 숨 쉬는 공간 | 넉넉한 마진/패딩 |
| **일관성** | 반복되는 패턴 | 제한된 색상, 단순한 아이콘 |
| **기능성** | 형태는 기능을 따름 | 보여주기 위한 디자인 X |

---

## 🎨 컬러 시스템

### Primary Color - Soft Green (최소 사용)

```
Primary            #2D9F6B    주요 액션만 (CTA, 완료)
Primary Light      #E8F5EE    호버 배경 (거의 사용 안 함)
Primary Dark       #1F7A51    액티브 (거의 사용 안 함)
```

**사용처:**
- CTA 버튼 (최소 1-2개)
- 완료 상태 표시
- 텍스트 링크 (선택)

### Neutral Colors - 주요 팔레트

```
White              #FFFFFF    메인 배경
Gray 50            #FAFAFA    미묘한 배경 구분 (거의 안 함)
Gray 200           #E5E7EB    테두리, 구분선 (thin 1px)
Gray 400           #9CA3AF    보조 텍스트
Gray 600           #4B5563    기본 텍스트 (Charcoal 대체)
Gray 900           #111827    주요 텍스트 (거의 검정)
```

**원칙:**
- 모노톤 중심 (회색 계열만)
- 명확한 대비 (흰색 배경 + 어두운 텍스트)
- 미묘한 경계선 (thin 1px borders)

### Status Colors - 기능적만

```
Success:    #2D9F6B    완료 (Primary와 동일)
Warning:    #F59E0B    미완료 (Amber - 주황)
Error:      #DC2626    기한 초과 (Red)
```

**원칙:** 최소 3가지만 사용

---

## 📝 타이포그래피

### 폰트 선택

**Pretendard Variable**
- 네이버에서 개발한 한글 최적화 폰트
- 가독성 우수
- 웹 폰트로 최적화됨

### 텍스트 스타일 (간소화)

| 요소 | 폰트 | 크기 | 굵기 | 줄높이 | 용도 |
| --- | --- | --- | --- | --- | --- |
| **Heading 1** | Pretendard | 28px | 600 SemiBold | 140% | 페이지 제목 |
| **Heading 2** | Pretendard | 20px | 600 SemiBold | 140% | 섹션 제목 |
| **Body** | Pretendard | 15px | 400 Regular | 150% | 본문, 할일 텍스트 |
| **Body Small** | Pretendard | 14px | 400 Regular | 150% | 작은 텍스트 |
| **Caption** | Pretendard | 13px | 400 Regular | 150% | 보조 정보 |

**원칙:**
- Font Weight 최소화 (400, 600만 사용)
- 크기 차이로 계층 표현
- 굵기가 아닌 크기로 우선순위 표현

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
```

**원칙:** 기본값은 넉넉하게 (12px↑)

### Container & Panel 규격

| 요소 | 규격 | 설명 |
| --- | --- | --- |
| **Container Max** | 1440px | 최대 너비 |
| **Left Panel** | 360px 고정 | 할일 영역 |
| **Right Panel** | Flex 1 | 캘린더 영역 |
| **Divider** | 1px, #E5E7EB | 미묘한 구분선 |
| **Card Padding** | 16px | 기본 패딩 |
| **Row Height** | 40px | 표준 높이 |

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
md: 8px      → 기본 (버튼, 입력 필드)
full: 9999px → 원형 (아바타)
```

**원칙:** 큰 Radius는 사용 안 함 (8px 이하만)

---

## 🌙 그림자 & 깊이

**최소화 원칙:**

```
Subtle (거의 사용 안 함)
  0 1px 2px rgba(0, 0, 0, 0.05)

Hover/Focus (선택적)
  0 2px 4px rgba(0, 0, 0, 0.08)
```

**사용처:**
- 드롭다운 (필요시만)
- 모달 (필요시만)
- 거의 사용하지 않음

---

## 🎯 아이콘 시스템

### 아이콘 라이브러리

**Lucide Icons**
- 깔끔하고 일관성 있는 디자인
- Stroke 기반 (fill 아님)
- 최소한의 세부 사항

### 아이콘 크기

| 사용처 | 크기 |
| --- | --- |
| 헤더 아이콘 | 20px |
| 버튼 아이콘 | 18px |
| 인라인 아이콘 | 16px |
| 배지 아이콘 | 12px |

### 아이콘 색상

```
Default     #4B5563 (Gray 400)
Active      #2D9F6B (Primary) - 매우 선택적
Disabled    #E5E7EB (Gray 200)
```

---

## 📱 반응형 디자인 전략

### Desktop (1440px+)

```
┌──────────────────────────────────────┐
│ Header                               │
├──────────────┬──────────────────────┤
│   Todo       │                      │
│   (360px)    │  Calendar            │
│              │  (Flex)              │
└──────────────┴──────────────────────┘
```

### Tablet (640px - 1024px)

```
┌────────────────────────────┐
│ Header                     │
├────────────────────────────┤
│ Tab Menu (Todo / Calendar) │
├────────────────────────────┤
│ Content                    │
│ (동적 변경)                │
└────────────────────────────┘
```

### Mobile (< 640px)

```
┌──────────────┐
│ Header       │
├──────────────┤
│ Tab Menu     │
├──────────────┤
│ Content      │
│              │
└──────────────┘
```

---

## ✅ 접근성 고려사항

### 색상 대비 (WCAG AA 기준)

- 텍스트 vs 배경: 최소 4.5:1
- Gray 600 (#4B5563) on White: 8.1:1 ✅
- Primary (#2D9F6B) on White: 3.8:1 ⚠️ (텍스트용 X)

### 터치 타겟 크기

- 최소: 44x44px (모바일)
- 권장: 48x48px (데스크톱)

### 키보드 네비게이션

- Tab으로 이동 가능한 모든 요소
- Focus 상태: 2px solid Primary 아웃라인
- 시각적 Focus indicator 필수

---

**Last Updated**: 2025-10-20
