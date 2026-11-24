<!-- Each member's own scores of the four technology matrices, filled alone before comparing, and the gaps the team discussed. -->

# Individual matrix scores

The [bootstrap](../subject/BOOTSTRAP.md#weighted-decision-matrix) asks every member to score each matrix **alone, before any discussion**, then to compare. The owners' scores are in each `tech-*.md`; this file holds everyone's.

| Step | Who                  | What                                                                                                                                                                                                                                         |
| ---- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Each member, in turn | Score the matrices on paper first, from the evidence, before opening this file. Then on the branch `docs/matrix-scores`: `git pull`, fill your column (`3 / 4 / 2`, in the order given above each table), commit, push. One member at a time |
| 2    | Team                 | Every criterion where two members differ by more than 2 points goes under **Gaps** with how it was settled                                                                                                                                   |
| 3    | Owner                | Report any changed score in the `tech-*.md` and the History of its ADR, then the team accepts the ADR                                                                                                                                        |

## Back-end

Matrix: [`tech-backend.md`](tech-backend.md). Order in each cell: NestJS / Fastify / Effect (e.g. `3 / 4 / 2`).

| Criterion                                                | Weight | Nexlein          | Saitamadupauvre | TeddyBertrand | Quinceyyyy |
| -------------------------------------------------------- | ------ | ---------------- | --------------- | ------------- | ---------- |
| Security: advisories, defaults, auth libraries           | 3      | 5 / 3 / 1        |                 |               |            |
| OpenAPI: generation, served UI, contract tests           | 3      | 2.5 / 4 / 4.5    |                 |               |            |
| Background work: scheduling hooks, timeouts              | 3      | 1.5 / 3 / 5      |                 |               |            |
| OAuth2 / OIDC libraries                                  | 2      | 4 / 4 / 3        |                 |               |            |
| Testing: unit, functional, mocked third parties          | 2      | 4 / 3.5 / 3      |                 |               |            |
| Speed and weight                                         | 2      | 3.5 / 4.5 / 2.5  |                 |               |            |
| Ease of getting it right: fixes, wrong APIs, conventions | 2      | 3 / 4 / 1.5      |                 |               |            |
| Learning curve and oral defense                          | 3      | 3 / 4.5 / 2      |                 |               |            |
| **Weighted total**                                       |        | 65 / 75.5 / 57.5 |                 |               |            |

**Gaps** (more than 2 points): none recorded yet.

## Front-end

Matrix: [`tech-frontend.md`](tech-frontend.md). Order in each cell: React + Expo / Svelte + Capacitor / Solid + Capacitor (e.g. `3 / 4 / 3`).

| Criterion                                                       | Weight | Nexlein            | Saitamadupauvre | TeddyBertrand | Quinceyyyy |
| --------------------------------------------------------------- | ------ | ------------------ | --------------- | ------------- | ---------- |
| Security: advisories, XSS defaults, token storage, dependencies | 3      | 3 / 2 / 4          |                 |               |            |
| Accessibility and two languages                                 | 3      | 4 / 4 / 4          |                 |               |            |
| Builder                                                         | 3      | 3 / 4 / 3.5        |                 |               |            |
| Android APK built in Docker                                     | 3      | 2 / 4 / 4          |                 |               |            |
| Code shared web and mobile, client from OpenAPI                 | 2      | 2 / 4 / 4          |                 |               |            |
| Testing                                                         | 2      | 3.5 / 4 / 4        |                 |               |            |
| Speed and weight                                                | 2      | 2.5 / 4 / 5        |                 |               |            |
| Ease of getting it right: fixes, versions, tooling              | 2      | 4 / 2 / 3          |                 |               |            |
| Learning curve and oral defense                                 | 3      | 4.5 / 3.5 / 3      |                 |               |            |
| **Weighted total**                                              |        | 73.5 / 80.5 / 87.5 |                 |               |            |

**Extra candidate, not tested (Nexlein):** React + Capacitor, the React web client in a Capacitor WebView. Estimated from the React web probes (F0 to F5) and the Capacitor build: 4 / 4 / 3 / 4 / 4 / 4 / 2.5 / 3.5 / 5 in the criteria order above, weighted total 88 (Solid 87.5 in the same column). Proposed to the team: add it as a fourth candidate and build its APK with the Capacitor 8 rerun ([#35](https://github.com/Nexlein/Area-Flow/issues/35)).

**Gaps** (more than 2 points): none recorded yet.

## Persistence

Matrix: [`tech-persistence.md`](tech-persistence.md#weighted-matrix). Order in each cell: PostgreSQL / SQLite / MongoDB (e.g. `5 / 4 / 2`).

| Criterion                                   | Weight | Nexlein      | Saitamadupauvre | TeddyBertrand | Quinceyyyy |
| ------------------------------------------- | ------ | ------------ | --------------- | ------------- | ---------- |
| Security: advisories, injection, encryption | 3      | 4 / 4 / 2    |                 |               |            |
| Integrity: unique constraints, transactions | 3      | 5 / 4 / 3    |                 |               |            |
| Model fit and queries                       | 2      | 5 / 4 / 3    |                 |               |            |
| Migrations from a fresh clone               | 2      | 5 / 4 / 3    |                 |               |            |
| Several server instances (not tested)       | 2      | 5 / 2 / 5    |                 |               |            |
| Tests: throwaway databases                  | 2      | 4 / 5 / 3    |                 |               |            |
| Operations: backup, footprint in Compose    | 2      | 4 / 5 / 2    |                 |               |            |
| Learning curve and oral defense             | 3      | 5 / 4 / 2    |                 |               |            |
| **Weighted total**                          |        | 88 / 76 / 53 |                 |               |            |

**Gaps** (more than 2 points): none recorded yet.

## Access layer

Matrix: [`tech-persistence.md`](tech-persistence.md#access-layer). Order in each cell: `pg` / Prisma / Drizzle / Kysely (e.g. `3 / 5 / 3 / 3`).

| Criterion                               | Weight | Nexlein           | Saitamadupauvre | TeddyBertrand | Quinceyyyy |
| --------------------------------------- | ------ | ----------------- | --------------- | ------------- | ---------- |
| Injection without a type check          | 3      | 5 / 3 / 4 / 2     |                 |               |            |
| Team knows it, oral defense             | 3      | 4 / 5 / 3 / 3     |                 |               |            |
| Migrations: generated, readable, locked | 2      | 2 / 5 / 3 / 3     |                 |               |            |
| Schema coverage                         | 2      | 5 / 3 / 4 / 4     |                 |               |            |
| Typed results                           | 2      | 1 / 5 / 5 / 2     |                 |               |            |
| Weight and advisories                   | 2      | 5 / 3 / 4 / 3     |                 |               |            |
| Stable major                            | 2      | 5 / 3 / 2 / 3     |                 |               |            |
| **Weighted total**                      |        | 63 / 62 / 57 / 45 |                 |               |            |

**Weight note (Nexlein):** for a server-side library, "Weight and advisories" reads as a tiebreaker (weight 1) rather than weight 2; at weight 1 the totals become `pg` 58, Prisma 59. Not applied: weights change only when the team compares the scores.

**Gaps** (more than 2 points): none recorded yet.
