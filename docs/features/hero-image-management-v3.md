# Hero image management — revision 3 (2026-11-20)

## Objective and scope

Use approved white crumpled-paper banner as first DEFAULT homepage hero and make existing admin hero/auction-image management usable and complete. React and Auth only; existing BFF/Gateway routing reused. Preserve existing paid auction slots 1 and 2 and XP accounting; no production operations or merge without separate approval.

## Baselines and ownership

- React main 0a68b28adcf1ffcbed88c982ea061caa7667d34f; worktree C:/workspace/dev/memonogi-worktrees/hero-admin-20261120/react.
- Auth main 9d9c573d99b834ca35c32ff7a2243b974fc5b3bc; worktree C:/workspace/dev/memonogi-worktrees/hero-admin-20261120/auth.
- Both branch feat/hero-image-management.
- Approved asset C:/workspace/dev/memonogi/.local/imagegen/hero-auction-20261119/memonogi-hero-auction-v13-1920x640.jpg (1920×640; 285311 bytes).
- Asset public path /home-hero-auction.jpg. Link https://www.memonogi.com/hero-auctions. Alt text: 메모노기 광고 경매 안내 — 활동으로 모은 XP로 메인 화면에 광고하세요.
- Old worktrees and original generated artwork untouched. No new dependencies.

## Public banner

1. Copy exact approved JPG into React public; reuse exact bytes.
2. New Auth migration replaces only unchanged library seed (nondeleted, matching original URL/alt/no link/no custom schedule) with new image/alt/link, making it first default while preserving other defaults' relative order. Never overwrite customized seed, create duplicates or erase existing media/records. Document conditional behavior.
3. The actual first promo banner comes from the API's migrated default record. Whole-image link remains the action, no extra HTML button superimposed on raster CTA. ALL fallback states (initial loading/no data, transport error with no usable cached items, Auth schedule/visibility gap, valid-empty or locally expired React data, and broken-image fallback) use a dedicated neutral system asset /home-hero-unavailable.svg (1920×640, plain neutral surface, centered Memonogi branding, no CTA/link). This system placeholder is not managed/user content. Never resurrect a hidden/deleted/expired managed banner as a public fallback. For a paid slot2 with no active default, use this neutral placeholder in slot1 to preserve paid slot positions. A direct response with valid empty items must not use the promo fallback.
4. Preserve artwork colors and all content: remove darkening/desaturation filters, fit full image in a 3:1 area. Carousel controls/auction notice must occupy their own row, not cover banner lettering on mobile. Keep keyboard, pause, reduced-motion, automatic advance, timed refetch/expiry and paid-slot order.
5. Correct shared upload preview to match actual 3:1 presentation, no obsolete fake overlaid search or dark filter.

## Default-image management

Reuse existing CRUD/order/scheduling/preview and permission gates. Break large page into small cohesive components as needed for changed behavior. Add clear sections/navigation for default images, ad images, auction operations/preview. Show current enabled/scheduled/expired states, previews, links and Korean schedule times; loading/error/empty/retry and pending feedback. Keep existing /admin entry discoverable.

- Add DB hero_slide.visible BOOLEAN NOT NULL DEFAULT TRUE.
- Existing public and admin Slide response may add visible:boolean (backward-compatible extra property); create defaults true; metadata/file update preserves current visibility.
- PUT /api/admin/hero/slides/{id}/visibility body {visible:boolean}; required strict boolean, omitted/null invalid, returns null data.
- Hidden defaults excluded from public display and time preview; maintain exact permutation ordering of all nondeleted defaults (hidden included).
- Cannot hide/delete final visible default, and cannot delete last nondeleted default. Enforce under existing settings lock. Do not silently republish hidden/default custom records.
- Confirm deletion before action; normal edits/ordering/visibility provide accurate success/error feedback and invalidate hero queries.

## Auction image management: additive API

Keep existing GET /api/admin/hero/creatives array API and all current user APIs unchanged.
New GET /api/admin/hero/creatives/search?page=0&size=20&query=&status=ALL:

- page >=0, size 1..50, query <=100 chars; status ALL|AVAILABLE|BLOCKED, invalid values 400.
- Search all nondeleted creatives, not just latest100; parameterized match on alt/link/owner nickname or creative/user numeric id. Stable id descending pagination.
- Response data {items:AdminHeroCreative[],page:number,size:number,totalElements:number,totalPages:number}.
- AdminHeroCreative fields: existing Creative fields plus userId:number, nickname:string|null, blockReason:string|null, leadingBidCount:number, scheduledPlacementCount:number, activePlacementCount:number.
- Usage counts use current server time and only active/nonstopped placements; blocked/history isn't labeled as active. Block reason comes from latest CREATIVE_BLOCK audit when blocked.
- UI search submit, status filter, previous/next pagination with reset on filter, count, owner and status/usage labels, creation time, full thumbnail and safe link display. Don't leak admin fields through user/public endpoints.
- POST /api/admin/hero/creatives/{id}/unblock body {reason:string} requiring existing reason validation.
- Unblock only clears blocked state under coordination/creative lock with audit CREATIVE_UNBLOCK. It NEVER restores BLOCKED bids, stopped placements, holds, charges or refunds; permit new future bids only. Missing/deleted creative rejects.
- Existing block behavior/coordination preserved. UI confirm block/unblock and whole-week cancellation, mandatory reason, explicit no-refund block and no-auto-restore unblock copy, errors/pending. No administrator rewriting user artwork or deleting bid history.

## Verification / acceptance

- Security: admin and super-admin allowed; anon401/member403; existing same-origin mutation protections apply to new routes.
- Tests: default first/fallback asset/link, visibility guards/order/schedule, nonoverwritten custom seed migration, paid slot priority and max10 preserved, creative pagination/filter/count/owner privacy, block/unblock audit and no resurrection/no XP mutation, repeated moderation safe, UI CRUD/visibility/search/pagination/confirm/cancel/errors/cache refresh, native carousel controls and image integrity.
- React npm run verify under Node20. Auth gradlew verify under Java21; real-MySQL HeroMySqlTest with synthetic isolated local database for migration and accounting behavior. Never mask failing checks.
- Browser: local desktop1440/tablet768/mobile390 both themes, banner full content and whole link, admin populated/empty/error and management flows with synthetic mocked data; no real production mutation.
- Independent read-only diff review after verification, remediate concrete findings.
- Versions before PR: React1.0.40, Auth1.0.15-SNAPSHOT (verify latest main version still lower).
- Commit/publish work branches and open main PRs via connected GitHub; CI must pass. Frontend static asset should deploy before Auth migration references it; no merge or deployment in this task without separate approval.

## Revision 2 rationale

Independent review identified that using the promo image for intentional visibility/schedule gaps could republish the just-hidden banner. Dedicated neutral placeholder resolves this without changing paid-slot order or XP policy. User confirmed default-first/paid-priority and record-preserving management scope on2026-11-20.

## Revision 3 rationale

Use the neutral placeholder for ALL fallback states; this also prevents the promotional banner flashing during initial load after an admin has hidden it. The actual first promo is returned by normal API data after seed migration. No public-slot or API contract change.
