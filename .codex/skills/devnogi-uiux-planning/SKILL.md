---
name: devnogi-uiux-planning
description: Plan DevNogi React UI and UX work before coding. Use when defining page structure, component hierarchy, interaction states, responsive layout behavior, theme parity, user flows, or file-level implementation scope for `.tsx` pages, components, and redesign tasks, especially when the result must match the existing DevNogi visual language and end in a lint-ready implementation plan.
---

# DevNogi UIUX Planning

## Overview

Plan UI work so implementation starts with the right structure instead of rework. Anchor every plan to the current DevNogi product language, reuse strategy, theme behavior, responsive behavior, and a clear finish checklist.

## Planning Workflow

### Inspect the real context

- Read `../../../CLAUDE.md` for the repository design language and workflow expectations.
- Review the target route, adjacent components, and shared primitives before proposing a layout.
- Identify what must be reused versus what can be introduced safely.

### Define the screen contract

- State the user goal and the primary action.
- Map the information hierarchy from top to bottom.
- Specify desktop, tablet, and mobile behavior separately when layouts diverge.
- Specify how light mode and dark mode should behave for surfaces, emphasis, and contrast.

### Define reusable implementation scope

- List the files likely to change.
- List components or hooks to reuse before proposing new abstractions.
- Call out required states: loading, empty, error, disabled, focus, and success where applicable.
- Note copy, iconography, and motion rules if they affect the experience.

### Produce a handoff that is ready to build

- Present the plan as concrete implementation steps, not only design commentary.
- Include acceptance checks for design fit, dark mode, responsive behavior, and state coverage.
- End the plan with a reminder to run `npm run lint` after implementation.

## Reference

- Read `references/planning-checklist.md` when a structured planning template is useful.
