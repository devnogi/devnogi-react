---
name: devnogi-frontend-qa-finish
description: Review and finish DevNogi React frontend changes after coding. Use when checking `.tsx` pages, components, Tailwind styling, and interaction polish for visual consistency with the existing design, light and dark mode parity, responsive behavior, accessibility states, and final `npm run lint` completion before handing work back.
---

# DevNogi Frontend QA Finish

## Overview

Run a finish pass on frontend work before it is considered done. Check whether the change still looks and behaves like DevNogi, whether it survives both themes and multiple viewport sizes, and whether lint passes cleanly.

## Finish Workflow

### Review the change in context

- Read the changed files and nearby screens, not only the diff.
- Compare spacing, radii, surface treatment, density, and copy tone against existing patterns.
- Flag any UI that feels detached from the rest of the product.

### Verify theme parity

- Check light mode and dark mode deliberately.
- Confirm readable contrast for text, icons, borders, hover states, and selected states.
- Catch hard-coded colors or surfaces that only work in one theme.

### Verify responsive behavior

- Check small mobile, tablet, and desktop layouts.
- Look for overflow, collapsed controls, broken tables, clipped text, and awkward spacing shifts.
- Confirm touch-friendly interactions on mobile and pointer-friendly polish on desktop.

### Verify state and accessibility coverage

- Check loading, empty, error, disabled, focus, and success states when applicable.
- Confirm visible focus styles and usable keyboard interaction.
- Ensure primary actions remain discoverable without relying only on color.

### Close the task

- Run `npm run lint`.
- Fix issues introduced by the change.
- If lint or QA fails because of unrelated existing issues, report the blocker with file names and keep the finish assessment explicit.

## Reference

- Read `references/finish-checklist.md` for the condensed final pass.
