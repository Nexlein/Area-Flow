# ADR 0004: Database access layer: Prisma

**Status:** Proposed · **Date:** 2026-11-24 · **Owner:** Nexlein · **Issues:** #28

## Why a record

Every query, every migration and every result type of the server goes through the access layer. Changing it later means rewriting the schema declaration, the migrations and every query. The matrix gives a near tie, so the reason for the choice must be written down.

## Context

- The database is proposed as PostgreSQL 18 ([ADR 0003](0003-persistence-postgresql.md)); the server as Fastify in TypeScript, with a route schema on every request body ([ADR 0001](0001-backend-fastify.md)).
- The repository is TypeScript only, in strict mode: query results should have types the compiler checks.
- Three libraries were tested on PostgreSQL 18.7 against the plain `pg` driver, with the same probes ([`../plan/tech-persistence.md`](../plan/tech-persistence.md#access-layer)).

## Alternatives

| Option                 | For this project                                                                                                                                 | What the product would look like with it                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| A (proposed): Prisma 7 | 62 of 80, one point behind `pg`: generated types and migrations, an advisory lock on migrate, used by all four members                           | One schema file generating the client, its types and the migrations |
| B: plain `pg`          | 63, the matrix leader by one point (46% of weightings against 45%). Not chosen here: every result type written by hand, our own migration runner | SQL in TypeScript, types maintained by hand                         |
| C: Drizzle, Kysely     | 57 and 45. Before 1.0; Drizzle's migrator takes no lock, Kysely inferred a wrong type                                                            | SQL-like builders in TypeScript                                     |

## Decision

Prisma ORM 7.10.x, with its driver adapter for `pg` and Prisma Migrate, pinned below 8.0. The exact version is pinned when the server is created.

## Consequences

An advisory lock is a lock PostgreSQL holds under a chosen number: two server instances that migrate at the same time take turns.

| Cost or limit                                                                                                                                                                                                                                                                                        | How we survive it                                                                                                                                                                 |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prisma's filters accept operators: a JSON object such as `{"contains": ""}` passed to `findFirst` matches a user                                                                                                                                                                                     | Route schemas type every field that reaches a filter; data-access functions check the type too; unique lookups use `findUnique`; a test sends operator objects to the login route |
| Prisma's schema and type limits: CHECK constraints go into the generated migration SQL by hand; identity columns become serials; partial indexes sit behind a preview flag; ids are `Int`, because `BigInt` does not serialize to JSON; one-query nested reads need the `relationJoins` preview flag | —                                                                                                                                                                                 |
| The Prisma CLI, about 125 packages, runs in the image that applies migrations                                                                                                                                                                                                                        | —                                                                                                                                                                                 |
| Prisma 8 is in release candidate, and npm's `latest` tag already installs it                                                                                                                                                                                                                         | We pin 7.10.x and plan the upgrade as its own change                                                                                                                              |

- **Revisit if** Prisma 8's `db migrate` cannot take over our migrations. That goes to a new ADR that supersedes this one.
- **Fact:** Prisma Migrate takes an advisory lock when it deploys migrations. ([Prisma docs](https://www.prisma.io/docs/orm/prisma-migrate/workflows/development-and-production#advisory-locking))

## Evidence

The four candidates passed probes P0 to P5 on PostgreSQL 18.7; tests and `tsc` were rerun outside the drafting sessions, and Prisma's operator finding was reproduced separately.

| Measure                                  | `pg`          | Prisma 7.10                                    | Drizzle 0.45 | Kysely 0.29         |
| ---------------------------------------- | ------------- | ---------------------------------------------- | ------------ | ------------------- |
| Total, out of 80                         | 63            | 62                                             | 57           | 45                  |
| A JSON object where a string is expected | finds nobody  | found by `findFirst`, rejected by `findUnique` | finds nobody | found with an array |
| Runtime packages, advisories (OSV)       | 13, 1 in 2017 | 21 (+125 for the CLI), 0                       | 14, 1 HIGH   | 14, 4 HIGH          |

The access-layer matrix and how fragile it is: [`../plan/tech-persistence.md`](../plan/tech-persistence.md#access-layer). Brief: [`../plan/spikes/persistence/brief.md`](../plan/spikes/persistence/brief.md); runs: [`../plan/spikes/persistence/runs.md`](../plan/spikes/persistence/runs.md).

## History

- 2026-11-24: created, `Proposed`, from the access-layer part of [ADR 0003](0003-persistence-postgresql.md). Awaiting the team's acceptance; each member scores the access-layer matrix first.
