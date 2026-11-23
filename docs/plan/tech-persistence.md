# Technology selection: persistence

**Status:** Draft · **Owner:** name · **Decision:** ADR NNNN

**Scope:** the database, its access layer (ORM, query builder, plain SQL), migrations, any other store (cache, queue).

**Drives the choice:** the entities of [`../architecture/persistence-model.md`](../architecture/persistence-model.md) · no event triggering twice · delegated tokens stored safely · Docker Compose.

## Criteria

| Criterion                                                                | Weight |
| ------------------------------------------------------------------------ | ------ |
| Security: access control, injection safety, encryption options           |        |
| Model fit: users, subscriptions, workflows, runs (relational, documents) |        |
| Integrity: transactions, unique constraints for hook deduplication       |        |
| Migrations: versioned, reproducible from a fresh clone                   |        |
| Backup and restore tooling                                               |        |
| Small footprint in Docker Compose                                        |        |
| Throwaway databases in tests and CI                                      |        |
| Team knowledge and learning goal                                         |        |

## Candidates

| Candidate | Score | Strengths | Weaknesses | Why not |
| --------- | ----- | --------- | ---------- | ------- |
|           |       |           |            |         |

**Compared by:** sources read, PoC, measurements, each linked. **PoC:** link, what it showed, with numbers.
