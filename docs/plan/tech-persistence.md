# Technology selection: persistence

**Status:** Draft · **Owner:** name · **Decision:** ADR NNNN (to write)

Scope: the database, its access layer (ORM, query builder or plain SQL), migrations, and any other store (cache, queue).

## What the product must persist

- Users, local credentials, linked external identities (OIDC).
- Service subscriptions and their delegated credentials (OAuth2 tokens, refresh tokens, expiry).
- Workflows: nodes, their order, the condition and its two branches, key path mappings; validated at save.
- Hook state: which occurrences were already seen, cursors, schedules, so no event triggers twice.
- Runs: what ran, when, with which result (more if SYS-OBS: immutable records with node inputs and outputs).
- Selected features that weigh on storage: [`features-selection.md`](features-selection.md).

## Criteria

| Criterion                                                                             | Weight | Why it matters here |
| ------------------------------------------------------------------------------------- | ------ | ------------------- |
| Security: access control, injection safety of the access layer, encryption options    |        |                     |
| Data model fit: relational links (users, subscriptions, workflows, runs) vs documents |        |                     |
| Integrity: transactions, unique constraints for hook deduplication                    |        |                     |
| Migrations: versioned, reproducible from a fresh clone                                |        |                     |
| Backup and restore tooling                                                            |        |                     |
| Runs in Docker Compose with a small footprint                                         |        |                     |
| Testing: throwaway databases in tests and CI                                          |        |                     |
| Team knowledge and learning goal                                                      |        |                     |

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
