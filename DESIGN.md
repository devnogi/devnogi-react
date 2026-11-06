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
- Revision 1 kept Home content width, typography sizes, ranking-card arrangement, and Hero composition unchanged. The approved revision 2 below supersedes that Home-only exclusion; revision 1 interaction and navigation contracts remain in force.
- Require `npm run verify`, mandatory CI and independent read-only review before delivery. PR merge and production deployment require human approval.

## Visual polish — approved revision 2 (2026-11-06)

The design owner approved the rendered reference on 2026-11-06 in
`codex://threads/01a1b0d1-e592-70f3-9e2f-ec54e8621b71` before product implementation.
The reference set `visual-baseline-r1` contains Home, auction history/current
listings, community, post detail and public profile at 1440, 768 and 390px in both
themes. It was based on main `fcab860`. Reference content is synthetic; it does
not change production data, API contracts or existing search/filter behavior.

### Art direction and tokens

An editorial surface for Erinn's trade records and everyday conversations:
precise data columns, quiet neutral surfaces, readable posts and thin dividers.
Game identity comes from existing Hero artwork and actual content, not ornamental
frames, repeated placeholder icons, gradients or card shadows.

The `.visual-polish` scope consumes the existing semantic and design-system
aliases. Do not globally recolor unrelated routes or redefine shared actions,
status colors, OAuth brands, chart colors or filter behavior.

| Role                 | Light     | Dark      |
| -------------------- | --------- | --------- |
| Page                 | `#F7F7F5` | `#0F0F10` |
| Reading/card surface | `#FFFFFF` | `#18181A` |
| Secondary surface    | `#EFEFEC` | `#242426` |
| Main text            | `#111111` | `#F5F5F5` |
| Metadata             | `#6B6B6B` | `#A1A1AA` |
| Divider              | `#E3E3DF` | `#303034` |

Keep Pretendard. Module headings are 18/26px, weight 600; item names 14/20px,
weight 500; prices 15/20px, weight 600 with tabular numerals; post bodies
15/24px, weight 400; authors 15/22px, weight 600; metadata 12/18px. Use the
4/8/12/16/24/32/48/64px spacing scale, 16px mobile and 24px tablet gutters,
8px controls, 10px fixed surfaces and 12px media. Reserve elevation for floating
layers. Preserve visible focus and 44px interactive areas.

### Six implementation contracts

1. **Hero composition:** align the search and content to a 1120px container;
   search is at most 720px. Hero starts at 280px desktop/tablet and 224px mobile,
   and may grow for content. Keep the two existing images. Library crop:
   desktop center 68%, mobile 35% 60%; winter: desktop center, mobile 50% 55%.
   Search/recommendations are DOM text. Group previous/next, pause/resume and
   position controls at bottom right. Preserve keyboard and reduced-motion behavior.
2. **Home typography:** remove nested viewport-width restrictions. Keep seven
   rows per data module, align numbers on the right, and wrap long names without
   shrinking the primary text. The data-source note is quieter than module titles.
3. **Home hierarchy:** at 1440px show popular items/horn summaries first and
   monthly largest trades/popular posts second; below 1024px use that same order
   in one column. Do not force all modules to equal height. Replace only the
   all-time highest-price module with popular posts; retain monthly trades and
   their shared API. Use the existing `useInfinitePosts({tab: "popular", size: 10})`
   cache and first-page server order, at most five posts, without loading another
   page or trimming shared cache. Include loading, empty, error/retry and media-only
   states. Link posts to their detail and the footer to `/community`.
4. **Auction results:** change only row typography, alignment and internal
   spacing. Preserve price formatting (억/만/remainder and G), options, list/detail
   links, `return_to`, search, filters and sorting. Mobile names use at most two
   lines beside a nonwrapping price; metadata can wrap without overlap.
5. **Social reading:** use the same body/author/meta rules in feed, detail,
   comments and profile activity. Keep the 680px feed plus 280px rail and 20px gap;
   the rail disappears below 1024px and existing empty/error/auth conditions stay.
   Detail and comments share one surface. Mobile feed/detail are edge-to-edge with
   16px inner padding. Preserve profile header dimensions and information; do not
   add new actions to activity summaries. Support 1/2/5 media without clipping or
   autoplay and preserve existing comment, like, bookmark and share behavior.
6. **Item encyclopedia:** remove the repeated Package decoration from populated
   rows. There is no image URL in the current contract, so do not fabricate item
   images. Use 14/20px names, 12/18px classifications and a 16px expansion icon;
   preserve detail data, sorting, pagination, filters and the empty-state illustration.

### Completion evidence

- Inspect actual Chromium output at 1440×1000, 768×1024 and 390×844 in light and
  dark. Capture viewport and full-page output after fonts, images and data settle.
  The normal set contains seven screens × six combinations = 42 views.
- Also inspect both Hero images; popular posts 0/1/5/10, loading and error;
  auction loading/empty, long names and large/zero/fractional prices; social long
  text, 1/2/5 media, guest/auth states and rail absence; detail comments; profile
  minimal/full headers and activity tabs/states; encyclopedia expanded/loading/empty.
- Verify no unintended page overflow or collisions, search/content alignment
  within 2px, and the full first auction result within 390×844 under default filters.
  Compare against the approved reference and explicitly record protected existing
  controls or real-content differences rather than claiming pixel-identical output.
- Smoke-test the protected horn, statistics, My Page and navigation contracts.
  Use a local synthetic gateway for authenticated/state tests, without production
  writes. Run targeted behavior tests, `npm run verify`, secret scan, workflow
  checks and independent read-only review. Merge/deployment remain unapproved.
