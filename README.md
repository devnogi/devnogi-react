# DevNogi Front

마비노기 정보 커뮤니티를 위한 Next.js 15 기반 프론트엔드 애플리케이션입니다. MSA(Microservices Architecture)와 BFF(Backend for Frontend) 패턴을 적용하여 효율적인 서비스 간 통신을 구현합니다.

## 기술 스택

- **런타임**: Node.js v22
- **프레임워크**: [Next.js](https://nextjs.org) v15.3.3 (App Router)
- **언어**: TypeScript v5
- **UI 라이브러리**: React v19
- **스타일링**:
  - Tailwind CSS v4
  - Shadcn/UI
  - Pretendard 폰트 (Primary)
- **상태 관리 & 데이터 페칭**: TanStack Query v5
- **HTTP 클라이언트**: Axios v1.10
- **폼 관리**: React Hook Form + Zod
- **아이콘**: Lucide React
- **API 모킹**: MSW (Mock Service Worker) v2
- **테스팅**:
  - Jest v30
  - React Testing Library v16
  - jest-fixed-jsdom (Next.js 15 호환)
- **코드 품질**:
  - ESLint v9 + Prettier v3.5
  - Husky v9 + lint-staged v16

## 프로젝트 구조

```
devnogi-front/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── (auth)/         # 인증 관련 페이지 (sign-in)
│   │   ├── (main)/         # 메인 애플리케이션 (auction, auction-history, community)
│   │   ├── api/            # BFF API 라우트 (게이트웨이로 프록시)
│   │   └── fonts/          # 폰트 파일 (Pretendard, Mabinogi Classic)
│   ├── components/
│   │   ├── page/           # 페이지별 컴포넌트
│   │   │   ├── auction/      # 경매장 관련
│   │   │   ├── auction-history/ # 거래 내역 관련
│   │   │   └── community/    # 커뮤니티 관련
│   │   └── ui/             # Shadcn UI 컴포넌트
│   ├── lib/
│   │   └── api/            # API 클라이언트 & 서버 설정
│   │       ├── clients.ts    # clientAxios, TanStack Query 설정
│   │       └── server.ts     # createServerAxios, MSW 초기화
│   ├── mocks/              # MSW 모킹 설정
│   │   ├── data/           # Mock JSON 데이터
│   │   ├── server.ts       # MSW 핸들러
│   │   └── initServer.ts   # MSW 서버 초기화
│   └── utils/            # 공통 유틸리티 함수
└── public/              # 정적 파일
```

## 아키텍처

### BFF (Backend for Frontend) 패턴

이 프로젝트는 Next.js API Routes를 활용한 BFF 패턴을 구현합니다:

**요청 흐름:**
```
Client Component
  ↓ (clientAxios)
Next.js API Route (/api/*)
  ↓ (createServerAxios)
Gateway Server (http://168.107.43.221:8080)
  ↓ (prefix 기반 라우팅)
Backend Services
  ├─ OPEN API BATCH (/oab/*) - 경매장, 거래 내역
  └─ 커뮤니티 서버 (/dcs/api/*) - 게시판, 댓글
```

### Route Groups

- `(auth)/` - 인증 페이지 (NavBar 없음)
- `(main)/` - 메인 애플리케이션 (NavBar 포함)

### API 레이어

**Client-side (`src/lib/api/clients.ts`):**
- `clientAxios`: 클라이언트 컴포넌트에서 사용
- Base URL: `/api` (Next.js API Routes)
- Timeout: 5000ms

**Server-side (`src/lib/api/server.ts`):**
- `createServerAxios()`: API 라우트 핸들러에서 사용
- Base URL: `process.env.GATEWAY_BASE_URL`
- Authorization 및 Cookie 헤더 전달
- MSW 서버 자동 초기화

**TanStack Query 설정:**
- `staleTime: 200ms`
- 윈도우 포커스, 재연결, 마운트 시 자동 refetch 비활성화

### API 모킹 (MSW)

**활성화 조건:**
- `VERCEL_ENV=development|preview` AND
- `API_MOCKING=enabled`

**구성:**
- Mock 핸들러: `src/mocks/server.ts`
- Mock 데이터: `src/mocks/data/*.json`
- 테스트 환경에서 자동 활성화 (`jest.setup.ts`)

## API 문서

### 백엔드 서비스

모든 API는 **게이트웨이 서버**를 통해 라우팅됩니다.

**게이트웨이 서버:**
```
http://168.107.43.221:8080/
```

**백엔드 서비스:**

| 서비스 | Prefix | Swagger | 담당 기능 |
|--------|--------|---------|-----------|
| OPEN API BATCH | `/oab` | [Swagger UI](http://138.2.126.248:8080/swagger-ui/index.html) | 경매장, 거래 내역 |
| 커뮤니티 서버 | `/dcs/api` | [Swagger UI](http://3.39.119.27/swagger-ui/index.html) | 게시판, 게시글, 댓글 |

**커뮤니티 API 응답 구조:**
```typescript
{
  success: boolean,
  code: string,
  message: string,
  data: T,
  timestamp: string
}
```

### Slash Commands

프로젝트에서 사용 가능한 커스텀 명령어:
- `/api-spec` - 전체 API 스펙 조회
- `/api-endpoint` - 특정 엔드포인트 상세 조회

## 개발 환경 설정

0. 원본 저장소에서 프로젝트 포크
[원본 저장소 링크](https://github.com/devnogi/devnogi-react)

1. 저장소 클론
```bash
git clone [your-repository-url]
cd devnogi-front
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
```bash
# .sample_env를 참조하여 .env 파일 생성
cp .sample_env .env
```

**환경 변수 설명:**
- `NODE_ENV` - 런타임 환경 (development/production)
- `VERCEL_ENV` - Vercel 환경 (development/preview/production)
- `API_MOCKING` - MSW 활성화 여부 (enabled/disabled)
- `GATEWAY_BASE_URL` - 백엔드 게이트웨이 URL

4. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인할 수 있습니다.

### Path Aliases

프로젝트는 `@/` alias를 사용하여 절대 경로로 import합니다:

```typescript
import { Button } from "@/components/ui/button";
import { clientAxios } from "@/lib/api/clients";
import { formatDate } from "@/utils/date";
```

TypeScript 및 Jest 설정에서 모두 지원됩니다.

## 개발 프로세스

### GitHub Flow 브랜치 전략

이 프로젝트는 실제 배포 전까지는 단순하고 지속적인 배포를 지향하는 GitHub Flow를 따릅니다:

- `main`: 항상 배포 가능한 상태를 유지하는 기본 브랜치

### 브랜치 작업 플로우

0. 작업 전 원본 저장소와 싱크 확인

1. 새로운 작업 시작
```bash
git switch main
git pull origin main
git switch -c 브랜치명
# 개발 작업 수행
git add .
git commit -m "작업 설명"
git push origin 브랜치명
# PR 생성: 브랜치명 -> main
```

2. PR(Pull Request) 프로세스
   - PR 생성 시 작업 내용 상세히 설명
   - 코드 리뷰 진행
   - 승인 후 main 브랜치에 머지

3. 머지 완료 후 포크 저장소 최신화

### 커밋 메시지 컨벤션

```
<type>: <subject>

<body> (선택사항)

<footer> (선택사항)
```

**Type:**
- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅 (기능 변경 없음)
- `refactor`: 코드 리팩토링 (기능 변경 없음)
- `test`: 테스트 코드 추가/수정
- `chore`: 빌드 프로세스, 도구 변경
- `perf`: 성능 개선
- `design`: UI/UX 디자인 변경
- `security`: 보안 관련 변경

**Subject 규칙:**
- 최대 50자
- 소문자로 시작
- 마침표 없음
- 명령형 현재 시제 (add, fix, update, remove)

**예시:**
```bash
feat: add user login functionality
fix: improve error handling on login
docs: update README with API documentation
```

**Footer (선택사항):**
```
Closes: #123
Fixes: #456
BREAKING CHANGE: API response format changed
```

## 품질 관리

### Pre-commit Hooks (Husky + lint-staged)

커밋 시 Staged 파일에 대해 자동으로 다음 작업이 수행됩니다:

1. **Prettier**: 코드 포맷팅
2. **ESLint**: 코드 품질 검사 및 자동 수정
3. **Jest**: 변경된 파일과 관련된 테스트 실행

```bash
# lint-staged 설정
"*.{ts,tsx}": [
  "prettier --write",
  "eslint --fix",
  "npm test -- --bail --findRelatedTests"
]
```

### ESLint

- Next.js 권장 설정 사용 (`eslint.config.mjs`)
- 빌드 시 ESLint 에러가 있어도 빌드 성공 (`next.config.ts`)

### 테스팅

- **Jest 환경**: `jest-fixed-jsdom` (Next.js 15 호환)
- **테스트 파일**: `*.test.tsx` (소스 파일과 동일 위치)
- **MSW**: 모든 테스트에서 자동으로 사용 가능
- **실행 명령어**:
  ```bash
  npm test                    # 전체 테스트
  npm test -- --watch        # Watch 모드
  npm test -- <file-path>    # 특정 파일 테스트
  ```

## 개발 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 린트 검사
npm run lint

# 테스트 실행
npm test
```

## 디자인 시스템

### 디자인 철학

DevNogi는 **부드럽고 현대적이며 친근한** 디자인을 추구합니다:

**핵심 원칙:**
- **Rounded & Soft**: 넉넉한 border radius, 부드러운 모서리, 은은한 그림자
- **Colorful but Subtle**: 파스텔톤, 그라데이션 악센트, 강한 대비 지양
- **Clean & Minimal**: 넉넉한 여백, 명확한 계층, 깔끔한 레이아웃
- **Friendly & Approachable**: 따뜻한 색상, 환영하는 인터랙션

**영감 출처:**
- Reddit: 카드 기반 레이아웃, 명확한 콘텐츠 계층
- Threads: 부드러운 색상, 둥근 디자인, 친근한 인터랙션
- Notion: 깔끔한 미학, 넉넉한 여백, 부드러운 애니메이션
- Linear: 모던한 그라데이션, 섬세한 그림자, 세련된 타이포그래피

### 색상 팔레트

**브랜드 컬러 (Blue):**
- `brand-500` (#0ea5e9): 메인 브랜드 색상 - 버튼, 링크, 강조
- `brand-100` to `brand-900`: 배경, 호버, 텍스트용 전체 스케일

**액센트 컬러 (Purple):**
- `accent-500` (#a855f7): 보조 액센트 - 뱃지, 하이라이트, 특별 액션
- `accent-100` to `accent-900`: 악센트 및 장식 요소용 전체 스케일

**사용 가이드:**
- Primary actions: `bg-gradient-to-r from-blue-600 to-purple-600`
- Backgrounds: `bg-gradient-to-br from-blue-50 via-white to-purple-50`
- Interactive elements: 색상 전환을 활용한 은은한 호버 효과
- 순수 검정/흰색 지양 - `gray-900` / `gray-50` 사용

### Border Radius 표준

| Element | Radius | Class | Use Case |
|---------|--------|-------|----------|
| Cards | 16-24px | `rounded-2xl` | 메인 콘텐츠 카드, 모달 |
| Buttons | 8-12px | `rounded-lg` | 버튼, 폼 입력 |
| Small elements | 6-8px | `rounded-md` | 태그, 뱃지, 필 |
| Images | 12px | `rounded-xl` | 프로필 이미지, 썸네일 |
| Avatars | 50% | `rounded-full` | 사용자 아바타 |

### Typography

**Primary Font: Pretendard**
- 한글과 영문에 최적화된 모던한 sans-serif
- SIL Open Font License 1.1 (상업적 사용 가능)
- 디지털 스크린에 최적화된 가독성
- 9개 웨이트 (100-900)
- CSS variable: `--font-pretendard`
- Tailwind class: `font-sans`

**Typography Scale:**

| Element | Size | Weight | Usage |
|---------|------|--------|-------|
| H1 | 30-36px | 700 | 페이지 제목 |
| H2 | 24-30px | 600-700 | 섹션 헤더 |
| H3 | 20-24px | 600 | 하위 섹션 헤더 |
| Body | 14-16px | 400 | 본문 텍스트 |
| Small | 12-14px | 400 | 캡션, 메타데이터 |

**Line Height:**
- Headings: 1.2-1.3
- Body text: 1.5-1.7 (가독성을 위한 넉넉한 행간)
- Code: 1.4

### Interactive Elements

**Buttons:**
- Primary: 그라데이션 배경 (`from-blue-600 to-purple-600`)
- Height: `h-12` (48px) 터치 최적화
- Hover: 약간 확대 (`hover:scale-[1.02]`), 그라데이션 강조
- Disabled: 50% 투명도, 호버 효과 없음

**Inputs:**
- Height: `h-12` (48px)
- Padding: 아이콘이 있을 때 `pl-11` (왼쪽 패딩)
- Border: `border-gray-300`, focus: `border-blue-500`
- Rounded: `rounded-lg`

## 개발 원칙

### TypeScript 원칙

- **타입 안정성 우선**: 모든 변수, 함수, 컴포넌트에 명시적 타입 정의
- **`any` 지양**: 대신 `unknown` 사용
- **제네릭 활용**: 재사용 가능한 타입 정의
- **타입 추론 활용**: 불필요한 타입 어노테이션 지양

### React 원칙

- **단일 책임**: 각 컴포넌트는 하나의 명확한 책임
- **컴포넌트 크기**: 200줄 이하 유지
- **불변성**: 상태 업데이트 시 항상 새 객체/배열 생성
- **순수 함수 컴포넌트**: 부수효과 없는 순수 함수로 작성
- **Hook 규칙**: 최상위 레벨에서만 호출, 조건문/반복문 내 사용 금지

### Next.js 원칙

- **Server Components 우선**: 기본적으로 서버 컴포넌트 사용
- **`'use client'`**: 필요한 경우에만 사용
- **메타데이터 관리**: 각 페이지에 적절한 메타데이터 설정
- **동적 메타데이터**: `generateMetadata` 함수 활용

### 상태 관리

- **로컬 상태 우선**: Props drilling이 3단계 이하일 때 컴포넌트 상태 사용
- **전역 상태**: Props drilling이 3단계 초과 시에만 고려
- **상태 정규화**: 중첩된 객체 대신 평탄한 구조 사용
- **ID 기반 관계**: 중복 데이터 제거

### 성능 최적화

- **코드 스플리팅**: 라우트 기반 자동 스플리팅 활용
- **동적 import**: 큰 컴포넌트는 동적 import로 분할
- **메모이제이션**: `useMemo`, `useCallback` 적절히 활용
- **Image 최적화**: Next.js Image 컴포넌트 사용

### 접근성

- **시맨틱 HTML**: 적절한 HTML 태그 사용
- **ARIA 속성**: 필요시 ARIA 속성 활용
- **키보드 내비게이션**: 키보드로 모든 기능 접근 가능
- **색상 대비**: WCAG 2.1 AA 기준 준수

### 보안

- **입력 검증**: 모든 사용자 입력 검증
- **XSS 방지**: 적절한 이스케이핑 및 새니타이징
- **환경 변수**: 민감 정보는 환경 변수로 관리
- **클라이언트 노출 금지**: 서버 전용 정보 클라이언트에 노출 금지

## 라이선스

이 프로젝트는 오픈 소스이며, 학습 및 포트폴리오 목적으로 자유롭게 사용할 수 있습니다.

**폰트 라이선스:**
- **Pretendard**: SIL Open Font License 1.1 (상업적 사용 가능)
- **Mabinogi Classic**: 저작권 제한 있음 (게임 관련 브랜딩에만 제한적 사용)

## 참고 자료

- [Next.js 공식 문서](https://nextjs.org/docs)
- [React 공식 문서](https://react.dev)
- [TanStack Query 공식 문서](https://tanstack.com/query)
- [Tailwind CSS 공식 문서](https://tailwindcss.com)
- [MSW 공식 문서](https://mswjs.io)
- [CLAUDE.md](./CLAUDE.md) - AI 어시스턴트용 프로젝트 상세 가이드
