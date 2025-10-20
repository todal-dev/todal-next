# 인터랙션 & 애니메이션 가이드 (미니멀)

> 사용자 액션에 대한 시각적 피드백 - 미니멀한 상호작용 규격

---

## 🎬 애니메이션 원칙

1. **목적성**: 모든 애니메이션은 기능적 목적이 있어야 함
2. **일관성**: 같은 타입의 액션에는 같은 애니메이션 적용
3. **최소성**: 필요한 것만 (색상 변화, 아웃라인)
4. **성능**: 60fps 유지
5. **접근성**: 모션 민감 사용자를 위한 `prefers-reduced-motion` 고려

---

## ⏱️ 타이밍 값

### Easing Functions

```
ease             → cubic-bezier(0.25, 0.1, 0.25, 1.0)    기본
ease-in-out      → cubic-bezier(0.42, 0, 0.58, 1)        양방향
```

### Duration Values

```
Normal     150ms    기본 전환 (호버, 상태 변화)
Slower     300ms    느린 전환 (중요 애니메이션)
```

---

## 🖱️ 마우스/터치 인터랙션

### 1. Hover 상태 (데스크톱)

#### 버튼 호버

```
전환:       all 150ms ease
변화:
  - 배경색: Gray 100 → Gray 200
  - 테두리: transparent → 1px solid Gray 200 (선택적)
```

**예시: Secondary Button**
```
Before:  배경 White, 테두리 1px solid #E5E7EB
Hover:   배경 #F3F4F6, 테두리 1px solid #D1D5DB
```

#### 카드/아이템 호버

```
전환:       all 150ms ease
변화:
  - 배경:   White → #F3F4F6 (Gray 100)
  - 테두리: transparent → 1px solid #E5E7EB (선택적)
```

#### 링크 호버

```
전환:       color 150ms ease
변화:
  - 색상:   Gray 600 → Primary #2D9F6B
```

### 2. Click/Press 상태

#### 버튼 클릭

```
시작:       클릭 즉시
동작:       배경색 변화
           Gray 100 → Gray 200
총 시간:    150ms ease
```

---

## 🎯 주요 인터랙션별 피드백

### 1. 호버 상태

```
배경 색상 변화만 적용:
  - 밝은 상태 → 약간 진한 상태
  - 전환: 150ms ease
  - 예: White → #F3F4F6 (또는 Gray 100)
```

### 2. 포커스 상태 (Focus)

```
아웃라인:        2px solid Primary
아웃라인 오프셋: 2px
전환:            150ms ease
```

**입력 필드 포커스:**
```
시간:    150ms ease
변화:
  - 테두리:    Gray 200 → Primary #2D9F6B
  - 그림자:    없음
```

---

### 3. 상태 전환 (State Transition)

#### 미완료 → 완료

```
시간:      300ms ease-in-out
동작:
  1. 체크 아이콘 나타남 (100ms)
  2. 배경 색상 변화 (200ms)
     - White → Gray 100 (#F3F4F6)
  3. 텍스트 색상 변화 (200ms)
     - Gray 600 → Gray 400
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

### 4. 알림/토스트 (Toast/Notification)

#### 나타남 (Enter)

```
시간:      200ms ease-out
동작:
  - 투명도: 0 → 1 (fade in)
  - Y축: +20px → 0px (위에서 아래로 등장)
```

#### 자동 제거 (Auto-dismiss)

```
유지 시간:  4초
종료:      200ms ease-in 페이드아웃
```

---

### 5. 텍스트 입력 (Text Input)

#### 포커스

```
시간:      150ms ease
동작:
  1. 테두리 색상: Gray 200 → Primary
  2. 배경 유지: White
```

#### 에러 상태

```
시간:      150ms ease
동작:
  1. 테두리 색상: Gray 200 → Error (#DC2626)
  2. 흔들림 애니메이션 (선택적)
     - 좌우 4px 이동 (2회)
     - 시간: 150ms
```

---

## 🚫 하지 말아야 할 것

```
❌ Scale 변형 (커지거나 작아짐)
❌ Translate 변형 (위아래 이동)
❌ Rotation 변형 (회전)
❌ 과도한 그림자 (극소 또는 없음)
❌ 복잡한 애니메이션 (단순 색상 변화만)
```

---

## ✅ 미니멀 인터랙션 원칙

```
1. 배경 색상 변화만 사용
   - 밝음 → 진함 (또는 색상 변경)
   - 150ms 전환

2. 아웃라인/테두리만 변화
   - Focus 상태 표시용
   - 2px solid Primary

3. 텍스트 색상 변화
   - 비활성 상태 표시
   - 완료 상태 표시

4. 투명도 변화
   - 선택적 (거의 사용 안 함)
   - 로딩/비활성 상태에만

5. 회전 (로딩만)
   - 스피너 애니메이션
   - 나머지는 절대 금지
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

---

## 📊 애니메이션 참고 표

| 상황 | Duration | Easing | 설명 |
| --- | --- | --- | --- |
| 호버 상태 | 150ms | ease | 빠른 피드백 |
| 버튼 클릭 | 150ms | ease | 색상 변화 |
| 상태 변화 | 200-300ms | ease | 자연스러운 전환 |
| 모달 열기 | 200ms | ease-out | 부드러운 진입 |
| 모달 닫기 | 150ms | ease-in | 빠른 퇴장 |
| 로딩 스피너 | 800ms | linear | 지속적 회전 |

---

**Last Updated**: 2025-10-20
