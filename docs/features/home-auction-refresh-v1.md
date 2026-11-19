# Home and advertisement auction refresh — revision 1

Approved scope: user plan dated 2026-11-19. Repository: devnogi/devnogi-react; base main b10864a.

- Hero: 320px below 768px and 480px from 768px. Center search below Hero and above cards; remove popular-item links, feature disclosure, and data notice from home.
- Hero caption links to /hero-auctions; existing advertisement image links remain intact. Controls move to the lower left with no mobile overlap.
- Combine unofficial-site notice, NEXON Open API attribution, and in-game verification guidance in the shared Footer once.
- Compact the four cards through spacing only; preserve item counts, long text, and existing more links.
- Advertisement navigation is public. Anonymous visitors and authentication loading see static rules and registration steps only; no auction or member queries. Guests receive a login link.
- Replace the old auction introduction and standalone rules button with a summary card and accessible question-mark dialog trigger. Preserve the detailed rules and dialog focus behavior.
- Explain creative registration, creative selection, and XP bidding. Member actions follow existing verified-character and 45 XP eligibility rules.

Acceptance: targeted home/navigation/auction regression tests; full npm run verify; responsive visual checks; independent review; PR required checks. Version 1.0.38. Merge and production deployment require separate approval.
