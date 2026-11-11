# Community author layout — revision 1

Scope: normal community post feed/detail/related cards and comments/replies. First line keeps server code, nickname, verified mark. Second line shows eligible grade as plain text, selected arcana label and existing relative time, separated only between present values. Remove repeated server name from the second line. No global badge redesign or profile/outfit/guild changes.

Data contract: backend supplies nullable author.arcana on post feed/detail and nullable top-level arcana on comment/reply DTOs, using existing Auth GameProfile enum codes. Older responses without the field work; no per-author fetch or invented arcana. Grade remains visible only for verified authors. Missing fields do not leave separators.

Validation: update existing author contract tests; full npm run verify, version1.0.26 and both workflow version fixtures; independent review and mandatory PR CI. Local server startup previously denied, so do not retry via alternate launcher. Deliver PR without merge/deployment for this request.
