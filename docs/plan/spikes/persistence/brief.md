<!-- The identical briefs used for every persistence spike (databases, then access layers), so no candidate got more help than another. -->

# Persistence spike briefs

Used verbatim for each candidate. Folder paths (`../postgresql`, `~/dev/...`) are in the spike folder, outside this repository. Summary, matrix and decision: [`../../tech-persistence.md`](../../tech-persistence.md); runs and checks: [`runs.md`](runs.md).

## Databases

Identical for every candidate: replace only `<DATABASE>` with `PostgreSQL`, `SQLite` or `MongoDB`. One session per database, probes in order, in that database's folder. Each probe has a 10-minute wall-clock cap (`date +%s` at start and end): when it rings, stop, write where it stood in `LOG.md`, and go to the next probe. Do not reword a probe for one candidate.

### Shared preamble

You are writing a throwaway proof of concept in TypeScript against <DATABASE>, in the current folder. TypeScript only, no JavaScript files, strict mode, run by Node 26 directly (type stripping, no build step); tests with `node:test`. Use the latest stable <DATABASE> (an official Docker image for a server database) and the official or most widely used Node.js driver. **No ORM, no query builder**: the access layer is compared separately. Name every version you used. Keep the code simple enough that someone who did not write it can follow it. Do not add features that were not asked for.

### Probes

0. **Compose.** Write a `compose.yaml` that runs <DATABASE> with a healthcheck and its data on a named volume (for an embedded database: a small Node service that opens the database file on a named volume). Credentials come from environment variables, never written in a file. `docker compose up -d --wait` from a fresh clone ends healthy, and `npm run ping` connects and prints the database version.
1. **Schema and migrations.** Store these entities: users (unique email, password hash); external identities (provider and subject unique together); subscriptions (user, service, encrypted token, scopes, expiry); workflows (owner, name, enabled, the Action id of its trigger); nodes (workflow, position, type, params as string key-values); runs (workflow, status, start and end); node results (run, node, status, output); hook state (workflow, occurrence id, seen at). Use versioned migration files applied in order by `npm run migrate`, recorded so that a second run applies nothing. Then add a second migration giving workflows a `description`, without losing data. Test: fresh database, migrate, insert, second migration, data still there, rerun is a no-op.
2. **Event deduplication.** Write `claimOccurrence(workflowId, occurrenceId)`, which returns `true` exactly once per pair, ever, even when called at the same time from several processes. Test: 4 separate Node processes call it at the same time for the same 1,000 occurrence ids; the database then holds 1,000 rows and the processes got exactly 1,000 `true` in total. No in-memory lock: the database decides.
3. **Transactions.** Write `recordRun(workflowId, results)`, which stores a run and its node results atomically. Test: make it fail after the second node result and check that neither the run nor any node result was stored; then a successful call stores everything.
4. **Workflow query.** Write `workflowsTriggeredBy(actionId)`, returning the enabled workflows whose trigger is that Action, each with its nodes in order, in as few database calls as possible. Seed 10,000 workflows of 5 nodes, 1% of them matching; test the result and print the median time of 20 calls.
5. **Security.** Store a subscription's token encrypted at rest with AES-256-GCM (`node:crypto`), the key from an environment variable; test that the stored value contains no plaintext and that decryption returns the original. Then write `findUserByEmail(input)`, where `input` comes from a parsed JSON body and may be a string, an object or an array; test that `"x' OR '1'='1"`, `{"$ne": null}`, `{"$gt": ""}` and `["a@b.c"]` find no user, and that a real email finds its user.
6. **Throwaway databases in tests.** Make every test file run on its own empty, migrated database, created at setup and removed at teardown, so test files can run in parallel. Print the setup time per test file, median of 10.
7. **Backup and restore.** Add `npm run backup` and `npm run restore <file>` using the database's own tools (through Docker for a server database). Test: seed, back up, drop everything, restore, compare the row or document count of every table or collection.

### Rules for the session

- Work only in your database's folder. Never touch `~/dev/epitech/tek3/Area-Flow`, never push, never create or read a `.env` file: pass variables inline (`POSTGRES_PASSWORD=spike docker compose up -d --wait`).
- Server ports: PostgreSQL `55432`, MongoDB `57017`. Prefix Compose projects, containers and volumes with `spike-<database>`.
- After each probe, break one thing on purpose (change one line), run its test, check it fails, revert, check it passes again.
- At the end, `docker compose down -v`.

### Log

Write `LOG.md` in your folder, one section per probe, with: result (pass, partial, fail); seconds used; files and lines added; every error met before the test passed, each marked **wrong API** (a function, option or flag that does not exist), **config** or **logic**; what the test checks; the line broken on purpose and the failing output; anything that surprised you. Start with the exact versions (database, driver, Node).

## Access layers

Identical for every candidate: replace only `<TOOL>` with `Prisma`, `Drizzle` or `Kysely`. One session per tool, probes in order, in that tool's folder. Same 10-minute cap per probe (`date +%s`), same log rules as the databases brief above. The database is PostgreSQL 18 (`postgres:18-alpine`); the baseline is the plain-driver spike in `../postgresql`, whose entities and probes these repeat.

### Shared preamble

You are writing a throwaway proof of concept in TypeScript with <TOOL> on PostgreSQL 18, in the current folder. TypeScript only, no JavaScript files, strict mode, run by Node 26 directly (type stripping, no build step), tests with `node:test`. Use the latest stable <TOOL> and its documented, recommended setup; name every version. Prefer the tool's own features; when you must write raw SQL, say so in the log and count it. Keep the code simple enough that someone who did not write it can follow it. Do not add features that were not asked for.

### Probes

0. **Compose and connect.** A `compose.yaml` running `postgres:18-alpine` with a healthcheck and a named volume, password from the environment only. `npm run ping` connects through <TOOL> and prints the server version.
1. **Schema and migrations.** The same eight entities as `../postgresql/migrations/001_init.sql` (read it), declared the way <TOOL> recommends, with versioned migrations generated or written with its tooling and applied by `npm run migrate`; a second migration adds `description` to workflows without losing data. Test: fresh database, migrate, insert, second migration, data still there, rerun is a no-op.
2. **Event deduplication.** `claimOccurrence(workflowId, occurrenceId)` returns `true` exactly once per pair, ever, even from several processes at once. Test: 4 processes, the same 1,000 ids at the same time, 1,000 rows and 1,000 `true` in total.
3. **Transactions.** `recordRun(workflowId, results)` stores a run and its node results atomically. Test: a failure after the second node result stores nothing; a successful call stores everything.
4. **Workflow query.** `workflowsTriggeredBy(actionId)` returns the enabled workflows whose trigger is that Action, each with its nodes in order, with a result type <TOOL> infers (no hand-written result interface). Seed 10,000 workflows of 5 nodes, 1% matching; test the result and print the median of 20 calls.
5. **Injection.** `findUserByEmail(input)` where `input` comes from a parsed JSON body (string, object or array): `"x' OR '1'='1"`, `{"$ne": null}`, `{"$gt": ""}` and `["a@b.c"]` find no user, a real email finds its user. Also run the TypeScript compiler (`npx tsc --noEmit`, add `typescript` as a dev dependency) and report its errors.

### Rules for the session

- Work only in your tool's folder. Never touch `~/dev/epitech/tek3/Area-Flow`, never push, never create or read a `.env` file: pass variables inline.
- Ports: Prisma `55433`, Drizzle `55434`, Kysely `55435`. Prefix Compose projects, containers and volumes with `spike-<tool>`.
- After each probe, break one line on purpose, check its test fails, revert, check it passes.
- At the end, `docker compose down -v`.

### Log

`LOG.md` in your folder, one section per probe: result, seconds, files and lines, every error before the test passed (**wrong API**, **config**, **logic**), raw SQL written and why, the line broken on purpose and its failing output, surprises. Start with exact versions, then the installed size (`du -sh node_modules`) and package count (`npm ls --all --omit=dev --parseable | wc -l`).
