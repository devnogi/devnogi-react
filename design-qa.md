# Home Warm Hero Redesign — Design QA

## Reference and scope

- Reference: approved Option 1 mockup from 2026-11-02:
  `C:\Users\user\.codex\generated_images\01a19c77-aa88-7d63-81f3-d511890ca908\exec-fcd817b2-d95e-4904-9432-85560c935164.png`.
- Approved specification: `docs/features/react-home-warm-hero-redesign-v1-20261102.md`.
- Scope exclusions were preserved: no game-server, Abyss, Summoning Barrier, or additional home search UI was added.
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
- Functional exclusions: mock-only status text absent; main content contains no added searchbox.

## Findings

- P0: none.
- P1: none.
- P2: none. The Windows non-overlay scrollbar overflow found during review was fixed with a home-scoped root/body horizontal clip while preserving the full-bleed hero.

## Comparison history

1. Initial desktop and mobile captures matched the approved composition but exposed a horizontal scrollbar caused by `100vw` including the Windows scrollbar width.
2. A body-only clip removed the visible scrollbar but left `documentElement.scrollWidth` larger than `clientWidth`, so it was not accepted as complete.
3. The final home-scoped root/body clip produced equality on both tested viewports. New desktop, focused, mobile, and combined comparison captures were recorded from the clean server.
4. Independent code review reported no P0, P1, or P2 findings after the correction.

final result: passed
