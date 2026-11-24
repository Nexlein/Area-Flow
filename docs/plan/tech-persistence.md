# Technology selection: persistence

**Status:** Draft · **Owner:** Nexlein (the team confirms) · **Decision:** PostgreSQL 18 with Prisma 7, proposed ([ADR 0003](../adr/0003-persistence-postgresql.md))

**Scope:** the database, its access layer (ORM, query builder, plain SQL), migrations, any other store (cache, queue).

**Drives the choice:** the entities of [`../architecture/persistence-model.md`](../architecture/persistence-model.md) · no event triggering twice · delegated tokens stored safely · Docker Compose. Features that lean on it: [SEC-CRYPTO](../subject/FEATURES.md#sec-crypto), [SYS-BACKUP](../subject/FEATURES.md#sys-backup), [ENG-RETRY](../subject/FEATURES.md#eng-retry).

## What we compared

| Candidate      | Model                       | Why it is in the list                                        |
| -------------- | --------------------------- | ------------------------------------------------------------ |
| **PostgreSQL** | relational, network server  | the default relational choice; all four members have used it |
| **SQLite**     | relational, file in-process | nothing to run or operate; the fastest tests                 |
| **MongoDB**    | documents, network server   | a workflow and its nodes fit one document                    |

- Each with its official or most used Node.js driver and **no ORM**: the database is compared, not the library. The access layer is chosen after, for the winner ([below](#access-layer)).
- Considered, not tested: MySQL and MariaDB (relational, and offer nothing PostgreSQL lacks here), Redis (a cache or queue, not the main store).

## Tests made

Eight probes from one brief ([`spikes/persistence-brief.md`](spikes/persistence-brief.md)), 10-minute cap each, one coding-assistant session per database. Each probe broke one line on purpose to check its test failed (one SQLite order check proved nothing, see the [runs](spikes/persistence-runs.md)).

Then, outside those sessions and one database at a time: every test suite, a strict typecheck, a harder concurrency test, the measurements.

| Probe | Checks                                                                         |
| ----- | ------------------------------------------------------------------------------ |
| P0    | Runs in Docker Compose, healthy on a new volume, no secret in a file           |
| P1    | The 8 entities, versioned migrations, a second one keeps the data, rerun no-op |
| P2    | `claimOccurrence` true once per event, ever, from several processes at once    |
| P3    | A run and its node results stored together or not at all                       |
| P4    | Enabled workflows triggered by one Action, with ordered nodes, among 10,000    |
| P5    | Token encrypted with AES-256-GCM; hostile JSON inputs find no user             |
| P6    | Each test file gets its own fresh, migrated database                           |
| P7    | Backup, drop everything, restore, same counts                                  |

## Results

| Measure                                             | PostgreSQL 18.7                  | SQLite 3.54                   | MongoDB 9.0                          |
| --------------------------------------------------- | -------------------------------- | ----------------------------- | ------------------------------------ |
| Probes passed, tests rerun                          | 8/8, 8 pass (also on 19.0)       | 8/8, 7 pass                   | 8/8, 9 pass                          |
| Concurrency: 8 processes, same 2,000 events, 3 runs | 2,000 claimed once, 0.6 to 1.0 s | 2,000 once, 0.4 s, in-process | 2,000 once, 1.3 to 1.8 s             |
| Trigger lookup (P4), median of 20                   | 7.8 ms                           | 1.7 ms, in-process            | 15.6 ms                              |
| Fresh test database (P6), median of 10              | 179 ms                           | 1.7 ms, in-process            | 200 ms                               |
| Image, cold start, idle memory                      | 304 MB (Alpine), 6.0 s, 29 MiB   | none: inside the server       | 1,127 MB, 11.0 s, 111 MiB            |
| `{"$ne": null}` as the email, no type check         | finds nobody (bound as text)     | rejected by the driver        | **returns a user**                   |
| CVEs 2025-2026: total, CVSS 7+, CVSS 9+             | 103 (77 server), 69, 0           | about 20, not scored          | 164 (server), 108, 5                 |
| In CISA's catalogue of exploited flaws              | none                             | none                          | MongoBleed, CVE-2025-14847, pre-auth |

SQLite runs in-process with no network hop: its times are not like for like.

| Finding                                                                                                       | So                                                                                             |
| ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| All three deduplicate correctly under contention with one unique constraint                                   | "never twice" is the database's job, not an in-memory lock ([hooks](../architecture/hooks.md)) |
| MongoDB transactions need a replica set; with auth, a key file and `directConnection` too                     | more setup in Compose, 11 s to start                                                           |
| MongoDB's driver passes `{"$ne": null}` as a query operator                                                   | every input needs a type check, or the login query leaks users                                 |
| Most PostgreSQL CVEs need a logged-in SQL user; eight core ones do not, three rated 7 or more (8.2, 8.1, 7.5) | no database port outside Compose; an application role that is not a superuser                  |
| SQLite: one writer at a time, one file on one host                                                            | workers on the same host queue on its lock; replicas on several hosts are ruled out            |
| SQLite enforces foreign keys only after `PRAGMA foreign_keys = ON`, on every connection                       | a silent trap, set by hand in the probes                                                       |
| No database spike's `migrate` locks against a second run                                                      | two instances starting together could race (see the access layer)                              |

Not tested: key rotation, tamper detection on PostgreSQL (the SQLite and MongoDB probes flipped a byte), real load, replication, several server instances, MongoDB with nodes embedded in the workflow document.

## Weighted matrix

Weights: **3** = the subject requires it, **2** = shapes cost or risk over the project. Scores 1 to 5 (5 is best), score times weight in brackets: total weight 19, maximum 95.

| Criterion                                   | Weight | PostgreSQL | SQLite   | MongoDB  | Why                                                                                                                         |
| ------------------------------------------- | ------ | ---------- | -------- | -------- | --------------------------------------------------------------------------------------------------------------------------- |
| Security: advisories, injection, encryption | 3      | 4 (12)     | 4 (12)   | 2 (6)    | MongoDB: a flaw in CISA's exploited catalogue, operator injection; SQLite: no network, no access control beyond file rights |
| Integrity: unique constraints, transactions | 3      | 5 (15)     | 4 (12)   | 3 (9)    | all correct; SQLite's foreign keys are off by default; MongoDB has none                                                     |
| Model fit and queries                       | 2      | 5 (10)     | 4 (8)    | 3 (6)    | our model is relational; SQLite stores JSON as text and timestamps as integers; MongoDB tested with separate nodes          |
| Migrations from a fresh clone               | 2      | 5 (10)     | 4 (8)    | 3 (6)    | versioned files in all; SQLite rebuilds a table for most changes (documented, not hit)                                      |
| Several server instances (not tested)       | 2      | 5 (10)     | 2 (4)    | 5 (10)   | SQLite is one file on one host                                                                                              |
| Tests: throwaway databases                  | 2      | 4 (8)      | 5 (10)   | 3 (6)    | 179 ms, 1.7 ms, 200 ms with a raised open-files limit                                                                       |
| Operations: backup, footprint in Compose    | 2      | 4 (8)      | 5 (10)   | 2 (4)    | SQLite needs no container; MongoDB weighs 1.1 GB                                                                            |
| Learning curve and oral defense             | 3      | 5 (15)     | 4 (12)   | 2 (6)    | all four members have used PostgreSQL with Prisma; MongoDB is new, with its own traps                                       |
| **Total, out of 95**                        |        | **88**     | **76**   | **53**   |                                                                                                                             |
| **Weighted average, 1 to 5**                |        | **4.63**   | **4.00** | **2.79** |                                                                                                                             |

The learning-curve weight is how we read the subject's oral defense, as in [`tech-backend.md`](tech-backend.md): a review choice the team can change. SQLite's table rebuild: [ALTER TABLE](https://www.sqlite.org/lang_altertable.html).

Before the ADR is accepted, each member scores this matrix and the access-layer one alone ([bootstrap](../subject/BOOTSTRAP.md#weighted-decision-matrix)); a gap of more than 2 points is discussed and recorded here.

**How fragile it is.** PostgreSQL wins all 6,561 integer weightings from 1 to 3, by 1 point over SQLite at worst. Without the learning-curve row, the team's own habit, it still leads, 73 against 64. Only scores can change the ranking: if we stay on one server, SQLite gets 5 on several instances, and with 5 on security too PostgreSQL still leads, 88 to 85; with 5 on integrity as well, they tie.

## Access layer

P0 to P5 again on PostgreSQL 18.7 (P5 without encryption), with three libraries, against the plain `pg` driver of the database spike. Tests and typecheck rerun outside the drafting sessions; Prisma's injection finding reproduced separately.

| Measure                                  | `pg` (baseline) | Prisma 7.10                                                               | Drizzle 0.45                        | Kysely 0.29                         |
| ---------------------------------------- | --------------- | ------------------------------------------------------------------------- | ----------------------------------- | ----------------------------------- |
| Probes passed, `tsc` errors              | 8/8, 0          | 6/6, 0                                                                    | 6/6, 0                              | 6/6, 0                              |
| Migrations                               | SQL by hand     | SQL generated from its schema, advisory lock                              | SQL generated, no lock              | written by hand, advisory lock      |
| What the schema cannot declare           | -               | CHECK, identity; partial index behind a preview flag                      | CHECK only as an `sql` fragment     | through `sql` fragments             |
| Type of the P4 result                    | written by hand | inferred, checked by `tsc`; one query needs a preview flag                | inferred, checked by `tsc`          | inferred, **wrong** (`id` a string) |
| A JSON object where an email is expected | finds nobody    | **found** by `findFirst` with `{"contains": ""}`; `findUnique` rejects it | finds nobody with `eq()`            | **found** with `["a@b.c"]`          |
| Runtime packages, advisories (OSV)       | 13, 1 in 2017   | 21, plus 125 for the CLI that applies migrations; 0                       | 14, 1 HIGH in 2026, fixed in 0.45.2 | 14, 4 HIGH in 2026 (2 MySQL only)   |
| Stable line                              | 8.x             | 7.x; 8.0 in release candidate                                             | 0.45; 1.0 in release candidate      | 0.29                                |

| Criterion                               | Weight | `pg`     | Prisma   | Drizzle  | Kysely   | Why                                                                                                                                     |
| --------------------------------------- | ------ | -------- | -------- | -------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Injection without a type check          | 3      | 5 (15)   | 3 (9)    | 4 (12)   | 2 (6)    | values bound by `pg` and Drizzle's `eq()`; Prisma's `findUnique` rejects objects, `findFirst` does not; Drizzle 1.0 adds object filters |
| Team knows it, oral defense             | 3      | 4 (12)   | 5 (15)   | 3 (9)    | 3 (9)    | all four members have used Prisma; `pg` is plain SQL                                                                                    |
| Migrations: generated, readable, locked | 2      | 2 (4)    | 5 (10)   | 3 (6)    | 3 (6)    | only Prisma 7 has all three                                                                                                             |
| Schema coverage                         | 2      | 5 (10)   | 3 (6)    | 4 (8)    | 4 (8)    | Prisma's CHECK constraints go into the generated SQL by hand                                                                            |
| Typed results                           | 2      | 1 (2)    | 5 (10)   | 5 (10)   | 2 (4)    | `pg`: by hand; Kysely's inferred type was wrong                                                                                         |
| Weight and advisories                   | 2      | 5 (10)   | 3 (6)    | 4 (8)    | 3 (6)    | from the table above; Prisma's CLI ships where migrations run                                                                           |
| Stable major                            | 2      | 5 (10)   | 3 (6)    | 2 (4)    | 3 (6)    | Prisma 8 replaces `migrate deploy` with `db migrate`; Drizzle 1.0 turns `where` into an object                                          |
| **Total, out of 80**                    |        | **63**   | **62**   | **57**   | **45**   |                                                                                                                                         |
| **Weighted average, 1 to 5**            |        | **3.94** | **3.88** | **3.56** | **2.81** |                                                                                                                                         |

Prisma 8: [`db migrate` succeeds `migrate deploy`](https://github.com/prisma/web/blob/main/apps/docs/content/docs/orm/reference/error-reference.mdx). Drizzle 1.0: [`where` becomes an object](https://rqbv2.drizzle-orm-fe.pages.dev/docs/relations-v1-v2).

**How fragile it is.** Across all 2,187 weightings, `pg` wins 46%, Prisma 45%, Drizzle 1%, the rest tie. One point decides it: one more for Prisma on any row below 5, or one less for `pg`, swaps the lead.

Proposed: **Prisma 7**, against `pg`'s 1-point lead.

- The rows `pg` wins have a remedy: route schemas and a type check in each data-access function for injection (Fastify's validation has had bypasses: [`tech-backend.md`](tech-backend.md)), the CLI only in the image that migrates, 7.10 pinned.
- The rows `pg` loses come back with every query and every schema change: result types written by hand, our own migration runner and its lock.
- With typed results at weight 3 instead of 2, Prisma leads, 67 against 64. The team confirms that weight when it scores.

## Decision

**Proposed choice: PostgreSQL 18 with Prisma 7**, by the owner, pending the team's acceptance of [ADR 0003](../adr/0003-persistence-postgresql.md).

- **The two criteria that decided it:** security against MongoDB (164 server flaws in two years, 5 rated 9 or more, MongoBleed exploited before authentication); several server instances against SQLite (one file on one host rules out replicas, such as SYS-K8S if selected).
- **Version:** `postgres:18.7-alpine` (304 MB, supported until 2030-11-14) rather than 19.0, released five days before the spike; the tests pass on both.
- **Trade-off we accept:** a container to run, and 179 ms per fresh test database (SQLite: 1.7 ms). To survive it: create test databases from a migrated template, and measure the gain.
- **Security baseline:** the minor version pinned, Dependabot proposing the next; no database port outside Compose; an application role that is not a superuser.
- **Access layer:** Prisma 7.10.x, pinned, since npm's `latest` tag already points to 8.0. Its costs: route schemas type every field that reaches a filter, and data-access functions check types too; CHECK constraints written into the generated migrations; `Int` ids, because `BigInt` does not serialize to JSON; its CLI in the image that applies migrations.
- **Runners-up:** SQLite (76 against 88), nothing to run and the fastest tests, the better choice if the product stays on one host; MongoDB (53) is lowest on seven of the eight criteria. For the access layer, plain `pg`, the matrix leader (63 against 62): lighter and safe by construction, but every result type written by hand.
- **Team disagreement:** none recorded yet; gaps found when each member scores the two matrices go here.
