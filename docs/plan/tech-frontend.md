# Technology selection: front-end

**Status:** Draft · **Owner:** name · **Decision:** ADR NNNN (to write)

Scope: the web client and the Android client. Framework of each, whether they share code, UI and i18n libraries, how the builder is drawn.

## What the subject asks of the clients

- Presentation and interaction only: no business rule in the clients.
- Separate codebases from the server (full-stack frameworks strongly discouraged); built in parallel against the OpenAPI contract.
- Web: common browsers; hosts the **builder** (nodes and data mapping, web only), free form but justified.
- Android: server address configurable in the app; lists workflows, enables and disables them, shows their runs; no building. iOS is a bonus.
- Docker Compose produces an installable Android app (APK).
- WCAG AA on both clients, with an audit report; at least two languages over the whole main flow.
- Login with a local account and through OIDC, OAuth2 subscriptions to Services: redirects and callbacks on web and mobile.
- Selected features with screens (admin area, reviews, templates, run history...): [`features-selection.md`](features-selection.md).

## Criteria

| Criterion                                                                | Weight | Why it matters here |
| ------------------------------------------------------------------------ | ------ | ------------------- |
| Security: XSS defenses, token storage on web and mobile, OAuth redirects |        |                     |
| Accessibility: WCAG AA support, audit tooling                            |        |                     |
| Internationalization                                                     |        |                     |
| Builder: fit for a canvas, a step list or a wizard                       |        |                     |
| Android build reproducible in Docker (APK without a local SDK)           |        |                     |
| Client generated from the OpenAPI description                            |        |                     |
| Code sharing between web and mobile, and its cost                        |        |                     |
| Team knowledge and learning goal                                         |        |                     |
| Testing: components, end-to-end                                          |        |                     |

## Candidates

| Candidate (web / mobile) | Score | Strengths | Weaknesses |
| ------------------------ | ----- | --------- | ---------- |
|                          |       |           |            |

## Comparison

How each candidate was evaluated against each criterion: reading (with sources), PoC, measurement.

## Evidence (exploratory code)

- PoC: what was built, where (branch or folder), what it showed, with numbers.

## Decision

Concise, justified choice. Record it in an ADR from [`../adr/0000-template.md`](../adr/0000-template.md).

## Rejected

- **Candidate:** why not for this project.
