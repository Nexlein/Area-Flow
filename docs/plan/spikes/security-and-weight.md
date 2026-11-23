<!-- Security advisory history and heaviness of the three back-end spike candidates, with the method, sources and what the numbers cannot tell. -->

# Security and weight

Two comparisons the probes did not cover: how often each framework has had security advisories, and how heavy each is. Data collected by TeddyBertrand on 2026-11-23 ("I" below). Feeds the "Security: auth libraries, input validation, advisories, defaults" criterion of [`../tech-backend.md`](../tech-backend.md). Probe results: [`runs.md`](runs.md).

## Method and sources

- **Exposure today:** the production dependency tree of each spike (from its lockfile) was checked against the [OSV](https://osv.dev) database version by version, and with `npm audit --omit=dev`. Two independent tools.
- **History:** every OSV advisory for the framework's own packages, grouped by publication month. Core packages: NestJS `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`, `@nestjs/swagger`; Fastify `fastify`, `@fastify/swagger`, `@fastify/swagger-ui`; Effect `effect`, `@effect/platform-node`, `@effect/platform`. `jose`, used by all three, is excluded. Package creation dates come from the npm registry.
- **Corroboration:** web searches for the main advisories, against GitLab's advisory database, NVD, Red Hat and others.
- **Counting rule:** one OSV advisory ID is one advisory. The same CVE number can appear twice when a fix was incomplete and a second advisory followed (Fastify `CVE-2025-32442`). An advisory listed on two packages of one framework is counted once (Effect `CVE-2026-115779`).

## Exposure today

|                                                         | NestJS 12.6.0 | Fastify 5.12.8 | Effect 4.1.5 |
| ------------------------------------------------------- | ------------- | -------------- | ------------ |
| Packages in the production tree                         | 104           | 78             | 15           |
| Known advisories affecting the installed versions (OSV) | 0             | 0              | 0            |
| `npm audit --omit=dev`                                  | 0             | 0              | 0            |

"None known" is not "none". Effect needs a caveat: two of its three advisories list only a version 3 fix (`3.20.0`, `3.22.1`), so a version 4.1.5 install showing clean may mean "not affected" or "not covered by the advisory's ranges". The advisories do not say which.

## Advisory history of the framework's own packages

Window for the recent figures: 24 months, December 2024 to November 2026.

|                                                   | NestJS   | Fastify      | Effect        |
| ------------------------------------------------- | -------- | ------------ | ------------- |
| Advisories, all time                              | 3        | 19           | 3             |
| First release                                     | May 2017 | October 2016 | November 2022 |
| Months since first release                        | 114      | 121          | 48            |
| Per month, all time                               | 0.03     | 0.16         | 0.06          |
| Advisories, last 24 months                        | 2        | 14           | 3             |
| Per month, last 24 months                         | 0.08     | 0.58         | 0.13          |
| HIGH severity, last 24 months                     | 0        | 7            | 2             |
| Months with at least one advisory, of the last 24 | 2        | 6            | 2             |

Averages hide the clustering. Fastify published **7 advisories in September 2026** alone (5 of them HIGH on 30 September), and 4 more between February and April 2026. NestJS's and Effect's are isolated events.

Severity labels are those of the GitHub advisory database and differ between sources; scores quoted below are from the sources linked.

### What they are about

**Fastify (19):** 9 are validation bypasses, all published since April 2025: Content-Type parsing tricks (`CVE-2025-32442` twice, `CVE-2026-25223`, `CVE-2026-3419`), and schema bypasses by primitive coercion, boolean `false` schemas, header case normalization, async validation collisions and case-sensitive `propertyNames` (`CVE-2026-18504`, `84469`, `84428`, `84504`, `107832`). The rest are denial of service, `X-Forwarded-*` spoofing, and one listed as an authentication bypass through malformed URLs (`CVE-2026-76169`). Fix cadence is fast: each cluster was patched in a point release within days (latest fix `5.12.6`). The installed 5.12.8 contains them.

**NestJS (3):** a Server-Sent Events injection in `@nestjs/core` (`CVE-2026-35515`, medium, fixed in 11.1.18), an information exposure in `StreamableFile` (`CVE-2023-26108`, 2023), and `CVE-2024-29409` on `@nestjs/common`, listed as moderate and described as remote code execution through the `Content-Type` header; I did not check whether its maintainers dispute it. None is HIGH.

**Effect (3):** an `AsyncLocalStorage` context loss or contamination under concurrent load (`CVE-2026-32887`, March 2026, HIGH, CVSS 7.4, race condition, fixed in 3.20.0), a cookie attribute injection in `@effect/platform` (`CVE-2026-115779`, November 2026, moderate), and a ReDoS in `Schema.TemplateLiteral` (`CVE-2026-121707`, November 2026, HIGH, fixed in 3.22.1). Some third-party sources (Wiz, SentinelOne) describe the first as an authentication bypass in specific setups; NVD and GitLab describe it only as a context race, so I treat that as a secondary reading.

### What the web search confirmed

Confirmed by at least one source besides OSV: Fastify `CVE-2026-84428` (GitLab, Red Hat; CVSS 7.5), `CVE-2026-84469` (OSV, Red Hat), `CVE-2026-18504` (NVD, Debian), `CVE-2026-25223` (NVD); Effect `CVE-2026-32887` (NVD and others); NestJS `CVE-2026-35515` (NVD, GitLab and others).

**Not confirmed by the web search:** Fastify `CVE-2026-76169` (no result) and Effect `CVE-2026-121707` (no result; published 9 days before this check, so indexes may lag). Both are in the counts above because OSV lists them. One more Fastify advisory appears in Red Hat's results but not under that number in my OSV list (`CVE-2026-33806`, a leading space in `Content-Type` skipping validation): it looks like the same flaw as `CVE-2026-3419`'s or `CVE-2025-32442`'s follow-up under another identifier, so the Fastify count could be off by one or two either way.

## Heaviness

Each measure is divided by the lightest value, so 1.00 is the best framework on it and 2.00 is twice as heavy. Values come from [`runs.md`](runs.md#speed-measurements).

| Measure (lower is lighter)                                  | NestJS         | Fastify        | Effect         |
| ----------------------------------------------------------- | -------------- | -------------- | -------------- |
| Idle memory (MB)                                            | 112, **1.26**  | 89, **1.00**   | 163, **1.83**  |
| Cold start (ms)                                             | 376, **1.40**  | 269, **1.00**  | 548, **2.04**  |
| Production `node_modules` (MB)                              | 58, **2.00**   | 29, **1.00**   | 94, **3.24**   |
| CPU time per `/ping` request (µs, from requests per second) | 38.1, **1.62** | 23.6, **1.00** | 56.9, **2.41** |
| Installed packages (supply-chain surface)                   | 104, **6.93**  | 78, **5.20**   | 15, **1.00**   |
| **Runtime weight**: geometric mean of the first four        | **1.54**       | **1.00**       | **2.32**       |
| **With package count**: geometric mean of all five          | **2.08**       | **1.39**       | **1.96**       |

The ranking depends on whether package count is part of "heavy":

- **Runtime weight only (memory, start, size, CPU):** Fastify is lightest, NestJS 1.5 times heavier, Effect 2.3 times.
- **Counting packages as supply-chain surface:** Fastify still leads, and Effect moves nearly level with NestJS (1.96 against 2.08), because Effect pulls in only 15 packages where NestJS pulls in 104. Fewer packages means fewer maintainers to trust and fewer places for a transitive advisory, but each Effect package is large (94 MB for 15).

The geometric mean is one reasonable way to combine ratios, and the equal weights are my choice. The team should set the weights, as the matrix exercise intends.

## What the numbers do not tell

- **Advisory counts measure disclosure, not safety.** A popular framework is audited more, so it publishes more advisories. Fastify's higher count partly reflects scrutiny; Effect's low count partly reflects how young and how little examined it is. Zero advisories is not evidence of zero bugs.
- **The kind of advisory matters more than the count.** Fastify's recurring bypasses sit exactly where AREA relies on the framework, input validation. The mitigations are cheap: pin the version at or above the latest fix, and keep an application-level check behind the schema, as probe 3 did with the hand-written reference check. That check is also why the probe 3 result does not depend on Fastify's validation alone.
- **Today's exposure is the current state, not a promise.** Fastify shows 0 today after a cluster of 7 in one month, so the project would need to track updates (Dependabot and Renovate are already configured in this repository).
- **OSV and GitHub's database can lag** behind new disclosures, and severity scores differ by source.
- **Version skew in Effect:** its fixes are on the version 3 line, while the spike runs version 4.1.5. Whether version 4 is affected by the context race and the ReDoS is not stated by the advisories and was not tested here.
- **Only the framework layer is covered.** `jose`, the database driver and the OAuth2 libraries will carry their own advisories whichever framework is chosen.

## Sources

- OSV API queries made on 2026-11-23: `https://api.osv.dev/v1/query`, `/v1/querybatch` and `/v1/vulns/<id>`; npm registry for creation dates.
- Fastify: [GitLab advisory list](https://advisories.gitlab.com/pkg/npm/fastify/), [CVE-2026-84428 on OSV](https://osv.dev/vulnerability/CVE-2026-84428), [Red Hat](https://access.redhat.com/security/cve/cve-2026-84428), [NVD CVE-2026-18504](https://nvd.nist.gov/vuln/detail/cve-2026-18504), [NVD CVE-2026-25223](https://nvd.nist.gov/vuln/detail/CVE-2026-25223).
- Effect: [NVD CVE-2026-32887](https://nvd.nist.gov/vuln/detail/CVE-2026-32887), [GitLab](https://advisories.gitlab.com/npm/effect/CVE-2026-32887/), [OSV GHSA-38f7-945m-qr2g](https://osv.dev/vulnerability/GHSA-38f7-945m-qr2g).
- NestJS: [GitLab CVE-2026-35515](https://advisories.gitlab.com/npm/@nestjs/core/CVE-2026-35515/), [NVD](https://nvd.nist.gov/vuln/detail/CVE-2026-35515), [OSV GHSA-36xv-jgw5-4q75](https://osv.dev/vulnerability/GHSA-36xv-jgw5-4q75).
