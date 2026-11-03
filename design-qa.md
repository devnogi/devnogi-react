# Home Warm Hero Redesign — Design QA

## Reference and scope

- Reference: approved Option 1 mockup from 2026-11-02:
  `C:\Users\user\.codex\generated_images\01a19c77-aa88-7d63-81f3-d511890ca908\exec-fcd817b2-d95e-4904-9432-85560c935164.png`.
- Approved specifications:
  `docs/features/react-home-warm-hero-redesign-v1-20261102.md` and
  `docs/features/react-home-hero-search-v2-20261103.md` revision v1.
- Scope exclusions were preserved: no game-server, Abyss, Summoning Barrier, or mock-only status UI was added.
- Existing global navigation/search and all existing home ranking/data functionality were retained.

## Captured evidence

- Combined reference/implementation comparison:
  `C:\workspace\dev\memonogi\devnogi-react\qa-evidence\home-reference-vs-implementation.png`.
- Desktop implementation, `1440x1024`:
  `C:\workspace\dev\memonogi\devnogi-react\qa-evidence\home-desktop-1440x1024.png`.
- Focused desktop navigation/hero/content evidence:
  `C:\workspace\dev\memonogi\devnogi-react\qa-evidence\home-desktop-focus.png`.
- Mobile implementation, `390x844`:
  `C:\workspace\dev\memonogi\devnogi-react\qa-evidence\home-mobile-390x844.png`.

## Visual comparison

- The full-width scenic hero begins immediately below the existing navigation and is limited to 240px on desktop and about 236px on the tested mobile viewport.
- The page body returns to a clean white surface after the hero; warm coral, amber, and sage accents are limited to icons, focus/hover states, and the data notice.
- Desktop content is centered at 60% width (`864px` at a `1440px` viewport) while the header/navigation and hero remain full bleed.
- The four existing feature links retain their destinations and are presented in the approved two-column desktop / one-column mobile hierarchy.
- Existing ranking sections remain intact below the redesigned introduction instead of reproducing mock-only data or controls.

## Browser evidence

- Desktop: `1440x1024`; `documentElement.clientWidth = 1425`, `scrollWidth = 1425`; hero `1440x240`; content `864px` wide.
- Mobile: `390x844`; `documentElement.clientWidth = 375`, `scrollWidth = 375`; no horizontal scrollbar; all four feature links remain visible in one column.
- Dark mode: hero overlay, page background, text, dividers, and accent colors remain readable and consistent.
- Fresh-tab console check: no warnings or errors.
- Functional exclusions for the v1 baseline: mock-only status text absent.

## Findings

- P0: none.
- P1: none.
- P2: none. The Windows non-overlay scrollbar overflow found during review was fixed with a home-scoped root/body horizontal clip while preserving the full-bleed hero.

## Comparison history

1. Initial desktop and mobile captures matched the approved composition but exposed a horizontal scrollbar caused by `100vw` including the Windows scrollbar width.
2. A body-only clip removed the visible scrollbar but left `documentElement.scrollWidth` larger than `clientWidth`, so it was not accepted as complete.
3. The final home-scoped root/body clip produced equality on both tested viewports. New desktop, focused, mobile, and combined comparison captures were recorded from the clean server.
4. Independent code review reported no P0, P1, or P2 findings after the correction.

## V2 hero search evidence

- Combined approved-reference/current-implementation comparison:
  `C:\workspace\dev\memonogi\devnogi-react\qa-evidence\home-search-v2-reference-vs-implementation.png`.
- Desktop implementation, `1440x1024`:
  `C:\workspace\dev\memonogi\devnogi-react\qa-evidence\home-search-v2-desktop-1440x1024.png`.
- Mobile implementation, `390x844`:
  `C:\workspace\dev\memonogi\devnogi-react\qa-evidence\home-search-v2-mobile-390x844.png`.
- The visible hero title and description are absent from rendered body text and leaf DOM elements. The same search keywords remain in description, Open Graph description, Twitter metadata, and WebSite JSON-LD.
- The hero search replaces the former text panel without changing the full-width `1440x240` hero or the centered 60% desktop content grid.
- The navigation and hero inputs synchronize their value. A live `세공` query returned ten suggestions in the hero list; ten ArrowDown presses kept the last selected option inside the scroll viewport, and Enter navigated to the correctly encoded `/auction-history` item/category URL.
- Chromium shows one accessible custom clear button; the duplicated native search-cancel control found during QA is suppressed.
- Desktop: `documentElement.clientWidth = 1425`, `scrollWidth = 1425`.
- Mobile: `documentElement.clientWidth = 375`, `scrollWidth = 375`; both search inputs are available and synchronized.
- Mobile dark mode preserves readable input, button, hero, and body contrast.
- Fresh-tab console check: no warnings or errors.

## V2 findings and repair history

1. Independent review found a P2 where keyboard selection could move outside the scrollable autocomplete viewport. The active keyboard option now uses nearest scrolling, and a ten-item regression test plus browser measurement confirms it remains visible.
2. Browser QA found a P2 duplicate clear icon caused by Chromium's native search cancel control. The native control is now scoped out while the accessible custom clear button remains.
3. Final independent code review reports no P0, P1, or P2 findings; browser and combined visual comparison also report none.

## V3 hero overlap evidence

- Combined approved-reference/current-implementation comparison:
  `C:\workspace\dev\memonogi\devnogi-react\qa-evidence\home-overlap-v3-reference-vs-implementation.png`.
- Desktop implementation, `1440x1024`:
  `C:\workspace\dev\memonogi\devnogi-react\qa-evidence\home-overlap-v3-desktop-1440x1024.png`.
- Mobile implementation, `390x844`:
  `C:\workspace\dev\memonogi\devnogi-react\qa-evidence\home-overlap-v3-mobile-390x844.png`.
- Desktop measurement: hero `1440x280`, card `960.47px`, inner content `864px`, overlap `28px`, top radius `24px`, border `0px`, and `clientWidth = scrollWidth = 1425`.
- Mobile measurement: hero `390x260`, card `351px`, left/right gutters `12px`, overlap `20px`, and `clientWidth = scrollWidth = 375`.
- The feature links, data notice, and every ranking section share one white borderless card. Dark mode uses the existing navy surface with a `20px` mobile top radius and readable contrast.
- The hero search remains above the card (`z-index: 20` versus `10`). Its live ten-item autocomplete extended across the overlap and remained visible and clickable above the card.
- After scrolling to `scrollY = 3458`, the mobile navigation remained fixed at `top = 0`; the scroll-to-top control remained inside the viewport, and the footer began exactly after the card bottom without clipped ranking content.
- Fresh-tab console check: no warnings or errors.

## V3 findings and repair history

1. Independent review found that card width based on the full-bleed `100vw` wrapper would leave only `4.5px` visible mobile gutters on a non-overlay scrollbar platform.
2. The card now uses a home-scoped scrollbar-free inline-size query container and `calc(100cqw - 24px)`. Browser measurement confirms exact `12px` left/right gutters without horizontal overflow.
3. Final combined visual comparison confirms the taller scenic hero and rounded white content card match the approved composition while retaining the v2 search changes.
4. Final browser and code review report no remaining P0, P1, or P2 findings.

## V4 shadow removal evidence

- Combined approved-reference/current-implementation comparison:
  `C:\workspace\dev\memonogi\devnogi-react\qa-evidence\home-no-shadow-v4-reference-vs-implementation.png`.
- Desktop light implementation, `1440x1024`:
  `C:\workspace\dev\memonogi\devnogi-react\qa-evidence\home-no-shadow-v4-desktop-light-1440x1024.png`.
- Mobile light implementation, `390x844`:
  `C:\workspace\dev\memonogi\devnogi-react\qa-evidence\home-no-shadow-v4-mobile-light-390x844.png`.
- Computed `box-shadow` for `div[role="region"][aria-label="홈 콘텐츠"]` is `none` in desktop light, desktop dark, mobile light, and mobile dark states.
- Computed card border remains `0px`; no replacement border, outline, gradient, filter, or decorative depth effect was added.
- V3 measurements remain unchanged: desktop card `960.47px`, mobile gutters `12px / 12px`, and desktop/mobile `scrollWidth === clientWidth`.
- The white/navy surface, rounded top corners, hero overlap, synchronized search, all feature links, and ranking content remain intact.

## V4 findings

- P0: none.
- P1: none.
- P2: none.
- Independent code review found only the approved light/dark shadow utility removal, and the four browser state checks confirmed the computed result.

final result: passed

## V5 visual focus evidence

- Approved specification: `docs/features/react-home-visual-focus-v5-20261103.md`, revision `v1`, SHA-256 `05114273AC2932E17A4FE0449B035F9F19E89ADF25ACB0E2BB7EDDC7ECF19E87`.
- Taste direction: `Achromatic ledger` (seed `2045685949`). The page uses a white market-ledger surface, one warm copper accent, and the real Mabinogi ranking data as its visual signature.
- The screen's primary question is "오늘 가장 많이 거래되는 아이템은 무엇인가?". The existing `오늘의 인기 아이템` TOP 10 now answers it immediately below the hero, followed by price surge/drop and the remaining existing rankings.
- The single visible H1 is `메모노기에서 보는 마비노기 경매장 시세`; it renders on one line at 1440px and 768px and two lines at 390px.
- Existing functionality and scope remain unchanged: the hero and navigation searches share the same state and route behavior; no API, route, ranking limit, mock-only navigation, or invented statistic was added.
- The 280px desktop / 260px mobile hero, 60vw desktop inner content, 66.7vw overlap surface, exact 12px mobile gutters, borderless card, and `box-shadow: none` contract remain intact.
- Browser measurement at 1440px: `clientWidth = scrollWidth = 1425`, content surface `960.47px`, inner content `864px`, hero `280px`.
- Browser measurement at 768px: `clientWidth = scrollWidth = 753`, with exact 12px content gutters.
- Browser measurement at 390px: `clientWidth = scrollWidth = 375`, hero `260px`, exact 12px content gutters, and the H1 remains within two lines.
- Search QA covered both comboboxes: typing in either search synchronized the other, live suggestions appeared, ArrowDown set the active option, and Escape closed the list.
- Light and dark themes were visually checked at desktop and mobile widths; text, data accents, controls, and the overlap surface remain readable.
- Taste source lint reports `0 FAIL, 3 WARN`: one existing honest loading skeleton and two legitimate `YYYY.MM.DD` date-padding expressions.
- Taste real-browser inspection against the production build reports `0 FAIL, 2 WARN` at 1440px, 768px, and 390px. The below-fold warning is expected because the approved page retains every existing ranking. The panel-void warning is caused by the existing upstream `month-largest` ranking endpoint returning HTTP 500 while the other five ranking endpoints returned live data.
- Final production screenshots and report are stored under `.taste-skill/final-production/`; every generated viewport screenshot was opened and visually reviewed.
- Node `20.20.2` verification passed: formatting, lint, typecheck, dead-code analysis, 45 test suites / 211 tests, and the production build.

## V5 findings

- P0: none found during implementation and browser QA.
- P1: none found during implementation and browser QA.
- P2: none.
- Independent final diff review reported no P0, P1, P2, or P3 findings. It verified the approved specification hash, tracked diff identity, both new test files, acceptance mapping, and a fresh Node 20 focused test run (3 suites / 6 tests).
- Residual risk: the existing monthly-largest upstream endpoint returned HTTP 500 during final local QA; no API/BFF code changed in this feature. Commit-specific CI remains a later gate because this working tree has not been committed.

## V6 ranking and horn grid evidence

- Approved specification: `docs/features/react-home-ranking-horn-grid-v6-20261103.md`, revision `v1`, SHA-256 `0EA682A5E69121366D16D9CF9448F644C6A611DF1B574AA0E268457FEAAF82E0`.
- The home background uses the existing light-gray design token (`#F5F6F8`) while the four data cards use the white card token. Dark mode continues to use the existing navy surfaces.
- The home ranking area now contains only `오늘의 인기 아이템`, `역대 최고가 거래`, `이번 달 최대 거래액`, and `거대한 뿔피리`. The price-surge, price-drop, and volume-surge components remain available outside the home composition and were not deleted.
- The three ranking requests and the horn-bugle request each return at most seven entries. Final local production-gateway checks returned HTTP 200 with seven entries for all four endpoints.
- `거대한 뿔피리` requests `/api/horn-bugle?page=1&size=7`, which uses the existing all-server behavior when no server name is supplied. Each row shows only server, character, message, and sent time.
- Desktop browser measurement at 1440px: two `420px` columns; every card is exactly `420px × 538px`; `scrollWidth === clientWidth`; card shadows compute to `none`.
- Tablet browser measurement at 768px: one `681px` column; every card remains `538px` tall; no horizontal overflow.
- Mobile browser measurement at 390px: one `319px` column within exact `12px` content gutters; every card remains `538px` tall; no horizontal overflow.
- The full-page mobile capture confirms all four seven-row cards remain readable in sequence and the horn message text truncates instead of widening the layout.
- Search regression QA: entering `나무장작` in the visible navigation search synchronized all three responsive search instances and produced eight matching rendered text nodes; Escape and clearing restored the neutral state.
- Light and dark desktop states were visually checked. Dark mode applied the `dark` root class, `rgb(15, 15, 26)` page ground, readable card text, and preserved equal card dimensions. The browser was returned to light mode after QA.
- Taste source lint reports `0 FAIL, 3 WARN`: one intentional loading skeleton pulse and two legitimate date/time `padStart` expressions.
- Taste production inspection reports `0 FAIL, 1 WARN` across 1440px, 768px, and 390px. The below-fold warning is accepted because the approved design requires four complete seven-row cards rather than truncating their content.
- Final Taste screenshots and report are stored under `.taste-skill/v6-production/`; every generated desktop, tablet, and mobile fold/full-page image was opened and visually reviewed.
- Fresh Node `20.20.2` verification passed: formatting, lint, typecheck, Knip, 47 test suites / 215 tests, and the production build.

### V6 visual critique

```text
ROUND 1
Seen in one second: the scenic Mabinogi market hero, then the live ranking ledger.
Idea (one sentence): Mabinogi's storybook landscape becomes the entry point to a restrained, current market ledger.
Live thing: the synchronized item search plus four live seven-row data feeds.
Layout words by section: hero=full-bleed search landscape / rankings=2×2 ledger grid / features=two-column link list / notice=single text block / footer=centered close.
Scores: design 7.6 · usability 8.1 · creativity 7.2 · content 8.2 → overall 7.8.
Caps applied: none.
```

Top three problems (most visible first), each with the screenshot it shows in and the fix:

1. `desktop-fold.jpg` shows only the first row of the 2×2 ledger at once. This is retained because shrinking or truncating the required seven rows would violate the approved data-density contract; the page provides a conventional vertical scroll.
2. `tablet-page-01.jpg` is long because the 2×2 desktop grid intentionally becomes one column. The cards keep a consistent rhythm and full data rather than introducing a horizontal carousel.
3. `mobile-page-01.jpg` shows a dense sequence of four cards. One-line item/message truncation, stable value columns, and equal card height keep scanning predictable without removing approved content.

## V6 findings

- P0: none found during implementation and browser QA.
- P1: none found during implementation and browser QA.
- P2: none found during implementation and browser QA.
- Residual risk: the home reads from live upstream ranking and horn-bugle services, so empty/error states may appear during upstream incidents; all four final endpoint checks returned HTTP 200 with seven entries.

## Hero library image replacement

**Source visual truth**

- User-provided image: `C:\Users\user\AppData\Local\Temp\codex-clipboard-e030895e-40ca-4e6c-ae6e-1a386eb4c72c.png`.
- Project asset: `public/home-hero-library.png`.
- Source pixels: `1672 × 939`; source density was treated as `1x` because the image is used as responsive full-bleed media rather than a fixed CSS-size mockup.

**Implementation evidence**

- Production screenshot: `.taste-skill/hero-library-production/desktop-fold.jpg`.
- Desktop viewport: `1440 × 1024`; hero CSS size: `1440 × 280`; screenshot density: `1x`.
- Tablet evidence: `.taste-skill/hero-library-production/tablet-fold.jpg` at `768px` viewport width.
- Mobile evidence: `.taste-skill/hero-library-production/mobile-fold.jpg` at `390px` viewport width; hero CSS size: `390 × 260`.
- Combined full-view comparison: `qa-evidence/home-hero-library-source-vs-implementation.png`. The source was contained inside a `1440 × 1024` comparison panel; the production screenshot remained `1440 × 1024` so the intended crop and surrounding page hierarchy could be judged together.
- Focused-region comparison was made directly on the hero in the combined image. A separate crop was unnecessary because the 280px hero, search field, horse focal point, windows, books, and stairs are all legible at the combined image's rendered scale.
- Final responsive positions: mobile `45% 48%`; desktop/tablet `50% 40%`.
- In-app Browser QA measured `clientWidth === scrollWidth` at desktop and mobile sizes. The mobile hero remained `260px` tall with the horse statue, windows, books, and stair rail visible around the search field.
- Primary interaction regression: entering `나무장작` in the hero search synchronized all three responsive search inputs and rendered eight matching text nodes; Escape and clearing restored the neutral state.
- Browser console errors: none.
- Taste source lint: `0 FAIL, 0 WARN` for the changed hero component and CSS module.
- Taste production inspection: `0 FAIL, 1 WARN`. The unchanged below-fold warning is caused by the approved four complete seven-row data cards, not the hero asset replacement.

**Findings**

- No remaining P0, P1, or P2 differences.
- P3: the source is a wide illustration while the desktop hero is intentionally much shallower. The responsive `object-cover` crop therefore omits the floor and most of the ceiling, but preserves the horse, arched windows, bookshelves, and stairs that carry the image's identity.

**Comparison history**

1. The first desktop implementation used a `52%` vertical focal point and clipped the horse's head at the top edge, weakening the source image's main subject (P2).
2. The desktop/tablet focal point moved to `40%`; the revised production screenshot keeps the horse's head and torso, two arched windows, bookshelves, and the right stair rail visible while leaving the search field readable.
3. Mobile keeps a dedicated `45% 48%` focal point. The complete statue and crest remain visible in the 390px composition without horizontal overflow.

**Implementation checklist**

- [x] Copy the exact supplied image into the project.
- [x] Replace the existing hero asset without changing navigation, search, content height, or data behavior.
- [x] Tune responsive crop positions for desktop, tablet, and mobile.
- [x] Verify the production build, search interaction, console, responsive overflow, and visual output.

final result: passed
