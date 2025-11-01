# Todal Design System

> 미니멀하고 세련된 생산성 도구를 위한 디자인 시스템

---

## 디자인 철학

**"Minimal, Refined & Purposeful"**

Todal은 불필요한 장식을 배제하고 본질에 집중합니다.

- **여백의 미학**: 넓고 통일된 공간감으로 시각적 편안함 제공
- **절제된 색상**: 중립적 톤 중심, 의미 있는 곳에만 색상 사용
- **명확한 계층**: 타이포그래피와 스페이싱으로 정보 우선순위 표현
- **기능 우선**: 모든 디자인 요소는 사용자 경험을 위해 존재

---

## 컬러 시스템

### Accent Color

절제된 액센트 컬러로 중요한 액션에만 사용합니다.

```
Accent               #2B8A5F    주요 액션, 완료 상태
Accent / Light       #E6F4ED    호버 상태, 서브 배경
Accent / Dark        #1F6847    액티브 상태, 눌림
```

### Neutral Palette

미니멀한 디자인의 핵심. 섬세한 그레이 스케일로 깊이를 표현합니다.

```
Neutral / 0          #FFFFFF    캔버스 배경
Neutral / 50         #FAFBFC    서브 배경, 카드
Neutral / 100        #F4F5F7    구분 영역
Neutral / 200        #E8EAED    경계선, 디바이더
Neutral / 300        #D1D5DB    비활성 요소
Neutral / 400        #9CA3AF    보조 텍스트, 플레이스홀더
Neutral / 600        #52575E    기본 텍스트
Neutral / 800        #2C3035    강조 텍스트
Neutral / 900        #1A1C1F    제목, 헤딩
```

### Category Colors

차분하고 세련된 10가지 프리셋. 채도를 낮춰 조화로운 색감을 유지합니다.

```
Sky               #5B9FD8    차분한 하늘색
Sage              #6B9F7C    은은한 초록
Sand              #D4A574    따뜻한 베이지
Coral             #D87B7B    부드러운 코랄
Lavender          #9B8BC6    은은한 라벤더
Rose              #D68BA8    차분한 로즈
Slate             #6E7C8F    중성 슬레이트
Mint              #6DAFA8    시원한 민트
Amber             #D9A565    따뜻한 앰버
Periwinkle        #7B8FD4    부드러운 페리윙클
```

### Semantic Colors

최소한의 상태 표시 컬러. 과하지 않게 사용합니다.

```
Success           #2B8A5F    완료, 성공
Alert             #E5A855    주의, 예정
Critical          #D86D6D    오류, 긴급
Information       #5B9FD8    안내, 정보
```

---

## 타이포그래피

### 폰트 패밀리

**Pretendard Variable** - 한글과 영문이 조화로운 현대적 서체

Variable Font를 활용하여 섬세한 글꼴 두께 조절이 가능합니다.

### 텍스트 스케일

타입 스케일은 1.25 비율로 통일성 있게 구성되었습니다.

| 역할 | 크기 | 행간 | 굵기 | 사용처 |
|------|------|------|------|--------|
| **Display** | 28px | 1.3 | 600 | 페이지 헤딩 |
| **Heading** | 22px | 1.4 | 600 | 섹션 타이틀 |
| **Subheading** | 18px | 1.4 | 500 | 서브 타이틀 |
| **Body** | 15px | 1.6 | 400 | 본문, 할일 내용 |
| **Body Small** | 14px | 1.5 | 400 | 보조 본문 |
| **Caption** | 13px | 1.4 | 400 | 시간, 날짜 표시 |
| **Label** | 12px | 1.3 | 500 | 태그, 배지 |

### 타이포그래피 원칙

- **Letter Spacing**: -0.02em (Display), -0.01em (Heading), 0 (나머지)
- **Color**: Neutral 900 (Heading), Neutral 600 (Body), Neutral 400 (Caption)
- **Font Feature**: Tabular Numbers 사용 (시간, 날짜 정렬)

---

## 스페이싱 & 레이아웃

### Spacing Scale

8px 기준 시스템으로 일관된 리듬감을 형성합니다.

```
2xs      4px      아이콘과 텍스트 간격
xs       8px      밀접한 요소 사이
sm       12px     관련 요소 그룹
md       16px     기본 여백
lg       24px     컴포넌트 간격
xl       32px     섹션 간격
2xl      48px     큰 구분 영역
3xl      64px     메인 섹션 구분
```

### 레이아웃 시스템

```
Container Max Width     1440px
Content Max Width       1200px      (본문 최대 폭)
Left Panel (Todo)       400px       (고정)
Right Panel (Calendar)  Flex 1      (가변)
Header Height           56px        (넉넉한 여백)
Divider                 1px         (섬세한 경계)
Side Padding            24px        (좌우 여백)
```

### Border Radius

부드럽지만 절제된 곡선으로 차분한 느낌을 연출합니다.

```
xs       3px      체크박스, 작은 요소
sm       6px      태그, 배지
md       8px      버튼, 입력 필드
lg       12px     카드, 패널
xl       16px     다이얼로그, 모달
full     9999px   pill 형태, 아바타
```

### 그림자

미세한 그림자로 레이어를 표현합니다.

```
Subtle       0 1px 2px rgba(0,0,0,0.04)           카드 기본
Soft         0 2px 8px rgba(0,0,0,0.06)           호버 상태
Medium       0 4px 16px rgba(0,0,0,0.08)          드롭다운
Elevated     0 8px 24px rgba(0,0,0,0.12)          모달, 다이얼로그
```

---

## 컴포넌트 디자인

### Todo Item

미니멀하고 호흡감 있는 할일 아이템

```
Height              44px
Padding             16px 20px
Background          Neutral 0
Hover               Neutral 50
Border              None
Completed State     Text: Neutral 400, Strikethrough
Transition          150ms ease
```

### Calendar Event

부드러운 색감으로 시각적 피로도를 낮춥니다.

```
Padding             12px 16px
Border              1.5px solid [Category Color]
Background          [Category Color] at 8% opacity
Border Radius       8px
Completed State     Opacity 40%, Accent overlay
Font Size           14px
Min Height          60px
```

### Category Badge

차분한 pill 형태의 카테고리 표시

```
Height              26px
Padding             6px 14px
Background          [Category Color] at 12% opacity
Text Color          [Category Color] darkened 30%
Border Radius       13px (pill)
Font Size           12px
Font Weight         500
```

### Buttons

명확한 위계를 가진 버튼 시스템

| Variant | Background | Text | Border | Usage |
|---------|------------|------|--------|-------|
| **Primary** | Accent | Neutral 0 | None | 주요 액션 |
| **Secondary** | Neutral 100 | Neutral 800 | Neutral 200 | 보조 액션 |
| **Ghost** | Transparent | Neutral 600 | None | 서브 액션 |
| **Minimal** | Neutral 50 | Neutral 600 | None | 최소 강조 |

```
Height              44px
Padding             12px 24px
Border Radius       8px
Font Weight         500
Hover State         Background darkens 8%
Active State        Background darkens 12%
Transition          200ms ease
```

### Input Fields

깔끔하고 명확한 입력 필드

```
Height              44px
Padding             12px 16px
Border              1px solid Neutral 200
Background          Neutral 0
Border Radius       8px
Placeholder         Neutral 400
Focus State         Border: 1.5px Accent, Shadow: 0 0 0 3px Accent/10%
Transition          150ms ease
```

### Checkbox

미니멀한 체크박스 디자인

```
Size                20x20px
Border Radius       4px
Border              1.5px solid Neutral 300
Background          Neutral 0
Checked State       Background: Accent, Border: Accent
Icon                White checkmark, 14px
Transition          200ms ease
```

---

## 아이콘 시스템

### 아이콘 라이브러리

**Lucide Icons** - 일관된 stroke 기반의 미니멀 아이콘셋

### 아이콘 크기

절제된 크기로 시각적 균형을 유지합니다.

```
XL          28px        Hero 아이콘
Large       24px        헤더, 주요 액션
Medium      20px        버튼, 리스트 아이템
Small       16px        인라인, 보조 액션
XSmall      14px        배지, 라벨
```

### 아이콘 색상

```
Primary           Neutral 600      기본 상태
Active            Accent           선택/활성화 상태
Subtle            Neutral 400      보조 정보
Disabled          Neutral 300      비활성 상태
```

### Stroke Width

```
Default           1.5px            대부분의 아이콘
Emphasized        2px              강조가 필요한 아이콘
```

---

## 모션 & 애니메이션

### 애니메이션 원칙

**부드럽고 자연스럽게, 그러나 빠르게**

- 과하지 않은 움직임으로 세련됨 유지
- 사용자의 흐름을 방해하지 않는 빠른 전환
- 의미 있는 피드백만 애니메이션으로 표현

### Timing Functions

```
Ease Out          cubic-bezier(0.16, 1, 0.3, 1)       진입 애니메이션
Ease In           cubic-bezier(0.7, 0, 0.84, 0)      퇴장 애니메이션
Ease In Out       cubic-bezier(0.65, 0, 0.35, 1)     양방향 애니메이션
Spring            cubic-bezier(0.34, 1.56, 0.64, 1)  탄성 효과
```

### Duration Scale

```
Instant           100ms            색상 변화, 호버
Quick             200ms            기본 전환
Moderate          300ms            레이아웃 변화
Smooth            400ms            페이지 전환
Slow              600ms            복잡한 애니메이션
```

### 주요 인터랙션

| 인터랙션 | 애니메이션 | Duration | Easing |
|---------|-----------|----------|--------|
| **Hover** | 배경색, 그림자 | 150ms | Ease Out |
| **Click** | Scale 0.98 | 100ms | Ease In Out |
| **Check** | 체크마크 그리기 | 300ms | Spring |
| **Drag** | Lift (그림자 증가) | 200ms | Ease Out |
| **Page** | Fade + Slide 8px | 250ms | Ease Out |
| **Modal** | Fade + Scale 0.95 | 300ms | Ease Out |

---

## 반응형 디자인

### Breakpoints

모던 디바이스를 고려한 중단점

```
Mobile          320px - 767px
Tablet          768px - 1023px
Desktop         1024px - 1439px
Large Desktop   1440px+
```

### 레이아웃 적응

**Large Desktop (1440px+)**
```
┌──────────────────────────────────┐
│ Header (56px)                    │
├────────────┬─────────────────────┤
│            │                     │
│ Todo Panel │   Calendar View     │
│  (400px)   │   (Flex 1)          │
│            │                     │
└────────────┴─────────────────────┘
```

**Desktop (1024px - 1439px)**
```
┌──────────────────────────────────┐
│ Header                           │
├────────────┬─────────────────────┤
│ Todo       │   Calendar          │
│ (360px)    │   (Flex 1)          │
└────────────┴─────────────────────┘
```

**Tablet (768px - 1023px)**
```
┌────────────────────────┐
│ Header                 │
├────────────────────────┤
│ Tab: Todo / Calendar   │
├────────────────────────┤
│                        │
│ Active View            │
│                        │
└────────────────────────┘
```

**Mobile (< 768px)**
```
┌──────────────┐
│ Header       │
├──────────────┤
│              │
│ Content      │
│              │
│              │
├──────────────┤
│ Bottom Nav   │
└──────────────┘
```

---

## 접근성

### WCAG 2.1 AA 준수

모든 사용자가 편안하게 사용할 수 있도록 설계합니다.

### 색상 대비

```
Neutral 900 / Neutral 0      18.2:1  ✅ AAA
Neutral 800 / Neutral 0      14.5:1  ✅ AAA
Neutral 600 / Neutral 0       8.3:1  ✅ AA
Accent / Neutral 0            5.1:1  ✅ AA
```

### 터치 & 클릭 영역

```
Minimum Touch Target       44x44px   (모바일)
Recommended Target         48x48px   (데스크톱 포함)
Spacing Between Targets    8px       (최소)
```

### 키보드 네비게이션

```
Focus Indicator           2px Accent outline, 4px offset
Tab Order                 논리적 순서 보장
Keyboard Shortcuts        직관적이고 충돌 없음
Skip Links                메인 콘텐츠 바로가기 제공
```

### 스크린 리더

```
Semantic HTML             적절한 태그 사용
ARIA Labels               필요한 곳에 명확한 레이블
Live Regions              동적 콘텐츠 알림
Alt Text                  모든 의미 있는 이미지
```

---

## 다크 모드

**Phase 2 예정** - 세련된 다크 팔레트

```
Background              #0F1117      깊은 어둠
Surface                 #1A1D25      카드, 패널
Surface Elevated        #25282F      호버, 강조
Border                  #2F3339      경계선
Text Primary            #E8EAED      주요 텍스트
Text Secondary          #9CA3AF      보조 텍스트
Text Tertiary           #6B7280      캡션
Accent                  #3DAA7A      밝은 액센트
Accent / Subtle         #2A4D3D      액센트 배경
```

### 다크 모드 원칙

- 순수 검정(#000000) 사용 금지 → 눈의 피로 증가
- 색상 채도를 낮춰 밤에도 편안하게
- 그림자 대신 미세한 테두리로 레이어 구분
- 텍스트 대비는 라이트 모드와 동일하게 유지

---

**Design System Version**: 1.0  
**Last Updated**: 2025-11-01

