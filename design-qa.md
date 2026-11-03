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

final result: passed
