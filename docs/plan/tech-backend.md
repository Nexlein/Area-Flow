# Technology selection: back-end

**Status:** Draft · **Owner:** name · **Decision:** ADR NNNN

**Scope:** the application server: language, HTTP framework, OpenAPI tooling, what runs the hooks.

**Drives the choice** ([subject](../subject/SUBJECT.md)): served and tested OpenAPI contract · hooks running with no client · OIDC login and OAuth2 delegated access · Docker Compose.

## Criteria

| Criterion                                                        | Weight |
| ---------------------------------------------------------------- | ------ |
| Security: auth libraries, input validation, advisories, defaults |        |
| OpenAPI: generation or contract-first, served UI, contract tests |        |
| Background work: scheduling hooks, timeouts                      |        |
| OAuth2 / OIDC libraries, SDKs of our target Services             |        |
| Testing: unit, functional, mocked third parties                  |        |
| Team knowledge and learning goal                                 |        |
| Image size and startup time                                      |        |

## Candidates

| Candidate | Score | Strengths | Weaknesses | Why not |
| --------- | ----- | --------- | ---------- | ------- |
|           |       |           |            |         |

**Compared by:** sources read, PoC, measurements, each linked. **PoC:** link, what it showed, with numbers.
