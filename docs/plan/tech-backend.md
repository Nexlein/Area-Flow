# Technology selection: back-end

**Status:** Draft · **Owner:** name · **Decision:** ADR NNNN (to write)

Scope: the application server. Language, HTTP framework, OpenAPI tooling, and whatever runs the hooks (scheduler, job queue).

## What the subject asks of the server

- All business logic and rules; clients only present and interact.
- An OpenAPI description of the HTTP API, served with a browsable interface, covering every endpoint the clients call and their errors; a test fails when it drifts from the implementation.
- Local accounts (with confirmation) and OIDC login; OAuth2 delegated access to Services, with credentials stored for unattended hooks.
- Hooks that detect Actions with no client open, never re-trigger the same occurrence, and start the workflow.
- A workflow engine: validation at save (structure, key paths), deterministic substitution with no code evaluation.
- The `about.json` catalogue, built from the code, not hard-coded twice.
- Built and run by Docker Compose; separate codebase from the clients.
- Selected features that weigh on the server: [`features-selection.md`](features-selection.md).

## Criteria

| Criterion                                                                       | Weight | Why it matters here |
| ------------------------------------------------------------------------------- | ------ | ------------------- |
| Security: auth libraries, input validation, advisories history, secure defaults |        |                     |
| OpenAPI: generation or contract-first, served UI, contract testing              |        |                     |
| Background work: scheduling and running hooks, timeouts                         |        |                     |
| OAuth2 / OIDC client libraries, SDKs of the Services we target                  |        |                     |
| Testing: unit and functional tests, mocks of third-party APIs                   |        |                     |
| Team knowledge and learning goal                                                |        |                     |
| Container image size and startup time                                           |        |                     |
| Maturity, documentation, long-term support                                      |        |                     |

## Candidates

| Candidate | Score | Strengths | Weaknesses |
| --------- | ----- | --------- | ---------- |
|           |       |           |            |

## Comparison

How each candidate was evaluated against each criterion: reading (with sources), PoC, measurement.

## Evidence (exploratory code)

- PoC: what was built, where (branch or folder), what it showed, with numbers.

## Decision

Concise, justified choice. Record it in an ADR from [`../adr/0000-template.md`](../adr/0000-template.md).

## Rejected

- **Candidate:** why not for this project.
