# ADR 0001: Back-end framework: Fastify

**Status:** Proposed · **Date:** 2026-11-23 · **Owner:** TeddyBertrand · **Issues:** #19

## Why a record

The server holds all business logic and every client depends on its contract. Changing the framework later means rewriting the engine, the hooks and the OpenAPI tests, so it is costly to reverse.

## Context

- The subject requires a served and tested OpenAPI description, hooks that run with no client and never repeat an event, OIDC login, OAuth2 delegated access, and Docker Compose ([subject](../subject/SUBJECT.md)).
- Rules: TypeScript only (repository), full-stack frameworks strongly discouraged (subject). We compare what each candidate produced on the same brief, not only what its documentation promises.
- Three candidates were tested the same way: six probes, speed, weight and security ([`../plan/tech-backend.md`](../plan/tech-backend.md)).

## Alternatives

| Option                | For this project                                                                                                                                                                                                                                                                                                  | What the product would look like with it                                                   |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| A (proposed): Fastify | Fastify: fastest and lightest of the three, fewest manual fixes (8), no decorators, one schema drives validation and OpenAPI                                                                                                                                                                                      | A small plain server; scheduling, deduplication and configuration checks are ours to write |
| B: Effect             | One point behind under the proposed weights (65 against 66), with scheduling, timeouts and configuration checks built in. Not chosen here: slowest and heaviest (2.3 times Fastify at runtime), four non-existent APIs in its first draft, a steep learning curve that makes oral defense harder, young ecosystem | Strong typed failure handling, but a style the whole team must learn and easy to get wrong |
| C: NestJS             | Never ahead under any weighting tried. Most manual fixes (13), official scheduler did not install, generated JWT guard failed open on missing configuration, validation hand-written, 104 packages                                                                                                                | A structured, familiar layout; decorators and dependency injection hide the wiring         |

Hono, Elysia and Express with `tsoa` were considered and not tested. Go, Python and Java stacks were left out by the TypeScript-only rule ([why](../plan/tech-backend.md#language)).

## Decision

Fastify 5.12.x in TypeScript, never below 5.12.6 (the latest advisory fix at the time of writing), with its own OpenAPI plugins and `jose` for JWT and JWKS. Exact versions are pinned when the server is created.

## Consequences

| Cost or limit                                                                                                                                                                                                                               | How we survive it                                                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| The most security advisories of the three: 19 in ten years, 14 in the last 24 months, 7 of them HIGH, and nine are validation bypasses. Accepted because fixes arrive in point releases within days and the installed version contains them | Track updates with Dependabot; keep an application-level check behind the schema (the save-time key-path check does not trust the schema alone); test malformed inputs                                                   |
| No built-in scheduler, and we give up Effect's: its schedules, timeouts and typed failures would have come for free. In the spikes, hooks use a hand-written timer, with deduplication held in memory and lost on restart                   | We write them. In the real server, deduplication keys go to the database with a uniqueness constraint ([persistence](../plan/tech-persistence.md)), which no framework's in-process scheduler would have given us anyway |
| Test-runner trap: in the spike, tests hung unless the job was disabled                                                                                                                                                                      | The app builder must not start jobs; only the server entry point does                                                                                                                                                    |
| Configuration was read lazily                                                                                                                                                                                                               | The server must validate its security-relevant environment at startup and refuse to start without it                                                                                                                     |
| Not tested: OIDC login, OAuth2 delegation and a realistic load were not part of the spikes, and `jose` is third-party                                                                                                                       | —                                                                                                                                                                                                                        |

- **Revisit if** the hook engine makes us hand-write retries, timeouts and cancellation that Effect would have given us, or if a Fastify validation advisory cannot be fixed by upgrading within a week. Either goes to a new ADR that supersedes this one.
- **Fact:** Fastify's advisories, with dates and fixed versions. ([GitLab advisory list](https://advisories.gitlab.com/pkg/npm/fastify/))
- **Fact:** the advisory data was read from the OSV database on 2026-11-23. ([OSV](https://osv.dev))

## Evidence

All three candidates passed the six probes. Median of three runs on the compiled code, `autocannon` with 50 connections for 10 s:

| Measure                       | Fastify            | Effect             | NestJS              |
| ----------------------------- | ------------------ | ------------------ | ------------------- |
| `/ping` requests per second   | 42,384             | 17,582             | 26,241              |
| Cold start, idle memory       | 269 ms, 89 MB      | 548 ms, 163 MB     | 376 ms, 112 MB      |
| Production dependencies       | 29 MB, 78 packages | 94 MB, 15 packages | 58 MB, 104 packages |
| Manual fixes, wrong APIs used | 8, 1               | 10, 4              | 13, 0               |

The weighted matrix, its weights, and how fragile the ranking is are in [`../plan/tech-backend.md`](../plan/tech-backend.md#weighted-matrix). The raw probe logs are in [`../plan/spikes/backend/runs.md`](../plan/spikes/backend/runs.md), the briefs in [`../plan/spikes/backend/brief.md`](../plan/spikes/backend/brief.md).

## History

- 2026-11-23: created, `Proposed`. Awaiting the team's acceptance.
- 2026-11-23: the matrix gains the learning-curve and oral-defense criterion (weight 3); Fastify now leads, 66 against 65. Each member scores the matrix before acceptance.
