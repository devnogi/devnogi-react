# DevNogi Design System

마비노기의 따뜻하고 아기자기한 판타지 라이프 감성을 담은 디자인 시스템입니다.
maple.gg의 깔끔한 정보 구조를 참고하되, 마비노기만의 동글동글하고 귀여운 감성을 녹여냅니다.

---

## 1. 디자인 철학

### 핵심 키워드

| 키워드 | 설명 |
|--------|------|
| **따뜻함 (Warmth)** | 마비노기 세계관의 포근하고 환상적인 분위기 |
| **동글동글 (Rounded)** | 날카로운 모서리 없이 부드럽고 친근한 형태 |
| **심플 (Simple)** | 과한 장식 없이 깔끔하고 명확한 정보 전달 |
| **판타지 라이프 (Fantasy Life)** | 마을, 자연, 생활 컨텐츠의 아기자기한 감성 |
| **일러스트 중심 (Illustration)** | 그라데이션 대신 이미지/아이콘/일러스트 활용 |

### 디자인 원칙

```
1. 그라데이션보다 단색 + 일러스트/아이콘 활용
2. 둥근 모서리로 친근하고 부드러운 느낌
3. 충분한 여백으로 시원하고 깔끔한 레이아웃
4. 정보 계층 구조를 명확히 구분
5. 라이트/다크 모드 모두 따뜻한 톤 유지
```

### 영감 소스

- **maple.gg**: 깔끔한 정보 구조, 카드 기반 레이아웃, 명확한 섹션 분리
- **마비노기 게임**: 손그림 느낌, 따뜻한 색감, 자연/마을/생활 컨텐츠 분위기
- **지브리 애니메이션**: 따뜻한 자연 색감과 판타지 세계관

---

## 2. 색상 팔레트

### 2.1 색상 설계 원칙

본 팔레트는 UI/UX 가독성, 일관성, 확장성을 고려한 표준 디자인 원칙을 따릅니다.

#### 60-30-10 법칙

| 비율 | 색상 역할 | 용도 |
|------|----------|------|
| **60~70%** | Background (배경) | 전체 레이아웃의 기본 바탕 |
| **20~30%** | Primary (주요) | 핵심 인터랙션, 버튼, 링크 |
| **5~10%** | Accent (강조) | 알림, 중요 표시, 제한적 CTA |

#### Hue(색상 계열) 제한

```
최대 3종의 색상 계열만 사용:
├── Background 계열 1종 (Gray)
├── Primary 계열 1종 (Blue)
└── Accent 계열 1종 (Gold)

* 명도/채도 차이는 동일 색상군으로 간주 (추가 색상 아님)
* 상태 색상(Success, Warning, Error, Info)은 의미 전달용으로만 사용
  → 브랜드 컬러 개수 제한에 포함하지 않음
```

#### 배경 색상 원칙

- 시각적 피로를 줄이기 위해 **순수 흰색 대신 연한 회색**을 기본 배경으로 사용
- 순수 흰색(`#FFFFFF`)은 **카드, 모달, 강조 영역**에 한정하여 사용
- 모든 텍스트와 UI 요소는 **WCAG 대비 기준**을 만족해야 함

---

### 2.2 Background - Gray (배경 색상)

| Token | HEX | RGB | 용도 |
|-------|-----|-----|------|
| `gray-bg` | `#F5F6F8` | 245, 246, 248 | **메인 배경** - body, 전체 레이아웃 기본 바탕 |
| `white` | `#FFFFFF` | 255, 255, 255 | **카드/강조 배경** - 카드, 모달, 리스트 아이템 |

#### 명도 변형 (Gray 계열)

| Token | HEX | RGB | 용도 |
|-------|-----|-----|------|
| `gray-50` | `#F9FAFB` | 249, 250, 251 | 가장 연한 배경 |
| `gray-100` | `#F5F6F8` | 245, 246, 248 | **메인 배경 (Main Gray)** |
| `gray-200` | `#E5E7EB` | 229, 231, 235 | 섹션 구분, 호버 배경 |
| `gray-300` | `#D1D5DB` | 209, 213, 219 | 테두리, 구분선 |
| `gray-400` | `#9CA3AF` | 156, 163, 175 | 비활성 요소, placeholder |
| `gray-500` | `#6B7280` | 107, 114, 128 | 보조 텍스트 |
| `gray-600` | `#4B5563` | 75, 85, 99 | 부제목 |
| `gray-700` | `#374151` | 55, 65, 81 | 본문 텍스트 |
| `gray-800` | `#1F2937` | 31, 41, 55 | 강조 텍스트 |
| `gray-900` | `#111827` | 17, 24, 39 | 제목 텍스트 |

---

### 2.3 Primary - Blaanid Blue (청색)

맑고 연한 하늘색 톤의 주요 색상입니다.
상단 네비게이션, 주요 버튼, 활성 상태, 링크, 선택된 메뉴 등 서비스의 핵심 인터랙션에 사용합니다.

| Token | HEX | RGB | 용도 |
|-------|-----|-----|------|
| `blaanid-50` | `#EFF6FF` | 239, 246, 255 | 아주 연한 배경 |
| `blaanid-100` | `#DBEAFE` | 219, 234, 254 | 연한 배경, 선택 상태 배경 |
| `blaanid-200` | `#BFDBFE` | 191, 219, 254 | 호버 배경 |
| `blaanid-300` | `#93C5FD` | 147, 197, 253 | 보조 요소 |
| `blaanid-400` | `#7FB4FA` | 127, 180, 250 | **메인 색상 (Blaanid Blue)** |
| `blaanid-500` | `#60A5FA` | 96, 165, 250 | 호버, 강조 |
| `blaanid-600` | `#3B82F6` | 59, 130, 246 | 활성 상태, 진한 버튼 |
| `blaanid-700` | `#2563EB` | 37, 99, 235 | 강조 텍스트 |
| `blaanid-800` | `#1D4ED8` | 29, 78, 216 | 진한 강조 |
| `blaanid-900` | `#1E40AF` | 30, 64, 175 | 가장 진한 텍스트 |

---

### 2.4 Accent - Gold (금색)

보조 강조 색상(Accent Color)입니다.
알림 포인트, 강조 아이콘, 중요한 상태 표시, 제한적인 CTA 요소에만 사용합니다.

> **주의**: Accent 색상은 "보이면 중요한 요소"라는 인식이 유지되도록 사용 빈도를 제한합니다.

| Token | HEX | RGB | 용도 |
|-------|-----|-----|------|
| `gold-50` | `#FFFBEB` | 255, 251, 235 | 알림 배경 |
| `gold-100` | `#FEF3C7` | 254, 243, 199 | 하이라이트 배경 |
| `gold-200` | `#FDE68A` | 253, 230, 138 | 배지 배경 |
| `gold-300` | `#FCD34D` | 252, 211, 77 | 장식 요소 |
| `gold-400` | `#EEB233` | 238, 178, 51 | **메인 액센트 (Gold)** |
| `gold-500` | `#F59E0B` | 245, 158, 11 | 호버 상태 |
| `gold-600` | `#D97706` | 217, 119, 6 | 활성 상태 |
| `gold-700` | `#B45309` | 180, 83, 9 | 강조 텍스트 |
| `gold-800` | `#92400E` | 146, 64, 14 | 진한 강조 |
| `gold-900` | `#78350F` | 120, 53, 15 | 가장 진한 |

---

### 2.5 Semantic Colors (상태/의미 색상)

상태 색상은 **의미 전달용으로만** 사용하며, 브랜드 컬러 개수 제한에 포함하지 않습니다.

| 용도 | 라이트 모드 | 다크 모드 | 설명 |
|------|-------------|-----------|------|
| **Success** | `#22C55E` | `#4ADE80` | 성공, 완료, 긍정 |
| **Warning** | `#EEB233` (gold-400) | `#FCD34D` | 주의, 경고 |
| **Error** | `#EF4444` | `#F87171` | 오류, 삭제, 부정 |
| **Info** | `#7FB4FA` (blaanid-400) | `#93C5FD` | 정보, 안내 |

---

### 2.6 라이트 모드 색상 체계

```css
:root {
  /* 배경 */
  --bg-primary: #F5F6F8;      /* gray-100: 메인 배경 */
  --bg-secondary: #FFFFFF;    /* white: 카드/섹션 배경 */
  --bg-tertiary: #E5E7EB;     /* gray-200: 강조 배경 */
  --bg-elevated: #FFFFFF;     /* 떠있는 요소 (모달, 드롭다운) */

  /* 텍스트 */
  --text-primary: #111827;    /* gray-900: 제목 */
  --text-secondary: #374151;  /* gray-700: 본문 */
  --text-tertiary: #4B5563;   /* gray-600: 부제목 */
  --text-muted: #6B7280;      /* gray-500: 비활성 */
  --text-placeholder: #9CA3AF; /* gray-400: 플레이스홀더 */

  /* 테두리 */
  --border-default: #E5E7EB;  /* gray-200 */
  --border-strong: #D1D5DB;   /* gray-300 */
  --border-focus: #7FB4FA;    /* blaanid-400 */

  /* Primary */
  --primary: #7FB4FA;         /* blaanid-400 */
  --primary-hover: #60A5FA;   /* blaanid-500 */
  --primary-active: #3B82F6;  /* blaanid-600 */
  --primary-bg: #EFF6FF;      /* blaanid-50 */

  /* Accent */
  --accent: #EEB233;          /* gold-400 */
  --accent-hover: #F59E0B;    /* gold-500 */
  --accent-bg: #FFFBEB;       /* gold-50 */
}
```

### 2.7 다크 모드 색상 체계

```css
.dark {
  /* 배경 - 어두운 톤 */
  --bg-primary: #111827;      /* gray-900: 메인 배경 */
  --bg-secondary: #1F2937;    /* gray-800: 카드/섹션 배경 */
  --bg-tertiary: #374151;     /* gray-700: 강조 배경 */
  --bg-elevated: #1F2937;     /* 떠있는 요소 */

  /* 텍스트 */
  --text-primary: #F9FAFB;    /* gray-50 */
  --text-secondary: #E5E7EB;  /* gray-200 */
  --text-tertiary: #D1D5DB;   /* gray-300 */
  --text-muted: #9CA3AF;      /* gray-400 */
  --text-placeholder: #6B7280; /* gray-500 */

  /* 테두리 */
  --border-default: #374151;  /* gray-700 */
  --border-strong: #4B5563;   /* gray-600 */
  --border-focus: #93C5FD;    /* blaanid-300 */

  /* Primary */
  --primary: #93C5FD;         /* blaanid-300 */
  --primary-hover: #7FB4FA;   /* blaanid-400 */
  --primary-active: #60A5FA;  /* blaanid-500 */
  --primary-bg: rgba(127, 180, 250, 0.1);

  /* Accent */
  --accent: #FCD34D;          /* gold-300 */
  --accent-hover: #EEB233;    /* gold-400 */
  --accent-bg: rgba(238, 178, 51, 0.1);
}
```

---

### 2.8 색상 사용 규칙

#### DO (권장)

```
✅ 새로운 색상이 필요할 때 기존 색상의 명도/투명도를 조절하여 변형
✅ 텍스트 색상은 배경 대비를 최우선으로 고려
✅ Accent 색상은 시선을 끌어야 하는 요소에만 제한적으로 사용
✅ 상태 색상은 의미 전달용으로만 사용
```

#### DON'T (금지)

```
❌ 새로운 Hue(색상 계열)를 임의로 추가
❌ 색상 자체로 의미를 전달 (색각 이상 사용자 고려)
❌ Accent 색상 남용 (중요도 인식 훼손)
❌ WCAG 대비 기준 미충족 색상 조합 사용
```

---

## 3. 버튼 스타일

### 3.1 버튼 종류 및 색상

| 종류 | 용도 | 라이트 모드 | 다크 모드 |
|------|------|-------------|-----------|
| **Primary** | 주요 액션 (저장, 확인, 검색) | `bg-blaanid-400` | `bg-blaanid-400` |
| **Secondary** | 보조 액션 (취소, 닫기) | `bg-gray-100 border-gray-300` | `bg-gray-700 border-gray-600` |
| **Ghost** | 미니멀한 액션 | `bg-transparent hover:bg-gray-100` | `bg-transparent hover:bg-gray-800` |
| **Accent** | 특별한 액션 (알림, 이벤트) | `bg-gold-400` | `bg-gold-400` |
| **Destructive** | 삭제, 위험한 액션 | `bg-red-500` | `bg-red-500` |

### 3.2 버튼 상태

| 상태 | 스타일 변화 |
|------|-------------|
| **Default** | 기본 색상 |
| **Hover** | 배경 1단계 진하게 |
| **Active/Pressed** | 배경 2단계 진하게, `scale-[0.98]` |
| **Focus** | `ring-2 ring-blaanid-400/50 ring-offset-2` |
| **Disabled** | `opacity-50 cursor-not-allowed` |
| **Loading** | 스피너 아이콘 + 텍스트 |

### 3.3 버튼 크기

| Size | Height | Padding | Font Size | Border Radius |
|------|--------|---------|-----------|---------------|
| `xs` | 28px | `px-2.5 py-1` | 12px | `rounded-lg` (8px) |
| `sm` | 32px | `px-3 py-1.5` | 13px | `rounded-lg` (8px) |
| `md` | 40px | `px-5 py-2.5` | 14px | `rounded-xl` (12px) |
| `lg` | 48px | `px-6 py-3` | 15px | `rounded-xl` (12px) |
| `xl` | 56px | `px-8 py-4` | 16px | `rounded-2xl` (16px) |

### 3.4 버튼 코드 예시

```tsx
// Primary Button
<button className="
  h-10 px-5 rounded-xl
  bg-blaanid-400 hover:bg-blaanid-500 active:bg-blaanid-600
  text-white font-medium text-sm
  transition-colors duration-200
  focus:outline-none focus:ring-2 focus:ring-blaanid-400/50 focus:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed
">
  저장하기
</button>

// Secondary Button
<button className="
  h-10 px-5 rounded-xl
  bg-white hover:bg-gray-50 border border-gray-300
  text-gray-800 font-medium text-sm
  transition-colors duration-200
  dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200
">
  취소
</button>

// Icon Button (원형)
<button className="
  w-10 h-10 rounded-full
  bg-blaanid-50 hover:bg-blaanid-100
  text-blaanid-600
  flex items-center justify-center
  transition-colors duration-200
">
  <PlusIcon className="w-5 h-5" />
</button>
```

---

## 4. 타이포그래피

### 4.1 폰트 패밀리

| 용도 | 폰트 | 대체 폰트 | 설명 |
|------|------|-----------|------|
| **Primary** | Pretendard | system-ui, sans-serif | 한글/영문 모두 깔끔한 가독성 |
| **Decorative** | 마비노기 클래식체 | Pretendard | 로고, 특별 제목에만 사용 |
| **Mono** | JetBrains Mono | monospace | 코드, 숫자 데이터 |

### 4.2 폰트 스케일

| Token | Size | Weight | Line Height | 용도 |
|-------|------|--------|-------------|------|
| `display` | 36-48px | 700 | 1.1 | 히어로 제목, 랜딩 |
| `h1` | 28-32px | 700 | 1.2 | 페이지 제목 |
| `h2` | 22-24px | 600 | 1.25 | 섹션 제목 |
| `h3` | 18-20px | 600 | 1.3 | 카드 제목 |
| `h4` | 16-17px | 600 | 1.35 | 서브 제목 |
| `body-lg` | 16px | 400 | 1.6 | 강조 본문 |
| `body` | 14-15px | 400 | 1.6 | 일반 본문 |
| `body-sm` | 13px | 400 | 1.5 | 작은 본문 |
| `caption` | 12px | 400 | 1.5 | 캡션, 라벨 |
| `tiny` | 11px | 400 | 1.4 | 메타데이터, 날짜 |

### 4.3 텍스트 색상 계층

```
라이트 모드:
├── Primary (gray-900): 제목, 중요 텍스트
├── Secondary (gray-700): 본문
├── Tertiary (gray-600): 부제목, 설명
├── Muted (gray-500): 비활성, 덜 중요한 정보
└── Placeholder (gray-400): 입력 힌트

다크 모드:
├── Primary (gray-50): 제목, 중요 텍스트
├── Secondary (gray-200): 본문
├── Tertiary (gray-300): 부제목, 설명
├── Muted (gray-400): 비활성
└── Placeholder (gray-500): 입력 힌트
```

### 4.4 텍스트 스타일 예시

```tsx
// 페이지 제목
<h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-50">
  경매장 거래 내역
</h1>

// 섹션 제목
<h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
  최근 거래
</h2>

// 본문
<p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
  마비노기 경매장의 모든 거래 내역을 확인하세요.
</p>

// 캡션
<span className="text-xs text-gray-500 dark:text-gray-400">
  2024년 1월 14일
</span>

// 강조 텍스트 (링크)
<a className="text-blaanid-600 hover:text-blaanid-700 dark:text-blaanid-300 font-medium">
  더 보기
</a>
```

---

## 5. UI 컴포넌트 스타일

### 5.1 모서리 둥글기 (Border Radius)

동글동글한 감성을 위해 넉넉한 둥글기를 적용합니다.

| Token | Size | Tailwind | 용도 |
|-------|------|----------|------|
| `sm` | 8px | `rounded-lg` | 작은 버튼, 입력 필드, 태그 |
| `md` | 12px | `rounded-xl` | 버튼, 배지, 드롭다운 |
| `lg` | 16px | `rounded-2xl` | 카드, 팝오버 |
| `xl` | 20px | `rounded-[20px]` | 메인 카드, 모달 |
| `2xl` | 24px | `rounded-3xl` | 큰 모달, 히어로 섹션 |
| `full` | 9999px | `rounded-full` | 아바타, 원형 버튼, 태그 |

**Anti-pattern (사용 금지)**
```
rounded-none   → 날카로운 모서리 금지
rounded-sm     → 너무 작은 둥글기 (4px)
rounded        → 기본값 너무 작음 (6px)
```

### 5.2 그림자 (Shadows)

부드럽고 중립적인 톤의 그림자를 사용합니다.

| Token | 값 | 용도 |
|-------|-----|------|
| `soft-sm` | `0 2px 8px rgba(0, 0, 0, 0.06)` | 입력 필드, 작은 버튼 |
| `soft-md` | `0 4px 16px rgba(0, 0, 0, 0.08)` | 호버 상태, 드롭다운 |
| `soft-lg` | `0 8px 24px rgba(0, 0, 0, 0.10)` | 카드, 팝오버 |
| `soft-xl` | `0 12px 32px rgba(0, 0, 0, 0.12)` | 모달, 플로팅 요소 |
| `glow-blaanid` | `0 4px 20px rgba(127, 180, 250, 0.25)` | Primary 버튼 호버 |
| `glow-gold` | `0 4px 20px rgba(238, 178, 51, 0.25)` | Accent 버튼 호버 |

### 5.3 네비게이션 바

```tsx
// 헤더 네비게이션
<header className="
  sticky top-0 z-50
  bg-white/90 dark:bg-gray-900/90
  backdrop-blur-md
  border-b border-gray-200 dark:border-gray-700
">
  <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
    {/* 로고 */}
    <Logo />

    {/* 메뉴 */}
    <ul className="flex items-center gap-1">
      <li>
        <a className="
          px-4 py-2 rounded-xl
          text-sm font-medium text-gray-700 dark:text-gray-300
          hover:bg-gray-100 dark:hover:bg-gray-800
          transition-colors
        ">
          경매장
        </a>
      </li>
      {/* 활성 메뉴 */}
      <li>
        <a className="
          px-4 py-2 rounded-xl
          text-sm font-medium
          bg-blaanid-50 text-blaanid-700
          dark:bg-blaanid-900/30 dark:text-blaanid-300
        ">
          커뮤니티
        </a>
      </li>
    </ul>
  </nav>
</header>
```

### 5.4 카드 디자인

```tsx
// 기본 카드
<div className="
  bg-white dark:bg-gray-800
  rounded-[20px]
  border border-gray-200 dark:border-gray-700
  shadow-[0_8px_24px_rgba(0,0,0,0.08)]
  dark:shadow-none
  p-5
">
  {/* 카드 내용 */}
</div>

// 인터랙티브 카드 (클릭 가능)
<div className="
  bg-white dark:bg-gray-800
  rounded-[20px]
  border border-gray-200 dark:border-gray-700
  shadow-[0_4px_16px_rgba(0,0,0,0.06)]
  hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]
  hover:border-gray-300 dark:hover:border-gray-600
  transition-all duration-200
  cursor-pointer
  p-5
">
  {/* 카드 내용 */}
</div>

// 이미지 카드 (게시물, 아이템 등)
<div className="
  bg-white dark:bg-gray-800
  rounded-[20px]
  border border-gray-200 dark:border-gray-700
  overflow-hidden
">
  {/* 이미지 영역 */}
  <div className="aspect-video bg-gray-100 dark:bg-gray-900">
    <img className="w-full h-full object-cover" />
  </div>

  {/* 텍스트 영역 */}
  <div className="p-4">
    <h3 className="font-semibold text-gray-900 dark:text-gray-50">제목</h3>
    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">설명</p>
  </div>
</div>
```

### 5.5 입력 필드 (Input)

```tsx
// 기본 입력 필드
<input className="
  w-full h-11 px-4 rounded-xl
  bg-white dark:bg-gray-800
  border border-gray-300 dark:border-gray-600
  text-gray-900 dark:text-gray-50
  placeholder:text-gray-400 dark:placeholder:text-gray-500
  focus:outline-none focus:border-blaanid-400 focus:ring-2 focus:ring-blaanid-400/20
  transition-all duration-200
" placeholder="검색어를 입력하세요" />

// 아이콘 포함 입력 필드
<div className="relative">
  <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
  <input className="
    w-full h-11 pl-11 pr-4 rounded-xl
    bg-white dark:bg-gray-800
    border border-gray-300 dark:border-gray-600
    ...
  " />
</div>

// 에러 상태
<input className="
  ... border-red-400 bg-red-50 dark:bg-red-900/10
  focus:border-red-500 focus:ring-red-500/20
" />
```

### 5.6 모달 (Modal)

```tsx
// 모달 오버레이
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">

  {/* 모달 컨텐츠 */}
  <div className="
    fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
    w-full max-w-lg max-h-[90vh]
    bg-white dark:bg-gray-800
    rounded-[24px]
    shadow-[0_20px_48px_rgba(0,0,0,0.14)]
    overflow-hidden
  ">
    {/* 헤더 */}
    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">
        모달 제목
      </h2>
    </div>

    {/* 본문 */}
    <div className="px-6 py-4 overflow-y-auto">
      {/* 내용 */}
    </div>

    {/* 푸터 */}
    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
      <Button variant="secondary">취소</Button>
      <Button variant="primary">확인</Button>
    </div>
  </div>
</div>
```

### 5.7 배지 & 태그

```tsx
// 기본 배지
<span className="
  inline-flex items-center
  px-2.5 py-1 rounded-full
  text-xs font-medium
  bg-gray-100 text-gray-700
  dark:bg-gray-700 dark:text-gray-300
">
  일반
</span>

// Primary 배지
<span className="bg-blaanid-100 text-blaanid-700 dark:bg-blaanid-900/30 dark:text-blaanid-300 ...">
  인기
</span>

// Accent 배지
<span className="bg-gold-100 text-gold-700 dark:bg-gold-900/30 dark:text-gold-300 ...">
  NEW
</span>

// 아이콘 포함 태그
<span className="
  inline-flex items-center gap-1.5
  px-3 py-1.5 rounded-full
  text-xs font-medium
  bg-blaanid-50 text-blaanid-700 border border-blaanid-200
">
  <TagIcon className="w-3.5 h-3.5" />
  무기
</span>
```

### 5.8 탭 (Tabs)

```tsx
// 탭 컨테이너
<div className="
  inline-flex p-1 rounded-xl
  bg-gray-100 dark:bg-gray-800
">
  {/* 비활성 탭 */}
  <button className="
    px-4 py-2 rounded-lg
    text-sm font-medium text-gray-600 dark:text-gray-400
    hover:text-gray-900 dark:hover:text-gray-100
    transition-colors
  ">
    전체
  </button>

  {/* 활성 탭 */}
  <button className="
    px-4 py-2 rounded-lg
    text-sm font-medium
    bg-white dark:bg-gray-700
    text-gray-900 dark:text-gray-50
    shadow-sm
  ">
    거래 내역
  </button>
</div>
```

### 5.9 드롭다운 (Dropdown)

```tsx
// 드롭다운 메뉴
<div className="
  absolute top-full left-0 mt-2
  min-w-[180px]
  bg-white dark:bg-gray-800
  rounded-xl
  border border-gray-200 dark:border-gray-700
  shadow-[0_8px_24px_rgba(0,0,0,0.10)]
  py-2
  z-50
">
  {/* 메뉴 아이템 */}
  <button className="
    w-full px-4 py-2 text-left
    text-sm text-gray-700 dark:text-gray-300
    hover:bg-gray-50 dark:hover:bg-gray-700
    transition-colors
  ">
    옵션 1
  </button>

  {/* 활성 아이템 */}
  <button className="
    w-full px-4 py-2 text-left
    text-sm font-semibold
    bg-blaanid-50 text-blaanid-700
    dark:bg-blaanid-900/30 dark:text-blaanid-300
  ">
    선택됨
  </button>

  {/* 구분선 */}
  <div className="my-2 border-t border-gray-200 dark:border-gray-700" />
</div>
```

---

## 6. 아이콘 & 일러스트 가이드

### 6.1 아이콘 스타일

| 항목 | 권장 사항 |
|------|-----------|
| **라이브러리** | Lucide React (심플하고 일관된 스타일) |
| **스트로크** | 1.5~2px (너무 얇거나 두껍지 않게) |
| **모서리** | 둥근 끝처리 (`stroke-linecap="round"`) |
| **스타일** | Outline (채우기보다 선 스타일 선호) |

### 6.2 아이콘 크기

| Size | 픽셀 | 용도 |
|------|------|------|
| `xs` | 14px | 배지 내부 |
| `sm` | 16px | 버튼 내부, 인라인 |
| `md` | 20px | 일반 아이콘 |
| `lg` | 24px | 네비게이션, 강조 |
| `xl` | 32px | 빈 상태, 피처 |
| `2xl` | 48px | 히어로, 온보딩 |

### 6.3 아이콘 색상

```tsx
// 기본 아이콘
<Icon className="text-gray-500" />

// Primary 아이콘
<Icon className="text-blaanid-400" />

// Accent 아이콘
<Icon className="text-gold-400" />

// 인터랙티브 아이콘
<Icon className="text-gray-400 hover:text-gray-600 transition-colors" />
```

### 6.4 일러스트 톤 가이드

마비노기 세계관에 어울리는 일러스트 스타일입니다.

| 항목 | 가이드 |
|------|--------|
| **스타일** | 손그림 느낌, 부드러운 선, 동글동글한 형태 |
| **색감** | 청색/하늘색 기조, 금색 포인트, 부드러운 회색 배경 |
| **주제** | 자연 (숲, 초원, 꽃), 마을, 캐릭터, 아이템, 펫 |
| **분위기** | 아기자기함, 평화로움, 판타지 생활 |

### 6.5 이미지 활용 가이드

| 영역 | 이미지 유형 | 예시 |
|------|-------------|------|
| **히어로 섹션** | 메인 일러스트 배경 | 에린 마을 풍경, 캐릭터 |
| **빈 상태** | 귀여운 캐릭터/아이콘 | 검색 결과 없음, 로딩 |
| **카테고리 아이콘** | 미니 일러스트 | 무기, 방어구, 소비 아이템 |
| **섹션 구분** | 장식용 일러스트 | 꽃, 나뭇잎, 별 |
| **에러 페이지** | 캐릭터 일러스트 | 404, 500 에러 |

### 6.6 이미지 요청 시 프롬프트 가이드

필요한 일러스트를 요청할 때 사용할 수 있는 키워드입니다.

```
스타일: 마비노기 스타일, 손그림, 수채화 느낌, 파스텔 톤
분위기: 따뜻한, 평화로운, 아기자기한, 판타지 라이프
색상: 하늘색/청색 기조, 금색 포인트, 연한 회색 배경
배경: 투명 또는 단색 (gray-100, white)
형태: 동글동글, 부드러운 곡선, 날카로운 모서리 없음
```

---

## 7. 레이아웃 & 간격

### 7.1 그리드 시스템

| 구분 | 최대 너비 | 컬럼 수 | 거터 |
|------|-----------|---------|------|
| **Mobile** | 100% | 1 | 16px |
| **Tablet** | 768px | 2 | 20px |
| **Desktop** | 1024px | 3-4 | 24px |
| **Wide** | 1280px | 4-6 | 24px |

### 7.2 컨테이너 너비

```tsx
// 기본 컨테이너
<div className="max-w-6xl mx-auto px-4 md:px-6">

// 좁은 컨테이너 (읽기 콘텐츠)
<div className="max-w-2xl mx-auto px-4">

// 넓은 컨테이너 (대시보드)
<div className="max-w-7xl mx-auto px-4 md:px-6">
```

### 7.3 간격 스케일 (4px 기반)

| Token | Size | Tailwind | 용도 |
|-------|------|----------|------|
| `xs` | 4px | `p-1`, `gap-1` | 아이콘 내부 |
| `sm` | 8px | `p-2`, `gap-2` | 요소 내부 |
| `md` | 12px | `p-3`, `gap-3` | 컴팩트 카드 |
| `base` | 16px | `p-4`, `gap-4` | 기본 간격 |
| `lg` | 24px | `p-6`, `gap-6` | 카드 패딩 |
| `xl` | 32px | `p-8`, `gap-8` | 섹션 간격 |
| `2xl` | 48px | `p-12`, `gap-12` | 큰 섹션 |
| `3xl` | 64px | `p-16`, `gap-16` | 페이지 레벨 |

### 7.4 컴포넌트별 간격 가이드

| 컴포넌트 | 내부 Padding | 외부 Gap |
|----------|--------------|----------|
| **버튼 (sm)** | `px-3 py-1.5` | - |
| **버튼 (md)** | `px-5 py-2.5` | - |
| **버튼 (lg)** | `px-6 py-3` | - |
| **입력 필드** | `px-4 py-2.5` | - |
| **카드** | `p-5` ~ `p-6` | `gap-4` |
| **모달** | `p-6` ~ `p-8` | - |
| **리스트 아이템** | `px-4 py-3` | `gap-2` |
| **섹션** | `py-8` ~ `py-12` | `gap-6` |

### 7.5 반응형 브레이크포인트

```css
/* Tailwind 기본 브레이크포인트 */
sm: 640px   /* 모바일 가로 */
md: 768px   /* 태블릿 */
lg: 1024px  /* 작은 데스크톱 */
xl: 1280px  /* 데스크톱 */
2xl: 1536px /* 넓은 데스크톱 */
```

### 7.6 반응형 레이아웃 예시

```tsx
// 카드 그리드
<div className="
  grid gap-4
  grid-cols-1
  sm:grid-cols-2
  lg:grid-cols-3
  xl:grid-cols-4
">
  {items.map(item => <Card key={item.id} />)}
</div>

// 사이드바 레이아웃
<div className="flex">
  {/* 사이드바 - 데스크톱만 표시 */}
  <aside className="hidden lg:block w-64 shrink-0">
    <Sidebar />
  </aside>

  {/* 메인 콘텐츠 */}
  <main className="flex-1 min-w-0">
    {children}
  </main>
</div>

// 모바일 하단 네비게이션
<nav className="
  fixed bottom-0 inset-x-0
  lg:hidden
  bg-white/90 dark:bg-gray-900/90
  backdrop-blur-md
  border-t border-gray-200 dark:border-gray-700
  px-4 py-2
">
  {/* 네비게이션 아이템 */}
</nav>
```

---

## 8. 애니메이션 & 트랜지션

### 8.1 트랜지션 기본값

```css
/* 색상/배경 변화 */
transition-colors duration-200

/* 모든 속성 */
transition-all duration-200

/* 부드러운 이징 */
transition-all duration-300 ease-out
```

### 8.2 호버 효과

```tsx
// 부드러운 확대
className="hover:scale-[1.02] transition-transform duration-200"

// 살짝 떠오르기
className="hover:-translate-y-0.5 transition-transform duration-200"

// 그림자 증가
className="hover:shadow-lg transition-shadow duration-200"
```

### 8.3 로딩 애니메이션

```css
/* 스피너 */
animate-spin

/* 부드러운 펄스 */
@keyframes gentle-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* 스켈레톤 로딩 */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

---

## 9. 접근성 (Accessibility)

### 9.1 색상 대비

- 본문 텍스트: 최소 **4.5:1** 대비
- 큰 텍스트 (18px+): 최소 **3:1** 대비
- UI 요소: 최소 **3:1** 대비

### 9.2 포커스 스타일

```tsx
className="
  focus:outline-none
  focus:ring-2 focus:ring-blaanid-400/50
  focus:ring-offset-2 focus:ring-offset-gray-100
  dark:focus:ring-offset-gray-900
"
```

### 9.3 터치 타겟

- 최소 크기: **44x44px**
- 버튼/링크 간격: 최소 **8px**

---

## 10. 빠른 참조

### Tailwind 클래스 요약

```tsx
// 배경 색상
bg-gray-100            // 메인 배경 (Main Gray)
bg-white               // 카드/강조 배경

// 텍스트 색상
text-gray-{50-900}     // 텍스트 (gray-900: 제목, gray-700: 본문)

// Primary 색상
bg-blaanid-{50-900}    // 배경
text-blaanid-{50-900}  // 텍스트 (blaanid-400: 메인)

// Accent 색상
bg-gold-{50-900}       // 배경
text-gold-{50-900}     // 텍스트 (gold-400: 메인)

// 모서리
rounded-lg             // 8px - 작은 요소
rounded-xl             // 12px - 버튼, 입력
rounded-2xl            // 16px - 카드
rounded-[20px]         // 20px - 메인 카드
rounded-3xl            // 24px - 모달
rounded-full           // 원형

// 그림자 (커스텀)
shadow-[0_8px_24px_rgba(0,0,0,0.08)]  // 카드
shadow-[0_20px_48px_rgba(0,0,0,0.14)] // 모달

// 트랜지션
transition-colors duration-200
transition-all duration-200
```

### 색상 비율 체크리스트

새로운 컴포넌트를 만들 때 확인하세요:

- [ ] **60-30-10 법칙** 준수 (배경 60%, Primary 30%, Accent 10%)
- [ ] 배경에는 `gray-100` 또는 `white` 사용
- [ ] Primary 인터랙션에는 `blaanid-400` 사용
- [ ] Accent는 제한적으로만 사용 (알림, 강조 등)
- [ ] 충분한 둥글기 적용 (최소 `rounded-lg`)
- [ ] 부드러운 그림자 사용
- [ ] 다크 모드 스타일 추가
- [ ] 호버/포커스 상태 정의
- [ ] 접근성 고려 (WCAG 색상 대비, 포커스 표시)
- [ ] 반응형 대응

---

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|----------|
| 2024-01-14 | 1.0.0 | 초기 디자인 시스템 작성 |
| 2024-01-14 | 2.0.0 | 전면 개편 - maple.gg 참고, 일러스트 가이드 추가 |
| 2025-01-15 | 3.0.0 | 색상 팔레트 전면 개편 - 60-30-10 법칙 적용, Gray/Blaanid Blue/Gold 체계 |
