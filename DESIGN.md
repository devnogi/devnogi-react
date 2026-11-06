# Memonogi Design

## Product feeling

The community is a warm, low-pressure conversation space for life in Erinn. It should feel as effortless as posting on X, Threads, or Instagram with Memonogi's calm, game-aware identity and neutral actions.

## Layout

- The primary timeline is a continuous white surface, about 680px wide, separated by thin rules instead of individual floating cards.
- At desktop widths, a 280px popular-post rail sits to the right. It disappears below 1024px; after an empty or failed popular-post query the feed is centered without an empty rail. Keep a rail skeleton while that query is pending.
- At 390px the feed is edge-to-edge with 16px content padding. All interactive targets are at least 44px.
- The navigation tabs are Latest, Popular, Saved, and My posts. Boards and categories do not appear in the posting flow.

## Composition

- Writing starts with one auto-growing plain-text field. There is no title, Markdown, category, tag, or draft choice.
- Copy should invite a small observation rather than a finished article. The maximum is 1,000 Unicode code points, and the counter appears from 800.
- Attachments are visual media only: up to five JPEG/PNG/WebP/GIF/MP4/WebM files, at most one video, and 5MiB per file.
- Media previews are removable and horizontally scrollable on small screens. Videos never autoplay.

## Feed anatomy

- Each post presents author avatar/name/server/time, plain text, media, then comment/like/bookmark/share/view actions.
- Avatar and name are independent profile links to `/profile/{userId}`. Post text and media lead to the post detail.
- Bookmarking is private, reversible, and optimistic with rollback on failure. Sharing uses Web Share first and clipboard fallback.
- Actions follow the shared neutral tokens below. Avoid gradients, glass effects, decorative shadows, and excessive rounded containers.

## Accessibility and responsive behavior

- Preserve visible focus, semantic buttons/links, pressed states, descriptive labels, AA contrast, and keyboard operation.
- Use `scrollbar-gutter: stable` globally so entering the community does not shift the top navigation.
- Loading, empty, error, unauthenticated, long-text, and 1/2/5-media states must remain readable at 1440, 768, and 390px.

## Shared actions — approved revision 1 (2026-11-06)

- Light primary: background `#111111`, foreground `#FFFFFF`, hover `#262626`.
- Dark primary: background `#F5F5F5`, foreground `#111111`, hover `#E5E5E5`.
- Secondary selection surfaces: `#EFEFEC` (light), `#242426` (dark). Use visible text, underline, or pressed state as well as color for selection.
- CSS design-system and Shadcn primary, foreground, hover, ring, and sidebar aliases describe the same actions. Components use these tokens instead of brown/orange/gold overrides.
- Ordinary price and volume highlights use neutral text. Directional prices, success, warning, destructive states, server identity, chart series, and OAuth provider branding keep their semantic colors.
- These action rules apply across the site, including Home and My Page. Their layout is not redesigned in this revision.

## Screen contracts — revision 1

- Below 768px, navigation has a 64px identity/account row and a 48px menu row. All five primary destinations remain visible without horizontal scrolling. At 768px and above retain the 64px single row. Content and dropdown offsets match the header.
- Auction order: short title, route tabs, search, filters, results. Data guidance and common categories are closed disclosures, retaining server-rendered links and SEO metadata. Route tabs carry only item name and top/subcategory; other criteria start at destination defaults.
- Auction filter chips, dialogs, inputs, and footer actions use themed surfaces and text; touch targets are at least 44px. At 390×844 the default search, filters and one complete result fit in the first viewport.
- Horn rows contain one wrapping metadata line (server, author, time) and the full message below, with 8px vertical padding and matching skeletons. Remove only one exact leading author-plus-`:` prefix. Home's horn card is not recomposed.
- Community auth loading reserves composer space. Guests see “로그인하고 이야기 남기기” and the existing login modal; authenticated users retain writing. Mobile writing uses the same gate and resumes after login.
- Public profiles use 80px mobile / 112px desktop avatars beside 24px / 28px names, with 16px / 24px gaps. Preserve all populated information and wrap long text. Hide a zero verification count, retain nonzero history. Activity starts after a 24px gap. My Page structure stays unchanged.
- Statistics offers at most three valid popular-item examples before the first item search, using existing ranking data and preserving date/period choices. Missing examples never block manual search.
- Item encyclopedia has an “아이템 도감” heading. Statistics and encyclopedia labels use “상위 분류” and “하위 분류”. Routes, APIs and response types stay unchanged.

## Verification and exclusions

- The approved revision 1 plan and the 2026-11-06 audit captures define this incremental correction; do not import unrelated unfinished design worktrees.
- Test changed interactions, preserve existing regression coverage, and inspect Chromium at 1440, 768, and 390px in both themes, including populated/empty/error/loading content, keyboard focus and dialogs.
- Confirm normal text contrast of at least 4.5:1 and 44px interaction targets on changed controls.
- Home content width, typography sizes, ranking-card arrangement, and Hero composition remain unchanged. Common action colors and responsive navigation are the only Home changes.
- Require `npm run verify`, mandatory CI and independent read-only review before delivery. PR merge and production deployment require human approval.
