# Community Social Feed Design

## Product feeling

The community is a warm, low-pressure conversation space for life in Erinn. It should feel as effortless as posting on X, Threads, or Instagram while retaining Memonogi's quiet brown-and-gold Mabinogi character.

## Layout

- The primary timeline is a continuous white surface, about 680px wide, separated by thin rules instead of individual floating cards.
- At desktop widths, a 280px popular-post rail sits to the right. It disappears below 1024px; the feed remains the visual focus.
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
- Brown (`#9a451f`) is the primary light-mode action color; gold is the dark-mode counterpart. Avoid gradients, glass effects, decorative shadows, and excessive rounded containers.

## Accessibility and responsive behavior

- Preserve visible focus, semantic buttons/links, pressed states, descriptive labels, AA contrast, and keyboard operation.
- Use `scrollbar-gutter: stable` globally so entering the community does not shift the top navigation.
- Loading, empty, error, unauthenticated, long-text, and 1/2/5-media states must remain readable at 1440, 768, and 390px.
