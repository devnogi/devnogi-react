# Community reaction and hydration fix — revision 1

Scope: React only, latest main ae61e82; preserve existing XP policy and APIs.

1. Personalized/refetched post liked state, count and bookmark state replace stale SSR values. Pending optimistic writes are not overwritten by incoming props. Prevent duplicate clicks while each request is pending; failed writes restore current authoritative props.
2. Remove non-deterministic date rendering from the SSR/initial hydration pass. Post timestamps have no offset (observed post25 createdAt 2026-11-10 00:37:53); server HTML says 1일 전 and browser says 2일 전. Render a deterministic date label before hydration and relative label after hydration; document/normalize timezone only after confirming source contract. Cover different server/client clocks and timezone.
3. Regression tests: personalized rerender, refetch count, pending race, failure, duplicate clicks, hydration recoverable error detection across changed clocks. Desktop/mobile rendered validation, full npm run verify, independent review and all mandatory CI before authorized deployment.
4. No new dependency, no suppression of hydration warnings, no permanent production activity mutation.

## Confirmed source contract and validation

Community PostDetailResponse and PostSummaryResponse serialize LocalDateTime using yyyy-MM-dd HH:mm:ss; docker-compose-prod.yml sets TZ=Asia/Seoul. Offset-free normal community dates therefore receive +09:00; explicit ISO offsets are retained. CommunityTime is used only in normal post/comment/popular-post views, not outfit UTC timestamps.

Before the fix, hydrateRoot regression reported a recoverable text mismatch at the timestamp link; personalized rerender and pending-write tests also failed. After the fix all 19 focused tests pass. Production read-only baseline on post26 additionally confirmed API isLiked=true/count2 while the button aria-pressed=false. No reaction was changed.

Browser localhost startup had been denied in the preceding task, so no alternate launcher was attempted. Pre-deployment rendering validation uses React renderToString/hydrateRoot; desktop/mobile actual-session checks follow the authorized official deployment.
