# 🎨 디자인 가이드

> Todal의 모든 UI/UX 디자인 원칙과 스타일 가이드

---

## 🎯 디자인 철학

**"Clean, Minimal & Functional"**

- **깔끔함**: 불필요한 요소 제거, 여백 활용
- **미니멀**: 모노톤 중심, 포인트 컬러 최소화
- **기능성**: 모든 디자인은 기능을 위해 존재

---

## 🎨 컬러 시스템

### Primary Color

```
Primary Green     #2D9F6B    주요 액션 (CTA, 완료 상태)
Primary Light     #E8F5EE    호버 배경
Primary Dark      #1F7A51    액티브 상태
```

**사용처**: 완료 체크박스, 주요 버튼, 강조 텍스트

### Neutral Colors (주요 팔레트)

```
White             #FFFFFF    메인 배경
Gray 50           #FAFAFA    서브 배경
Gray 100          #F5F5F5    구분 영역
Gray 200          #E5E7EB    테두리, 구분선
Gray 400          #9CA3AF    보조 텍스트
Gray 600          #4B5563    기본 텍스트
Gray 900          #111827    주요 텍스트
```

### Category Colors (10가지 프리셋)

```
Blue      #3B82F6    파란색
Green     #10B981    초록색
Yellow    #F59E0B    노란색
Red       #EF4444    빨간색
Purple    #8B5CF6    보라색
Pink      #EC4899    분홍색
Indigo    #6366F1    남색
Teal      #14B8A6    청록색
Orange    #F97316    주황색
Cyan      #06B6D4    하늘색
```

### Status Colors

```
Success    #10B981    완료 상태
Warning    #F59E0B    경고 (미완료)
Error      #EF4444    오류 (기한 초과)
Info       #3B82F6    정보
```

---

## 📝 타이포그래피

### 폰트
**Pretendard Variable** - 한글 최적화, 가독성 우수

### 텍스트 스타일

| 타입 | 크기 | 굵기 | 용도 |
|------|------|------|------|
| **H1** | 24px | 600 SemiBold | 페이지 타이틀 |
| **H2** | 20px | 600 SemiBold | 섹션 제목 |
| **H3** | 18px | 600 SemiBold | 카드 제목 |
| **Body** | 15px | 400 Regular | 본문, 할일 텍스트 |
| **Body Small** | 14px | 400 Regular | 작은 텍스트 |
| **Caption** | 13px | 400 Regular | 보조 정보, 시간 표시 |
| **Label** | 12px | 500 Medium | 태그, 라벨 |

---

## 📐 스페이싱 & 레이아웃

### Spacing Scale (4px 기준)

```
xs:  4px
sm:  8px
md:  12px
lg:  16px
xl:  20px
2xl: 24px
3xl: 32px
```

### 레이아웃 규격

```
Container Max Width:  1440px
Left Panel (할일):    360px 고정
Right Panel (캘린더): Flex 1 (나머지)
Header Height:        48px
Divider:              1px
```

### Border Radius

```
xs:   4px     작은 요소 (체크박스)
sm:   6px     중간 요소 (태그)
md:   8px     기본 (버튼, 카드)
lg:   12px    큰 요소
full: 9999px  원형 (아바타)
```

---

## 🎨 컴포넌트 스타일

### 1. 할일 아이템

```
높이:      40px
패딩:      12px 16px
배경:      White
호버:      Gray 50
테두리:    없음
완료 시:   텍스트 Gray 400, 취소선
```

### 2. 캘린더 블록

```
패딩:      12px
보더:      2px solid (카테고리 색상)
배경:      카테고리 색상 10% 투명도
Radius:    6px
완료 시:   투명도 50% + 초록 오버레이
```

### 3. 카테고리 태그

```
높이:      24px
패딩:      4px 12px
배경:      카테고리 색상
텍스트:    White
Radius:    12px (pill 형태)
```

### 4. 버튼

| 타입 | 배경 | 텍스트 | 테두리 |
|------|------|--------|--------|
| **Primary** | Primary Green | White | 없음 |
| **Secondary** | Gray 100 | Gray 900 | Gray 200 |
| **Ghost** | Transparent | Gray 600 | 없음 |
| **Danger** | Red | White | 없음 |

```
높이:     40px
패딩:     12px 20px
Radius:   8px
호버:     살짝 어두워짐
액티브:   더 어두워짐
```

### 5. 입력 필드

```
높이:          40px
패딩:          12px 16px
테두리:        1px solid Gray 200
Focus:         2px solid Primary Green
Radius:        8px
Placeholder:   Gray 400
```

### 6. 체크박스

```
크기:      20x20px
Radius:    4px
테두리:    1px solid Gray 300
체크 시:   배경 Primary Green, 체크 아이콘 White
```

---

## 🎭 아이콘 시스템

### 아이콘 라이브러리
**Lucide Icons** - 깔끔한 Stroke 기반 아이콘

### 크기

```
Large:  24px    헤더 아이콘
Medium: 20px    버튼 아이콘
Small:  16px    인라인 아이콘
Tiny:   12px    배지 아이콘
```

### 색상

```
Default:   Gray 600
Active:    Primary Green
Disabled:  Gray 300
```

---

## ✨ 애니메이션

### 트랜지션

```
빠름:     150ms ease
기본:     200ms ease
느림:     300ms ease-in-out
```

### 주요 애니메이션

| 액션 | 효과 | 시간 |
|------|------|------|
| **호버** | 배경색 변화 | 150ms |
| **드래그 시작** | 그림자 증가 | 200ms |
| **완료 체크** | 체크 애니메이션 | 300ms |
| **페이지 전환** | 페이드 인 | 200ms |

---

## 📱 반응형 디자인

### Breakpoints

```
Mobile:   < 640px
Tablet:   640px - 1024px
Desktop:  > 1024px
```

### 레이아웃 변화

**Desktop (1024px+)**
```
┌─────────────────────────────┐
│ Header                      │
├──────────┬──────────────────┤
│ Todo     │                  │
│ (360px)  │  Calendar        │
│          │  (Flex)          │
└──────────┴──────────────────┘
```

**Tablet (640px - 1024px)**
```
┌─────────────────────┐
│ Header              │
├─────────────────────┤
│ Tab: Todo/Calendar  │
├─────────────────────┤
│ Content             │
└─────────────────────┘
```

**Mobile (< 640px)**
```
┌───────────┐
│ Header    │
├───────────┤
│ Bottom Nav│
├───────────┤
│ Content   │
└───────────┘
```

---

## ♿ 접근성

### 색상 대비
- 텍스트 vs 배경: 최소 4.5:1 (WCAG AA)
- Gray 900 on White: 16.7:1 ✅
- Gray 600 on White: 8.1:1 ✅

### 터치 타겟
- 최소: 44x44px (모바일)
- 권장: 48x48px

### 키보드 네비게이션
- Tab으로 모든 요소 접근 가능
- Focus 시 2px Primary Green 아웃라인
- Enter/Space로 액션 실행

---

## 🎨 다크 모드 (Phase 2+)

```
배경:        #1F2937 (Gray 800)
카드 배경:   #374151 (Gray 700)
텍스트:      #F9FAFB (Gray 50)
테두리:      #4B5563 (Gray 600)
Primary:     #34D399 (Green 400) - 더 밝게
```

---

**Last Updated**: 2025-10-29


