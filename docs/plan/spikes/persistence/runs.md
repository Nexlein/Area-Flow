<!-- Log of every persistence spike run: what each database and access layer produced, what was checked outside the drafting sessions, and what the result does not prove. -->

# Persistence spike runs

Run on 2026-11-24, one coding-assistant session per candidate, in parallel, from [`brief.md`](brief.md), in `~/dev/epitech/tek3/area-persistence-spike/` (outside this repository). "Checked" means rerun outside the drafting sessions, by the scripts of that folder (`measure.sh`, `*/verify/`, `count-advisories.py`; raw outputs in `measure.out`, `measure-pg18.out`, `stress.out`); everything else is the session's own log. Summary and decision: [`../../tech-persistence.md`](../../tech-persistence.md).

Versions: Node 26.13.1, npm 11.20.0, Docker 29.8.0. PostgreSQL 19.0 (`postgres:latest`) then 18.7 (`postgres:18-alpine`) with `pg` 8.23.1; SQLite 3.54.1 through `node:sqlite`; MongoDB 9.0.8 with `mongodb` 7.9.1.

## Databases, per probe

| Probe          | PostgreSQL                                                     | SQLite                                                           | MongoDB                                                                  |
| -------------- | -------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------ |
| P0 Compose     | pass, 17 s; password required by Compose                       | pass, 14 s; no credentials exist                                 | pass, ~190 s; replica set, key file derived at start, `directConnection` |
| P1 Migrations  | pass, 8 s; no lock against two runs at once                    | pass, 17 s; `STRICT` tables                                      | pass, ~80 s; `$jsonSchema` validators and unique indexes                 |
| P2 Dedup       | pass, 19 s; 1 config error (a worker file run as a test)       | pass, 11 s; one process won all 1,000 (writers queue)            | pass, ~35 s                                                              |
| P3 Transaction | pass, 8 s                                                      | pass, 10 s; `BEGIN IMMEDIATE`                                    | pass, ~20 s; needs the replica set                                       |
| P4 Query       | pass, 10 s; one query, `json_agg`                              | pass, 13 s; one join; an order break passed thanks to an index   | pass, ~15 s; one `$lookup`                                               |
| P5 Security    | pass, 13 s; objects bound as text, safe even without the check | pass, 8 s; the driver throws on an object                        | pass, ~15 s; without the type check `{"$ne": null}` returns the user     |
| P6 Test DBs    | pass, 249 s (125 s a hang from the break)                      | pass, 42 s; about 2 ms per file                                  | pass, ~630 s, over the cap; open-files limit raised to 64,000            |
| P7 Backup      | pass, 24 s; `pg_dump -Fc`, `pg_restore`                        | pass, 37 s; `.backup`, `.restore`; CLI installed at first backup | pass, ~15 s; `mongodump`, `mongorestore`; index and validator survive    |

Seconds are as each session logged them, with different conventions (with or without writing time): not compared. Every probe broke one line on purpose and its test failed, except the SQLite P4 order break, which proved nothing and is not counted.

## Databases, checked

| Check                                                               | PostgreSQL                                                          | SQLite                            | MongoDB               |
| ------------------------------------------------------------------- | ------------------------------------------------------------------- | --------------------------------- | --------------------- |
| Test suite rerun                                                    | 8/8 on 19.0 and on 18.7                                             | 7/7                               | 9/9                   |
| `tsc --noEmit`, strict                                              | 0 errors (with `@types/pg`)                                         | 0 (with `types: ["node"]`)        | 0                     |
| 8 processes, same 2,000 events, shuffled, one start instant, 3 runs | 2,000 once each run; 0.48 to 0.70 s on 19.0, 0.62 to 0.97 s on 18.7 | 2,000, 0.37 to 0.40 s, in-process | 2,000, 1.29 to 1.81 s |
| Cold start to healthy, median of 3                                  | 4.0 s on 19.0, 6.0 s on 18.7                                        | 3.8 s (a Node service)            | 11.0 s                |
| Idle memory                                                         | 34 MiB on 19.0, 29 MiB on 18.7                                      | 24 MiB (the Node service)         | 111 MiB               |
| Fresh migrated database, median of 10                               | 124 ms on 19.0, 179 ms on 18.7                                      | 1.7 ms                            | 200 ms                |
| P4 query, median of 20, three runs                                  | 6.5 ms on 19.0, 7.8 ms on 18.7                                      | 1.7 ms                            | 15.6 ms               |

One database at a time, on a laptop also running two containers of another project. PostgreSQL 19.0 is the Debian image, 18.7 the Alpine one; SQLite runs in-process, with no network hop.

Advisories, on 2026-11-24, from saved copies of each page: [PostgreSQL](https://www.postgresql.org/support/security/) and [MongoDB](https://www.mongodb.com/resources/products/mongodb-security-bulletins) counted by script; [SQLite](https://www.sqlite.org/cves.html) and the [CISA catalogue](https://www.cisa.gov/known-exploited-vulnerabilities-catalog) read by hand. PostgreSQL's page has no dates, so its window is the CVE year (2025 and 2026).

## Access layers

PostgreSQL 18.7, probes P0 to P5. Prisma 7.10.1 with `@prisma/adapter-pg`, Drizzle 0.45.4 with drizzle-kit 0.31.11, Kysely 0.29.9 with kysely-codegen 0.20.0, TypeScript 7.0.2.

| Probe                       | Prisma                                                                    | Drizzle                                         | Kysely                                                       |
| --------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------ |
| P0 Connect                  | pass                                                                      | pass                                            | pass                                                         |
| P1 Migrations               | pass; `migrate dev` no longer regenerates the client (v7)                 | pass; no built-in `bytea`, a 3-line custom type | pass; wrong import path for `FileMigrationProvider`          |
| P2 Dedup                    | pass; `createMany` with `skipDuplicates`                                  | pass; `onConflictDoNothing`                     | pass; `onConflict().doNothing()`                             |
| P3 Transaction              | pass                                                                      | pass                                            | pass; a shared client pointed at the wrong database at first |
| P4 Query                    | pass, 5.2 to 5.5 ms; one query needs the `relationJoins` preview flag     | pass, 2.96 ms; one query                        | pass, 3.7 to 3.8 ms; inferred `id` type wrong                |
| P5 Injection                | pass with a type check; `findFirst` matches `{"contains": ""}` without it | pass, safe without a type check                 | pass with a type check; `["a@b.c"]` matches without it       |
| Checked: tests twice, `tsc` | 7/7, 0                                                                    | 7/7, 0                                          | 7/7, 0                                                       |

The P4 times were taken while the three sessions ran in parallel: indicative only. The Prisma operator finding was reproduced separately (`findFirst` found the user with `{"contains": ""}`, `{"not": "zzz"}`, `{"startsWith": "a"}`, `{"in": [...]}`; `findUnique` rejected them). Runtime packages: the dependency tree of the client libraries and `pg`, from each `package-lock.json`, optional dependencies excluded; Prisma's CLI, which applies its migrations, adds about 125. Migration locks: Prisma Migrate and Kysely's `Migrator` take a PostgreSQL advisory lock; Drizzle's migrator does not (read in its source, 0.45.4). Advisories: [OSV](https://osv.dev), 2026-11-24.

**Not proven:** real load, a long-running server, replication, key rotation, the access layers on SQLite or MongoDB, and how the team reads each library a day later.
