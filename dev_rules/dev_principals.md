🎯 목표: 댓글 무한 스크롤
cursor run:
1. git:checkout -b feat/comment-infinite-scroll
2. generate code:
   - modify /app/community/page.tsx
   - create hooks/useInfinitePosts.ts
   - update PostCard.stories.tsx
3. add unit + component tests (Vitest + Playwright)
4. ensure pnpm lint type-check test build all pass
5. git:add .
6. git:commit -m "feat: implement comment infinite scroll (#456)"
