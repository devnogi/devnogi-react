# 게시글 목록 화면 개발 계획

## 📋 개발 개요
마비노기 블로니 채널의 게시글 목록 화면을 참고하여 커뮤니티 플랫폼의 게시글 목록 기능을 구현합니다.

## 🎯 목표 기능
- 게시글 목록 표시 (번호, 제목, 작성자, 작성일, 조회수, 추천수)
- 카테고리 필터링
- 정렬 기능 (등록순, 추천순, 댓글순 등)
- 공지사항 구분 표시
- 페이지네이션
- 반응형 디자인

## 📝 커밋 계획

### 1. `feat: 게시글 목록 페이지 기본 구조 생성`
- **파일**: `src/app/(main)/posts/page.tsx`
- **내용**: 
  - 게시글 목록 페이지 기본 레이아웃
  - 메타데이터 설정
  - 서버 컴포넌트 구조

### 2. `feat: 게시글 목록 컴포넌트 생성`
- **파일**: `src/components/page/posts/post-list.tsx`
- **내용**:
  - 게시글 목록 테이블 구조
  - 반응형 헤더 (데스크톱/모바일)
  - 기본 스타일링

### 3. `feat: 게시글 목록 헤더 컴포넌트 생성`
- **파일**: `src/components/page/posts/post-list-header.tsx`
- **내용**:
  - 채널 정보 표시 (아이콘, 제목, 설명)
  - 구독자 수, 알림 수 표시
  - 채널 위키, 알림, 구독 버튼

### 4. `feat: 게시글 목록 필터 컴포넌트 생성`
- **파일**: `src/components/page/posts/post-list-filters.tsx`
- **내용**:
  - 카테고리 탭 필터
  - 정렬 옵션 (등록순, 추천순, 댓글순)
  - 추천컷 필터
  - 전체글/개념글 토글

### 5. `feat: 게시글 목록 테이블 컴포넌트 생성`
- **파일**: `src/components/page/posts/post-list-table.tsx`
- **내용**:
  - 게시글 행 컴포넌트
  - 공지사항 구분 표시
  - 댓글 수, 미디어 아이콘 표시
  - 사용자 정보 (닉네임, 아이콘)

### 6. `feat: 게시글 목록 행 컴포넌트 생성`
- **파일**: `src/components/page/posts/post-list-row.tsx`
- **내용**:
  - 개별 게시글 행 렌더링
  - 공지사항 스타일링
  - 반응형 레이아웃

### 7. `feat: 게시글 데이터 타입 정의`
- **파일**: `src/types/post.ts`
- **내용**:
  - Post 인터페이스 정의
  - PostCategory 타입 정의
  - PostSortOption 타입 정의

### 8. `feat: 게시글 목록 데이터 모킹`
- **파일**: `src/data/mock-posts.ts`
- **내용**:
  - 샘플 게시글 데이터 생성
  - 다양한 카테고리와 상태의 게시글 포함
  - 공지사항 데이터 포함

### 9. `feat: 게시글 목록 훅 생성`
- **파일**: `src/hooks/use-posts.ts`
- **내용**:
  - 게시글 목록 상태 관리
  - 필터링 및 정렬 로직
  - 페이지네이션 로직

### 10. `feat: 게시글 목록 페이지네이션 컴포넌트 생성`
- **파일**: `src/components/page/posts/post-list-pagination.tsx`
- **내용**:
  - 페이지 번호 표시
  - 이전/다음 페이지 버튼
  - 페이지 이동 로직

### 11. `test: 게시글 목록 컴포넌트 테스트 추가`
- **파일**: `src/components/page/posts/__tests__/post-list.test.tsx`
- **내용**:
  - 게시글 목록 렌더링 테스트
  - 필터링 기능 테스트
  - 정렬 기능 테스트

### 12. `test: 게시글 목록 훅 테스트 추가`
- **파일**: `src/hooks/__tests__/use-posts.test.ts`
- **내용**:
  - 훅 초기 상태 테스트
  - 필터링 로직 테스트
  - 정렬 로직 테스트

### 13. `feat: 게시글 목록 페이지 통합`
- **파일**: `src/app/(main)/posts/page.tsx`
- **내용**:
  - 모든 컴포넌트 통합
  - 데이터 페칭 로직
  - 에러 처리

### 14. `style: 게시글 목록 반응형 디자인 개선`
- **파일**: `src/components/page/posts/*.tsx`
- **내용**:
  - 모바일 최적화
  - 태블릿 레이아웃 개선
  - 접근성 개선

### 15. `feat: 게시글 목록 검색 기능 추가`
- **파일**: `src/components/page/posts/post-list-search.tsx`
- **내용**:
  - 제목 검색 기능
  - 작성자 검색 기능
  - 실시간 검색 결과

### 16. `perf: 게시글 목록 성능 최적화`
- **파일**: `src/components/page/posts/*.tsx`
- **내용**:
  - React.memo 적용
  - 가상화 스크롤 적용 (필요시)
  - 이미지 지연 로딩

### 17. `test: 게시글 목록 E2E 테스트 추가`
- **파일**: `src/app/(main)/posts/__tests__/page.test.tsx`
- **내용**:
  - 페이지 로딩 테스트
  - 사용자 상호작용 테스트
  - 필터링 및 정렬 테스트

### 18. `docs: 게시글 목록 컴포넌트 문서화`
- **파일**: `src/components/page/posts/README.md`
- **내용**:
  - 컴포넌트 사용법
  - Props 설명
  - 예시 코드

## 🔧 기술 스택
- **프레임워크**: Next.js 15 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **상태관리**: React Hooks
- **테스팅**: Jest + React Testing Library
- **UI 라이브러리**: Radix UI + Lucide React

## 📱 반응형 디자인
- **데스크톱**: 2열 레이아웃 (번호/제목, 작성자/날짜/조회수/추천수)
- **태블릿**: 1열 레이아웃, 일부 정보 숨김
- **모바일**: 카드 형태 레이아웃, 핵심 정보만 표시

## ♿ 접근성 고려사항
- 시맨틱 HTML 태그 사용
- ARIA 속성 적용
- 키보드 네비게이션 지원
- 색상 대비 WCAG 2.1 AA 기준 준수
- 스크린 리더 지원

## 🚀 성능 최적화
- 서버 컴포넌트 우선 사용
- 이미지 최적화 (Next.js Image)
- 코드 분할 및 지연 로딩
- 메모이제이션 적용

## 🔒 보안 고려사항
- XSS 방지 (데이터 이스케이핑)
- 입력 검증
- CSRF 토큰 사용 (필요시)

---

*이 계획은 dev_rules의 모든 가이드라인을 준수하여 작성되었습니다.*
