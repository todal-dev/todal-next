# UI 컴포넌트 스타일 가이드 (미니멀)

> Phase 1 MVP에서 사용되는 모든 UI 컴포넌트의 미니멀 스타일 명세

---

## 📚 목차

1. [기본 원칙](#기본-원칙)
2. [기본 컴포넌트](#기본-컴포넌트)
3. [복합 컴포넌트](#복합-컴포넌트)

---

## 기본 원칙

### 미니멀 디자인 규칙

```
1. 불필요한 색상 제거 → Gray + Primary만 사용
2. 그림자 최소화 → border-bottom 또는 outline으로 대체
3. 여백을 통한 분리 → 구분선 선호
4. 명확한 형태 → 불필요한 둥글림 제거 (8px 이하)
5. 한눈에 읽히는 텍스트 → 크기로 계층 표현
```

---

## 기본 컴포넌트

### 1. 버튼 (Button)

#### Primary Button (최소 사용)

```
배경:        #2D9F6B (Primary)
텍스트:      White
패딩:        12px 20px
Border Radius: 6px (soft corner)
높이:        40px
폰트:        15px / 600 SemiBold
테두리:      없음
그림자:      없음
```

**상태:**
- **Default**: 배경 Primary
- **Hover**: 배경 다크 (#1F7A51)
- **Active**: 배경 다크 + 내부 outline (1px)
- **Disabled**: 배경 #E5E7EB, 텍스트 #9CA3AF

**Transition:** all 150ms ease

#### Secondary Button

```
배경:        White
텍스트:      #4B5563 (Gray 600)
테두리:      1px solid #E5E7EB
패딩:        12px 20px
Border Radius: 6px
높이:        40px
```

**상태:**
- **Hover**: 배경 #FAFAFA
- **Active**: 테두리 #9CA3AF

#### Ghost Button (최소화)

```
배경:        투명
텍스트:      #4B5563 (Gray 600)
패딩:        8px 12px
테두리:      없음
```

**상태:**
- **Hover**: 배경 transparent (텍스트만 변경 X)
- **Active**: 텍스트 Primary

---

### 2. 입력 필드 (Input)

```
배경:        White
테두리:      1px solid #E5E7EB
Border Radius: 6px
패딩:        12px 16px
높이:        40px
폰트:        15px / 400
플레이스홀더: #9CA3AF (Gray 400)
```

**상태:**

| 상태 | 스타일 |
| --- | --- |
| **Focus** | 테두리 2px Primary (테두리 아래만) |
| **Hover** | 테두리 #D1D5DB (약간 밝음) |
| **Disabled** | 배경 #FAFAFA, 텍스트 #9CA3AF |
| **Error** | 테두리 2px #DC2626 |

**Transition:** border-color 150ms ease

---

### 3. 체크박스 (Checkbox)

```
크기:        20px × 20px
테두리:      2px solid #E5E7EB
Border Radius: 4px
배경:        White
```

**상태:**

| 상태 | 스타일 |
| --- | --- |
| **Unchecked** | 테두리 Gray 200, 배경 White |
| **Checked** | 배경 Primary, 테두리 Primary, 흰 체크마크 |
| **Disabled** | 테두리 #E5E7EB, 배경 #FAFAFA |

**애니메이션:**
- 체크 시: 150ms ease 스케일 (1 → 1.1 → 1)

---

## 복합 컴포넌트

### 4. 할일 아이템 (TodoItem)

**레이아웃:**
```
[  ]  할일 텍스트                    [✕]
└─────────────────────────────────────────┘
```

**스타일:**
```
높이:           40px
패딩:           12px 16px
배경:           White
테두리:         1px solid transparent
Border Radius:  6px
```

**상태:**

| 상태 | 스타일 |
| --- | --- |
| **Hover** | 배경 #FAFAFA, 테두리 #E5E7EB |
| **완료** | 텍스트 #9CA3AF + 취소선, 배경 불변 |
| **드래그 중** | 투명도 60%, 배경 #F3F4F6, 그림자 없음 |

**텍스트:**
- 기본: #4B5563 (Gray 600)
- 완료: #9CA3AF (Gray 400) + 취소선
- 들여쓰기: 24px씩

**Transition:** all 150ms ease

---

### 5. 캘린더 일정 박스 (CalendarEvent)

**레이아웃:**
```
┌──────────────────────┐
│ 일정명         [☐]  │
│ 10:00 - 11:00       │
└──────────────────────┘
```

**스타일:**
```
패딩:           12px
테두리:         1px solid #E5E7EB (구분선만)
배경:           White
Border Radius:  6px
그림자:         없음
```

**완료 상태:**
```
배경:           #F3F4F6
텍스트:         #9CA3AF + 취소선
투명도:         안 함 (색상으로만 표현)
```

**호버 상태:**
```
배경:           White 유지
테두리:         1px solid #D1D5DB (약간 진함)
Transition:     150ms ease
```

---

### 6. 헤더 (Header) - 미니멀

```
높이:           48px
배경:           White
테두리:         1px solid #E5E7EB (하단만)
패딩:           12px 20px
그림자:         없음
```

**레이아웃:**
```
┌────────────────────────────────┐
│ Todal               [⚙️] [👤] │
└────────────────────────────────┘
```

**요소:**
- 로고/제목: 15px / 600 SemiBold
- 버튼: Ghost style, 20px 아이콘
- 간격: 16px
- 호버: 배경 transparent (텍스트 색상 변경만)

---

### 7. 드롭다운 메뉴

```
배경:           White
테두리:         1px solid #E5E7EB
Border Radius:  6px
그림자:         0 1px 2px rgba(0,0,0,0.05)
패딩:           8px
Z-index:        50
```

**항목 스타일:**
```
패딩:           12px 16px
텍스트:         #4B5563 (Gray 600)
Border Radius:  4px
```

**상태:**
- **Hover**: 배경 #F3F4F6
- **Active**: 배경 Primary Light (#E8F5EE)

---

## 색상 적용 요약

### 텍스트 색상 사용처

| 색상 | 용도 |
| --- | --- |
| #111827 (Gray 900) | 주요 제목 (거의 사용 안 함) |
| #4B5563 (Gray 600) | 기본 텍스트 (가장 많이 사용) |
| #9CA3AF (Gray 400) | 보조 텍스트, 플레이스홀더 |
| #E5E7EB (Gray 200) | 비활성, 테두리 |
| #2D9F6B (Primary) | CTA, 강조 (최소 사용) |

### 배경 색상 사용처

| 색상 | 용도 |
| --- | --- |
| #FFFFFF (White) | 메인 배경 |
| #FAFAFA (Gray 50) | 미묘한 구분 (거의 안 함) |
| #F3F4F6 (Gray 100) | Hover 상태 |

---

## 📐 최종 체크리스트

- [ ] 그림자 최소화 (필요시 outline 사용)
- [ ] 색상 3개 이하 (Gray + Primary)
- [ ] Font Weight 2개 이하 (400, 600)
- [ ] Border Radius 최대 8px
- [ ] 여백으로 분리 (구분선 아닌 공간 활용)
- [ ] 아이콘은 Lucide (stroke 기반)
- [ ] 모든 상호작용 150ms ease

---

**Last Updated**: 2025-10-20
