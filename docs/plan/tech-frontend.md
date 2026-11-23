# Technology selection: front-end

**Status:** Draft · **Owner:** name · **Decision:** ADR NNNN

**Scope:** the web client and the Android client: frameworks, shared code or not, UI and i18n libraries, how the builder is drawn.

**Drives the choice** ([subject](../subject/SUBJECT.md)): separate from the server · web-only builder · Android with a configurable server address, APK built by Docker Compose · WCAG AA · two languages · OIDC and OAuth2 redirects on web and mobile.

## Criteria

| Criterion                                                          | Weight |
| ------------------------------------------------------------------ | ------ |
| Security: XSS defenses, token storage on web and mobile, redirects |        |
| Accessibility: WCAG AA support and audit tooling                   |        |
| Internationalization                                               |        |
| Builder: fit for a canvas, step list or wizard                     |        |
| Android APK built in Docker, no local SDK                          |        |
| Client generated from the OpenAPI description                      |        |
| Code shared between web and mobile, and its cost                   |        |
| Team knowledge and learning goal                                   |        |
| Testing: components, end to end                                    |        |

## Candidates

| Candidate (web / mobile) | Score | Strengths | Weaknesses | Why not |
| ------------------------ | ----- | --------- | ---------- | ------- |
|                          |       |           |            |         |

**Compared by:** sources read, PoC, measurements, each linked. **PoC:** link, what it showed, with numbers.
