# 인터랙션 & 애니메이션 가이드

> 사용자 액션에 대한 시각적 피드백과 애니메이션 규격

---

## 🎬 애니메이션 원칙

1. **목적성**: 모든 애니메이션은 기능적 목적이 있어야 함
2. **일관성**: 같은 타입의 액션에는 같은 애니메이션 적용
3. **성능**: 60fps 유지, GPU 가속 활용
4. **접근성**: 모션 민감 사용자를 위한 `prefers-reduced-motion` 고려

---

## ⏱️ 타이밍 값

### Easing Functions

```
ease             → cubic-bezier(0.25, 0.1, 0.25, 1.0)    기본
ease-in          → cubic-bezier(0.42, 0, 1, 1)           진입
ease-out         → cubic-bezier(0, 0, 0.58, 1)           진출
ease-in-out      → cubic-bezier(0.42, 0, 0.58, 1)        양방향
```

### Duration Values

```
Fast       100ms    빠른 피드백 (호버)
Normal     150ms    기본 전환 (상태 변화)
Slow       200ms    느린 전환 (페이지 진입)
Slower     300ms    매우 느린 전환 (중요 애니메이션)
```

---

## 🖱️ 마우스/터치 인터랙션

### 1. Hover 상태 (데스크톱)

#### 버튼 호버

```
전환:       all 150ms ease
변화:
  - 배경색: 기존 → Darker tone (-10%)
  - 스케일: 1 → 1.02
  - 그림자: Shadow 1 → Shadow 2
```

**예시: Primary Button**
```
Before:  배경 #2D9F6B, 그림자 없음
Hover:   배경 #1F7A51, 스케일 1.02, 그림자 0 4px 8px rgba(0,0,0,0.1)
```

#### 카드/아이템 호버

```
전환:       all 150ms ease
변화:
  - 배경:   White → #F9FAFB (Background Gray)
  - 테두리: transparent → #E5E7EB (Gray 300)
  - 그림자: 없음 → Shadow 1
```

#### 링크 호버

```
전환:       color 150ms ease
변화:
  - 색상:   Secondary → Primary
  - 언더라인: 추가 (선택적)
```

### 2. Click/Press 상태

#### 버튼 클릭

```
시작:   클릭 즉시
동작:
  1. 스케일 1.02 → 0.98 (50ms)
  2. 다시 1.0으로 (100ms ease-out)
총 시간:  150ms
```

**CSS/JS:**
```javascript
active {
  transform: scale(0.98);
  transition: transform 50ms ease-out;
}
```

#### 체크박스 체크

```
동작:
  1. 스케일 1 → 1.2 (100ms)
  2. 체크마크 그려짐 (100ms)
  3. 색상 변화 (150ms)
총 시간:  300ms ease-in-out
```

---

## 🎯 주요 인터랙션별 애니메이션

### 1. 드래그 시작 (Drag Start)

```
전환:     box-shadow 200ms ease-out
변화:
  - 그림자: Shadow 1 → Shadow Hover
  - 투명도: 100% → 85%
  - 스케일: 1 → 1.02
  - 커서:   grab → grabbing
```

**완료 상태에서도 그림자 변함**

### 2. 드래그 오버 (Drop Zone)

드롭 존에 드래그 중인 아이템이 있을 때:

```
시각적 피드백:
  - 드롭 존 배경:     변화 (Primary Light 20%)
  - 가이드라인:       나타남 (Primary 2px 점선)
  - 하강/상승 애니메이션: 아이템이 삽입될 위치 표시
```

**가이드라인 스타일:**
```
테두리:       2px dashed Primary
높이:         2px
애니메이션:   fade-in 100ms ease (즉시 나타남)
```

### 3. 드롭 완료 (Drop)

```
시간:        150ms ease-out
동작:
  1. 아이템 자리 이동
  2. 그림자 복원 (Shadow 1)
  3. 투명도 복원 (100%)
  4. 스케일 복원 (1)
```

**성공 피드백 (선택):**
- 아이템 테두리 Primary 깜박임 (2회, 100ms)

---

### 4. 팝오버/모달 열기

```
시간:        200ms ease-out
동작:
  1. 배경 어두움 (Fade in)
     - 투명도: 0 → 0.5 (검은색, rgba 0,0,0,0.5)
     - 전환: background-color 200ms ease

  2. 컨텐츠 나타남
     - 시작 위치: Y축 -20px (위쪽)
     - 최종 위치: Y축 0px
     - 투명도: 0 → 1
     - transform: translateY(-20px) + opacity
     - 전환: all 200ms ease-out
```

### 5. 팝오버/모달 닫기

```
시간:        150ms ease-in
동작:
  1. 배경 밝아짐
     - 투명도: 0.5 → 0

  2. 컨텐츠 사라짐
     - 투명도: 1 → 0
     - 스케일: 1 → 0.95 (축소)
     - transform: scale(0.95) + opacity
```

---

### 6. 포커스 상태 (Focus)

```
아웃라인:        2px solid Primary
아웃라인 오프셋: 2px
전환:            box-shadow 150ms ease (입력 필드)
```

**입력 필드 포커스:**
```
시간:    150ms ease
변화:
  - 테두리:    Gray 300 → Primary
  - 그림자:    없음 → 0 0 0 3px rgba(45, 159, 107, 0.1)
```

---

### 7. 상태 전환 (State Transition)

#### 미완료 → 완료

```
시간:      300ms ease-in-out
동작:
  1. 체크 아이콘 나타남 (100ms)
  2. 배경 색상 변화 (150ms)
     - White → Primary Light 50%
  3. 텍스트 색상 변화 (200ms)
     - Charcoal → Text Tertiary
  4. 취소선 추가 (200ms)
```

#### 로딩 상태

```
스피너 회전:
  - 지속: ∞
  - 각속도: 360도 / 800ms
  - 애니메이션: linear (일정 속도)
  - 색상: Primary

코드:
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
animation: spin 800ms linear infinite;
```

---

### 8. 알림/토스트 (Toast/Notification)

#### 나타남 (Enter)

```
시간:      200ms ease-out
동작:
  - Y축: +30px → 0px (아래에서 올라옴)
  - 투명도: 0 → 1
```

#### 자동 제거 (Auto-dismiss)

```
유지 시간:  4초
종료:      200ms ease-in 페이드아웃
```

---

### 9. 텍스트 입력 (Text Input)

#### 플레이스홀더 → 입력값

```
시간:      100ms ease
동작:
  - 플레이스홀더 사라짐
  - 입력값 나타남
  - 커서 깜박임 시작
```

#### 에러 상태

```
시간:      150ms ease
동작:
  1. 테두리 색상: Gray 300 → Error (#E74C3C)
  2. 흔들림 애니메이션 (Shake)
     - 좌우 4px 이동 (2회)
     - 시간: 150ms
```

**Shake 애니메이션:**
```css
@keyframes shake {
  0%, 100%  { transform: translateX(0); }
  25%       { transform: translateX(-4px); }
  75%       { transform: translateX(4px); }
}
animation: shake 150ms ease;
```

---

## 🚫 비활성화 상태 (Disabled)

```
전환:       all 150ms ease
변화:
  - 투명도:    100% → 50%
  - 커서:     pointer → not-allowed
  - 상호작용:  비활성화
호버 효과:   없음
포커스 효과: 없음
```

---

## ♿ 접근성 고려사항

### prefers-reduced-motion

모든 애니메이션에 대응:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**적용 대상:**
- 스핀, 페이드, 이동 애니메이션
- 모든 transition 효과

---

## 📊 애니메이션 참고 표

| 상황 | Duration | Easing | 설명 |
| --- | --- | --- | --- |
| 호버 상태 | 150ms | ease | 빠른 피드백 |
| 버튼 클릭 | 150ms | ease-out | 누르는 느낌 |
| 상태 변화 | 200-300ms | ease | 자연스러운 전환 |
| 모달 열기 | 200ms | ease-out | 부드러운 진입 |
| 모달 닫기 | 150ms | ease-in | 빠른 퇴장 |
| 드래그 시작 | 200ms | ease-out | 분리 감각 표현 |
| 드롭 완료 | 150ms | ease-out | 빠른 정착 |
| 토스트 등장 | 200ms | ease-out | 알림 표시 |
| 토스트 퇴장 | 200ms | ease-in | 자연스러운 제거 |
| 로딩 스피너 | 800ms | linear | 지속적 회전 |

---

## 🎨 주요 색상 전환 예시

### Primary to Dark 호버

```
From: #2D9F6B (Primary)
To:   #1F7A51 (Primary Dark)
```

### Gray 호버

```
From: White (#FFFFFF)
To:   #F9FAFB (Background Gray)
```

### Focus 그림자

```
Color:   rgba(45, 159, 107, 0.1)  ← Primary의 10% 투명도
Spread:  3px
```

---

## 🎮 게임스러운 피드백 (선택적)

완료 시 추가 피드백 (UX 향상용):

```
1. 시각적: Primary 테두리 깜박임 (2회)
2. 음향: 짧은 완료음 (선택적, 설정으로 끌 수 있음)
3. 촉각: 기기 진동 (모바일)
```

---

## 📱 모바일 고려사항

### 터치 피드백

```
터치 시작:    배경 Primary Light
터치 진행:    스케일 0.98
터치 종료:    이전 상태로 복원 (150ms)
```

### 제약사항

```
- 호버 상태 제거 (터치에는 hover 없음)
- 탭 액션으로 대체
- 애니메이션 시간은 동일 유지
```

---

## 🔧 구현 권장사항

### CSS Transition 우선

```css
button {
  transition: all 150ms ease;
}

button:hover {
  /* 변화 */
}
```

### 복잡한 애니메이션은 JavaScript

```javascript
// 예: 드래그 중 스케일
onDragStart={() => {
  element.style.transition = 'none';
  element.style.transform = 'scale(1.02)';
}}
```

### GPU 가속화

```css
/* will-change 사용 (드래그 등 고성능 필요 시) */
.draggable {
  will-change: transform;
}
```

---

**Last Updated**: 2025-10-17
