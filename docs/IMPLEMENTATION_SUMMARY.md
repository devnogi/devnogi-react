# 커뮤니티 기능 구현 완료 요약

## 📋 구현 완료된 기능

### 1. ✅ API 라우트
- **`/api/boards`**: 게시판 목록 조회
- **`/api/posts`**: 게시글 목록 조회 (페이지네이션, 필터링, 정렬 지원)
- **`/api/posts/[id]`**: 게시글 상세 조회
- **`/api/posts/[id]/comments`**: 댓글 목록 조회

### 2. ✅ TypeScript 타입 정의
**위치**: `src/types/community.ts`
- `Board`: 게시판 타입
- `Author`: 작성자 타입
- `Post`: 게시글 타입
- `PostsResponse`: 게시글 목록 응답 타입
- `Comment`: 댓글 타입
- `CommentsResponse`: 댓글 목록 응답 타입
- `PostFormData`: 게시글 작성/수정 요청 타입
- `CommentFormData`: 댓글 작성 요청 타입
- `SortOption`: 정렬 옵션 타입
- `PostsQueryParams`: 게시글 목록 쿼리 파라미터 타입

### 3. ✅ 커스텀 훅
**위치**: `src/hooks/useInfinitePosts.ts`
- TanStack Query의 `useInfiniteQuery`를 활용한 무한 스크롤 구현
- 게시판별, 정렬별, 검색별 필터링 지원

### 4. ✅ 컴포넌트 (Threads 스타일)

#### 메인 페이지 컴포넌트
- **`Category`** (`src/components/page/community/Category.tsx`)
  - 게시판 카테고리 필터
  - API 연동으로 동적 카테고리 로딩
  - 로딩 스켈레톤 UI

- **`PostCard`** (`src/components/page/community/PostCard.tsx`)
  - Threads 스타일의 게시글 카드
  - 작성자 프로필 이미지
  - 상대 시간 표시 (date-fns 활용)
  - 이미지 그리드 레이아웃 (1개/여러개 대응)
  - 해시태그 표시
  - 좋아요, 댓글, 공유 버튼

- **`PostList`** (`src/components/page/community/PostList.tsx`)
  - 무한 스크롤 구현 (Intersection Observer)
  - 로딩/에러 상태 처리
  - 빈 상태 메시지

#### 상세 페이지 컴포넌트
- **`PostDetailView`** (`src/components/page/community/PostDetailView.tsx`)
  - 게시글 전체 내용 표시
  - 이미지 갤러리
  - 조회수, 좋아요, 댓글 수 표시
  - 뒤로가기 버튼

- **`CommentList`** (`src/components/page/community/CommentList.tsx`)
  - 댓글 목록 표시
  - 댓글 수 표시

- **`CommentItem`** (`src/components/page/community/CommentItem.tsx`)
  - 개별 댓글 아이템
  - 답글 표시 (1depth)
  - 좋아요 기능
  - 답글 작성 폼 토글

- **`CommentForm`** (`src/components/page/community/CommentForm.tsx`)
  - 댓글/답글 작성 폼
  - 작성 중 로딩 상태
  - 취소 버튼 (답글 작성 시)

### 5. ✅ 페이지

#### 커뮤니티 메인 페이지
**위치**: `src/app/(main)/community/page.tsx`
- 카테고리 필터
- 정렬 옵션 (최신순, 인기순, 댓글순, 조회순)
- 글쓰기 버튼
- 게시글 목록 (무한 스크롤)

#### 게시글 상세 페이지
**위치**: `src/app/(main)/community/[id]/page.tsx`
- 게시글 상세 내용
- 댓글 목록
- 댓글 작성 폼

### 6. ✅ 레이아웃 개선
- **배경색**: 밝은 회색 (`bg-gray-50`) - Threads 스타일
- **카드 스타일**: 흰색 배경, 부드러운 테두리
- **고정 헤더**: `sticky top-0` 적용
- **여백 조정**: 패딩 추가로 가독성 향상

## 🎨 디자인 특징

### Threads 스타일 요소
1. **카드 기반 레이아웃**: 각 게시글이 독립적인 카드
2. **프로필 중심**: 작성자 프로필 이미지 강조
3. **미니멀한 인터랙션**: 깔끔한 좋아요/댓글 버튼
4. **상대 시간 표시**: "2시간 전", "1일 전" 형식
5. **이미지 그리드**: 여러 이미지 미리보기
6. **해시태그**: 파란색 클릭 가능한 태그

### 반응형 디자인
- **모바일**: 카테고리 가로 스크롤
- **데스크톱**: 최대 너비 제한 (`max-w-3xl`)
- **이미지**: Next.js Image 컴포넌트로 최적화

## 🔄 데이터 흐름

```
User Action → Component → Custom Hook → API Route → Backend Gateway
                ↓
         TanStack Query Cache
                ↓
         Component Re-render
```

### 무한 스크롤 흐름
1. 사용자가 페이지 하단으로 스크롤
2. Intersection Observer가 감지
3. `useInfinitePosts` 훅이 `fetchNextPage()` 호출
4. API에서 다음 페이지 데이터 로드
5. TanStack Query가 캐시에 추가
6. 컴포넌트 리렌더링으로 새 게시글 표시

## 🔌 API 연동 상태

### 연동 완료
- ✅ `/api/boards` - 게시판 목록
- ✅ `/api/posts` - 게시글 목록
- ✅ `/api/posts/[id]` - 게시글 상세
- ✅ `/api/posts/[id]/comments` - 댓글 목록

### 구현 대기 (TODO)
- ⏳ 게시글 작성/수정/삭제
- ⏳ 댓글 작성/수정/삭제
- ⏳ 좋아요 기능
- ⏳ 이미지 업로드
- ⏳ 검색 기능

## 📁 파일 구조

```
src/
├── app/
│   ├── (main)/
│   │   └── community/
│   │       ├── page.tsx                # 커뮤니티 메인
│   │       └── [id]/
│   │           └── page.tsx            # 게시글 상세
│   └── api/
│       ├── boards/
│       │   └── route.ts                # 게시판 API
│       └── posts/
│           ├── route.ts                # 게시글 목록 API
│           ├── [id]/
│           │   ├── route.ts            # 게시글 상세 API
│           │   └── comments/
│           │       └── route.ts        # 댓글 API
├── components/
│   └── page/
│       └── community/
│           ├── Category.tsx            # 카테고리 필터
│           ├── PostCard.tsx            # 게시글 카드 (Threads 스타일)
│           ├── PostList.tsx            # 게시글 목록 (무한 스크롤)
│           ├── PostDetailView.tsx      # 게시글 상세
│           ├── CommentList.tsx         # 댓글 목록
│           ├── CommentItem.tsx         # 댓글 아이템
│           └── CommentForm.tsx         # 댓글 작성 폼
├── hooks/
│   └── useInfinitePosts.ts             # 무한 스크롤 훅
├── types/
│   └── community.ts                    # 타입 정의
└── lib/
    └── api/
        └── constants.ts                # API 엔드포인트 상수
```

## 🚀 다음 단계

### Phase 1: 핵심 기능 완성
1. 좋아요 기능 API 연동
2. 댓글 작성/수정/삭제 API 연동
3. 게시글 작성 페이지 구현
4. 이미지 업로드 기능

### Phase 2: 고급 기능
5. 검색 기능 구현
6. 실시간 알림 (WebSocket)
7. 사용자 프로필 페이지
8. 팔로우 기능

### Phase 3: 최적화
9. 가상 스크롤 적용
10. 이미지 최적화 (CDN)
11. 서버 사이드 렌더링 개선
12. 에러 바운더리 추가

## 🐛 알려진 이슈

1. **좋아요 기능**: UI만 구현, API 연동 필요
2. **공유 기능**: UI만 구현, 실제 기능 필요
3. **댓글 작성**: 폼은 있으나 API 연동 필요
4. **이미지 업로드**: 구현 필요
5. **검색**: 구현 필요

## 📝 사용법

### 개발 서버 실행
```bash
npm run dev
```

### 커뮤니티 페이지 접속
```
http://localhost:3000/community
```

### 게시글 상세 페이지
```
http://localhost:3000/community/[게시글ID]
```

## 🔧 설정

### Backend Architecture

모든 API는 **게이트웨이 서버**를 통해 호출되며, prefix를 통해 각 백엔드 서비스로 라우팅됩니다.

**게이트웨이 서버 (모든 API 통과):**
```
http://168.107.43.221:8080/
```

**백엔드 서비스:**

1. **OPEN API BATCH 서버** (경매장 관련)
   - Prefix: `/oab`
   - Swagger: http://138.2.126.248:8080/swagger-ui/index.html
   - 담당: 경매장 뷰, 거래 내역 뷰 등 경매 관련 모든 화면

2. **커뮤니티 서버** (커뮤니티 관련)
   - Prefix: `/dcs`
   - Swagger: http://3.39.119.27/swagger-ui/index.html
   - 담당: 커뮤니티 뷰 - 게시판, 게시글, 댓글 등 모든 기능

**화면별 사용 서버:**
- **경매장 뷰** → OPEN API BATCH 서버 (`/oab` prefix)
- **거래 내역 뷰** → OPEN API BATCH 서버 (`/oab` prefix)
- **커뮤니티 뷰** → 커뮤니티 서버 (`/dcs` prefix)

### API Endpoints (src/lib/api/constants.ts)
```typescript
// Gateway Server: http://168.107.43.221:8080/

// Auction API (prefix: /oab)
export const AUCTION_HISTORY_ENDPOINT = "/oab/auction-history";

// Community API (prefix: /dcs)
export const BOARDS_ENDPOINT = "/dcs/boards";
export const POSTS_ENDPOINT = "/dcs/posts";
export const COMMENTS_ENDPOINT = "/dcs/comments";
```

### API Routing Flow

**커뮤니티 API:**
```
Client → /api/posts
  → Next.js API Route (src/app/api/posts/route.ts)
    → createServerAxios()
      → Gateway (http://168.107.43.221:8080/dcs/posts)
        → 커뮤니티 서버 (http://3.39.119.27)
```

**경매장 API:**
```
Client → /api/auction-history
  → Next.js API Route (src/app/api/auction-history/route.ts)
    → createServerAxios()
      → Gateway (http://168.107.43.221:8080/oab/auction-history)
        → OPEN API BATCH 서버 (http://138.2.126.248:8080)
```

### TanStack Query 설정 (src/lib/api/clients.ts)
```typescript
staleTime: 200,
refetchOnWindowFocus: false,
refetchOnReconnect: false,
refetchOnMount: false,
```

## 📖 참고 문서

- [커뮤니티 기능 명세서](./COMMUNITY_SPECIFICATION.md)
- [CLAUDE.md](../CLAUDE.md) - 프로젝트 가이드
- [개발 원칙](../dev_rules/DEVELOPMENT_PRINCIPLES.md)
- [Git 커밋 컨벤션](../dev_rules/GIT_COMMIT_CONVENTION.md)

## ✅ 완료 체크리스트

- [x] API 라우트 생성
- [x] TypeScript 타입 정의
- [x] 커스텀 훅 구현
- [x] Threads 스타일 UI 컴포넌트
- [x] 무한 스크롤
- [x] 게시글 목록 페이지
- [x] 게시글 상세 페이지
- [x] 댓글 시스템 UI
- [x] 반응형 디자인
- [x] 레이아웃 개선
- [ ] 좋아요 API 연동
- [ ] 댓글 작성 API 연동
- [ ] 게시글 작성 페이지
- [ ] 이미지 업로드
- [ ] 검색 기능
