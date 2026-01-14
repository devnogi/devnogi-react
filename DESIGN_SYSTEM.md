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

### 2.1 Primary - Clover Green (클로버 녹색)

마비노기의 푸른 초원과 자연을 상징하는 메인 컬러입니다.

| Token | HEX | RGB | 용도 |
|-------|-----|-----|------|
| `clover-50` | `#f0fdf4` | 240, 253, 244 | 아주 연한 배경 |
| `clover-100` | `#dcfce7` | 220, 252, 231 | 연한 배경, 호버 |
| `clover-200` | `#bbf7d0` | 187, 247, 208 | 강조 배경 |
| `clover-300` | `#86efac` | 134, 239, 172 | 보조 요소 |
| `clover-400` | `#4ade80` | 74, 222, 128 | 아이콘, 장식 |
| `clover-500` | `#22c55e` | 34, 197, 94 | **메인 색상** |
| `clover-600` | `#16a34a` | 22, 163, 74 | 호버, 강조 |
| `clover-700` | `#15803d` | 21, 128, 61 | 활성 상태 |
| `clover-800` | `#166534` | 22, 101, 52 | 텍스트 강조 |
| `clover-900` | `#14532d` | 20, 83, 45 | 진한 텍스트 |

### 2.2 Secondary - Cream (크림 베이지)

따뜻하고 포근한 배경과 보조 요소에 사용합니다.

| Token | HEX | RGB | 용도 |
|-------|-----|-----|------|
| `cream-50` | `#fefdfb` | 254, 253, 251 | 메인 배경 (라이트) |
| `cream-100` | `#fdf8f3` | 253, 248, 243 | 카드 배경 |
| `cream-200` | `#f5ebe0` | 245, 235, 224 | 섹션 배경 |
| `cream-300` | `#e9dcc9` | 233, 220, 201 | 테두리 |
| `cream-400` | `#d4c4a8` | 212, 196, 168 | 비활성 요소 |
| `cream-500` | `#b8a589` | 184, 165, 137 | 보조 텍스트 |
| `cream-600` | `#9a8b73` | 154, 139, 115 | 부제목 |
| `cream-700` | `#7a6f5d` | 122, 111, 93 | 본문 텍스트 |
| `cream-800` | `#5c5347` | 92, 83, 71 | 강조 텍스트 |
| `cream-900` | `#3d382f` | 61, 56, 47 | 제목 텍스트 |

### 2.3 Accent - Sunset Orange (노을빛 주황)

알림, 중요 표시, 포인트 컬러로 사용합니다.

| Token | HEX | RGB | 용도 |
|-------|-----|-----|------|
| `sunset-50` | `#fff7ed` | 255, 247, 237 | 알림 배경 |
| `sunset-100` | `#ffedd5` | 255, 237, 213 | 하이라이트 배경 |
| `sunset-200` | `#fed7aa` | 254, 215, 170 | 배지 배경 |
| `sunset-300` | `#fdba74` | 253, 186, 116 | 장식 요소 |
| `sunset-400` | `#fb923c` | 251, 146, 60 | 아이콘 |
| `sunset-500` | `#f97316` | 249, 115, 22 | **액센트 색상** |
| `sunset-600` | `#ea580c` | 234, 88, 12 | 호버 상태 |
| `sunset-700` | `#c2410c` | 194, 65, 12 | 활성 상태 |
| `sunset-800` | `#9a3412` | 154, 52, 18 | 경고 텍스트 |
| `sunset-900` | `#7c2d12` | 124, 45, 18 | 진한 경고 |

### 2.4 Semantic Colors (의미 색상)

| 용도 | 라이트 모드 | 다크 모드 | 설명 |
|------|-------------|-----------|------|
| **Success** | `clover-500` | `clover-400` | 성공, 완료, 긍정 |
| **Warning** | `sunset-500` | `sunset-400` | 주의, 경고 |
| **Error** | `#ef4444` | `#f87171` | 오류, 삭제, 부정 |
| **Info** | `#0ea5e9` | `#38bdf8` | 정보, 안내 |

### 2.5 라이트 모드 색상 체계

```css
:root {
  /* 배경 */
  --bg-primary: #fefdfb;      /* cream-50: 메인 배경 */
  --bg-secondary: #fdf8f3;    /* cream-100: 카드/섹션 배경 */
  --bg-tertiary: #f5ebe0;     /* cream-200: 강조 배경 */
  --bg-elevated: #ffffff;     /* 떠있는 요소 (모달, 드롭다운) */

  /* 텍스트 */
  --text-primary: #3d382f;    /* cream-900: 제목 */
  --text-secondary: #5c5347;  /* cream-800: 본문 */
  --text-tertiary: #7a6f5d;   /* cream-700: 부제목 */
  --text-muted: #9a8b73;      /* cream-600: 비활성 */
  --text-placeholder: #b8a589; /* cream-500: 플레이스홀더 */

  /* 테두리 */
  --border-default: #e9dcc9;  /* cream-300 */
  --border-strong: #d4c4a8;   /* cream-400 */
  --border-focus: #22c55e;    /* clover-500 */

  /* Primary */
  --primary: #22c55e;         /* clover-500 */
  --primary-hover: #16a34a;   /* clover-600 */
  --primary-active: #15803d;  /* clover-700 */
  --primary-bg: #f0fdf4;      /* clover-50 */

  /* Accent */
  --accent: #f97316;          /* sunset-500 */
  --accent-hover: #ea580c;    /* sunset-600 */
  --accent-bg: #fff7ed;       /* sunset-50 */
}
```

### 2.6 다크 모드 색상 체계

```css
.dark {
  /* 배경 - 따뜻한 다크 톤 */
  --bg-primary: #1a1814;      /* 메인 배경 */
  --bg-secondary: #252219;    /* 카드/섹션 배경 */
  --bg-tertiary: #2d2a23;     /* 강조 배경 */
  --bg-elevated: #353128;     /* 떠있는 요소 */

  /* 텍스트 */
  --text-primary: #fdf8f3;    /* cream-100 */
  --text-secondary: #e9dcc9;  /* cream-300 */
  --text-tertiary: #d4c4a8;   /* cream-400 */
  --text-muted: #b8a589;      /* cream-500 */
  --text-placeholder: #9a8b73; /* cream-600 */

  /* 테두리 */
  --border-default: #3d382f;  /* cream-900 */
  --border-strong: #4a453b;
  --border-focus: #4ade80;    /* clover-400 */

  /* Primary */
  --primary: #4ade80;         /* clover-400 */
  --primary-hover: #22c55e;   /* clover-500 */
  --primary-active: #16a34a;  /* clover-600 */
  --primary-bg: rgba(34, 197, 94, 0.1);

  /* Accent */
  --accent: #fb923c;          /* sunset-400 */
  --accent-hover: #f97316;    /* sunset-500 */
  --accent-bg: rgba(249, 115, 22, 0.1);
}
```

---

## 3. 버튼 스타일

### 3.1 버튼 종류 및 색상

| 종류 | 용도 | 라이트 모드 | 다크 모드 |
|------|------|-------------|-----------|
| **Primary** | 주요 액션 (저장, 확인, 검색) | `bg-clover-500` | `bg-clover-500` |
| **Secondary** | 보조 액션 (취소, 닫기) | `bg-cream-100 border-cream-300` | `bg-cream-800/20 border-cream-700` |
| **Ghost** | 미니멀한 액션 | `bg-transparent hover:bg-cream-100` | `bg-transparent hover:bg-cream-800/20` |
| **Accent** | 특별한 액션 (알림, 이벤트) | `bg-sunset-500` | `bg-sunset-500` |
| **Destructive** | 삭제, 위험한 액션 | `bg-red-500` | `bg-red-500` |

### 3.2 버튼 상태

| 상태 | 스타일 변화 |
|------|-------------|
| **Default** | 기본 색상 |
| **Hover** | 배경 1단계 진하게 |
| **Active/Pressed** | 배경 2단계 진하게, `scale-[0.98]` |
| **Focus** | `ring-2 ring-clover-500/50 ring-offset-2` |
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
  bg-clover-500 hover:bg-clover-600 active:bg-clover-700
  text-white font-medium text-sm
  transition-colors duration-200
  focus:outline-none focus:ring-2 focus:ring-clover-500/50 focus:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed
">
  저장하기
</button>

// Secondary Button
<button className="
  h-10 px-5 rounded-xl
  bg-cream-100 hover:bg-cream-200 border border-cream-300
  text-cream-800 font-medium text-sm
  transition-colors duration-200
  dark:bg-cream-800/20 dark:border-cream-700 dark:text-cream-200
">
  취소
</button>

// Icon Button (원형)
<button className="
  w-10 h-10 rounded-full
  bg-clover-50 hover:bg-clover-100
  text-clover-600
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
├── Primary (cream-900): 제목, 중요 텍스트
├── Secondary (cream-800): 본문
├── Tertiary (cream-700): 부제목, 설명
├── Muted (cream-600): 비활성, 덜 중요한 정보
└── Placeholder (cream-500): 입력 힌트

다크 모드:
├── Primary (cream-100): 제목, 중요 텍스트
├── Secondary (cream-300): 본문
├── Tertiary (cream-400): 부제목, 설명
├── Muted (cream-500): 비활성
└── Placeholder (cream-600): 입력 힌트
```

### 4.4 텍스트 스타일 예시

```tsx
// 페이지 제목
<h1 className="text-2xl md:text-3xl font-bold text-cream-900 dark:text-cream-100">
  경매장 거래 내역
</h1>

// 섹션 제목
<h2 className="text-xl font-semibold text-cream-800 dark:text-cream-200">
  최근 거래
</h2>

// 본문
<p className="text-sm text-cream-700 dark:text-cream-400 leading-relaxed">
  마비노기 경매장의 모든 거래 내역을 확인하세요.
</p>

// 캡션
<span className="text-xs text-cream-500 dark:text-cream-500">
  2024년 1월 14일
</span>

// 강조 텍스트 (링크)
<a className="text-clover-600 hover:text-clover-700 dark:text-clover-400 font-medium">
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

부드럽고 따뜻한 톤의 그림자를 사용합니다.

| Token | 값 | 용도 |
|-------|-----|------|
| `soft-sm` | `0 2px 8px rgba(61, 56, 47, 0.06)` | 입력 필드, 작은 버튼 |
| `soft-md` | `0 4px 16px rgba(61, 56, 47, 0.08)` | 호버 상태, 드롭다운 |
| `soft-lg` | `0 8px 24px rgba(61, 56, 47, 0.10)` | 카드, 팝오버 |
| `soft-xl` | `0 12px 32px rgba(61, 56, 47, 0.12)` | 모달, 플로팅 요소 |
| `glow-clover` | `0 4px 20px rgba(34, 197, 94, 0.25)` | Primary 버튼 호버 |
| `glow-sunset` | `0 4px 20px rgba(249, 115, 22, 0.25)` | Accent 버튼 호버 |

### 5.3 네비게이션 바

```tsx
// 헤더 네비게이션
<header className="
  sticky top-0 z-50
  bg-cream-50/90 dark:bg-[#1a1814]/90
  backdrop-blur-md
  border-b border-cream-200 dark:border-cream-800
">
  <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
    {/* 로고 */}
    <Logo />

    {/* 메뉴 */}
    <ul className="flex items-center gap-1">
      <li>
        <a className="
          px-4 py-2 rounded-xl
          text-sm font-medium text-cream-700 dark:text-cream-300
          hover:bg-cream-100 dark:hover:bg-cream-800/30
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
          bg-clover-50 text-clover-700
          dark:bg-clover-900/30 dark:text-clover-400
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
  bg-white dark:bg-[#252219]
  rounded-[20px]
  border border-cream-200 dark:border-cream-800
  shadow-[0_8px_24px_rgba(61,56,47,0.08)]
  dark:shadow-none
  p-5
">
  {/* 카드 내용 */}
</div>

// 인터랙티브 카드 (클릭 가능)
<div className="
  bg-white dark:bg-[#252219]
  rounded-[20px]
  border border-cream-200 dark:border-cream-800
  shadow-[0_4px_16px_rgba(61,56,47,0.06)]
  hover:shadow-[0_8px_24px_rgba(61,56,47,0.12)]
  hover:border-cream-300 dark:hover:border-cream-700
  transition-all duration-200
  cursor-pointer
  p-5
">
  {/* 카드 내용 */}
</div>

// 이미지 카드 (게시물, 아이템 등)
<div className="
  bg-white dark:bg-[#252219]
  rounded-[20px]
  border border-cream-200 dark:border-cream-800
  overflow-hidden
">
  {/* 이미지 영역 */}
  <div className="aspect-video bg-cream-100 dark:bg-cream-900">
    <img className="w-full h-full object-cover" />
  </div>

  {/* 텍스트 영역 */}
  <div className="p-4">
    <h3 className="font-semibold text-cream-900 dark:text-cream-100">제목</h3>
    <p className="text-sm text-cream-600 dark:text-cream-400 mt-1">설명</p>
  </div>
</div>
```

### 5.5 입력 필드 (Input)

```tsx
// 기본 입력 필드
<input className="
  w-full h-11 px-4 rounded-xl
  bg-white dark:bg-cream-900/50
  border border-cream-300 dark:border-cream-700
  text-cream-900 dark:text-cream-100
  placeholder:text-cream-400 dark:placeholder:text-cream-600
  focus:outline-none focus:border-clover-500 focus:ring-2 focus:ring-clover-500/20
  transition-all duration-200
" placeholder="검색어를 입력하세요" />

// 아이콘 포함 입력 필드
<div className="relative">
  <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-400" />
  <input className="
    w-full h-11 pl-11 pr-4 rounded-xl
    bg-white dark:bg-cream-900/50
    border border-cream-300 dark:border-cream-700
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
    bg-white dark:bg-[#252219]
    rounded-[24px]
    shadow-[0_20px_48px_rgba(61,56,47,0.14)]
    overflow-hidden
  ">
    {/* 헤더 */}
    <div className="px-6 py-4 border-b border-cream-200 dark:border-cream-800">
      <h2 className="text-lg font-bold text-cream-900 dark:text-cream-100">
        모달 제목
      </h2>
    </div>

    {/* 본문 */}
    <div className="px-6 py-4 overflow-y-auto">
      {/* 내용 */}
    </div>

    {/* 푸터 */}
    <div className="px-6 py-4 border-t border-cream-200 dark:border-cream-800 flex gap-3 justify-end">
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
  bg-cream-100 text-cream-700
  dark:bg-cream-800/30 dark:text-cream-300
">
  일반
</span>

// Primary 배지
<span className="bg-clover-100 text-clover-700 dark:bg-clover-900/30 dark:text-clover-400 ...">
  인기
</span>

// Accent 배지
<span className="bg-sunset-100 text-sunset-700 dark:bg-sunset-900/30 dark:text-sunset-400 ...">
  NEW
</span>

// 아이콘 포함 태그
<span className="
  inline-flex items-center gap-1.5
  px-3 py-1.5 rounded-full
  text-xs font-medium
  bg-clover-50 text-clover-700 border border-clover-200
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
  bg-cream-100 dark:bg-cream-800/30
">
  {/* 비활성 탭 */}
  <button className="
    px-4 py-2 rounded-lg
    text-sm font-medium text-cream-600 dark:text-cream-400
    hover:text-cream-900 dark:hover:text-cream-200
    transition-colors
  ">
    전체
  </button>

  {/* 활성 탭 */}
  <button className="
    px-4 py-2 rounded-lg
    text-sm font-medium
    bg-white dark:bg-[#252219]
    text-cream-900 dark:text-cream-100
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
  bg-white dark:bg-[#252219]
  rounded-xl
  border border-cream-200 dark:border-cream-800
  shadow-[0_8px_24px_rgba(61,56,47,0.10)]
  py-2
  z-50
">
  {/* 메뉴 아이템 */}
  <button className="
    w-full px-4 py-2 text-left
    text-sm text-cream-700 dark:text-cream-300
    hover:bg-cream-50 dark:hover:bg-cream-800/30
    transition-colors
  ">
    옵션 1
  </button>

  {/* 활성 아이템 */}
  <button className="
    w-full px-4 py-2 text-left
    text-sm font-semibold
    bg-clover-50 text-clover-700
    dark:bg-clover-900/30 dark:text-clover-400
  ">
    선택됨
  </button>

  {/* 구분선 */}
  <div className="my-2 border-t border-cream-200 dark:border-cream-800" />
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
<Icon className="text-cream-500" />

// Primary 아이콘
<Icon className="text-clover-500" />

// Accent 아이콘
<Icon className="text-sunset-500" />

// 인터랙티브 아이콘
<Icon className="text-cream-400 hover:text-cream-600 transition-colors" />
```

### 6.4 일러스트 톤 가이드

마비노기 세계관에 어울리는 일러스트 스타일입니다.

| 항목 | 가이드 |
|------|--------|
| **스타일** | 손그림 느낌, 부드러운 선, 동글동글한 형태 |
| **색감** | 따뜻한 톤 (베이지, 녹색, 주황 계열), 파스텔 |
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
색상: 베이지, 크림, 녹색, 주황, 파스텔
배경: 투명 또는 단색 (cream-50, cream-100)
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
  bg-cream-50/90 dark:bg-[#1a1814]/90
  backdrop-blur-md
  border-t border-cream-200 dark:border-cream-800
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
  focus:ring-2 focus:ring-clover-500/50
  focus:ring-offset-2 focus:ring-offset-cream-50
  dark:focus:ring-offset-[#1a1814]
"
```

### 9.3 터치 타겟

- 최소 크기: **44x44px**
- 버튼/링크 간격: 최소 **8px**

---

## 10. 빠른 참조

### Tailwind 클래스 요약

```tsx
// 색상
text-cream-{50-900}    // 텍스트
bg-cream-{50-900}      // 배경
text-clover-{50-900}   // Primary
text-sunset-{50-900}   // Accent

// 모서리
rounded-lg             // 8px - 작은 요소
rounded-xl             // 12px - 버튼, 입력
rounded-2xl            // 16px - 카드
rounded-[20px]         // 20px - 메인 카드
rounded-3xl            // 24px - 모달
rounded-full           // 원형

// 그림자 (커스텀)
shadow-[0_8px_24px_rgba(61,56,47,0.08)]  // 카드
shadow-[0_20px_48px_rgba(61,56,47,0.14)] // 모달

// 트랜지션
transition-colors duration-200
transition-all duration-200
```

### 컴포넌트 체크리스트

새로운 컴포넌트를 만들 때 확인하세요:

- [ ] 따뜻한 색상 사용 (cream, clover, sunset)
- [ ] 충분한 둥글기 적용 (최소 `rounded-lg`)
- [ ] 부드러운 그림자 사용
- [ ] 다크 모드 스타일 추가
- [ ] 호버/포커스 상태 정의
- [ ] 접근성 고려 (색상 대비, 포커스 표시)
- [ ] 반응형 대응

---

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|----------|
| 2024-01-14 | 1.0.0 | 초기 디자인 시스템 작성 |
| 2024-01-14 | 2.0.0 | 전면 개편 - maple.gg 참고, 일러스트 가이드 추가 |
