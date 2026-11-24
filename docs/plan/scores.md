<!-- Each member's own scores of the four technology matrices, filled alone before comparing, and the gaps the team discussed. -->

# Individual matrix scores

The [bootstrap](../subject/BOOTSTRAP.md#weighted-decision-matrix) asks every member to score each matrix **alone, before any discussion**, then to compare. The owners' scores are in each `tech-*.md`; this file holds everyone's.

| Step | Who                | What                                                                                                                                                                                                   |
| ---- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1    | Each member, alone | Fill your column: scores 1 to 5 per candidate, in the order given above each table, e.g. `3 / 4 / 2`. Keep it local until all four are done, then commit together, so nobody sees another column first |
| 2    | Team               | Every criterion where two members differ by more than 2 points goes under **Gaps** with how it was settled                                                                                             |
| 3    | Owner              | Report any changed score in the `tech-*.md` and the History of its ADR, then the team accepts the ADR                                                                                                  |

## Back-end

Matrix: [`tech-backend.md`](tech-backend.md). Order in each cell: NestJS / Fastify / Effect (e.g. `3 / 4 / 2`).

| Criterion                                                | Weight | Nexlein | Saitamadupauvre | TeddyBertrand | Quinceyyyy |
| -------------------------------------------------------- | ------ | ------- | --------------- | ------------- | ---------- |
| Security: advisories, defaults, auth libraries           | 3      |         |                 |               |            |
| OpenAPI: generation, served UI, contract tests           | 3      |         |                 |               |            |
| Background work: scheduling hooks, timeouts              | 3      |         |                 |               |            |
| OAuth2 / OIDC libraries                                  | 2      |         |                 |               |            |
| Testing: unit, functional, mocked third parties          | 2      |         |                 |               |            |
| Speed and weight                                         | 2      |         |                 |               |            |
| Ease of getting it right: fixes, wrong APIs, conventions | 2      |         |                 |               |            |
| Learning curve and oral defense                          | 3      |         |                 |               |            |
| **Weighted total**                                       |        |         |                 |               |            |

**Gaps** (more than 2 points): none recorded yet.

## Front-end

Matrix: [`tech-frontend.md`](tech-frontend.md). Order in each cell: React + Expo / Svelte + Capacitor / Solid + Capacitor (e.g. `3 / 4 / 3`).

| Criterion                                                       | Weight | Nexlein | Saitamadupauvre | TeddyBertrand | Quinceyyyy |
| --------------------------------------------------------------- | ------ | ------- | --------------- | ------------- | ---------- |
| Security: advisories, XSS defaults, token storage, dependencies | 3      |         |                 |               |            |
| Accessibility and two languages                                 | 3      |         |                 |               |            |
| Builder                                                         | 3      |         |                 |               |            |
| Android APK built in Docker                                     | 3      |         |                 |               |            |
| Code shared web and mobile, client from OpenAPI                 | 2      |         |                 |               |            |
| Testing                                                         | 2      |         |                 |               |            |
| Speed and weight                                                | 2      |         |                 |               |            |
| Ease of getting it right: fixes, versions, tooling              | 2      |         |                 |               |            |
| Learning curve and oral defense                                 | 3      |         |                 |               |            |
| **Weighted total**                                              |        |         |                 |               |            |

**Gaps** (more than 2 points): none recorded yet.

## Persistence

Matrix: [`tech-persistence.md`](tech-persistence.md#weighted-matrix). Order in each cell: PostgreSQL / SQLite / MongoDB (e.g. `5 / 4 / 2`).

| Criterion                                   | Weight | Nexlein | Saitamadupauvre | TeddyBertrand | Quinceyyyy |
| ------------------------------------------- | ------ | ------- | --------------- | ------------- | ---------- |
| Security: advisories, injection, encryption | 3      |         |                 |               |            |
| Integrity: unique constraints, transactions | 3      |         |                 |               |            |
| Model fit and queries                       | 2      |         |                 |               |            |
| Migrations from a fresh clone               | 2      |         |                 |               |            |
| Several server instances (not tested)       | 2      |         |                 |               |            |
| Tests: throwaway databases                  | 2      |         |                 |               |            |
| Operations: backup, footprint in Compose    | 2      |         |                 |               |            |
| Learning curve and oral defense             | 3      |         |                 |               |            |
| **Weighted total**                          |        |         |                 |               |            |

**Gaps** (more than 2 points): none recorded yet.

## Access layer

Matrix: [`tech-persistence.md`](tech-persistence.md#access-layer). Order in each cell: `pg` / Prisma / Drizzle / Kysely (e.g. `3 / 5 / 3 / 3`).

| Criterion                               | Weight | Nexlein | Saitamadupauvre | TeddyBertrand | Quinceyyyy |
| --------------------------------------- | ------ | ------- | --------------- | ------------- | ---------- |
| Injection without a type check          | 3      |         |                 |               |            |
| Team knows it, oral defense             | 3      |         |                 |               |            |
| Migrations: generated, readable, locked | 2      |         |                 |               |            |
| Schema coverage                         | 2      |         |                 |               |            |
| Typed results                           | 2      |         |                 |               |            |
| Weight and advisories                   | 2      |         |                 |               |            |
| Stable major                            | 2      |         |                 |               |            |
| **Weighted total**                      |        |         |                 |               |            |

**Gaps** (more than 2 points): none recorded yet.
