# Technology selection: back-end

**Status:** Draft · **Owner:** TeddyBertrand (the team confirms) · **Decision:** Fastify, proposed ([ADR 0001](../adr/0001-backend-fastify.md))

**Scope:** the application server: language, HTTP framework, OpenAPI tooling, what runs the hooks.

**Drives the choice** ([subject](../subject/SUBJECT.md)): served and tested OpenAPI contract · hooks running with no client · OIDC login and OAuth2 delegated access · Docker Compose.

## What we compared

- **TypeScript only** (repository rule, [why](#language)). **Full-stack frameworks strongly discouraged** (subject).
- We judge what each candidate produced on the same brief, not only what its documentation promises.
- Three candidates chosen for contrast: **NestJS** (the framework does it), **Fastify** (we assemble it), **Effect** (typed effects, scheduling built in).
- Considered, not tested: Hono, Elysia, Express with `tsoa`.

## Language

TypeScript was set for the whole repository before the spikes; it is not scored in the matrix below. Our reasons:

- One language for the server, the web client and the Android client (Capacitor and React Native both run TypeScript): any member can read any codebase.
- The clients' types come from the OpenAPI description and the compiler checks them, in strict mode (probe F1 of [`tech-frontend.md`](tech-frontend.md)).
- The repository tooling is already TypeScript, run by Node without a build step.

Go, Python and Java (server), Kotlin and Flutter (mobile) were left out by that rule, not compared. Comparing languages would be a new ADR.

## Tests made

Each candidate went through the same four categories.

| Category             | What was done                                                                                                                                                                                                                                  |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Requirements fit** | Six probes, drafted with a coding assistant from an identical brief ([`spikes/backend/brief.md`](spikes/backend/brief.md)), 5 minutes at most each, then checked and fixed by hand. Details below the table.                                   |
| **Speed**            | Compiled code under `autocannon` (50 connections, 10 s) on `/ping` and on the save-time check, plus cold start and idle memory. Median of 3 runs in rotating order, zero errors.                                                               |
| **Weight**           | Production dependency size and package count.                                                                                                                                                                                                  |
| **Security**         | Advisory history of each framework's own packages (OSV database, cross-checked on GitLab, NVD and Red Hat). Known vulnerabilities in the installed versions (OSV and `npm audit`). What each JWT guard does when its configuration is missing. |

The six probes, numbered as in the [runs](spikes/backend/runs.md) (a JWKS is the set of public keys a provider publishes to verify its tokens):

| Probe | Checks                                                                                  |
| ----- | --------------------------------------------------------------------------------------- |
| 0     | A `/ping` server                                                                        |
| 1     | A served OpenAPI description, with a test that fails when code and description disagree |
| 2     | A background hook that deduplicates, survives errors and times out                      |
| 3     | A save-time check rejecting undeclared `{{ key }}` references without evaluating them   |
| 4     | A JWT checked against a JWKS, including `alg: none` and HS256 attacks                   |
| 5     | A route calling a mocked third party that answers 502 on failure                        |

We reran every test and broke one rule per probe to check a test failed.

| Test                                                                 | NestJS 12.6.0                    | Fastify 5.12.8      | Effect 4.1.5       |
| -------------------------------------------------------------------- | -------------------------------- | ------------------- | ------------------ |
| Probes passed, of 6                                                  | 6                                | 6                   | 6                  |
| Manual fixes, wrong APIs used                                        | 13, 0                            | 8, 1                | 10, 4              |
| `/ping` requests per second                                          | 26,241                           | 42,384              | 17,582             |
| Save-time check requests per second                                  | 15,255                           | 25,487              | 10,180             |
| Cold start, idle memory                                              | 376 ms, 112 MB                   | 269 ms, 89 MB       | 548 ms, 163 MB     |
| Production dependencies                                              | 58 MB, 104 packages              | 29 MB, 78 packages  | 94 MB, 15 packages |
| Advisories on its own packages: all time, HIGH in the last 24 months | 3, 0                             | 19, 7               | 3, 2               |
| Known vulnerabilities in the installed version                       | 0                                | 0                   | 0                  |
| JWT guard when issuer or audience is not configured                  | accepts any validly signed token | rejects every token | refuses to start   |
| Hook scheduling and timeout                                          | hand-written                     | hand-written        | built in           |

| Finding                                                                                                                | Detail                                                                                            |
| ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| All three hold hook deduplication in memory                                                                            | events would be reprocessed after a restart: a persistence decision, not a framework feature      |
| NestJS: its official scheduler would not install (peer-dependency conflict)                                            |                                                                                                   |
| NestJS: the generated JWT guard fails open                                                                             | any validly signed token passes when configuration is missing                                     |
| Fastify: 9 of its 19 advisories are validation bypasses, all since April 2025                                          | they hit the boundary AREA relies on; fixed quickly, and the installed version contains the fixes |
| Effect: four APIs used in its first draft do not exist in version 4 (the names look like version 3 ones, not verified) |                                                                                                   |
| Effect: two of its three advisories list only a version 3 fix                                                          | whether version 4 is affected is unknown                                                          |
| Effect: its "connection refused" test passes through the timeout                                                       | it cannot tell a refusal from a hang                                                              |

- **Not tested:** the OIDC login and OAuth2 delegation flows, persistence (see [`tech-persistence.md`](tech-persistence.md)), a realistic load, and the cold-read questions of the [brief](spikes/backend/brief.md#cold-read-questions).
- **Unconfirmed advisories:** two (Fastify `CVE-2026-76169`, Effect `CVE-2026-121707`) are counted from OSV but could not be confirmed elsewhere.

Spike code is in local repositories, not pushed. Full logs and raw runs: [`spikes/backend/runs.md`](spikes/backend/runs.md). The identical briefs: [`spikes/backend/brief.md`](spikes/backend/brief.md). Advisory history and heaviness, with sources: [`spikes/backend/security-and-weight.md`](spikes/backend/security-and-weight.md).

## Weighted matrix

Weights: **3** = the subject requires it, **2** = shapes cost or risk over the project, **1** = a tiebreaker. Scores 1 to 5 (5 is best), the number in brackets is score times weight: total weight 20, maximum 100.

**Scored from the tests above; the weights are the owner's proposal**, and the learning-curve row was added in review. Before the ADR is accepted, each member scores the matrix alone, as the [bootstrap](../subject/BOOTSTRAP.md#weighted-decision-matrix) asks. Any criterion where two members differ by more than 2 points is discussed and recorded in [`scores.md`](scores.md) (Gaps).

| Criterion                                                | Weight | NestJS   | Fastify  | Effect   | Why                                                                                                                                                                        |
| -------------------------------------------------------- | ------ | -------- | -------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Security: advisories, defaults, auth libraries           | 3      | 3 (9)    | 2 (6)    | 4 (12)   | NestJS: fewest advisories, but fails open, widest tree. Fastify: by far the most. Effect: refuses to start on missing configuration, smallest tree, but young              |
| OpenAPI: generation, served UI, contract tests           | 3      | 3 (9)    | 4 (12)   | 4 (12)   | NestJS's DTO classes do not validate, so description and validation can drift; the other two derive both from one definition                                               |
| Background work: scheduling hooks, timeouts              | 3      | 2 (6)    | 2 (6)    | 5 (15)   | only Effect has it built in                                                                                                                                                |
| OAuth2 / OIDC libraries                                  | 2      | 3 (6)    | 3 (6)    | 3 (6)    | all three used `jose`; flows not tested, so no difference scored                                                                                                           |
| Testing: unit, functional, mocked third parties          | 2      | 4 (8)    | 3 (6)    | 3 (6)    | Fastify's tests hang unless configured; Effect's refusal test is blind                                                                                                     |
| Speed and weight                                         | 2      | 3 (6)    | 5 (10)   | 2 (4)    | Fastify leads every measure                                                                                                                                                |
| Ease of getting it right: fixes, wrong APIs, conventions | 2      | 3 (6)    | 4 (8)    | 2 (4)    | NestJS needed the most fixes; Effect used the most non-existent APIs                                                                                                       |
| Learning curve and oral defense                          | 3      | 3 (9)    | 4 (12)   | 2 (6)    | Fastify: plain functions and route schemas. NestJS: decorators and dependency injection hide the wiring (its DI hung silently in probe 2). Effect: a new programming model |
| **Total, out of 100**                                    |        | **59**   | **66**   | **65**   |                                                                                                                                                                            |
| **Weighted average, 1 to 5**                             |        | **2.95** | **3.30** | **3.25** |                                                                                                                                                                            |

Learning curve and oral defense, weight 3:

- The subject has every member explain an architecture decision they contributed to ([subject](../subject/SUBJECT.md#documentation)). The learning curve is how we read that requirement (a review choice the team can change).
- The bootstrap asks for technologies nobody has shipped with, so the scores rest on the learning curve seen in the spikes. Each member records their experience below before the ADR is accepted; a row that changes a score goes into the History of ADR 0001.

Each cell: none, tried, or shipped.

| Member          | NestJS | Fastify | Effect |
| --------------- | ------ | ------- | ------ |
| Nexlein         | none   | none    | none   |
| Saitamadupauvre |        |         |        |
| TeddyBertrand   |        |         |        |
| Quinceyyyy      |        |         |        |

- Effect's version 4 is two months old (4.0.0 on 2026-10-01) and most examples still target version 3. That is where its four non-existent APIs came from.

**How fragile it is.** Across every integer weighting from 1 to 3 (6,561 of them), NestJS never wins. Fastify wins 77%, Effect 16%, the rest tie. Effect wins when security and built-in background work count most and the learning curve least. Without the learning-curve row the two are level (44% each), and under the proposed weights Effect leads, 59 against 54. The row added in review decides the ranking. The most contestable scores are security (Effect 4, Fastify 2) and the learning-curve row itself.

## Decision

**Proposed choice: Fastify (TypeScript)**, by the owner, pending the team's acceptance of [ADR 0001](../adr/0001-backend-fastify.md).

- **The two criteria that decided it:** the learning curve and oral defense (plain code every member can explain, where Effect asks the team to learn a new model on a two-month-old major version) and speed and weight (it leads every runtime measure).
- **Trade-off we accept:** the most security advisories, nine of them validation bypasses, and no built-in scheduler. To survive it: pin a recent version (at least 5.12.6) and let Dependabot track it, keep an application-level check behind the schema (as the save-time probe did), and write the hook scheduler ourselves with deduplication stored in the database, not in memory.
- **Team disagreement:** none recorded yet; the gaps found when each member scores the matrix go to [`scores.md`](scores.md) (Gaps), their outcome here.
- **Runner-up: Effect**, one point behind (65 against 66). It leads on built-in background work and security defaults; Fastify leads on the learning curve, speed and weight. The margin is thin under these weights but holds across most weightings (Fastify 77%, Effect 16%), so the team should weigh the learning-curve row carefully when it accepts the ADR.
