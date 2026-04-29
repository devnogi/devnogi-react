# DevNogi UI Rules

## Visual fit

- Match nearby screens before inventing a new pattern.
- Keep rounded corners generous and shadows soft.
- Preserve clean spacing, readable hierarchy, and restrained accent usage.
- Avoid harsh shadows, sharp-corner-heavy layouts, and visually dense blocks.

## Theme parity

- Verify surfaces, text, borders, and interactive states in both light mode and dark mode.
- Avoid hard-coded foreground/background pairs unless they are already used safely in the repo.
- Keep contrast readable in both themes.

## Responsive parity

- Check mobile, tablet, and desktop layouts.
- Prevent overflow, clipped copy, broken tables, and controls that only work on hover.
- Prefer stacking, wrapping, or modal/drawer adaptations over shrinking content until it fails.

## State coverage

- Check loading, empty, error, disabled, hover, focus, and selected states.
- Keep focus indicators visible and touch targets usable.

## Done definition

- Confirm the result matches the existing DevNogi design language.
- Confirm light and dark mode parity.
- Confirm responsive behavior.
- Run `npm run lint`.
