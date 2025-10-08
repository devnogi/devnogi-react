# 커뮤니티 기능 명세서

## 📋 개요

DevNogi 커뮤니티는 메타(구 페이스북)의 Threads 스타일을 차용한 소셜 커뮤니티 플랫폼입니다. 마비노기 게임 관련 정보 공유, 소통, 거래 등을 위한 공간을 제공합니다.

## 🎨 디자인 컨셉

### UI/UX 스타일 (Threads-inspired)

- **카드 기반 레이아웃**: 각 게시글을 독립적인 카드 형태로 표현
- **미니멀리즘**: 깔끔하고 여백이 충분한 디자인
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 환경 최적화
- **무한 스크롤**: 페이지네이션 대신 무한 스크롤 방식
- **인터랙션 중심**: 좋아요, 댓글, 공유 등의 인터랙션 강조
- **프로필 중심**: 작성자 프로필 이미지와 정보를 강조

### 컬러 스킴

- **Primary**: 기본 브랜드 색상 (현재 설정된 테마 색상)
- **Background**: 밝은 회색 배경 (#F8F9FA)
- **Card**: 흰색 카드 배경 (#FFFFFF)
- **Border**: 연한 회색 테두리 (#E5E7EB)
- **Text**: 어두운 회색 텍스트 (#1F2937)
- **Muted**: 보조 텍스트 (#6B7280)

## 🏗️ 화면 구조

### 1. 커뮤니티 메인 (게시글 목록)

```
┌─────────────────────────────────────────────────────────┐
│  NavBar (거래 내역 | 경매장 | 커뮤니티)                  │
├─────────────────────────────────────────────────────────┤
│  [커뮤니티]                                             │
│                                                          │
│  [전체] [자유게시판] [공략] [거래] [질문] [팁]          │
│                                                          │
│  [+ 글쓰기]                    [정렬: 최신순 ▼]         │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 👤 닉네임        @username       2시간 전        │   │
│  │                                                  │   │
│  │ 게시글 제목이 여기 표시됩니다                    │   │
│  │ 게시글 내용 미리보기가 여기 표시됩니다...        │   │
│  │                                                  │   │
│  │ [이미지 썸네일]                                  │   │
│  │                                                  │   │
│  │ 💬 12  ❤️ 45  🔗 공유                           │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 👤 닉네임2       @username2      1일 전         │   │
│  │ ...                                              │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  [더 보기...]                                           │
└─────────────────────────────────────────────────────────┘
```

### 2. 게시글 상세 화면

```
┌─────────────────────────────────────────────────────────┐
│  [← 뒤로가기]                                           │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 👤 닉네임        @username                       │   │
│  │    2시간 전      [팔로우]                        │   │
│  │                                                  │   │
│  │ 게시글 전체 제목                                 │   │
│  │                                                  │   │
│  │ 게시글 전체 내용이 여기 표시됩니다.              │   │
│  │ 여러 줄의 텍스트와 이미지, 링크 등이            │   │
│  │ 포함될 수 있습니다.                              │   │
│  │                                                  │   │
│  │ [이미지1] [이미지2]                              │   │
│  │                                                  │   │
│  │ 💬 12  ❤️ 45  🔗 공유                           │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─ 댓글 (12) ─────────────────────────────────────┐   │
│  │                                                  │   │
│  │ 👤 댓글작성자1    @user1        1시간 전        │   │
│  │    댓글 내용입니다...                            │   │
│  │    💬 답글 2   ❤️ 5                             │   │
│  │                                                  │   │
│  │    ┌─ 답글 ─────────────────────────────────┐  │   │
│  │    │ 👤 답글작성자   30분 전                 │  │   │
│  │    │    답글 내용...                         │  │   │
│  │    │    ❤️ 2                                 │  │   │
│  │    └──────────────────────────────────────────┘  │   │
│  │                                                  │   │
│  │ 👤 댓글작성자2    @user2        30분 전         │   │
│  │    또 다른 댓글...                               │   │
│  │    💬 답글 0   ❤️ 1                             │   │
│  │                                                  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 💬 댓글을 작성하세요...                          │   │
│  │                                    [게시]        │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## 🔧 기능 명세

### 1. 게시글 목록 (Community List)

#### 1.1 카테고리 필터
- **API**: `GET /api/boards`
- **기능**: 게시판 카테고리 목록 조회 및 필터링
- **상태**:
  - 전체 (기본값)
  - 게시판별 필터 (API에서 받아온 boards 데이터)
- **UI**:
  - 칩(Chip) 형태의 버튼
  - 선택된 카테고리는 Primary 색상 강조
  - 가로 스크롤 가능 (모바일)

#### 1.2 게시글 카드
- **API**: `GET /api/posts?boardId={boardId}&page={page}&size={size}&sort={sort}`
- **표시 정보**:
  - 작성자 프로필 이미지 (아바타)
  - 작성자 닉네임
  - 작성자 사용자명 (@username)
  - 작성 시간 (상대 시간: "2시간 전", "1일 전")
  - 게시글 제목 (1줄, 말줄임)
  - 게시글 내용 미리보기 (2-3줄, 말줄임)
  - 첨부 이미지 썸네일 (있는 경우)
  - 댓글 수
  - 좋아요 수
  - 공유 버튼
- **인터랙션**:
  - 카드 클릭 → 상세 페이지 이동
  - 좋아요 버튼 → 좋아요/취소 토글
  - 댓글 아이콘 → 상세 페이지로 이동 (댓글 섹션 포커스)
  - 공유 버튼 → 공유 모달/공유 기능

#### 1.3 정렬 옵션
- **최신순** (기본값): 작성일 기준 내림차순
- **인기순**: 좋아요 수 기준 내림차순
- **댓글순**: 댓글 수 기준 내림차순
- **조회순**: 조회수 기준 내림차순

#### 1.4 무한 스크롤
- **라이브러리**: TanStack Query의 `useInfiniteQuery`
- **동작**:
  - 스크롤이 페이지 하단 80% 도달 시 다음 페이지 로드
  - 로딩 중 스피너 표시
  - 더 이상 데이터가 없으면 "모든 게시글을 확인했습니다" 메시지

#### 1.5 글쓰기 버튼
- **위치**: 우측 상단 고정 (Floating Action Button)
- **기능**: 새 게시글 작성 페이지로 이동
- **아이콘**: + 또는 편집 아이콘

### 2. 게시글 상세 (Post Detail)

#### 2.1 게시글 본문
- **API**: `GET /api/posts/{postId}`
- **표시 정보**:
  - 작성자 프로필 이미지
  - 작성자 닉네임 및 사용자명
  - 작성 시간 (절대 시간 + 상대 시간)
  - 팔로우 버튼
  - 게시글 제목
  - 게시글 전체 내용 (마크다운 렌더링 지원)
  - 첨부 이미지 (갤러리 형태)
  - 해시태그
  - 조회수
  - 좋아요 수
  - 댓글 수
- **인터랙션**:
  - 좋아요 버튼
  - 공유 버튼
  - 북마크 버튼
  - 더보기 메뉴 (수정, 삭제, 신고)

#### 2.2 댓글 시스템
- **API**:
  - `GET /api/posts/{postId}/comments`: 댓글 목록 조회
  - `POST /api/posts/{postId}/comments`: 댓글 작성
  - `PUT /api/comments/{commentId}`: 댓글 수정
  - `DELETE /api/comments/{commentId}`: 댓글 삭제
  - `POST /api/comments/{commentId}/like`: 댓글 좋아요
- **기능**:
  - 댓글 작성/수정/삭제
  - 댓글에 대한 좋아요
  - 대댓글 (1depth까지)
  - 댓글 정렬 (최신순, 인기순)
  - 실시간 댓글 수 업데이트
- **UI**:
  - 작성자 프로필 이미지
  - 닉네임 및 작성 시간
  - 댓글 내용
  - 답글 버튼
  - 좋아요 버튼
  - 더보기 메뉴 (수정, 삭제, 신고)

#### 2.3 댓글 입력창
- **위치**: 댓글 목록 하단 고정
- **기능**:
  - 멀티라인 텍스트 입력
  - 이모지 선택기 (선택사항)
  - 작성 버튼
  - 작성자 프로필 이미지 표시

#### 2.4 네비게이션
- **뒤로가기 버튼**: 이전 페이지 또는 목록으로
- **다음글/이전글**: 같은 카테고리의 다음/이전 게시글로 이동
- **목록으로 버튼**: 커뮤니티 목록 페이지로

### 3. 게시글 작성/수정

#### 3.1 작성 폼
- **API**:
  - `POST /api/posts`: 게시글 작성
  - `PUT /api/posts/{postId}`: 게시글 수정
- **입력 필드**:
  - 카테고리 선택 (필수)
  - 제목 (필수, 최대 100자)
  - 내용 (필수, 마크다운 에디터)
  - 이미지 업로드 (선택, 최대 5개)
  - 해시태그 (선택)
- **기능**:
  - 실시간 미리보기
  - 이미지 드래그 앤 드롭 업로드
  - 임시 저장
  - 작성 취소 확인 모달

### 4. 추가 기능

#### 4.1 검색
- **API**: `GET /api/posts/search?q={query}&type={type}`
- **검색 타입**:
  - 제목
  - 내용
  - 작성자
  - 해시태그
- **UI**: 상단 검색바 또는 전용 검색 페이지

#### 4.2 알림
- **API**: `GET /api/notifications`
- **알림 유형**:
  - 내 게시글에 댓글
  - 내 댓글에 답글
  - 내 게시글/댓글 좋아요
  - 팔로우한 사용자의 새 게시글
- **UI**: 헤더의 벨 아이콘, 뱃지로 미읽은 알림 수 표시

#### 4.3 사용자 프로필
- **API**: `GET /api/users/{userId}`
- **표시 정보**:
  - 프로필 이미지
  - 닉네임 및 사용자명
  - 자기소개
  - 팔로워/팔로잉 수
  - 작성한 게시글 목록
  - 좋아요한 게시글 목록

## 📱 반응형 디자인

### Desktop (1024px 이상)
- 2단 레이아웃 (사이드바 + 메인)
- 카드 최대 너비: 600px (중앙 정렬)
- 댓글 인라인 답글 표시

### Tablet (768px - 1023px)
- 1단 레이아웃
- 카드 전체 너비 활용
- 카테고리 가로 스크롤

### Mobile (767px 이하)
- 1단 레이아웃
- 풀 스크린 카드
- 하단 플로팅 글쓰기 버튼
- 댓글 답글은 들여쓰기로 표시

## 🔄 API 엔드포인트 정리

### 백엔드 서버 구조

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

### 게시판/카테고리
```
GET    /api/boards                    # 게시판 목록
                                       # → Gateway: /dcs/boards
GET    /api/boards/{boardId}          # 게시판 상세
                                       # → Gateway: /dcs/boards/{boardId}
```

### 게시글
```
GET    /api/posts                     # 게시글 목록
                                       # → Gateway: /dcs/posts
GET    /api/posts/{postId}            # 게시글 상세
                                       # → Gateway: /dcs/posts/{postId}
POST   /api/posts                     # 게시글 작성
                                       # → Gateway: /dcs/posts
PUT    /api/posts/{postId}            # 게시글 수정
                                       # → Gateway: /dcs/posts/{postId}
DELETE /api/posts/{postId}            # 게시글 삭제
                                       # → Gateway: /dcs/posts/{postId}
POST   /api/posts/{postId}/like       # 게시글 좋아요
                                       # → Gateway: /dcs/posts/{postId}/like
GET    /api/posts/search              # 게시글 검색
                                       # → Gateway: /dcs/posts/search
```

### 댓글
```
GET    /api/posts/{postId}/comments   # 댓글 목록
                                       # → Gateway: /dcs/posts/{postId}/comments
POST   /api/posts/{postId}/comments   # 댓글 작성
                                       # → Gateway: /dcs/posts/{postId}/comments
PUT    /api/comments/{commentId}      # 댓글 수정
                                       # → Gateway: /dcs/comments/{commentId}
DELETE /api/comments/{commentId}      # 댓글 삭제
                                       # → Gateway: /dcs/comments/{commentId}
POST   /api/comments/{commentId}/like # 댓글 좋아요
                                       # → Gateway: /dcs/comments/{commentId}/like
POST   /api/comments/{commentId}/reply # 답글 작성
                                       # → Gateway: /dcs/comments/{commentId}/reply
```

### 사용자
```
GET    /api/users/{userId}            # 사용자 프로필
                                       # → Gateway: /dcs/users/{userId}
GET    /api/users/{userId}/posts      # 사용자 게시글
                                       # → Gateway: /dcs/users/{userId}/posts
POST   /api/users/{userId}/follow     # 팔로우
                                       # → Gateway: /dcs/users/{userId}/follow
```

### 알림
```
GET    /api/notifications             # 알림 목록
                                       # → Gateway: /dcs/notifications
PUT    /api/notifications/{id}/read   # 알림 읽음 처리
                                       # → Gateway: /dcs/notifications/{id}/read
```

### API 라우팅 흐름

**커뮤니티 API 전체 흐름:**
```
Client → /api/posts
  → Next.js API Route (src/app/api/posts/route.ts)
    → Gateway (http://168.107.43.221:8080/dcs/posts)
      → 커뮤니티 서버 (http://3.39.119.27)
        → Response
```

**경매장 API 전체 흐름 (참고):**
```
Client → /api/auction-history
  → Next.js API Route (src/app/api/auction-history/route.ts)
    → Gateway (http://168.107.43.221:8080/oab/auction-history)
      → OPEN API BATCH 서버 (http://138.2.126.248:8080)
        → Response
```

**라우팅 규칙:**
- 클라이언트는 `/api/*` 형태로 호출
- Next.js API 라우트가 게이트웨이로 전달
- 게이트웨이는 prefix를 통해 적절한 백엔드 서버로 라우팅:
  - `/oab/*` → OPEN API BATCH 서버 (경매장 관련)
  - `/dcs/*` → 커뮤니티 서버 (커뮤니티 관련)

## 📦 컴포넌트 구조

```
src/
├── app/
│   └── (main)/
│       └── community/
│           ├── page.tsx                    # 목록 페이지
│           ├── [id]/
│           │   └── page.tsx                # 상세 페이지
│           └── new/
│               └── page.tsx                # 작성 페이지
├── components/
│   └── page/
│       └── community/
│           ├── PostCard.tsx                # 게시글 카드
│           ├── PostList.tsx                # 게시글 목록
│           ├── PostDetail.tsx              # 게시글 상세
│           ├── PostForm.tsx                # 게시글 작성/수정 폼
│           ├── CommentList.tsx             # 댓글 목록
│           ├── CommentItem.tsx             # 댓글 아이템
│           ├── CommentForm.tsx             # 댓글 작성 폼
│           ├── CategoryFilter.tsx          # 카테고리 필터
│           ├── SortDropdown.tsx            # 정렬 드롭다운
│           └── UserAvatar.tsx              # 사용자 아바타
├── hooks/
│   ├── useInfinitePosts.ts                 # 무한 스크롤 훅
│   ├── usePost.ts                          # 게시글 조회 훅
│   ├── useComments.ts                      # 댓글 관련 훅
│   └── useLike.ts                          # 좋아요 훅
├── lib/
│   └── api/
│       ├── posts.ts                        # 게시글 API 함수
│       ├── comments.ts                     # 댓글 API 함수
│       └── boards.ts                       # 게시판 API 함수
└── types/
    ├── post.ts                             # 게시글 타입 정의
    ├── comment.ts                          # 댓글 타입 정의
    └── board.ts                            # 게시판 타입 정의
```

## 🎯 성능 최적화

1. **이미지 최적화**
   - Next.js Image 컴포넌트 사용
   - 썸네일 자동 생성 (CDN 활용)
   - Lazy Loading

2. **데이터 페칭 최적화**
   - TanStack Query 캐싱 활용
   - Prefetching (다음 페이지 미리 로드)
   - Optimistic Updates (좋아요, 댓글)

3. **렌더링 최적화**
   - React.memo로 불필요한 리렌더링 방지
   - 가상 스크롤 (react-window 또는 react-virtuoso)
   - 코드 스플리팅 (동적 임포트)

4. **번들 최적화**
   - Tree shaking
   - 이미지/폰트 최적화
   - Critical CSS

## ♿ 접근성

1. **키보드 네비게이션**
   - Tab 키로 모든 인터랙티브 요소 접근 가능
   - Enter/Space로 버튼 활성화
   - ESC로 모달 닫기

2. **스크린 리더 지원**
   - 시맨틱 HTML 사용
   - ARIA 레이블 적용
   - 이미지 alt 텍스트

3. **색상 대비**
   - WCAG 2.1 AA 기준 준수
   - 색상 외 추가 시각적 표시 (아이콘, 레이블)

## 🔐 보안

1. **XSS 방지**
   - 사용자 입력 새니타이징
   - DOMPurify 라이브러리 활용
   - Content Security Policy

2. **CSRF 방지**
   - CSRF 토큰 검증
   - SameSite 쿠키 설정

3. **인증/인가**
   - JWT 토큰 기반 인증
   - 권한 기반 접근 제어
   - Rate Limiting

## 📊 데이터 구조 예시

### Post (게시글)
```typescript
interface Post {
  id: number;
  boardId: number;
  boardName: string;
  title: string;
  content: string;
  author: {
    id: number;
    username: string;
    nickname: string;
    profileImage: string;
  };
  images: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
}
```

### Comment (댓글)
```typescript
interface Comment {
  id: number;
  postId: number;
  parentCommentId: number | null;
  content: string;
  author: {
    id: number;
    username: string;
    nickname: string;
    profileImage: string;
  };
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  isLiked: boolean;
  replies: Comment[];
}
```

### Board (게시판)
```typescript
interface Board {
  id: number;
  name: string;
  description: string;
  postCount: number;
}
```

## 🚀 개발 우선순위

### Phase 1: MVP (Minimum Viable Product)
1. ✅ 게시판 카테고리 필터링 (완료)
2. 게시글 목록 API 연동
3. 게시글 카드 UI (Threads 스타일)
4. 게시글 상세 페이지
5. 기본 댓글 기능 (작성/조회)

### Phase 2: Core Features
6. 좋아요 기능
7. 무한 스크롤
8. 게시글 작성/수정/삭제
9. 댓글 답글 기능
10. 이미지 업로드

### Phase 3: Advanced Features
11. 검색 기능
12. 알림 시스템
13. 사용자 프로필
14. 팔로우 기능
15. 실시간 업데이트 (WebSocket)

## 📝 참고사항

- 모든 시간은 사용자 로컬 시간대로 표시
- 상대 시간 표시: "방금 전", "5분 전", "1시간 전", "1일 전", "2023-10-27"
- 이미지 최대 크기: 5MB
- 게시글 내용 최대 길이: 10,000자
- 댓글 최대 길이: 500자
- 답글 depth: 1단계까지만 허용
