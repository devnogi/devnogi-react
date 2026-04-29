---
name: devnogi-uiux-implementation
description: Implement or update DevNogi React UI and UX in `.tsx` files, Tailwind styling, Shadcn components, and page layouts. Use when building screens, cards, forms, filters, navigation, modals, or visual refinements that must match the existing DevNogi design language, preserve light and dark mode parity, stay responsive across mobile and desktop, and finish with `npm run lint`.
---

# DevNogi UIUX Implementation

## Overview

Implement UI work so it feels native to this repository. Reuse nearby patterns first, keep the visual tone aligned with DevNogi, and treat light mode, dark mode, responsive behavior, and lint completion as required deliverables.

## Workflow

### Load local context

- Read `../../../CLAUDE.md` for project commands, design language, and repository expectations.
- Inspect nearby files in `src/app`, `src/components/page`, `src/components/ui`, and `src/contexts/ThemeContext.tsx` before changing structure or styling.
- Prefer existing component APIs, spacing, radii, and interaction patterns over introducing new ones.

### Match the existing design

- Preserve the soft, modern, friendly style: rounded corners, gentle shadows, clear hierarchy, and generous whitespace.
- Reuse Pretendard, current Tailwind conventions, and existing Shadcn primitives already used in the feature area.
- Keep copy tone, icon weight, density, and motion consistent with adjacent screens.
- Avoid standalone redesigns unless the user explicitly asks for a visual departure.

### Build with theme and responsive parity

- Treat light mode and dark mode as mandatory.
- Treat mobile and desktop as mandatory.
- Check at least small mobile, tablet, and wide desktop layouts before considering the work complete.
- Avoid hard-coded light-only colors, unreadable contrast pairs, fixed widths that break on mobile, and hover-only interactions without touch-safe alternatives.

### Cover interaction states

- Implement or verify loading, empty, error, disabled, hover, focus, and selected states when relevant.
- Keep keyboard focus visible and touch targets comfortable.
- Favor reusable state components or nearby patterns over one-off markup.

### Finish the task cleanly

- Keep the change scoped to the request and consistent with nearby files.
- Run `npm run lint` from the repository root after editing.
- Fix lint errors introduced by the change before handing work back.
- If unrelated existing issues block a clean finish, report them explicitly.

## Reference

- Read `references/devnogi-ui-rules.md` for the condensed delivery checklist.
