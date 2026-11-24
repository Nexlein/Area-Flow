<!-- Log of every back-end spike probe run: what each framework produced, what was verified independently, and what the result does not prove. -->

# Spike runs

One section per probe, in order. The summary, matrix and decision are in [`../../tech-backend.md`](../../tech-backend.md); the briefs are in [`brief.md`](brief.md). Every run so far is a **single run** by one agent per framework, in parallel, in the folders `~/projects/spikes-area/{nestjs,fastify,effect}` (outside this repository). Run and checked by TeddyBertrand on 2026-11-23 ("I" below). "Verified by me" means I reran the check myself after the agent reported; everything else is the agent's own report.

Versions: Node 26.13.0, npm 11.20.0. NestJS 12.6.0, Fastify 5.12.8, Effect 4.1.5.

## Probe 0: ping

|                                   | NestJS                             | Fastify | Effect                                               |
| --------------------------------- | ---------------------------------- | ------- | ---------------------------------------------------- |
| Result                            | pass                               | pass    | pass                                                 |
| Seconds (cap 300)                 | 22                                 | 15      | 56                                                   |
| Files, lines                      | 3, 26                              | 1, 13   | 1, 18                                                |
| Manual fixes                      | 2 (`tsconfig`: `rootDir`, `types`) | 0       | 1 (`Config.port` does not exist, `Config.Port` does) |
| Non-existent APIs called          | 0                                  | 0       | 1 (`Config.port`)                                    |
| Decorators / implicit conventions | 3 / 5                              | 0 / 2   | 0 / 3                                                |

- NestJS wrote `process.env.PORT ?? 3000`: an unrequested fallback literal.
- Effect's slowest step was learning that v4 moved HTTP to `effect/http` (no separate `@effect/platform`), by searching the installed package.
- Verified by me: curl bodies were read from the agents' reports only. The code was not rerun by me for probe 0.
- Not proven: the second gaps include `npm install` (4 to 9 s) and network noise.

## Probe 1: OpenAPI and contract test

|                              | NestJS                                                                  | Fastify                                                                                  | Effect                                                                  |
| ---------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Result                       | pass                                                                    | pass                                                                                     | pass                                                                    |
| Seconds (cap 300)            | 35                                                                      | 43                                                                                       | 85                                                                      |
| Lines added (about)          | 70                                                                      | 75                                                                                       | 88 (incl. test)                                                         |
| OpenAPI                      | generated from code, `@nestjs/swagger` 12.1.2 (first-party), Swagger UI | generated from route schemas, `@fastify/swagger` and `@fastify/swagger-ui` (first-party) | generated from the `HttpApi` definition, built into `effect`, Scalar UI |
| Third-party library added    | none                                                                    | `ajv` (already a Fastify dependency, now explicit)                                       | none                                                                    |
| Manual fixes                 | 2                                                                       | 3                                                                                        | 1                                                                       |
| Non-existent APIs called     | 0                                                                       | 1 (`exposeRoute`, from the old `fastify-swagger`)                                        | 0                                                                       |
| New decorators / conventions | `@ApiProperty` and `@ApiOkResponse` on every DTO field and route        | none; every route needs `schema.response`                                                | none; handlers matched by group and endpoint name strings               |
| Contract test checks         | property names, primitive types and the `example` value                 | real response validated against the served schema (Ajv)                                  | route list both ways, plus every GET body against its schema            |

Mutation tests, **verified by me** (changed `/ping` to return `ko`, ran `npm test`, reverted, ran again):

|                          | NestJS | Fastify | Effect           |
| ------------------------ | ------ | ------- | ---------------- |
| Test on clean code       | pass   | pass    | pass (2 tests)   |
| Test after `ko` mutation | fail   | fail    | fail (body test) |
| Test after revert        | pass   | pass    | pass             |

The second mutation, an undocumented route, was only run by the agents:

- NestJS: failed with "has no documented 200 response". Clear.
- Fastify: failed, but with a `TypeError` (`Cannot read properties of undefined`), because Swagger auto-documents the route without a response schema. It fails for the right reason only by accident.
- Effect: failed with a clean diff of the route list (`+ 'GET /secret'`).

What the result does not prove:

- NestJS's test compares against the `example` value, so it is only as strong as that annotation. `status!: string` has no enforced `'ok'`.
- Effect's `ko` mutation produced a 500 from the schema encoder before the test could compare bodies, so the test saw `500 !== 200`: a failure, but not the cleanest message.
- Mutation tests only cover GET routes and 200 responses on all three.
- NestJS needed `--legacy-peer-deps` because `@nestjs/swagger` wants TypeScript 5 or 6 and the project has 7.0.2: a dependency-hygiene cost that does not show in the seconds.
- One run each, so the seconds (35, 43, 85) are indicative only.

## Probe 2: hook (dedup, error, timeout)

|                           | NestJS                                                                                                                               | Fastify                                                                                                 | Effect                                                                      |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Result                    | pass                                                                                                                                 | pass, with a caveat                                                                                     | pass                                                                        |
| Seconds (cap 300)         | 73                                                                                                                                   | 180                                                                                                     | 52                                                                          |
| Scheduling                | hand-written `setInterval`, in `OnModuleInit` / `OnModuleDestroy`. `@nestjs/schedule` failed to install (`ERESOLVE` against Nest 12) | hand-written `setInterval`, in `onReady` / `onClose` hooks. `@fastify/schedule` exists but was not used | built in: `Effect.repeat(Schedule.spaced("5 seconds"))`; runs never overlap |
| Timeout                   | `Promise.race` with a 2000 ms timer; the hung fetch is abandoned, not cancelled                                                      | same                                                                                                    | built in: `Effect.timeout("2 seconds")`                                     |
| Dedup                     | in-memory `Set<string>`, lost on restart                                                                                             | same                                                                                                    | same; id added before processing, so a failed handler is not retried        |
| Third-party library added | none                                                                                                                                 | none                                                                                                    | none                                                                        |
| Manual fixes              | 3                                                                                                                                    | 1                                                                                                       | 0                                                                           |
| Non-existent APIs called  | 0                                                                                                                                    | 0                                                                                                       | 0                                                                           |
| Lines added (about)       | 116                                                                                                                                  | 120                                                                                                     | 85                                                                          |
| Decorators / conventions  | `@Injectable`; the job runs only because it is listed in the module's providers                                                      | none; `NODE_ENV=test` convention (see below)                                                            | none; stub chosen by `FETCH_MODE`                                           |

Verified by me (reran the tests, then removed the dedup check, ran, restored, ran again):

|                     | NestJS                      | Fastify                     | Effect                      |
| ------------------- | --------------------------- | --------------------------- | --------------------------- |
| Clean run           | 4 pass                      | 4 pass (`NODE_ENV=test`)    | 5 pass                      |
| Dedup check removed | the duplicate-id test fails | the duplicate-id test fails | the duplicate-id test fails |
| Restored            | 4 pass                      | 4 pass                      | 5 pass                      |

Agent-reported, not rerun by me: the job ticks about 5 s apart with no HTTP request (log lines from each app), and the throw and hang tests pass.

What the result does not prove, and what it costs:

- **Fastify:** a plain `npm test` never exits, because the job's interval keeps the process alive. I confirmed it (killed after 30 s, exit code 124). It only terminates with `NODE_ENV=test`, which skips starting the job. That cost most of its 180 s. It is an implicit convention a new contributor would trip over.
- **NestJS:** the 2 s limit is only tested through a 100 ms override; the 2000 ms default is never exercised. Nest's DI hung silently when the constructor took default-valued parameters, and the fix was to make them public fields, a Nest-specific trap that cost time.
- **All three:** dedup state is an in-memory `Set` and is lost on restart, so after a restart every event is processed again. The prompt only asked for "across runs", but AREA's requirement is that a hook never re-triggers on the same occurrence, so a persistent store is a design decision, not a framework feature on any of the three.
- **Effect** is the only one where scheduling and timeouts are framework features. For the other two, "built for this" means hand-written glue on top of the framework.
- One run each, so the seconds are indicative only; Fastify's 180 s is dominated by the hang, not by the framework's speed.

## Probe 3: save-time key-path check

|                           | NestJS                                                                                                                           | Fastify                                                      | Effect                                                                                                                 |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Result                    | pass                                                                                                                             | pass                                                         | pass                                                                                                                   |
| Seconds (cap 300)         | 40                                                                                                                               | 36                                                           | 103                                                                                                                    |
| Body validation           | hand-written function; DTO classes only document, they do not validate (no `ValidationPipe`, `class-validator` or Zod installed) | built in: `schema.body` (Ajv), the same schema feeds OpenAPI | built in: an Effect `Schema` as `payload`, rejected with 400 by the framework                                          |
| Reference check           | hand-written: regex, then Map / Set lookup                                                                                       | hand-written: regex, then Map lookup                         | hand-written: regex, then Map / Set lookup                                                                             |
| Evaluates input?          | no `eval`, no `Function`, no property access on input                                                                            | same                                                         | same                                                                                                                   |
| 400 in OpenAPI            | `@ApiBadRequestResponse` decorator                                                                                               | `response: { 400: ... }` in the route schema                 | `error: InvalidReference` on the endpoint (`httpApiStatus: 400`); the framework's own malformed-body 400 is not listed |
| Success status            | 201                                                                                                                              | 201                                                          | 200                                                                                                                    |
| Third-party library added | none                                                                                                                             | none                                                         | none                                                                                                                   |
| Manual fixes              | 1                                                                                                                                | 1                                                            | 1                                                                                                                      |
| Non-existent APIs called  | 0                                                                                                                                | 0                                                            | 1 (`Schema.TaggedErrorClass`, does not exist in 4.1.5)                                                                 |
| Lines added (about)       | 159                                                                                                                              | 148                                                          | 108                                                                                                                    |

Verified by me: all 13 tests pass on each (3 clean runs). I then made later-node references acceptable in each validator and reran: exactly one test failed on each (`later node returns 400`, `later node is rejected with 400`, `reference to a later node is rejected with 400`), the other 12 passed. After restoring, 13 pass again.

Agent-reported, not rerun by me: the curl status codes and bodies, and the OpenAPI JSON listing `POST /workflows` with its 400.

**A behavioural difference that is a design decision, not a framework feature.** For `{{ constructor.constructor('return 1')() }}`:

- NestJS and Fastify answer **400** (`invalid reference`): any `{{ ... }}` that is not a strict `nodeId.key` is rejected.
- Effect answers **200** and stores the string unchanged as plain data. Only `{{ constructor.x }}`, which matches the strict pattern, is rejected (unknown node, because the Map is keyed by id strings).

Neither evaluates anything, so both satisfy "substitution replaces data, never evaluates input". But the subject says a reference outside the declaration is rejected when the workflow is saved, and a malformed placeholder that is silently kept would later reach the engine as literal text. The prompt did not say which to choose, so this has to be decided in the workflow model whichever framework wins.

What the result does not prove, and what it costs:

- **NestJS:** validation is hand-written, so the OpenAPI description and the real validation can drift apart (the DTOs are documentation only). Fastify and Effect derive both from one schema. That matters for the "OpenAPI and implementation must not disagree" requirement.
- **All three:** the earlier OpenAPI contract test assumed every route was a GET. NestJS and Fastify each needed a one-line fix to it, so the probe 1 test does not generalize to `POST` routes on its own. Effect's did not need it.
- Only the "later node" rule was mutated, by me and by the agents. The other rules (unknown node, undeclared key, malformed body) are tested but not mutation-tested.
- One run each; the seconds are indicative only. Effect's 103 s went on locating APIs in `node_modules`, not on the logic.

## Probe 4: JWT against a JWKS

|                               | NestJS                                                                                     | Fastify                                                          | Effect                                                                                |
| ----------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Result                        | pass                                                                                       | pass                                                             | pass                                                                                  |
| Seconds (cap 300)             | 68                                                                                         | 56                                                               | 113                                                                                   |
| JWT library                   | `jose` 6.2.18, third-party                                                                 | `jose` 6.2.18, third-party                                       | `jose` 6.2.18, third-party                                                            |
| Why not the first-party one   | `@nestjs/jwt` wraps `jsonwebtoken` and has no remote JWKS                                  | `@fastify/jwt` needs `fast-jwt` and `get-jwks`, both third-party | none exists                                                                           |
| Algorithm restriction         | `['RS256']`                                                                                | `["RS256"]`                                                      | `["RS256","ES256"]`                                                                   |
| Route protection              | `@UseGuards(JwtGuard)`                                                                     | route `preHandler` hook                                          | `HttpApiMiddleware` with a `bearer` security handler, attached by `.middleware(Auth)` |
| OpenAPI security and 401      | `addBearerAuth()`, `@ApiBearerAuth()`, `@ApiUnauthorizedResponse()`                        | `securitySchemes` plus `security` and a 401 schema on the route  | derived from the middleware declaration                                               |
| Missing `ISSUER` / `AUDIENCE` | **fails open** (see below)                                                                 | rejects (`?? ""`)                                                | refuses to start (`Config.String`)                                                    |
| Manual fixes                  | 3 (peer-dependency install, contract test skips secured routes, stale server on port 8081) | 1 (contract test skips `/me`)                                    | 5 (wiring and type errors, plus the contract test and test env)                       |
| Non-existent APIs called      | 0                                                                                          | 0                                                                | 2 (`Config.string`, `CurrentUser.asEffect`)                                           |
| Lines added (about)           | 132                                                                                        | 149                                                              | 100                                                                                   |

Verified by me: 24, 23 and 23 tests pass on a clean run. I then removed the `audience` option from each verifier: exactly one test failed on each (`wrong audience gives 401` / `wrong audience returns 401`; on NestJS the parent `GET /me` suite also reports failed). Restored, 24, 23 and 23 pass again. I also checked for stray processes and listeners on the spike ports after this wave: none.

Agent-reported, not rerun by me: the live curl results (200 with the right `sub`, 401 on invalid tokens), the OpenAPI JSON showing `GET /me` with its 401 and a bearer scheme, and the `alg: none` and HS256 cases passing (they are in the test suites, which I did rerun).

**Finding, tested by me: the NestJS guard fails open.** It passes `process.env.ISSUER` and `process.env.AUDIENCE` straight to `jose`. With `jose`, an `undefined` option means "do not check". I signed a token with `iss: EVIL-ISSUER` and `aud: EVIL-AUD` and verified it with `issuer` and `audience` undefined: **accepted**. With empty strings, or with the right expected values, it is rejected. So a deployment that forgets to set those variables silently accepts any validly signed token from the JWKS, whoever it was issued for. Fastify falls back to `""`, which `jose` rejects, so it fails closed, apparently by accident. Effect reads them with `Config.String`, so the app refuses to start without them, which is the safest behaviour and is built into how its config works. This is generated code meeting a library's semantics, not a NestJS defect, and exactly the kind of mistake a review has to catch: the AREA server will need a startup check that rejects missing security configuration whichever framework wins.

What the result does not prove, and what it costs:

- **Key rotation is untested on all three.** The refetch on an unknown `kid` is `jose`'s documented behaviour (cooldown 30 s by default), but no test exercises it, so a provider rotating its keys is still unverified.
- **The OIDC login flow is not covered.** The probe verifies a bearer token against a JWKS. It does not cover the authorization-code flow, or OAuth2 delegated access to Services, which AREA also needs.
- **The test suites keep needing edits.** All three had to change the older OpenAPI contract test so it skips routes that need auth. The contract test has been patched in probes 3, 4 and 5 (not in probe 2, which added no route), so it is a maintenance cost to plan for.
- **Dependencies:** the agents each installed `jose` without asking, inside the throwaway folders. That is within the approval for spike-only dependencies, and Area-Flow's `package.json` is untouched.
- **Effect:** 5 fixes and 2 calls to APIs that do not exist, the most of the three on this probe, mostly while learning its v4 middleware API from type definitions. Its code is still the shortest.
- One run each; the seconds are indicative only.

## Probe 5: mocked third-party call

|                                    | NestJS                                                             | Fastify                                 | Effect                                                                              |
| ---------------------------------- | ------------------------------------------------------------------ | --------------------------------------- | ----------------------------------------------------------------------------------- |
| Result                             | pass                                                               | pass                                    | pass (mutation by hang, see below)                                                  |
| Seconds (cap 300)                  | 48                                                                 | 145                                     | 290                                                                                 |
| Mocking technique                  | local fake HTTP server in the test (port 0, modes ok / 500 / hang) | same                                    | same                                                                                |
| HTTP call                          | built-in `fetch`                                                   | built-in `fetch`                        | `HttpClient` from `effect/http` with `FetchHttpClient.layer`, plus `filterStatusOk` |
| Timeout                            | `AbortSignal.timeout(1000)`                                        | `AbortSignal.timeout(1000)`, hard-coded | `Effect.timeout("1500 millis")` around the whole call                               |
| City validation                    | hand-written regex in the handler, 400                             | route schema (`pattern`, length), 400   | path-param `Schema` with a pattern check, 400, upstream not called                  |
| 200 and 502 in OpenAPI             | `@ApiOkResponse`, `@ApiBadGatewayResponse`, `@ApiParam`            | route schema `response` 200 and 502     | endpoint declaration plus a tagged error with `httpApiStatus: 502`                  |
| Third-party library added          | none                                                               | none                                    | none                                                                                |
| Manual fixes                       | 2                                                                  | 2 (both to existing code)               | 2                                                                                   |
| Non-existent APIs called           | 0                                                                  | 0                                       | 0                                                                                   |
| Lines added (about)                | 101                                                                | 126                                     | 105                                                                                 |
| Tests in the suite after the probe | 31                                                                 | 29                                      | 30                                                                                  |

Verified by me: 31, 29 and 30 tests pass on a clean run. I changed the failure status in each (NestJS: the 502 exception replaced by a 400 one; Fastify: `reply.code(502)` to 500; Effect: `httpApiStatus: 502` to 500) and reran: the three failure-path tests failed on each (third-party 500, timeout, connection refused), plus Effect's OpenAPI test, since its status is declared in one place. Restored, all pass again. No listeners remain on the spike ports.

Agent-reported, not rerun by me: the live curl runs (200 with a body, then 502 once the fake server was stopped) and the OpenAPI JSON listing 200 and 502.

**Finding, tested by me: Effect's "connection refused" test does not test a refusal.** NestJS returns it in 4 ms and Fastify in 20 ms, but Effect's takes about 1508 ms, equal to its timeout. I shortened the timeout to 300 ms and the refused-connection test then took 307 ms, so the 502 comes from the timeout firing and the refusal is never reported on its own. The code has no retry, so the cause is not identified (the client may be retrying or swallowing the connect error). The test passes, but it cannot tell a refused connection from a hang. A real dependency outage would therefore be reported 1.5 s late on Effect. Restored to 1500 ms afterwards.

What the result does not prove, and what it costs:

- **"No real network" is shown by design, not by the closed-port run.** All three agents ran the tests with `WEATHER_API_URL` set to a closed port and they still passed, but each test sets that variable itself, so the run proves nothing. What shows no external call happens is that every test only talks to a loopback fake server.
- **Effect's 290 s is mostly tool stalls, not framework speed.** Two calls hung: a stray command in a compound shell line (120 s) and the "remove the timeout" mutation, which hangs until `timeout 90` kills it. The agent finished 10 s under the cap, so a stricter cap would have failed it for a reason unrelated to Effect. The mutation "passes" by hang, not by a clean failure line. I made my own status mutation, which fails cleanly.
- **Same pattern on Fastify:** removing the timeout also hangs, and its 145 s includes a denied `pkill`.
- **Configuration is read at request time on NestJS and Fastify, with no startup check.** If `WEATHER_API_URL` is unset the route answers 502 instead of the server refusing to start. Effect's `Config.String` requires it. Same lesson as the JWT variables: the AREA server needs a startup validation of its configuration.
- **The contract test needed a fix again** (skip parametrized paths) on NestJS and Fastify. The contract test from probe 1 has now needed an edit in probes 3, 4 and 5, on at least two of the three frameworks each time.
- One run each; the seconds are indicative only.

## Speed measurements

Run after probe 5, on the code of all six probes, on one machine (20 cores, 15 GB, Node 26.13.0). Nothing else was running during the load runs.

**Method.** The three spikes were compiled to plain JavaScript and started with `node dist/<entry>.js`, so none pays for runtime TypeScript transpilation. NestJS already built to `dist/`. For Fastify and Effect I compiled with `tsc --noEmit false --outDir dist --rootDir src` (plus `--rewriteRelativeImportExtensions` for Effect); the `dist/` folders are git-ignored in the spike repositories. Each server ran with the same dummy configuration (`JWKS_URL`, `ISSUER`, `AUDIENCE`, `WEATHER_API_URL`, `NODE_ENV=production`) and its hook job ticking every 5 s on the stub.

For each framework, three runs, in a rotating order (NestJS, Fastify, Effect, then Fastify, Effect, NestJS, then Effect, NestJS, Fastify), each run being:

1. Cold start: time from spawning the process to the first `200` on `/ping`, polling every 20 ms.
2. Idle memory: resident set size (RSS) 3 s after start.
3. A `POST /workflows` with a valid two-node body, checked for the right status (201 on NestJS and Fastify, 200 on Effect).
4. `autocannon` v9.0.0, 50 connections: 5 s warm-up then 10 s measured on `GET /ping`, then 3 s warm-up and 10 s measured on `POST /workflows`.
5. RSS again after the load.

All 9 runs ended with zero errors, zero timeouts and zero non-2xx responses, and no process was left listening afterwards. Typecheck is `tsc -p tsconfig.json --noEmit`, 3 runs each; the test time is the whole `npm test` (including `tsc` for NestJS and Fastify), 3 runs each. The script that drove the runs is not in the repository; the numbers above are its output.

|                                               | NestJS                   | Fastify                  | Effect                                  |
| --------------------------------------------- | ------------------------ | ------------------------ | --------------------------------------- |
| `/ping` requests per second, 3 runs           | 26,241 / 24,658 / 27,458 | 41,436 / 42,975 / 42,384 | 17,807 / 17,522 / 17,582                |
| `POST /workflows` requests per second, 3 runs | 15,519 / 14,798 / 15,255 | 25,314 / 25,487 / 26,197 | 10,271 / 10,104 / 10,180                |
| Cold start (ms), 3 runs                       | 376 / 375 / 378          | 276 / 264 / 269          | 548 / 540 / 632                         |
| Idle RSS (MB), 3 runs                         | 112.0 / 112.2 / 111.9    | 89.1 / 89.2 / 89.5       | 163.1 / 163.2 / 163.4                   |
| RSS after load (MB), 3 runs                   | 151.9 / 150.0 / 151.7    | 190.5 / 185.1 / 194.6    | 221.6 / 221.3 / 218.5                   |
| Typecheck (ms), 3 runs                        | 346 / 326 / 326          | 462 / 459 / 469          | 461 / 467 / 465                         |
| Whole `npm test` (ms), 3 runs                 | 1,722 / 1,754 / 1,731    | 2,493 / 2,488 / 2,517    | 3,948 / 3,881 / 3,970                   |
| Production `node_modules`                     | 58 MB, 104 packages      | 29 MB, 78 packages       | 94 MB, 15 packages (120 MB as declared) |

The results are stable run to run (within a few percent), so the ranking is not noise: **Fastify is about 1.6 times NestJS and 2.4 times Effect on both routes, starts fastest and uses the least idle memory.** Effect is the slowest and heaviest on every speed measure except package count.

What this does not prove:

- **The load generator and the server share a machine.** `autocannon` runs on a single thread and may itself limit the Fastify figure, so Fastify's real ceiling is probably at least what is shown. The ranking holds, but absolute requests per second are specific to this machine.
- **The routes are trivial.** `/ping` and a small validation measure the framework overhead, not a workflow engine with database access and third-party calls, where the framework's share of the time will be small. A fast framework matters less once the database is the bottleneck.
- **Memory after load is a single reading, not a steady-state test.** Fastify's RSS after load (190 MB) is higher than NestJS's (152 MB) although its idle figure is lower, probably V8 heap growth under load. That does not show a leak either way, and no soak test was run.
- **p99 latency has a 1 ms resolution** in `autocannon`'s output, so differences of 1 to 2 ms are within the measurement.
- **Not what `npm start` does.** The `start` scripts of Fastify and Effect use `tsx` (runtime transpilation) and NestJS's rebuilds first. I measured the compiled output, which is what a deployed container would run; development startup would be slower for Fastify and Effect.
- **"Image size" is a proxy.** No Docker image was built. The real image is a base image plus the production `node_modules` above plus `dist/` (56 to 104 KB). Effect's `package.json` also lists `typescript`, `tsx` and `@types/node` as runtime dependencies (120 MB); I measured it with only its real runtime packages (`effect`, `@effect/platform-node`, `jose`), 94 MB. Most of that is the `effect` package itself, which ships its TypeScript sources, so it stays the largest per package even with few packages.
- **Test time mostly measures each suite's built-in waits** (the timeout tests wait 1 s, 2 s and 1.5 s twice respectively), not the framework. Typecheck time is the cleaner signal, and it is under half a second on all three because TypeScript 7 is native.
