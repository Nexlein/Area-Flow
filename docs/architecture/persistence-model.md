# Persistence model and data structures

Draft drawn from the subject. Proposed store: PostgreSQL with Prisma ([ADR 0003](../adr/0003-persistence-postgresql.md), [ADR 0004](../adr/0004-access-layer-prisma.md)); the fields the spike used: probe 1 of the [persistence brief](../plan/spikes/persistence/brief.md#probes). First version at the MVP; final at the Final.

```mermaid
erDiagram
  USER ||--o{ EXTERNAL_IDENTITY : "logs in with (OIDC)"
  USER ||--o{ SUBSCRIPTION : "subscribes to a Service"
  USER ||--o{ WORKFLOW : owns
  WORKFLOW ||--|{ NODE : "trigger, reactions, condition"
  WORKFLOW ||--o{ RUN : executes
  WORKFLOW ||--o{ HOOK_STATE : "seen occurrences"
  RUN ||--|{ NODE_RESULT : "one per node run"
```

| Entity            | Note                                                                    |
| ----------------- | ----------------------------------------------------------------------- |
| USER              | Password storage: algorithm, parameters                                 |
| EXTERNAL_IDENTITY | Linking rules: [`auth.md`](auth.md)                                     |
| SUBSCRIPTION      | Delegated credentials, scopes, expiry; protection: [`auth.md`](auth.md) |
| NODE              | No structural maximum on reactions                                      |
| HOOK_STATE        | Deduplication: [`hooks.md`](hooks.md)                                   |
| RUN               | Retention below                                                         |

- **Data structures** asked at the defense: how a workflow graph is stored, how key paths resolve, how an event is identified.
- **Migrations:** how the schema is versioned and applied on a fresh clone.

## Retention

| Data | Kept for | Why | Enforced by |
| ---- | -------- | --- | ----------- |
