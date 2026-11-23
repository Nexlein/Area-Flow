# Persistence model and data structures

**Status:** To design, once [`../plan/tech-persistence.md`](../plan/tech-persistence.md) concludes.

## Entities

Entity diagram (Mermaid) once decided. Expected entities, from the subject:

| Entity               | Holds                                                      | Notes                                           |
| -------------------- | ---------------------------------------------------------- | ----------------------------------------------- |
| User                 | Account, confirmation state, local credentials             | Password storage: algorithm and parameters      |
| External identity    | OIDC provider and subject, link to a user                  | Linking rules: [`auth.md`](auth.md)             |
| Service subscription | User, Service, delegated credentials, scopes, expiry       | Token protection: [`auth.md`](auth.md)          |
| Workflow             | Owner, enabled flag, trigger, nodes, condition, branches   | Shape: [`workflow-model.md`](workflow-model.md) |
| Node                 | Kind, type, configuration, key path mappings, position     | No structural maximum on reactions              |
| Hook state           | Last seen occurrences or cursor per trigger                | Deduplication: [`hooks.md`](hooks.md)           |
| Run                  | Workflow, trigger event, timing, outcome, per-node results | Retention                                       |

## Important data structures

The structures the defense will ask about: how a workflow graph is stored, how key paths are resolved, how an event is identified.

## Retention

| Data | Kept for | Why | Enforced by |
| ---- | -------- | --- | ----------- |

## Migrations

How the schema is versioned and applied on a fresh clone.
