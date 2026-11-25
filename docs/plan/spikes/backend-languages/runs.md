<!-- Results of the back-end language spikes (Go, Rust, C++): the fixes, findings per probe, load figures and what they do not prove. -->

# Spike runs: Go, Rust and C++

Evidence behind [`tech-backend-languages.md`](../../tech-backend-languages.md). Same six probes, prompts and load method as the TypeScript spikes ([`../backend/brief.md`](../backend/brief.md)), single runs on 2026-11-25 by TeddyBertrand with an assistant, in `~/projects/spikes-area/{go-huma,rust-axum,cpp-drogon}` (outside this repository). Differences from the TypeScript spikes: one author in one session who had read the earlier results, no stopwatch, no cold-read questions.

Versions: Go 1.26.10, Huma 2.41.0, jwx 3.4.0; Rust 1.99.1, Axum 0.8.9, utoipa 6.0.0, jsonwebtoken 12.0.0, reqwest 0.13.5, Tokio 1.54.1; GCC 15.2.0, Drogon 1.9.14, jwt-cpp 0.7.3, jsoncpp 1.9.8, OpenSSL 3.5.5.

## Results

|                          | Go + Huma                                       | Rust + Axum                                   | C++ + Drogon                                         |
| ------------------------ | ----------------------------------------------- | --------------------------------------------- | ---------------------------------------------------- |
| Probes passed, of 6      | 6                                               | 6                                             | 6                                                    |
| Tests                    | 23 functions, race detector clean               | 23                                            | 24 cases, 58 assertions                              |
| Manual fixes             | 7 (5 in tests or configuration, 1 security gap) | 3 (a changed API, a feature flag, a refactor) | 0 in code; `jsoncpp` and `libuuid` built from source |
| Non-existent APIs called | 0                                               | 0                                             | 0                                                    |
| Source and test lines    | 448 and 461                                     | 452 and 386                                   | 508 and 436                                          |
| OpenAPI description      | from the handler types                          | from annotations beside the handlers          | written by hand (about 50 lines)                     |
| Mutations caught, of 6   | 6                                               | 6                                             | 6                                                    |

Fastify, from [`../backend/runs.md`](../backend/runs.md): 6 probes, 8 fixes, 1 non-existent API, 337 source and 271 test lines.

Mutations, one per probe, made by editing the code and reverting: `/ping` answering `ko`, an undescribed route, the deduplication disabled, `>=` loosened to `>` in the reference order, the audience check removed, 502 changed to 500.

## Findings per probe

- **0 and 1, ping and OpenAPI.** Go (Huma) and Rust (utoipa) generate the description from the code and serve a UI; C++ (Drogon) cannot, so the description, the contract check and the schema validator for the test were written by hand. In Go and Rust the response type makes drift hard; in Rust the annotation and the return type are separate, so a test catches a handler returning another shape. Axum cannot list its routes, so "no undescribed route" is a source scan for `.route(`. Huma adds a `$schema` field to bodies unless a hook is removed.
- **2, hook.** Go and C++ can abandon a hung call but not cancel it: the goroutine or thread lives on. Rust drops the hung future. All three keep seen ids in memory, so events would repeat after a restart (the same persistence question as in TypeScript).
- **3, save-time check.** All pass the same cases (missing node, later node, the node itself, undeclared key, references staying inert text, malformed body). Go and Rust derive the schema check from the types; in C++ it is 20 hand-written lines.
- **4, JWT.** `alg: none` and HS256 with the public key as secret are refused by all three. **Go's `jwx` and C++'s `jwt-cpp` accept a token with no `exp` claim by default**; `jsonwebtoken` refuses it. The Go guard failed my test until `WithRequiredClaim("exp")` was added; I wrote the C++ check from knowing the library. `jwx` also needs `WithInferAlgorithmFromKey`, or no key matches. All three refuse to start without issuer and audience because I wrote that check.
- **5, mocked third party.** All pass five cases (success, 500, timeout, refused connection, bad body) with a local mock; each failure answers 502.

## Manual fixes

| Candidate | Fix                                                                                               | Probe |
| --------- | ------------------------------------------------------------------------------------------------- | ----- |
| Go        | `CreateHooks = nil`, or every response carries a `$schema` field                                  | 0     |
| Go        | the route recorder must override `HandleFunc`, which Huma calls                                   | 1     |
| Go        | test: compare error text after unescaping JSON quotes                                             | 3     |
| Go        | test: put the `kid` in the token header                                                           | 4     |
| Go        | `WithInferAlgorithmFromKey(true)`, or no key of the set matches                                   | 4     |
| Go        | test: trim the newline Huma adds after a JSON body                                                | 4     |
| Go        | `WithRequiredClaim("exp")`: a token that never expires was accepted (**security**)                | 4     |
| Rust      | `EncodingKey::from_secret` returns a `Result` in jsonwebtoken 12                                  | 4     |
| Rust      | the `query` feature of `reqwest` 0.13 must be enabled                                             | 5     |
| Rust      | tests updated after `Deps` gained a field                                                         | 5     |
| C++       | none in code; `jsoncpp` and `libuuid` built from source (no `sudo`) before Drogon would configure | 0     |

## Load and weight

Same machine as the TypeScript spikes (20 cores, 15 GB, WSL2), production builds, `autocannon` 9.0.0 with 50 connections (5 s warm-up and 10 s measured on `GET /ping`, 3 s and 10 s on `POST /workflows`), four servers, three runs each in a rotating order, Fastify rerun in the same session. All 12 runs: zero errors, every `POST` answered 201.

|                                     | Fastify 5.12.8           | Go + Huma                | Rust + Axum                 | C++ + Drogon                   |
| ----------------------------------- | ------------------------ | ------------------------ | --------------------------- | ------------------------------ |
| `/ping` requests per second, 3 runs | 40,031 / 42,698 / 42,314 | 78,496 / 78,362 / 73,158 | 89,388 / 91,878 / 87,264    | 94,170 / 83,430 / 92,141       |
| `POST /workflows`, 3 runs           | 25,054 / 23,544 / 24,663 | 52,941 / 51,585 / 49,418 | 102,950 / 103,123 / 103,366 | 48,380 / 50,532 / 47,396       |
| Cold start (ms), 3 runs             | 527 / 275 / 253          | 22 / 22 / 22             | 22 / 22 / 22                | 22 / 22 / 22                   |
| Idle memory (MB)                    | 89.8 / 89.1 / 89.7       | 12.3 / 12.4 / 12.6       | 9.0 / 9.1 / 9.0             | 11.6 / 11.6 / 11.6             |
| Executable and dependencies         | node, 29 MB, 78 packages | 13.8 MB, 8 modules       | 18.3 MB, 173 crates         | 3.1 MB, 6 shared libraries     |
| Clean build                         | none (typecheck 0.5 s)   | 6.9 s                    | 41.7 s                      | 17 s, and 23 s for Drogon once |

Advisories (OSV for Go and Rust, the NVD keyword search for C++; 2026-11-25): Go `huma` and `jwx/v3` none (the old `jwx/v2` has 4, moderate, 2023 to 2024); Rust 16 distinct, 4 in 24 months, none HIGH, `hyper` 7 and `tokio` 7; Drogon 8 CVEs, 3 in 24 months, all CVSS 5.5 (two SQL injections in the ORM, which this build leaves out, and a Windows-only path traversal; the reports say the vendor did not reply). The installed versions have no known advisory in the runtime tree (Rust's test-only `rsa` dependency has one).

What this does not prove:

- **The load generator limits the fast servers.** `autocannon` is single-threaded; Rust answers `POST` faster than `/ping`, which a server limit would not explain. The gap to Fastify is real; the order among the three is not.
- **The 22 ms cold start is the 20 ms polling resolution.**
- **The routes are trivial**: no database, no workflow engine, no container image built.
- **One machine, three runs**; the first Fastify run was slower (527 ms, 281 MB after load), probably a cold file cache.
