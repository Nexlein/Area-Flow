# ADR 0003: Persistence: PostgreSQL

**Status:** Proposed · **Date:** 2026-11-24 · **Owner:** Nexlein · **Issues:** #28

## Why a record

Every workflow, run, delegated token and seen event lives in the database, and the hook engine relies on it to never treat an event twice. Changing the database later means rewriting the schema, the migrations, the queries and the backups.

## Context

- The subject requires that hooks never repeat an event, that delegated tokens are stored safely, a persistence model we can defend, and the whole product in Docker Compose ([subject](../subject/SUBJECT.md)); [SEC-CRYPTO](../subject/FEATURES.md#sec-crypto) and [SYS-BACKUP](../subject/FEATURES.md#sys-backup) lean on it.
- The model is relational: users, identities, subscriptions, workflows, nodes, runs, node results, hook state ([model](../architecture/persistence-model.md)).
- The server is proposed as Fastify in TypeScript ([ADR 0001](0001-backend-fastify.md)), which plans deduplication keys in the database and validates every request body with a route schema.
- Three databases were tested on one brief, with their official drivers and no ORM ([`../plan/tech-persistence.md`](../plan/tech-persistence.md)). The access layer on top is [ADR 0004](0004-access-layer-prisma.md).

## Alternatives

| Option                   | For this project                                                                                                                            | What the product would look like with it                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| A (proposed): PostgreSQL | 88 of 95, ahead under every weighting: correct under contention, binds values safely, used before by all four members                       | One database container; tables, foreign keys and constraints carry the rules |
| B: SQLite                | 76. Nothing to run, the fastest tests. Not chosen here: one writer, one file on one host, so no replicas on several hosts                   | A file inside the server container, backed up by copying it                  |
| C: MongoDB               | 53. Not chosen here: an exploited pre-authentication flaw, 164 server CVEs in two years (5 rated 9 or more), a replica set for transactions | Documents per workflow, rules enforced in code and validators                |

## Decision

PostgreSQL 18 on `postgres:18.7-alpine` (18.7 tested; 19.0 waits for a revision of this record). The exact version is pinned when the server is created.

## Consequences

CVSS is the 0-to-10 severity score of a CVE.

| Cost or limit                                                                                                                                                                                                                                      | How we survive it                                                                                                                      |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| One more container: a 304 MB image, 29 MiB idle, 6 s to start; a fresh test database costs 179 ms (SQLite: 1.7 ms)                                                                                                                                 | Create test databases from a migrated template, and measure the gain ([selection](../plan/tech-persistence.md#decision))               |
| Many PostgreSQL advisories: 103 CVEs with 2025 and 2026 identifiers, 69 rated 7 or more, none 9 or more, none in CISA's exploited catalogue. Most need a logged-in SQL user; eight core ones do not, three of them rated 7 or more (8.2, 8.1, 7.5) | The minor version pinned, Dependabot proposing the next; no database port outside Compose; an application role that is not a superuser |

- **Revisit if** the product stays on one host with no replicas (SQLite then costs less). That goes to a new ADR that supersedes this one.
- **Fact:** PostgreSQL's advisories, with affected and fixed versions. ([PostgreSQL security](https://www.postgresql.org/support/security/))
- **Fact:** MongoBleed, CVE-2025-14847, added to CISA's catalogue of exploited flaws on 2025-12-29. ([CISA](https://www.cisa.gov/known-exploited-vulnerabilities-catalog))
- **Fact:** PostgreSQL 18 is supported until 2030-11-14. ([Versioning policy](https://www.postgresql.org/support/versioning/))

## Evidence

All three databases passed the eight probes; tests, typecheck, a contention test and the measurements were rerun outside the drafting sessions.

| Measure                                              | PostgreSQL 18.7 | SQLite               | MongoDB  |
| ---------------------------------------------------- | --------------- | -------------------- | -------- |
| 8 processes, same 2,000 events: claimed once, errors | 2,000, 0        | 2,000, 0             | 2,000, 0 |
| Trigger lookup, median of 20                         | 7.8 ms          | 1.7 ms (in-process)  | 15.6 ms  |
| Fresh test database, median of 10                    | 179 ms          | 1.7 ms (in-process)  | 200 ms   |
| CVEs 2025-2026: total, CVSS 9 or more                | 103, 0          | about 20, not scored | 164, 5   |

The weighted matrix and how fragile it is: [`../plan/tech-persistence.md`](../plan/tech-persistence.md#weighted-matrix). Brief: [`../plan/spikes/persistence/brief.md`](../plan/spikes/persistence/brief.md); runs: [`../plan/spikes/persistence/runs.md`](../plan/spikes/persistence/runs.md).

## History

- 2026-11-24: created, `Proposed`. Awaiting the team's acceptance; each member scores the matrix first.
- 2026-11-24: the access layer (Prisma) moved to its own record, [ADR 0004](0004-access-layer-prisma.md): one decision per record.
