# Recurring Docker Build Typecheck Issues

## Problem Summary
- 증상: `npm run build`(Next.js production build) 단계에서 TypeScript 에러로 빌드 실패.
- 대표 에러: `implicitly has type 'any[]'`.
- 예시: `const merged = [];` 처럼 타입 힌트 없는 빈 배열 초기화.

## Why This Repeats
1. `next lint`와 `next build`의 검증 범위가 다름.
- lint는 통과해도, build의 타입체크(`Checking validity of types`)에서 실패할 수 있음.

2. 개발 중 빠른 검증만 수행.
- 변경 후 `npm run build`를 생략하면 Docker/CI에서만 실패가 드러남.

3. 빈 배열/빈 객체 초기화 시 타입 추론 한계.
- `const arr = []`, `const map = {}`는 문맥에 따라 `any[]`/`{}` 문제를 만들기 쉬움.

4. 컴포넌트 로직 병합 시 임시 변수 타입 미지정.
- `useMemo`, `reduce`, `forEach push` 패턴에서 타입 주석 없으면 암묵 `any`가 생김.

## Root Cause Definition (for future sessions)
- "로컬 lint 통과"를 "프로덕션 빌드 안전"으로 잘못 가정하는 것이 1차 원인.
- TypeScript strict 환경에서, **초기값이 빈 컨테이너인 변수에 명시 타입을 주지 않은 코드**가 2차 원인.
- 결과적으로 Docker build 단계에서만 타입 오류가 표면화됨.

## Mandatory Prevention Rules
1. 빈 배열/객체 초기화 시 반드시 타입 명시.
- Bad: `const merged = [];`
- Good: `const merged: RelatedPost[] = [];`

2. `useMemo`, `reduce`, `map`의 반환 타입을 필요 시 명시.
- 예: `useMemo<RelatedPost[]>(() => { ... }, [...])`

3. 프론트 코드 변경 후 최소 1회 `npm run build` 실행.
- lint 통과만으로 머지/배포하지 않음.

4. Docker/CI와 동일한 검증을 로컬에서 재현.
- 가능하면 `docker build` 또는 `npm run build`를 PR 전 체크리스트에 포함.

## Quick Checklist Before Finish
- [ ] 새로 만든 빈 배열/객체 변수에 타입이 있는가?
- [ ] `any`가 암묵적으로 추론되는 위치가 없는가?
- [ ] `npm run build`를 실제로 실행했는가?
- [ ] 타입 에러 0건을 확인했는가?

## Validation Command Set
### 1) Fast local check (recommended before commit)
```bash
npm run lint
npm run build
```

### 2) Changed-files focused check (during implementation)
```bash
npm run lint -- --file src/components/page/community/RelatedPostsSection.tsx
npm run build
```

### 3) CI-like clean install + build
```bash
rm -rf node_modules .next
npm ci
npm run build
```

### 4) Docker verification (same class of failure as CI buildx)
```bash
docker build -f Dockerfile -t devnogi-front:local .
```

### 5) Suggested pre-push one-liner
```bash
npm run lint && npm run build
```

## Current Incident Reference
- Docker build failed at:
  - `src/components/page/community/RelatedPostsSection.tsx:77`
  - `const merged = [];`
- Error:
  - `Variable 'merged' implicitly has type 'any[]' in some locations where its type cannot be determined.`
